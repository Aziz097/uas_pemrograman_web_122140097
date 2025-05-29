from pyramid.view import view_config
from pyramid.response import Response
from pyramid.httpexceptions import HTTPBadRequest
from sqlalchemy import func, cast, Date
from sqlalchemy.orm import aliased
import datetime
import logging

from ..models.mymodel import Barang, Lokasi, KondisiBarang
from ..schemas import ReportAssetByLocationSchema, ReportAssetByConditionSchema, ReportAssetInOutSchema

log = logging.getLogger(__name__)

# Schema instances
report_asset_by_location_schema = ReportAssetByLocationSchema(many=True)
report_asset_by_condition_schema = ReportAssetByConditionSchema(many=True)
report_asset_in_out_schema = ReportAssetInOutSchema(many=True)

def _apply_date_filters(query, model_class, date_column, start_date_str, end_date_str):
    if start_date_str:
        try:
            start_dt = datetime.datetime.strptime(start_date_str, '%Y-%m-%d')
            query = query.filter(date_column >= start_dt)
        except ValueError:
            raise HTTPBadRequest(json_body={'message': 'Format start_date tidak valid (YYYY-MM-DD).'})
    if end_date_str:
        try:
            end_dt = datetime.datetime.strptime(end_date_str, '%Y-%m-%d') + datetime.timedelta(days=1)
            query = query.filter(date_column < end_dt)
        except ValueError:
            raise HTTPBadRequest(json_body={'message': 'Format end_date tidak valid (YYYY-MM-DD).'})
    return query

@view_config(route_name='report_assets_by_location', renderer='json', request_method='GET', permission='authenticated')
def report_assets_by_location(request):
    """
    Generates a report of assets grouped by location.
    Query params: start_date, end_date
    """
    dbsession = request.dbsession
    start_date = request.params.get('start_date')
    end_date = request.params.get('end_date')

    try:
        query = dbsession.query(
            Lokasi.nama_lokasi,
            func.count(Barang.id_barang),
            func.count(func.case([(Barang.kondisi == KondisiBarang.BAIK, 1)])),
            func.count(func.case([(Barang.kondisi == KondisiBarang.RUSAK_RINGAN, 1)])),
            func.count(func.case([(Barang.kondisi == KondisiBarang.RUSAK_BERAT, 1)]))
        ).outerjoin(Barang, Lokasi.id_lokasi == Barang.id_lokasi) # Use outerjoin to include locations with no assets
        
        query = _apply_date_filters(query, Barang, Barang.tanggal_masuk, start_date, end_date)

        report_data_raw = query.group_by(Lokasi.nama_lokasi).order_by(Lokasi.nama_lokasi).all()

        report_data = []
        for loc_name, total, baik, rusak_ringan, rusak_berat in report_data_raw:
            report_data.append({
                'location_name': loc_name,
                'total_assets': total,
                'baik': baik,
                'rusak_ringan': rusak_ringan,
                'rusak_berat': rusak_berat
            })

        return report_asset_by_location_schema.dump(report_data)
    except HTTPBadRequest:
        raise # Re-raise if it's already an HTTPBadRequest
    except Exception as e:
        log.error(f"Error generating assets by location report: {e}")
        raise Response(status=500, json_body={'message': 'Gagal membuat laporan aset per lokasi.'})

@view_config(route_name='report_assets_by_condition', renderer='json', request_method='GET', permission='authenticated')
def report_assets_by_condition(request):
    """
    Generates a report of assets grouped by condition.
    Query params: start_date, end_date, location_id
    """
    dbsession = request.dbsession
    start_date = request.params.get('start_date')
    end_date = request.params.get('end_date')
    location_id = request.params.get('location_id')

    try:
        query = dbsession.query(
            Barang.kondisi,
            func.count(Barang.id_barang)
        )
        
        query = _apply_date_filters(query, Barang, Barang.tanggal_masuk, start_date, end_date)

        if location_id:
            query = query.filter(Barang.id_lokasi == int(location_id))

        report_data_raw = query.group_by(Barang.kondisi).order_by(Barang.kondisi).all()

        report_data = []
        for condition, count in report_data_raw:
            report_data.append({
                'condition': condition.value,
                'total_assets': count
            })
        
        # Ensure all conditions are present, even if count is 0
        all_conditions = [e.value for e in KondisiBarang]
        for cond in all_conditions:
            if not any(d['condition'] == cond for d in report_data):
                report_data.append({'condition': cond, 'total_assets': 0})
        report_data.sort(key=lambda x: all_conditions.index(x['condition']))


        return report_asset_by_condition_schema.dump(report_data)
    except HTTPBadRequest:
        raise
    except Exception as e:
        log.error(f"Error generating assets by condition report: {e}")
        raise Response(status=500, json_body={'message': 'Gagal membuat laporan aset per kondisi.'})

