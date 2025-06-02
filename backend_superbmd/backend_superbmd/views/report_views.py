# superbmd_backend/views/report_views.py
from pyramid.view import view_config
from pyramid.response import Response
from pyramid.httpexceptions import HTTPBadRequest
from sqlalchemy import func, cast, Date, union_all, Text, case
import datetime
import logging

from ..models.mymodel import Barang, Lokasi, KondisiBarang
from ..schemas.myschema import ReportAssetByLocationSchema, ReportAssetByConditionSchema, ReportAssetInOutSchema

log = logging.getLogger(__name__)

# Schema instances
report_asset_by_location_schema = ReportAssetByLocationSchema(many=True)
report_asset_by_condition_schema = ReportAssetByConditionSchema(many=True)
report_asset_in_out_schema = ReportAssetInOutSchema(many=True)

def _apply_report_filters(query, model_class, params):
    """Helper to apply common filters for reports."""
    if params.get('start_date'):
        try:
            start_dt = datetime.datetime.strptime(params['start_date'], '%Y-%m-%d')
            query = query.filter(model_class.tanggal_masuk >= start_dt)
        except ValueError:
            raise HTTPBadRequest(json_body={'message': 'Format start_date tidak valid (YYYY-MM-DD).'})
    if params.get('end_date'):
        try:
            end_dt = datetime.datetime.strptime(params['end_date'], '%Y-%m-%d') + datetime.timedelta(days=1)
            query = query.filter(model_class.tanggal_masuk < end_dt)
        except ValueError:
            raise HTTPBadRequest(json_body={'message': 'Format end_date tidak valid (YYYY-MM-DD).'})
    if params.get('location_id'):
        query = query.filter(model_class.id_lokasi == int(params['location_id']))
    if params.get('condition'):
        try:
            condition_enum = KondisiBarang(params['condition'])
            query = query.filter(model_class.kondisi == condition_enum)
        except ValueError:
            raise HTTPBadRequest(json_body={'message': 'Kondisi barang tidak valid.'})
    return query

@view_config(route_name='report_assets_by_location', renderer='json', request_method='GET') # Hapus permission
def report_assets_by_location(request):
    """
    Generates a report of assets grouped by location. Accessible by anyone.
    Query params: start_date, end_date
    """
    dbsession = request.dbsession
    
    try:
        query = dbsession.query(
            Lokasi.nama_lokasi,
            func.count(Barang.id).label("total_assets"),
            func.sum(case((Barang.kondisi == KondisiBarang.BAIK, 1), else_=0)).label("baik"),
            func.sum(case((Barang.kondisi == KondisiBarang.RUSAK_RINGAN, 1), else_=0)).label("rusak_ringan"),
            func.sum(case((Barang.kondisi == KondisiBarang.RUSAK_BERAT, 1), else_=0)).label("rusak_berat"),
        ).outerjoin(Barang, Lokasi.id == Barang.id_lokasi) # Join dengan ID dari BaseModel
        
        query = _apply_report_filters(query, Barang, request.params)

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
        raise
    except Exception as e:
        log.error(f"Error generating assets by location report: {e}")
        return Response(status=500, json_body={'message': 'Gagal membuat laporan aset per lokasi.'})

@view_config(route_name='report_assets_by_condition', renderer='json', request_method='GET') # Hapus permission
def report_assets_by_condition(request):
    """
    Generates a report of assets grouped by condition. Accessible by anyone.
    Query params: start_date, end_date, location_id
    """
    dbsession = request.dbsession
    
    try:
        query = dbsession.query(
            Barang.kondisi,
            func.count(Barang.id) # Menggunakan id dari BaseModel
        )
        
        query = _apply_report_filters(query, Barang, request.params)

        report_data_raw = query.group_by(Barang.kondisi).order_by(Barang.kondisi).all()

        report_data = []
        for condition, count in report_data_raw:
            report_data.append({
                'condition': condition.value,
                'total_assets': count
            })
        
        all_conditions_enum = [e for e in KondisiBarang]
        for cond_enum in all_conditions_enum:
            if not any(d['condition'] == cond_enum.value for d in report_data):
                report_data.append({'condition': cond_enum.value, 'total_assets': 0})
        report_data.sort(key=lambda x: [e.value for e in KondisiBarang].index(x['condition']))

        return report_asset_by_condition_schema.dump(report_data)
    except HTTPBadRequest:
        raise
    except Exception as e:
        log.error(f"Error generating assets by condition report: {e}")
        return Response(status=500, json_body={'message': 'Gagal membuat laporan aset per kondisi.'})

@view_config(route_name='report_assets_in_out', renderer='json', request_method='GET') # Hapus permission
def report_assets_in_out(request):
    """
    Generates a report for asset entry/update history. Accessible by anyone.
    Query params: start_date, end_date, location_id, condition
    """
    dbsession = request.dbsession
    
    try:
        in_query = dbsession.query(
            Barang.nama_barang,
            Barang.kode_barang,
            Lokasi.nama_lokasi,
            Barang.tanggal_masuk.label("tanggal_transaksi"),
            func.lit("MASUK").label("tipe_transaksi"),
            func.cast(None, Text).label("kondisi_lama"),
            Barang.kondisi.label("kondisi_baru")
        ).join(Lokasi, Lokasi.id == Barang.id_lokasi) # Join dengan ID dari BaseModel
        
        in_query_filtered = _apply_report_filters(in_query, Barang, request.params)

        updated_query = dbsession.query(
            Barang.nama_barang,
            Barang.kode_barang,
            Lokasi.nama_lokasi,
            Barang.tanggal_pembaruan.label("tanggal_transaksi"),
            func.lit("PEMBARUAN").label("tipe_transaksi"),
            func.cast(None, Text).label("kondisi_lama"),
            Barang.kondisi.label("kondisi_baru")
        ).join(Lokasi, Lokasi.id == Barang.id_lokasi).filter(Barang.tanggal_pembaruan != None) # Join dengan ID dari BaseModel

        updated_query_filtered = _apply_report_filters(updated_query, Barang, request.params)

        combined_statement = in_query_filtered.statement.union_all(updated_query_filtered.statement)
        full_report_query = dbsession.query(combined_statement.alias('full_report'))

        report_data_raw = full_report_query.order_by(Text("tanggal_transaksi")).all() # Order by text()

        report_data = []
        for row in report_data_raw:
            report_data.append({
                'nama_barang': row.nama_barang,
                'kode_barang': row.kode_barang,
                'lokasi': row.nama_lokasi,
                'tanggal': row.tanggal_transaksi,
                'tipe_transaksi': row.tipe_transaksi,
                'kondisi_lama': row.kondisi_lama,
                'kondisi_baru': row.kondisi_baru
            })

        return report_asset_in_out_schema.dump(report_data)
    except HTTPBadRequest:
        raise
    except Exception as e:
        log.error(f"Error generating assets in/out report: {e}")
        return Response(status=500, json_body={'message': 'Gagal membuat laporan aset masuk/keluar.'})