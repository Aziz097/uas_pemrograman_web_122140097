# superbmd_backend/views/dashboard_views.py
from pyramid.view import view_config
from pyramid.response import Response
from sqlalchemy import func
from sqlalchemy.orm import joinedload
import logging

from ..models.mymodel import Barang, Lokasi, KondisiBarang
from ..services.barang_service import BarangService # Opsional: jika ada fungsi agregasi di service [cite: 2]
from ..services.lokasi_service import LokasiService # Opsional: jika ada fungsi agregasi di service [cite: 1]

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
        total_assets = dbsession.query(func.count(Barang.id)).scalar() # Menggunakan id dari BaseModel [cite: 30]

        # Total Lokasi
        total_locations = dbsession.query(func.count(Lokasi.id)).scalar() # Menggunakan id dari BaseModel [cite: 30]

        # Aset berdasarkan Kondisi
        # Menggunakan all() untuk mendapatkan semua hasil query
        assets_by_condition_raw = dbsession.query(
            Barang.kondisi,
            func.count(Barang.id) # Menggunakan id dari BaseModel [cite: 30]
        ).group_by(Barang.kondisi).all()

        assets_by_condition = [
            {'name': condition.value, 'value': count}
            for condition, count in assets_by_condition_raw
        ]
        # Pastikan semua kondisi ada, meskipun jumlahnya 0
        all_conditions_enum = [e for e in KondisiBarang] # Get all enum members
        for cond_enum in all_conditions_enum:
            if not any(d['name'] == cond_enum.value for d in assets_by_condition):
                assets_by_condition.append({'name': cond_enum.value, 'value': 0})
        # Sort by predefined order
        assets_by_condition.sort(key=lambda x: [e.value for e in KondisiBarang].index(x['name']))


        # Aset berdasarkan Lokasi
        assets_by_location_raw = dbsession.query(
            Lokasi.nama_lokasi,
            func.count(Barang.id) # Menggunakan id dari BaseModel [cite: 30]
        ).outerjoin(Barang, Lokasi.id == Barang.id_lokasi) # Join dengan ID dari BaseModel [cite: 30]
        
        # Otorisasi dashboard untuk penanggung jawab
        current_user_roles = request.identity.get('role')
        current_username = request.identity.get('sub')
        if current_user_roles == 'penanggung_jawab':
            # Jika user adalah penanggung jawab, hanya hitung aset yang menjadi tanggung jawabnya
            assets_by_location_raw = assets_by_location_raw.filter(Barang.penanggung_jawab == current_username)

        assets_by_location_raw = assets_by_location_raw.group_by(Lokasi.nama_lokasi).order_by(Lokasi.nama_lokasi).all()

        assets_by_location = [
            {'name': name, 'value': count}
            for name, count in assets_by_location_raw
        ]
        # Sort alphabetically by location name
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