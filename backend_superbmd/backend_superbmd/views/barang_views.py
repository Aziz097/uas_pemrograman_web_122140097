# superbmd_backend/views/barang_views.py
from pyramid.view import view_config
from pyramid.response import Response
from pyramid.httpexceptions import HTTPNotFound, HTTPBadRequest # HTTPForbidden mungkin tidak lagi diperlukan
from sqlalchemy.exc import IntegrityError, DBAPIError
from marshmallow import ValidationError
import logging
import datetime

from ..schemas.myschema import BarangSchema, BarangCreateSchema, BarangUpdateSchema, BarangListSchema
from ..models.mymodel import Barang, Lokasi
from ..services.barang_service import BarangService
from ..services.lokasi_service import LokasiService

log = logging.getLogger(__name__)

# Schema instances
barang_schema = BarangSchema()
barang_create_schema = BarangCreateSchema()
barang_update_schema = BarangUpdateSchema()
barang_list_schema = BarangListSchema()

@view_config(route_name='barang_list', renderer='json', request_method='GET') # Hapus permission
def barang_list(request):
    """
    Retrieves a paginated list of items. Accessible by anyone.
    """
    page = int(request.params.get('page', 1))
    limit = int(request.params.get('limit', 10))
    search_term = request.params.get('search', '').strip()
    location_id_filter = request.params.get('location_id')
    condition_filter = request.params.get('condition')
    penanggung_jawab_filter = request.params.get('penanggung_jawab')
    start_date_filter = request.params.get('start_date')
    end_date_filter = request.params.get('end_date')

    # Hapus semua logika otorisasi yang bergantung pada request.identity
    # current_user_roles = request.identity.get('role')
    # current_username = request.identity.get('sub')

    all_barang = BarangService.get_all_barang(
        request.dbsession,
        search_term=search_term,
        location_id=int(location_id_filter) if location_id_filter else None,
        condition=condition_filter,
        penanggung_jawab=penanggung_jawab_filter,
        start_date=start_date_filter,
        end_date=end_date_filter
    )

    # Hapus filtering ini karena otorisasi di frontend
    # if current_user_roles == 'penanggung_jawab':
    #     all_barang = [b for b in all_barang if b.penanggung_jawab == current_username]

    total_items = len(all_barang)
    barang = all_barang[(page - 1) * limit : page * limit]
    total_pages = (total_items + limit - 1) // limit
    
    lokasi_map = {lok.id: lok.nama_lokasi for lok in request.dbsession.query(Lokasi).all()}
    barang_with_lokasi = []
    for b in barang:
        data = {
            'id': b.id,
            'nama_barang': b.nama_barang,
            'kode_barang': b.kode_barang,
            'kondisi': b.kondisi.value,
            'id_lokasi': b.id_lokasi,
            'penanggung_jawab': b.penanggung_jawab,
            'tanggal_masuk': b.tanggal_masuk.strftime('%Y-%m-%d') if b.tanggal_masuk else None,
            'tanggal_pembaruan': b.tanggal_pembaruan.strftime('%Y-%m-%d') if b.tanggal_pembaruan else None,
            'gambar_aset': b.gambar_aset,
            'created_at': b.created_at.isoformat() if b.created_at else None,
            'updated_at': b.updated_at.isoformat() if b.updated_at else None,
            'nama_lokasi': lokasi_map.get(b.id_lokasi, '')
        }
        barang_with_lokasi.append(data)

    return {
        'items': barang_with_lokasi,
        'pagination': {
            'total_items': total_items,
            'total_pages': total_pages,
            'current_page': page,
            'items_per_page': limit
        }
    }

@view_config(route_name='barang_create', renderer='json', request_method='POST') # Hapus permission
def barang_create(request):
    """
    Creates a new item. Accessible by anyone (otorisasi di frontend).
    """
    try:
        barang_data = barang_create_schema.load(request.json_body)
    except ValidationError as e:
        log.error(f"Barang creation validation error: {e.messages}")
        raise HTTPBadRequest(json_body={'message': 'Invalid request body', 'errors': e.messages})

    if not LokasiService.get_lokasi_by_id(request.dbsession, barang_data['id_lokasi']):
        raise HTTPBadRequest(json_body={'message': 'ID Lokasi tidak ditemukan.'})

    if BarangService.get_barang_by_kode(request.dbsession, barang_data['kode_barang']):
        raise HTTPBadRequest(json_body={'message': 'Kode barang sudah digunakan.'})

    try:
        new_barang = BarangService.create_barang(request.dbsession, barang_data)
    except IntegrityError:
        request.dbsession.rollback()
        raise HTTPBadRequest(json_body={'message': 'Gagal membuat barang. Data mungkin tidak valid atau relasi tidak ada.'})
    except DBAPIError as e:
        log.error(f"Database error during barang creation: {e}")
        request.dbsession.rollback()
        raise Response(status=500, json_body={'message': 'Terjadi kesalahan pada database.'})

    log.info(f"Barang {new_barang.nama_barang} created.")
    return barang_schema.dump(new_barang), 201

