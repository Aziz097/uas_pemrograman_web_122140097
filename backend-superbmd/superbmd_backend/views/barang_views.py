from pyramid.view import view_config
from pyramid.response import Response
from pyramid.httpexceptions import HTTPNotFound, HTTPBadRequest, HTTPForbidden
from sqlalchemy.exc import IntegrityError, DBAPIError
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy import func
import logging
import datetime

from ..schemas import BarangSchema, BarangListSchema
from ..models.mymodel import Barang, Lokasi, KondisiBarang
from ..security.auth import get_user_roles # Diperlukan untuk otorisasi penanggung jawab

log = logging.getLogger(__name__)

# Schema instances
barang_schema = BarangSchema()
barang_list_schema = BarangListSchema()

@view_config(route_name='barang_list', renderer='json', request_method='GET', permission='authenticated')
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

    query = request.dbsession.query(Barang).join(Lokasi) # Join with Lokasi for filtering/display

    # Otorisasi: Penanggung jawab hanya bisa melihat aset mereka sendiri
    current_user_roles = request.identity.get('role', []) if request.identity else []
    current_username = request.identity.get('sub') if request.identity else None

    if 'role:penanggung_jawab' in current_user_roles and 'role:admin' not in current_user_roles:
        query = query.filter(Barang.penanggung_jawab == current_username)

    # Apply filters
    if search_term:
        query = query.filter(
            (Barang.nama_barang.ilike(f'%{search_term}%')) |
            (Barang.kode_barang.ilike(f'%{search_term}%'))
        )
    if location_id_filter:
        query = query.filter(Barang.id_lokasi == int(location_id_filter))
    if condition_filter:
        try:
            # Konversi string ke enum KondisiBarang
            condition_enum = KondisiBarang(condition_filter)
            query = query.filter(Barang.kondisi == condition_enum)
        except ValueError:
            raise HTTPBadRequest(json_body={'message': 'Kondisi barang tidak valid.'})
    if penanggung_jawab_filter:
        query = query.filter(Barang.penanggung_jawab.ilike(f'%{penanggung_jawab_filter}%'))

    if start_date_filter:
        try:
            start_dt = datetime.datetime.strptime(start_date_filter, '%Y-%m-%d')
            query = query.filter(Barang.tanggal_masuk >= start_dt)
        except ValueError:
            raise HTTPBadRequest(json_body={'message': 'Format start_date tidak valid (YYYY-MM-DD).'})

    if end_date_filter:
        try:
            end_dt = datetime.datetime.strptime(end_date_filter, '%Y-%m-%d') + datetime.timedelta(days=1) # Include full day
            query = query.filter(Barang.tanggal_masuk < end_dt)
        except ValueError:
            raise HTTPBadRequest(json_body={'message': 'Format end_date tidak valid (YYYY-MM-DD).'})


    total_items = query.count()
    barang = query.offset((page - 1) * limit).limit(limit).all()

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
        barang_data = barang_schema.load(request.json_body)
    except Exception as e:
        log.error(f"Barang creation validation error: {e.messages if hasattr(e, 'messages') else e}")
        raise HTTPBadRequest(json_body={'message': 'Invalid request body', 'errors': e.messages if hasattr(e, 'messages') else str(e)})

    # Cek apakah id_lokasi valid
    if request.dbsession.query(Lokasi).filter(Lokasi.id_lokasi == barang_data['id_lokasi']).count() == 0:
        raise HTTPBadRequest(json_body={'message': 'ID Lokasi tidak ditemukan.'})

    # Cek apakah kode_barang sudah ada
    if request.dbsession.query(Barang).filter(Barang.kode_barang == barang_data['kode_barang']).count() > 0:
        raise HTTPBadRequest(json_body={'message': 'Kode barang sudah digunakan.'})

    # Konversi kondisi string ke Enum
    barang_data['kondisi'] = KondisiBarang(barang_data['kondisi'])

    new_barang = Barang(**barang_data)
    request.dbsession.add(new_barang)
    try:
        request.dbsession.flush()
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
    barang_id = request.matchdict['id']
    try:
        barang = request.dbsession.query(Barang).filter(Barang.id_barang == barang_id).one()
    except NoResultFound:
        raise HTTPNotFound(json_body={'message': 'Barang tidak ditemukan.'})
    except DBAPIError as e:
        log.error(f"Database error retrieving barang {barang_id}: {e}")
        raise Response(status=500, json_body={'message': 'Terjadi kesalahan pada database.'})

    # Otorisasi untuk penanggung jawab
    current_user_roles = request.identity.get('role', []) if request.identity else []
    current_username = request.identity.get('sub') if request.identity else None
    if 'role:penanggung_jawab' in current_user_roles and 'role:admin' not in current_user_roles:
        if barang.penanggung_jawab != current_username:
            raise HTTPForbidden(json_body={'message': 'Anda tidak memiliki izin untuk melihat barang ini.'})

    # Load lokasi object for nested schema dump
    # This might already be loaded by default, but explicit is good.
    if barang.lokasi_obj is None:
        barang.lokasi_obj = request.dbsession.query(Lokasi).filter(Lokasi.id_lokasi == barang.id_lokasi).one_or_none()

    return barang_schema.dump(barang)

