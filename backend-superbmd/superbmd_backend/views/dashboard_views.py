from pyramid.view import view_config
from pyramid.response import Response
from sqlalchemy import func
from sqlalchemy.orm import joinedload
from ..models.mymodel import Barang, Lokasi, KondisiBarang
import logging

log = logging.getLogger(__name__)

@view_config(route_name='dashboard', renderer='json', request_method='GET', permission='authenticated')
def dashboard_data(request):
    """
    Provides aggregated data for the dashboard.
    Accessible by authenticated users.
    """
    dbsession = request.dbsession

    try:
        # Total Barang
        total_assets = dbsession.query(func.count(Barang.id_barang)).scalar()

        # Total Lokasi
        total_locations = dbsession.query(func.count(Lokasi.id_lokasi)).scalar()

        # Aset berdasarkan Kondisi
        assets_by_condition_raw = dbsession.query(
            Barang.kondisi,
            func.count(Barang.id_barang)
        ).group_by(Barang.kondisi).all()

        assets_by_condition = [
            {'name': condition.value, 'value': count}
            for condition, count in assets_by_condition_raw
        ]
        # Ensure all conditions are present, even if count is 0
        all_conditions = [e.value for e in KondisiBarang]
        for cond in all_conditions:
            if not any(d['name'] == cond for d in assets_by_condition):
                assets_by_condition.append({'name': cond, 'value': 0})
        assets_by_condition.sort(key=lambda x: all_conditions.index(x['name'])) # Maintain order


        # Aset berdasarkan Lokasi
        assets_by_location_raw = dbsession.query(
            Lokasi.nama_lokasi,
            func.count(Barang.id_barang)
        ).join(Barang, Lokasi.id_lokasi == Barang.id_lokasi).group_by(Lokasi.nama_lokasi).all()

        assets_by_location = [
            {'name': name, 'value': count}
            for name, count in assets_by_location_raw
        ]
        assets_by_location.sort(key=lambda x: x['name']) # Sort alphabetically by location name


        log.info("Dashboard data retrieved successfully.")
        return {
            "total_assets": total_assets,
            "total_locations": total_locations,
            "assets_by_condition": assets_by_condition,
            "assets_by_location": assets_by_location
        }
    except Exception as e:
        log.error(f"Error fetching dashboard data: {e}")
        raise Response(status=500, json_body={'message': 'Gagal memuat data dashboard.'})