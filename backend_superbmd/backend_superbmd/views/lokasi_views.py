# superbmd_backend/views/lokasi_views.py
from pyramid.view import view_config
from pyramid.response import Response
from pyramid.httpexceptions import HTTPNotFound, HTTPBadRequest
from sqlalchemy.exc import IntegrityError, DBAPIError
from marshmallow import ValidationError # Import ValidationError [cite: 46]
import logging

from ..schemas.myschema import LokasiSchema, LokasiCreateSchema, LokasiUpdateSchema, LokasiListSchema
from ..models.mymodel import Lokasi
from ..services.lokasi_service import LokasiService # Import LokasiService [cite: 1]

log = logging.getLogger(__name__)

# Schema instances
lokasi_schema = LokasiSchema()
lokasi_create_schema = LokasiCreateSchema()
lokasi_update_schema = LokasiUpdateSchema()
lokasi_list_schema = LokasiListSchema()

@view_config(route_name='lokasi_list', renderer='json', request_method='GET', permission='authenticated')
def lokasi_list(request):
    """
    Retrieves a paginated list of locations. Accessible by authenticated users.
    """
    page = int(request.params.get('page', 1))
    limit = int(request.params.get('limit', 10))
    search_term = request.params.get('search', '').strip()

    # Gunakan Service Layer [cite: 1]
    all_lokasi = LokasiService.get_all_lokasi(request.dbsession, search_term)

    total_items = len(all_lokasi)
    lokasi = all_lokasi[(page - 1) * limit : page * limit] # Lakukan paginasi di sini

    total_pages = (total_items + limit - 1) // limit

    return lokasi_list_schema.dump({
        'items': lokasi,
        'pagination': {
            'total_items': total_items,
            'total_pages': total_pages,
            'current_page': page,
            'items_per_page': limit
        }
    })

@view_config(route_name='lokasi_create', renderer='json', request_method='POST', permission='role:admin')
def lokasi_create(request):
    """
    Creates a new location. Only accessible by admin.
    """
    try:
        lokasi_data = lokasi_create_schema.load(request.json_body) # Gunakan LokasiCreateSchema [cite: 46]
    except ValidationError as e:
        log.error(f"Lokasi creation validation error: {e.messages}")
        raise HTTPBadRequest(json_body={'message': 'Invalid request body', 'errors': e.messages})

    # Cek apakah kode_lokasi sudah ada melalui Service [cite: 1]
    if LokasiService.get_lokasi_by_kode(request.dbsession, lokasi_data['kode_lokasi']):
        raise HTTPBadRequest(json_body={'message': 'Kode lokasi sudah digunakan.'})

    try:
        # Gunakan Service Layer untuk membuat lokasi [cite: 1]
        new_lokasi = LokasiService.create_lokasi(request.dbsession, lokasi_data)
    except IntegrityError:
        request.dbsession.rollback()
        raise HTTPBadRequest(json_body={'message': 'Gagal membuat lokasi. Data mungkin tidak valid.'})
    except DBAPIError as e:
        log.error(f"Database error during lokasi creation: {e}")
        request.dbsession.rollback()
        raise Response(status=500, json_body={'message': 'Terjadi kesalahan pada database.'})

    log.info(f"Location {new_lokasi.nama_lokasi} created.")
    return lokasi_schema.dump(new_lokasi), 201

@view_config(route_name='lokasi_detail', renderer='json', request_method='GET', permission='authenticated')
def lokasi_detail(request):
    """
    Retrieves details of a specific location. Accessible by authenticated users.
    """
    lokasi_id = int(request.matchdict['id'])
    
    # Gunakan Service Layer [cite: 1]
    lokasi = LokasiService.get_lokasi_by_id(request.dbsession, lokasi_id)
    
    if not lokasi:
        raise HTTPNotFound(json_body={'message': 'Lokasi tidak ditemukan.'})

    return lokasi_schema.dump(lokasi)

@view_config(route_name='lokasi_update', renderer='json', request_method='PUT', permission='role:admin')
def lokasi_update(request):
    """
    Updates an existing location. Only accessible by admin.
    """
    lokasi_id = int(request.matchdict['id'])
    
    # Gunakan Service Layer [cite: 1]
    existing_lokasi = LokasiService.get_lokasi_by_id(request.dbsession, lokasi_id)
    
    if not existing_lokasi:
        raise HTTPNotFound(json_body={'message': 'Lokasi tidak ditemukan.'})

    try:
        update_data = lokasi_update_schema.load(request.json_body, partial=True) # Gunakan LokasiUpdateSchema [cite: 46]
    except ValidationError as e:
        log.error(f"Lokasi update validation error for lokasi {lokasi_id}: {e.messages}")
        raise HTTPBadRequest(json_body={'message': 'Invalid request body', 'errors': e.messages})

    # Cek apakah kode_lokasi yang diupdate sudah digunakan oleh lokasi lain melalui Service [cite: 1]
    if 'kode_lokasi' in update_data and update_data['kode_lokasi'] != existing_lokasi.kode_lokasi:
        if LokasiService.get_lokasi_by_kode(request.dbsession, update_data['kode_lokasi']):
            raise HTTPBadRequest(json_body={'message': 'Kode lokasi sudah digunakan oleh lokasi lain.'})

    try:
        # Gunakan Service Layer untuk update lokasi [cite: 1]
        updated_lokasi = LokasiService.update_lokasi(request.dbsession, existing_lokasi, update_data)
    except IntegrityError:
        request.dbsession.rollback()
        raise HTTPBadRequest(json_body={'message': 'Gagal memperbarui lokasi. Data mungkin tidak valid.'})
    except DBAPIError as e:
        log.error(f"Database error during lokasi update for lokasi {lokasi_id}: {e}")
        request.dbsession.rollback()
        raise Response(status=500, json_body={'message': 'Terjadi kesalahan pada database.'})

    log.info(f"Location {updated_lokasi.nama_lokasi} updated.")
    return lokasi_schema.dump(updated_lokasi)

@view_config(route_name='lokasi_delete', renderer='json', request_method='DELETE', permission='role:admin')
def lokasi_delete(request):
    """
    Deletes a location. Only accessible by admin.
    Note: Check for associated Barang before deleting a location.
    """
    lokasi_id = int(request.matchdict['id'])
    
    # Gunakan Service Layer [cite: 1]
    lokasi_to_delete = LokasiService.get_lokasi_by_id(request.dbsession, lokasi_id)
    
    if not lokasi_to_delete:
        raise HTTPNotFound(json_body={'message': 'Lokasi tidak ditemukan.'})

    # Periksa apakah ada barang yang terkait dengan lokasi ini sebelum menghapus
    if lokasi_to_delete.barang: # Relasi 'barang' di model Lokasi
        raise HTTPBadRequest(json_body={'message': 'Gagal menghapus lokasi. Ada barang terkait dengan lokasi ini. Hapus barang terlebih dahulu.'})

    try:
        LokasiService.delete_lokasi(request.dbsession, lokasi_to_delete)
    except IntegrityError:
        request.dbsession.rollback()
        raise HTTPBadRequest(json_body={'message': 'Gagal menghapus lokasi. Data mungkin tidak valid.'})
    except DBAPIError as e:
        log.error(f"Database error during lokasi deletion for lokasi {lokasi_id}: {e}")
        request.dbsession.rollback()
        raise Response(status=500, json_body={'message': 'Terjadi kesalahan pada database.'})

    log.info(f"Location {lokasi_to_delete.nama_lokasi} deleted.")
    return Response(status=204) # No Content