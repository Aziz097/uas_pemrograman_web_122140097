# superbmd_backend/views/barang_views.py
from pyramid.view import view_config
from pyramid.response import Response
from pyramid.httpexceptions import HTTPNotFound, HTTPBadRequest, HTTPForbidden
from sqlalchemy.exc import IntegrityError, DBAPIError
from sqlalchemy.orm.exc import NoResultFound
from marshmallow import ValidationError # Import ValidationError [cite: 46]
import logging
import datetime

from ..schemas.myschema import BarangSchema, BarangCreateSchema, BarangUpdateSchema, BarangListSchema
from ..models.mymodel import Barang, Lokasi # Import Lokasi untuk validasi id_lokasi
from ..services.barang_service import BarangService # Import BarangService [cite: 2]
from ..services.lokasi_service import LokasiService # Untuk validasi id_lokasi di create/update [cite: 1]

log = logging.getLogger(__name__)

# Schema instances
barang_schema = BarangSchema()
barang_create_schema = BarangCreateSchema()
barang_update_schema = BarangUpdateSchema()
barang_list_schema = BarangListSchema()

@view_config(route_name='barang_list', renderer='json', request_method='GET')
def barang_list(request):
    """
    Retrieves a paginated list of items. Accessible by authenticated users.
    Penanggung jawab can only see assets they are responsible for.
    Admin/Viewer can see all.
    """
    page = int(request.params.get('page', 1))
    limit = int(request.params.get('limit', 10))
    search_term = request.params.get('search', '').strip()
    location_id_filter = request.params.get('location_id')
    condition_filter = request.params.get('condition')
    penanggung_jawab_filter = request.params.get('penanggung_jawab')
    start_date_filter = request.params.get('start_date')
    end_date_filter = request.params.get('end_date')

    # Otorisasi: Penanggung jawab hanya bisa melihat aset mereka sendiri
    # current_user_roles = request.identity.get('role') # String role, misal 'admin'
    # current_username = request.identity.get('sub') # Username user yang login

    # Gunakan Service Layer untuk mendapatkan data, terapkan filter [cite: 2]
    all_barang = BarangService.get_all_barang(
        request.dbsession,
        search_term=search_term,
        location_id=int(location_id_filter) if location_id_filter else None,
        condition=condition_filter,
        penanggung_jawab=penanggung_jawab_filter,
        start_date=start_date_filter,
        end_date=end_date_filter
    )

    # Filtering untuk penanggung jawab dilakukan setelah service mengembalikan semua barang
    # if current_user_roles == 'penanggung_jawab':
    #     all_barang = [b for b in all_barang if b.penanggung_jawab == current_username]


    total_items = len(all_barang)
    barang = all_barang[(page - 1) * limit : page * limit] # Lakukan paginasi di sini

    total_pages = (total_items + limit - 1) // limit

    return barang_list_schema.dump({
        'items': barang,
        'pagination': {
            'total_items': total_items,
            'total_pages': total_pages,
            'current_page': page,
            'items_per_page': limit
        }
    })

@view_config(route_name='barang_create', renderer='json', request_method='POST', permission='role:admin')
def barang_create(request):
    """
    Creates a new item. Only accessible by admin.
    """
    try:
        barang_data = barang_create_schema.load(request.json_body) # Gunakan BarangCreateSchema [cite: 46]
    except ValidationError as e:
        log.error(f"Barang creation validation error: {e.messages}")
        raise HTTPBadRequest(json_body={'message': 'Invalid request body', 'errors': e.messages})

    # Validasi id_lokasi melalui Service Lokasi [cite: 1]
    if not LokasiService.get_lokasi_by_id(request.dbsession, barang_data['id_lokasi']):
        raise HTTPBadRequest(json_body={'message': 'ID Lokasi tidak ditemukan.'})

    # Cek apakah kode_barang sudah ada melalui Service [cite: 2]
    if BarangService.get_barang_by_kode(request.dbsession, barang_data['kode_barang']):
        raise HTTPBadRequest(json_body={'message': 'Kode barang sudah digunakan.'})

    try:
        # Gunakan Service Layer untuk membuat barang [cite: 2]
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

@view_config(route_name='barang_detail', renderer='json', request_method='GET', permission='authenticated')
def barang_detail(request):
    """
    Retrieves details of a specific item. Accessible by authenticated users.
    Penanggung jawab can only see assets they are responsible for.
    """
    barang_id = int(request.matchdict['id'])
    
    # Gunakan Service Layer [cite: 2]
    barang = BarangService.get_barang_by_id(request.dbsession, barang_id)
    
    if not barang:
        raise HTTPNotFound(json_body={'message': 'Barang tidak ditemukan.'})

    # Otorisasi: Penanggung jawab hanya bisa melihat aset mereka sendiri
    current_user_roles = request.identity.get('role')
    current_username = request.identity.get('sub')
    if current_user_roles == 'penanggung_jawab':
        if barang.penanggung_jawab != current_username:
            raise HTTPForbidden(json_body={'message': 'Anda tidak memiliki izin untuk melihat barang ini.'})

    return barang_schema.dump(barang)

@view_config(route_name='barang_update', renderer='json', request_method='PUT', permission='role:admin')
def barang_update(request):
    """
    Updates an existing item. Only accessible by admin.
    """
    barang_id = int(request.matchdict['id'])
    
    # Gunakan Service Layer [cite: 2]
    existing_barang = BarangService.get_barang_by_id(request.dbsession, barang_id)
    
    if not existing_barang:
        raise HTTPNotFound(json_body={'message': 'Barang tidak ditemukan.'})

    try:
        update_data = barang_update_schema.load(request.json_body, partial=True) # Gunakan BarangUpdateSchema [cite: 46]
    except ValidationError as e:
        log.error(f"Barang update validation error for barang {barang_id}: {e.messages}")
        raise HTTPBadRequest(json_body={'message': 'Invalid request body', 'errors': e.messages})

    # Validasi id_lokasi jika diupdate melalui Service Lokasi [cite: 1]
    if 'id_lokasi' in update_data:
        if not LokasiService.get_lokasi_by_id(request.dbsession, update_data['id_lokasi']):
            raise HTTPBadRequest(json_body={'message': 'ID Lokasi tidak ditemukan.'})

    # Cek apakah kode_barang yang diupdate sudah digunakan oleh barang lain melalui Service [cite: 2]
    if 'kode_barang' in update_data and update_data['kode_barang'] != existing_barang.kode_barang:
        if BarangService.get_barang_by_kode(request.dbsession, update_data['kode_barang']):
            raise HTTPBadRequest(json_body={'message': 'Kode barang sudah digunakan oleh barang lain.'})

    try:
        # Gunakan Service Layer untuk update barang [cite: 2]
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

@view_config(route_name='barang_delete', renderer='json', request_method='DELETE', permission='role:admin')
def barang_delete(request):
    """
    Deletes an item. Only accessible by admin.
    """
    barang_id = int(request.matchdict['id'])
    
    # Gunakan Service Layer [cite: 2]
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