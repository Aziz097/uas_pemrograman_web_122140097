# superbmd_backend/views/user_views.py
from pyramid.view import view_config
from pyramid.response import Response
from pyramid.httpexceptions import HTTPNotFound, HTTPBadRequest # HTTPForbidden mungkin tidak lagi diperlukan
from sqlalchemy.exc import IntegrityError, DBAPIError
from marshmallow import ValidationError
import logging

from ..schemas.myschema import UserSchema, UserCreateSchema, UserUpdateSchema, UserListSchema, LoginSchema 
from ..models.mymodel import User, UserRole
from ..services.user_service import UserService

log = logging.getLogger(__name__)

# Schema instances
user_schema = UserSchema()
user_create_schema = UserCreateSchema()
user_update_schema = UserUpdateSchema()
users_list_schema = UserListSchema()
login_schema = LoginSchema() 

@view_config(route_name='users_list', renderer='json', request_method='GET') # Hapus permission
def users_list(request):
    """
    Retrieves a paginated list of users. Accessible by anyone.
    """
    page = int(request.params.get('page', 1))
    limit = int(request.params.get('limit', 10))
    search_term = request.params.get('search', '').strip()

    all_users = UserService.get_all_users(request.dbsession, search_term)

    total_items = len(all_users)
    users = all_users[(page - 1) * limit : page * limit]
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

@view_config(route_name='users_create', renderer='json', request_method='POST') # Hapus permission
def users_create(request):
    """
    Creates a new user. Accessible by anyone (otorisasi di frontend).
    """
    try:
        user_data = user_create_schema.load(request.json_body)
    except ValidationError as e:
        log.error(f"User creation validation error: {e.messages}")
        raise HTTPBadRequest(json_body={'message': 'Invalid request body', 'errors': e.messages})

    if UserService.get_user_by_username(request.dbsession, user_data['username']):
        raise HTTPBadRequest(json_body={'message': 'Username sudah digunakan.'})

    try:
        new_user = UserService.create_user(request.dbsession, user_data)
    except IntegrityError:
        request.dbsession.rollback()
        raise HTTPBadRequest(json_body={'message': 'Gagal membuat user. Data mungkin tidak valid.'})
    except DBAPIError as e:
        log.error(f"Database error during user creation: {e}")
        request.dbsession.rollback()
        raise Response(status=500, json_body={'message': 'Terjadi kesalahan pada database.'})

    # Hapus logika logging yang bergantung pada request.identity
    log.info(f"User {new_user.username} created.") # Pesan log diubah
    return user_schema.dump(new_user), 201

@view_config(route_name='users_detail', renderer='json', request_method='GET') # Hapus permission
def users_detail(request):
    """
    Retrieves details of a specific user. Accessible by anyone.
    """
    user_id = int(request.matchdict['id'])
    
    user = UserService.get_user_by_id(request.dbsession, user_id)
    
    if not user:
        raise HTTPNotFound(json_body={'message': 'Pengguna tidak ditemukan.'})

    return user_schema.dump(user)

@view_config(route_name='users_update', renderer='json', request_method='PUT') # Hapus permission
def users_update(request):
    """
    Updates an existing user. Accessible by anyone (otorisasi di frontend).
    """
    user_id = int(request.matchdict['id'])
    
    existing_user = UserService.get_user_by_id(request.dbsession, user_id)
    
    if not existing_user:
        raise HTTPNotFound(json_body={'message': 'Pengguna tidak ditemukan.'})

    try:
        update_data = user_update_schema.load(request.json_body, partial=True)
    except ValidationError as e:
        log.error(f"User update validation error for user {user_id}: {e.messages}")
        raise HTTPBadRequest(json_body={'message': 'Invalid request body', 'errors': e.messages})

    # Hapus logika otorisasi ini
    # current_user_id_from_token = request.identity.get('id_user')
    # if current_user_id_from_token is not None and existing_user.id == current_user_id_from_token:
    #     if 'role' in update_data and UserRole(update_data['role']) != existing_user.role:
    #         raise HTTPForbidden(json_body={'message': 'Admin tidak dapat mengubah role akun sendiri.'})

    try:
        updated_user = UserService.update_user(request.dbsession, existing_user, update_data)
    except IntegrityError:
        request.dbsession.rollback()
        raise HTTPBadRequest(json_body={'message': 'Gagal memperbarui user. Data mungkin tidak valid.'})
    except DBAPIError as e:
        log.error(f"Database error during user update for user {user_id}: {e}")
        request.dbsession.rollback()
        raise Response(status=500, json_body={'message': 'Terjadi kesalahan pada database.'})

    # Hapus logika logging yang bergantung pada request.identity
    log.info(f"User {updated_user.username} updated.") # Pesan log diubah
    return user_schema.dump(updated_user)

@view_config(route_name='users_delete', renderer='json', request_method='DELETE') # Hapus permission
def users_delete(request):
    """
    Deletes a user. Accessible by anyone (otorisasi di frontend).
    """
    user_id = int(request.matchdict['id'])

    # Hapus logika otorisasi ini
    # current_user_id_from_token = request.identity.get('id_user')
    # if current_user_id_from_token is not None and int(user_id) == current_user_id_from_token:
    #     raise HTTPForbidden(json_body={'message': 'Admin tidak dapat menghapus akun sendiri.'})

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

    # Hapus logika logging yang bergantung pada request.identity
    log.info(f"User {user_to_delete.username} deleted.") # Pesan log diubah
    return Response(status=204) # No Content

@view_config(
    route_name='users_login',
    renderer='json',
    request_method='POST'
)
def users_login(request):
    """
    Endpoint untuk “login” sederhana: 
    menerima JSON { "username": "...", "password": "..." } 
    lalu mengembalikan password yang tersimpan di DB (plain text).
    """
    # 1. Validasi request body dengan LoginSchema
    try:
        data = login_schema.load(request.json_body)
    except ValidationError as e:
        log.error(f"Login validation error: {e.messages}")
        raise HTTPBadRequest(json_body={
            'message': 'Invalid request body',
            'errors': e.messages
        })

    username = data.get('username')
    # (catatan: parameter "password" di body bisa saja digunakan untuk verifikasi,
    #  tapi di skenario ini kita hanya “menampilkan” password DB tanpa pengecekan.)
    # password_input = data.get('password')

    # 2. Ambil user berdasarkan username
    user = UserService.get_user_by_username(request.dbsession, username)
    if not user:
        # Jika user tidak ditemukan, kembalikan HTTP 404
        raise HTTPNotFound(json_body={'message': 'Pengguna tidak ditemukan.'})

    # 3. Kembalikan password yang tersimpan di DB
    #    (di sini diasumsikan memang plain text & kita TRUST bahwa frontend memang butuh ini)
    return {
        'id': user.id,
        'username': user.username,
        'password': user.password,
        'role': user.role.value
    }