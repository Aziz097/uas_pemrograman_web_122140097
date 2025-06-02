# superbmd_backend/views/dashboard_views.py
from pyramid.view import view_config
from pyramid.response import Response
from sqlalchemy import func
import logging

from ..models.mymodel import Barang, Lokasi, KondisiBarang

log = logging.getLogger(__name__)

@view_config(route_name='dashboard', renderer='json', request_method='GET') # Hapus permission
def dashboard_data(request):
    """
    Provides aggregated data for the dashboard. Accessible by anyone.
    """
    dbsession = request.dbsession

    try:
        total_assets = dbsession.query(func.count(Barang.id)).scalar() # Menggunakan id dari BaseModel

        total_locations = dbsession.query(func.count(Lokasi.id)).scalar() # Menggunakan id dari BaseModel

        assets_by_condition_raw = dbsession.query(
            Barang.kondisi,
            func.count(Barang.id) # Menggunakan id dari BaseModel
        ).group_by(Barang.kondisi).all()

        assets_by_condition = [
            {'name': condition.value, 'value': count}
            for condition, count in assets_by_condition_raw
        ]
        all_conditions_enum = [e for e in KondisiBarang]
        for cond_enum in all_conditions_enum:
            if not any(d['name'] == cond_enum.value for d in assets_by_condition):
                assets_by_condition.append({'name': cond_enum.value, 'value': 0})
        assets_by_condition.sort(key=lambda x: [e.value for e in KondisiBarang].index(x['name']))

        assets_by_location_raw = dbsession.query(
            Lokasi.nama_lokasi,
            func.count(Barang.id) # Menggunakan id dari BaseModel
        ).outerjoin(Barang, Lokasi.id == Barang.id_lokasi) # Join dengan ID dari BaseModel
        
        # Hapus otorisasi dashboard untuk penanggung jawab
        # current_user_roles = request.identity.get('role')
        # current_username = request.identity.get('sub')
        # if current_user_roles == 'penanggung_jawab':
        #     assets_by_location_raw = assets_by_location_raw.filter(Barang.penanggung_jawab == current_username)

        assets_by_location_raw = assets_by_location_raw.group_by(Lokasi.nama_lokasi).order_by(Lokasi.nama_lokasi).all()

        assets_by_location = [
            {'name': name, 'value': count}
            for name, count in assets_by_location_raw
        ]
        assets_by_location.sort(key=lambda x: x['name'])

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