@view_config(route_name='barang_detail', renderer='json', request_method='GET') # Hapus permission
def barang_detail(request):
    """
    Retrieves details of a specific item. Accessible by anyone.
    """
    barang_id = int(request.matchdict['id'])
    
    barang = BarangService.get_barang_by_id(request.dbsession, barang_id)
    
    if not barang:
        raise HTTPNotFound(json_body={'message': 'Barang tidak ditemukan.'})

    barang_dict = barang_schema.dump(barang)
    # Ubah kondisi Enum ke value string
    if hasattr(barang, "kondisi"):
        barang_dict['kondisi'] = barang.kondisi.value if hasattr(barang.kondisi, "value") else barang.kondisi

    # Cari lokasi & isi field baru
    lokasi = None
    if barang.id_lokasi:
        lokasi = request.dbsession.query(Lokasi).filter_by(id=barang.id_lokasi).first()
    barang_dict['nama_lokasi'] = lokasi.nama_lokasi if lokasi else None
    barang_dict['alamat_lokasi'] = lokasi.alamat_lokasi if lokasi else None

    return barang_dict

@view_config(route_name='barang_update', renderer='json', request_method='PUT') # Hapus permission
def barang_update(request):
    """
    Updates an existing item. Accessible by anyone (otorisasi di frontend).
    """
    barang_id = int(request.matchdict['id'])
    
    existing_barang = BarangService.get_barang_by_id(request.dbsession, barang_id)
    
    if not existing_barang:
        raise HTTPNotFound(json_body={'message': 'Barang tidak ditemukan.'})

    try:
        update_data = barang_update_schema.load(request.json_body, partial=True)
    except ValidationError as e:
        log.error(f"Barang update validation error for barang {barang_id}: {e.messages}")
        raise HTTPBadRequest(json_body={'message': 'Invalid request body', 'errors': e.messages})

    if 'id_lokasi' in update_data:
        if not LokasiService.get_lokasi_by_id(request.dbsession, update_data['id_lokasi']):
            raise HTTPBadRequest(json_body={'message': 'ID Lokasi tidak ditemukan.'})

    if 'kode_barang' in update_data and update_data['kode_barang'] != existing_barang.kode_barang:
        if BarangService.get_barang_by_kode(request.dbsession, update_data['kode_barang']):
            raise HTTPBadRequest(json_body={'message': 'Kode barang sudah digunakan oleh barang lain.'})

    try:
        updated_barang = BarangService.update_barang(request.dbsession, existing_barang, update_data)
    except IntegrityError:
        request.dbsession.rollback()
        raise HTTPBadRequest(json_body={'message': 'Gagal memperbarui barang. Data mungkin tidak valid.'})
    except DBAPIError as e:
        log.error(f"Database error during barang update for barang {barang_id}: {e}")
        request.dbsession.rollback()
        raise Response(status=500, json_body={'message': 'Terjadi kesalahan pada database.'})

    log.info(f"Barang {updated_barang.nama_barang} updated.")
    return barang_schema.dump(updated_barang)

@view_config(route_name='barang_delete', renderer='json', request_method='DELETE') # Hapus permission
def barang_delete(request):
    """
    Deletes an item. Accessible by anyone (otorisasi di frontend).
    """
    barang_id = int(request.matchdict['id'])
    
    barang_to_delete = BarangService.get_barang_by_id(request.dbsession, barang_id)
    
    if not barang_to_delete:
        raise HTTPNotFound(json_body={'message': 'Barang tidak ditemukan.'})
    
    try:
        BarangService.delete_barang(request.dbsession, barang_to_delete)
    except IntegrityError:
        request.dbsession.rollback()
        raise HTTPBadRequest(json_body={'message': 'Gagal menghapus barang. Data mungkin tidak valid.'})
    except DBAPIError as e:
        log.error(f"Database error during barang deletion for barang {barang_id}: {e}")
        request.dbsession.rollback()
        raise Response(status=500, json_body={'message': 'Terjadi kesalahan pada database.'})

    log.info(f"Barang {barang_to_delete.nama_barang} deleted.")
    return Response(status=204) # No Content