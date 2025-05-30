# superbmd_backend/views/user_views.py
from pyramid.view import view_config
from pyramid.response import Response
from pyramid.httpexceptions import HTTPNotFound, HTTPBadRequest, HTTPForbidden
from sqlalchemy.exc import IntegrityError, DBAPIError
from sqlalchemy.orm.exc import NoResultFound
from marshmallow import ValidationError # Import ValidationError dari Marshmallow [cite: 46]
import logging

from ..schemas.myschema import UserSchema, UserCreateSchema, UserUpdateSchema, UserListSchema
from ..models.mymodel import User, UserRole # Import UserRole
from ..services.user_service import UserService # Import UserService

log = logging.getLogger(__name__)

# Schema instances
user_schema = UserSchema()
user_create_schema = UserCreateSchema()
user_update_schema = UserUpdateSchema()
users_list_schema = UserListSchema()

@view_config(route_name='users_list', renderer='json', request_method='GET', permission='role:admin')
def users_list(request):
    """
    Retrieves a paginated list of users. Only accessible by admin.
    """
    page = int(request.params.get('page', 1))
    limit = int(request.params.get('limit', 10))
    search_term = request.params.get('search', '').strip()

    # Gunakan Service Layer
    all_users = UserService.get_all_users(request.dbsession, search_term)

    total_items = len(all_users)
    users = all_users[(page - 1) * limit : page * limit] # Lakukan paginasi di sini

    total_pages = (total_items + limit - 1) // limit

    return users_list_schema.dump({
        'items': users,
        'pagination': {
            'total_items': total_items,
            'total_pages': total_pages,
            'current_page': page,
            'items_per_page': limit
        }
    })

@view_config(route_name='users_create', renderer='json', request_method='POST', permission='role:admin')
# <<< PENTING: Untuk membuat admin awal, permission='role:admin' harus DIKOMEN SEMENTARA, lalu diaktifkan kembali >>>
# @view_config(route_name='users_create', renderer='json', request_method='POST')
def users_create(request):
    """
    Creates a new user. Only accessible by admin (after initial setup).
    """
    try:
        user_data = user_create_schema.load(request.json_body) # Gunakan UserCreateSchema [cite: 46]
    except ValidationError as e:
        log.error(f"User creation validation error: {e.messages}")
        raise HTTPBadRequest(json_body={'message': 'Invalid request body', 'errors': e.messages})

    # Cek apakah username sudah ada melalui Service
    if UserService.get_user_by_username(request.dbsession, user_data['username']):
        raise HTTPBadRequest(json_body={'message': 'Username sudah digunakan.'})

    try:
        # Gunakan Service Layer untuk membuat user
        new_user = UserService.create_user(request.dbsession, user_data)
    except IntegrityError: # Error dari DB jika ada constraint violation lain
        request.dbsession.rollback()
        raise HTTPBadRequest(json_body={'message': 'Gagal membuat user. Data mungkin tidak valid.'})
    except DBAPIError as e:
        log.error(f"Database error during user creation: {e}")
        request.dbsession.rollback()
        raise Response(status=500, json_body={'message': 'Terjadi kesalahan pada database.'})

    log.info(f"User {new_user.username} created by {request.identity.get('sub', 'Unknown User')} (ID: {request.identity.get('id_user', 'N/A')}).")
    return user_schema.dump(new_user), 201

@view_config(route_name='users_detail', renderer='json', request_method='GET', permission='role:admin')
def users_detail(request):
    """
    Retrieves details of a specific user. Only accessible by admin.
    """
    user_id = int(request.matchdict['id']) # ID dari URL adalah int
    
    # Gunakan Service Layer
    user = UserService.get_user_by_id(request.dbsession, user_id)
    
    if not user:
        raise HTTPNotFound(json_body={'message': 'Pengguna tidak ditemukan.'})

    return user_schema.dump(user)

@view_config(route_name='users_update', renderer='json', request_method='PUT', permission='role:admin')
def users_update(request):
    """
    Updates an existing user. Only accessible by admin.
    Admin cannot change their own role or delete themselves.
    """
    user_id = int(request.matchdict['id']) # ID dari URL adalah int
    
    # Gunakan Service Layer
    existing_user = UserService.get_user_by_id(request.dbsession, user_id)
    
    if not existing_user:
        raise HTTPNotFound(json_body={'message': 'Pengguna tidak ditemukan.'})

    try:
        update_data = user_update_schema.load(request.json_body, partial=True) # Gunakan UserUpdateSchema [cite: 46]
    except ValidationError as e:
        log.error(f"User update validation error for user {user_id}: {e.messages}")
        raise HTTPBadRequest(json_body={'message': 'Invalid request body', 'errors': e.messages})

    # Otorisasi: Admin tidak bisa mengubah role dirinya sendiri
    current_user_id_from_token = request.identity.get('id_user') # ID user yang sedang login dari token
    if current_user_id_from_token is not None and existing_user.id == current_user_id_from_token:
        if 'role' in update_data and UserRole(update_data['role']) != existing_user.role:
            raise HTTPForbidden(json_body={'message': 'Admin tidak dapat mengubah role akun sendiri.'})

    try:
        # Gunakan Service Layer untuk update user
        updated_user = UserService.update_user(request.dbsession, existing_user, update_data)
    except IntegrityError:
        request.dbsession.rollback()
        raise HTTPBadRequest(json_body={'message': 'Gagal memperbarui user. Data mungkin tidak valid.'})
    except DBAPIError as e:
        log.error(f"Database error during user update for user {user_id}: {e}")
        request.dbsession.rollback()
        raise Response(status=500, json_body={'message': 'Terjadi kesalahan pada database.'})

    log.info(f"User {updated_user.username} updated by {request.identity.get('sub', 'Unknown User')}.")
    return user_schema.dump(updated_user)

@view_config(route_name='users_delete', renderer='json', request_method='DELETE', permission='role:admin')
def users_delete(request):
    """
    Deletes a user. Only accessible by admin.
    Admin cannot delete their own account.
    """
    user_id = int(request.matchdict['id']) # ID dari URL adalah int

    # Otorisasi: Admin tidak bisa menghapus akunnya sendiri
    current_user_id_from_token = request.identity.get('id_user')
    if current_user_id_from_token is not None and int(user_id) == current_user_id_from_token:
        raise HTTPForbidden(json_body={'message': 'Admin tidak dapat menghapus akun sendiri.'})

    # Gunakan Service Layer
    user_to_delete = UserService.get_user_by_id(request.dbsession, user_id)
    
    if not user_to_delete:
        raise HTTPNotFound(json_body={'message': 'Pengguna tidak ditemukan.'})
    
    try:
        UserService.delete_user(request.dbsession, user_to_delete)
    except IntegrityError:
        request.dbsession.rollback()
        raise HTTPBadRequest(json_body={'message': 'Gagal menghapus user. User mungkin memiliki relasi data lain.'})
    except DBAPIError as e:
        log.error(f"Database error during user deletion for user {user_id}: {e}")
        request.dbsession.rollback()
        raise Response(status=500, json_body={'message': 'Terjadi kesalahan pada database.'})

    log.info(f"User {user_to_delete.username} deleted by {request.identity.get('sub', 'Unknown User')}.")
    return Response(status=204) # No Content