@view_config(route_name='report_assets_in_out', renderer='json', request_method='GET', permission='authenticated')
def report_assets_in_out(request):
    """
    Generates a report for asset entry/update history.
    Query params: start_date, end_date, location_id, condition
    """
    dbsession = request.dbsession
    start_date = request.params.get('start_date')
    end_date = request.params.get('end_date')
    location_id = request.params.get('location_id')
    condition_filter = request.params.get('condition')

    try:
        # Laporan Aset Masuk (berdasarkan tanggal_masuk)
        # Mengambil semua barang yang masuk dalam rentang tanggal
        in_query = dbsession.query(
            Barang.nama_barang,
            Barang.kode_barang,
            Lokasi.nama_lokasi,
            Barang.tanggal_masuk,
            func.lit("MASUK").label("tipe_transaksi"),
            func.cast(None, Text).label("kondisi_lama"), # Cast None to Text to match type
            Barang.kondisi.label("kondisi_baru")
        ).join(Lokasi)
        in_query = _apply_date_filters(in_query, Barang, Barang.tanggal_masuk, start_date, end_date)
        if location_id:
            in_query = in_query.filter(Barang.id_lokasi == int(location_id))
        if condition_filter:
            in_query = in_query.filter(Barang.kondisi == KondisiBarang(condition_filter))
        
        # Laporan Aset Diperbarui (berdasarkan tanggal_pembaruan)
        # Ini sedikit lebih kompleks karena `tanggal_pembaruan` hanya mencatat kapan terakhir diupdate.
        # Untuk laporan "keluar" atau perubahan, kita perlu data historis yang biasanya di tabel terpisah (log/history).
        # Untuk contoh sederhana ini, kita akan asumsikan 'tanggal_pembaruan' sebagai indikator aktivitas.
        # Jika Anda ingin detail perubahan kondisi, Anda perlu tabel `BarangHistory` atau `BarangLog`.
        
        # Untuk demo, kita asumsikan 'PEMBARUAN' terjadi saat tanggal_pembaruan tidak null dan dalam rentang waktu.
        # Catatan: Ini TIDAK mencatat detail perubahan kondisi secara akurat tanpa tabel log.
        updated_query = dbsession.query(
            Barang.nama_barang,
            Barang.kode_barang,
            Lokasi.nama_lokasi,
            Barang.tanggal_pembaruan,
            func.lit("PEMBARUAN").label("tipe_transaksi"),
            func.cast(None, Text).label("kondisi_lama"),
            Barang.kondisi.label("kondisi_baru")
        ).join(Lokasi).filter(Barang.tanggal_pembaruan != None) # Filter out null dates
        updated_query = _apply_date_filters(updated_query, Barang, Barang.tanggal_pembaruan, start_date, end_date)
        if location_id:
            updated_query = updated_query.filter(Barang.id_lokasi == int(location_id))
        if condition_filter:
            updated_query = updated_query.filter(Barang.kondisi == KondisiBarang(condition_filter))

        # Gabungkan hasil (union)
        # Pastikan kolom sesuai urutan dan tipe
        full_report_query = in_query.union_all(updated_query).order_by(Barang.tanggal_masuk) # Order by combined date

        report_data_raw = full_report_query.all()
        
        report_data = []
        for row in report_data_raw:
            report_data.append({
                'nama_barang': row.nama_barang,
                'kode_barang': row.kode_barang,
                'lokasi': row.nama_lokasi,
                'tanggal': row.tanggal_masuk if row.tipe_transaksi == "MASUK" else row.tanggal_pembaruan, # Use correct date
                'tipe_transaksi': row.tipe_transaksi,
                'kondisi_lama': row.kondisi_lama,
                'kondisi_baru': row.kondisi_baru
            })

        return report_asset_in_out_schema.dump(report_data)
    except HTTPBadRequest:
        raise
    except Exception as e:
        log.error(f"Error generating assets in/out report: {e}")
        raise Response(status=500, json_body={'message': 'Gagal membuat laporan aset masuk/keluar.'})