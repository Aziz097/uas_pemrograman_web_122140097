from pyramid.view import view_config
from pyramid.response import Response
from pyramid.httpexceptions import HTTPNotFound, HTTPBadRequest
from sqlalchemy.exc import IntegrityError, DBAPIError
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy import func
import logging

from ..schemas import LokasiSchema, LokasiListSchema
from ..models.mymodel import Lokasi

log = logging.getLogger(__name__)

# Schema instances
lokasi_schema = LokasiSchema()
lokasi_list_schema = LokasiListSchema()

@view_config(route_name='lokasi_list', renderer='json', request_method='GET', permission='authenticated')
def lokasi_list(request):
    """
    Retrieves a paginated list of locations. Accessible by authenticated users.
    """
    page = int(request.params.get('page', 1))
    limit = int(request.params.get('limit', 10))
    search_term = request.params.get('search', '').strip()

    query = request.dbsession.query(Lokasi)

    if search_term:
        query = query.filter(
            (Lokasi.nama_lokasi.ilike(f'%{search_term}%')) |
            (Lokasi.kode_lokasi.ilike(f'%{search_term}%'))
        )

    total_items = query.count()
    lokasi = query.offset((page - 1) * limit).limit(limit).all()

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
        lokasi_data = lokasi_schema.load(request.json_body)
    except Exception as e:
        log.error(f"Lokasi creation validation error: {e.messages if hasattr(e, 'messages') else e}")
        raise HTTPBadRequest(json_body={'message': 'Invalid request body', 'errors': e.messages if hasattr(e, 'messages') else str(e)})

    # Cek apakah kode_lokasi sudah ada
    if request.dbsession.query(Lokasi).filter(Lokasi.kode_lokasi == lokasi_data['kode_lokasi']).count() > 0:
        raise HTTPBadRequest(json_body={'message': 'Kode lokasi sudah digunakan.'})

    new_lokasi = Lokasi(**lokasi_data)
    request.dbsession.add(new_lokasi)
    try:
        request.dbsession.flush()
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
    lokasi_id = request.matchdict['id']
    try:
        lokasi = request.dbsession.query(Lokasi).filter(Lokasi.id_lokasi == lokasi_id).one()
    except NoResultFound:
        raise HTTPNotFound(json_body={'message': 'Lokasi tidak ditemukan.'})
    except DBAPIError as e:
        log.error(f"Database error retrieving lokasi {lokasi_id}: {e}")
        raise Response(status=500, json_body={'message': 'Terjadi kesalahan pada database.'})

    return lokasi_schema.dump(lokasi)

@view_config(route_name='lokasi_update', renderer='json', request_method='PUT', permission='role:admin')
def lokasi_update(request):
    """
    Updates an existing location. Only accessible by admin.
    """
    lokasi_id = request.matchdict['id']
    try:
        existing_lokasi = request.dbsession.query(Lokasi).filter(Lokasi.id_lokasi == lokasi_id).one()
    except NoResultFound:
        raise HTTPNotFound(json_body={'message': 'Lokasi tidak ditemukan.'})

    try:
        update_data = lokasi_schema.load(request.json_body, partial=True)
    except Exception as e:
        log.error(f"Lokasi update validation error for lokasi {lokasi_id}: {e.messages if hasattr(e, 'messages') else e}")
        raise HTTPBadRequest(json_body={'message': 'Invalid request body', 'errors': e.messages if hasattr(e, 'messages') else str(e)})

    # Cek apakah kode_lokasi yang diupdate sudah digunakan oleh lokasi lain
    if 'kode_lokasi' in update_data and update_data['kode_lokasi'] != existing_lokasi.kode_lokasi:
        if request.dbsession.query(Lokasi).filter(Lokasi.kode_lokasi == update_data['kode_lokasi']).count() > 0:
            raise HTTPBadRequest(json_body={'message': 'Kode lokasi sudah digunakan oleh lokasi lain.'})

    for key, value in update_data.items():
        setattr(existing_lokasi, key, value)

    try:
        request.dbsession.flush()
    except IntegrityError:
        request.dbsession.rollback()
        raise HTTPBadRequest(json_body={'message': 'Gagal memperbarui lokasi. Data mungkin tidak valid.'})
    except DBAPIError as e:
        log.error(f"Database error during lokasi update for lokasi {lokasi_id}: {e}")
        request.dbsession.rollback()
        raise Response(status=500, json_body={'message': 'Terjadi kesalahan pada database.'})

    log.info(f"Location {existing_lokasi.nama_lokasi} updated.")
    return lokasi_schema.dump(existing_lokasi)

@view_config(route_name='lokasi_delete', renderer='json', request_method='DELETE', permission='role:admin')
def lokasi_delete(request):
    """
    Deletes a location. Only accessible by admin.
    Note: Deleting a location with associated Barang might cause IntegrityError.
    Consider soft delete or cascade delete depending on business rules.
    """
    lokasi_id = request.matchdict['id']
    try:
        lokasi_to_delete = request.dbsession.query(Lokasi).filter(Lokasi.id_lokasi == lokasi_id).one()
    except NoResultFound:
        raise HTTPNotFound(json_body={'message': 'Lokasi tidak ditemukan.'})
    except DBAPIError as e:
        log.error(f"Database error deleting lokasi {lokasi_id}: {e}")
        raise Response(status=500, json_body={'message': 'Terjadi kesalahan pada database.'})

    request.dbsession.delete(lokasi_to_delete)
    try:
        request.dbsession.flush()
    except IntegrityError:
        request.dbsession.rollback()
        raise HTTPBadRequest(json_body={'message': 'Gagal menghapus lokasi. Ada barang terkait dengan lokasi ini. Hapus barang terlebih dahulu.'})
    except DBAPIError as e:
        log.error(f"Database error during lokasi deletion for lokasi {lokasi_id}: {e}")
        request.dbsession.rollback()
        raise Response(status=500, json_body={'message': 'Terjadi kesalahan pada database.'})

    log.info(f"Location {lokasi_to_delete.nama_lokasi} deleted.")
    return Response(status=204) # No Content