@view_config(route_name='barang_update', renderer='json', request_method='PUT', permission='role:admin')
def barang_update(request):
    """
    Updates an existing item. Only accessible by admin.
    """
    barang_id = request.matchdict['id']
    try:
        existing_barang = request.dbsession.query(Barang).filter(Barang.id_barang == barang_id).one()
    except NoResultFound:
        raise HTTPNotFound(json_body={'message': 'Barang tidak ditemukan.'})

    try:
        update_data = barang_schema.load(request.json_body, partial=True)
    except Exception as e:
        log.error(f"Barang update validation error for barang {barang_id}: {e.messages if hasattr(e, 'messages') else e}")
        raise HTTPBadRequest(json_body={'message': 'Invalid request body', 'errors': e.messages if hasattr(e, 'messages') else str(e)})

    # Cek apakah id_lokasi valid jika diupdate
    if 'id_lokasi' in update_data:
        if request.dbsession.query(Lokasi).filter(Lokasi.id_lokasi == update_data['id_lokasi']).count() == 0:
            raise HTTPBadRequest(json_body={'message': 'ID Lokasi tidak ditemukan.'})

    # Cek apakah kode_barang yang diupdate sudah digunakan oleh barang lain
    if 'kode_barang' in update_data and update_data['kode_barang'] != existing_barang.kode_barang:
        if request.dbsession.query(Barang).filter(Barang.kode_barang == update_data['kode_barang']).count() > 0:
            raise HTTPBadRequest(json_body={'message': 'Kode barang sudah digunakan oleh barang lain.'})

    # Update tanggal_pembaruan jika ada perubahan relevan
    if update_data: # If any fields are actually being updated
        update_data['tanggal_pembaruan'] = datetime.datetime.now() # Update timestamp

    for key, value in update_data.items():
        if key == 'kondisi': # Convert string to Enum
            setattr(existing_barang, key, KondisiBarang(value))
        else:
            setattr(existing_barang, key, value)

    try:
        request.dbsession.flush()
    except IntegrityError:
        request.dbsession.rollback()
        raise HTTPBadRequest(json_body={'message': 'Gagal memperbarui barang. Data mungkin tidak valid.'})
    except DBAPIError as e:
        log.error(f"Database error during barang update for barang {barang_id}: {e}")
        request.dbsession.rollback()
        raise Response(status=500, json_body={'message': 'Terjadi kesalahan pada database.'})

    log.info(f"Barang {existing_barang.nama_barang} updated.")
    return barang_schema.dump(existing_barang)


@view_config(route_name='barang_delete', renderer='json', request_method='DELETE', permission='role:admin')
def barang_delete(request):
    """
    Deletes an item. Only accessible by admin.
    """
    barang_id = request.matchdict['id']
    try:
        barang_to_delete = request.dbsession.query(Barang).filter(Barang.id_barang == barang_id).one()
    except NoResultFound:
        raise HTTPNotFound(json_body={'message': 'Barang tidak ditemukan.'})
    except DBAPIError as e:
        log.error(f"Database error deleting barang {barang_id}: {e}")
        raise Response(status=500, json_body={'message': 'Terjadi kesalahan pada database.'})

    request.dbsession.delete(barang_to_delete)
    try:
        request.dbsession.flush()
    except DBAPIError as e:
        log.error(f"Database error during barang deletion for barang {barang_id}: {e}")
        request.dbsession.rollback()
        raise Response(status=500, json_body={'message': 'Terjadi kesalahan pada database.'})

    log.info(f"Barang {barang_to_delete.nama_barang} deleted.")
    return Response(status=204) # No Content