from pyramid.view import view_config
from pyramid.response import Response
from pyramid.httpexceptions import HTTPNotFound, HTTPBadRequest
from sqlalchemy.exc import IntegrityError, DBAPIError
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy import func
import logging


from ..schemas import UserSchema, UserListSchema
from ..models.mymodel import User, UserRole # Import UserRole
from ..security.auth import hash_password, verify_password

log = logging.getLogger(__name__)

# Schema instances
user_schema = UserSchema()
users_list_schema = UserListSchema()

@view_config(route_name='users_list', renderer='json', request_method='GET', permission='role:admin')
def users_list(request):
    """
    Retrieves a paginated list of users. Only accessible by admin.
    """
    page = int(request.params.get('page', 1))
    limit = int(request.params.get('limit', 10))
    search_term = request.params.get('search', '').strip()

    query = request.dbsession.query(User)

    if search_term:
        query = query.filter(User.username.ilike(f'%{search_term}%'))

    total_items = query.count()
    users = query.offset((page - 1) * limit).limit(limit).all()

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


@view_config(route_name='users_create', renderer='json', request_method='POST') # Hapus permission='role:admin'
def users_create(request):
    """
    Creates a new user. TEMPORARILY accessible without admin role for initial setup.
    """
    try:
        user_data = user_schema.load(request.json_body)
    except Exception as e:
        log.error(f"User creation validation error: {e.messages if hasattr(e, 'messages') else e}")
        raise HTTPBadRequest(json_body={'message': 'Invalid request body', 'errors': e.messages if hasattr(e, 'messages') else str(e)})

    # Cek apakah username sudah ada
    if request.dbsession.query(User).filter(User.username == user_data['username']).count() > 0:
        raise HTTPBadRequest(json_body={'message': 'Username sudah digunakan.'})

    hashed_password = hash_password(user_data['password'])
    new_user = User(
        username=user_data['username'],
        password=hashed_password,
        role=UserRole(user_data['role']) # Pastikan role dari string diubah ke Enum
    )
    request.dbsession.add(new_user)
    try:
        request.dbsession.flush() # Commit changes to get the ID
    except IntegrityError:
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
    user_id = request.matchdict['id']
    try:
        user = request.dbsession.query(User).filter(User.id_user == user_id).one()
    except NoResultFound:
        raise HTTPNotFound(json_body={'message': 'Pengguna tidak ditemukan.'})
    except DBAPIError as e:
        log.error(f"Database error retrieving user {user_id}: {e}")
        raise Response(status=500, json_body={'message': 'Terjadi kesalahan pada database.'})

    return user_schema.dump(user)

@view_config(route_name='users_update', renderer='json', request_method='PUT', permission='role:admin')
def users_update(request):
    """
    Updates an existing user. Only accessible by admin.
    Admin cannot change their own role.
    """
    user_id = request.matchdict['id']
    try:
        existing_user = request.dbsession.query(User).filter(User.id_user == user_id).one()
    except NoResultFound:
        raise HTTPNotFound(json_body={'message': 'Pengguna tidak ditemukan.'})

    try:
        # Gunakan partial=True untuk mengizinkan update sebagian field
        update_data = user_schema.load(request.json_body, partial=True)
    except Exception as e:
        log.error(f"User update validation error for user {user_id}: {e.messages if hasattr(e, 'messages') else e}")
        raise HTTPBadRequest(json_body={'message': 'Invalid request body', 'errors': e.messages if hasattr(e, 'messages') else str(e)})

    # Admin tidak bisa mengubah role dirinya sendiri
    current_user_id = request.identity.get('id_user')
    if current_user_id is not None and existing_user.id_user == current_user_id and 'role' in update_data and UserRole(update_data['role']) != existing_user.role:
        raise HTTPBadRequest(json_body={'message': 'Admin tidak dapat mengubah role akun sendiri.'})

    # Update password jika disediakan
    if 'password' in update_data and update_data['password']:
        existing_user.password = hash_password(update_data['password'])
    
    # Update role jika disediakan dan diizinkan
    if 'role' in update_data:
        existing_user.role = UserRole(update_data['role'])

    try:
        request.dbsession.flush()
    except IntegrityError:
        request.dbsession.rollback()
        raise HTTPBadRequest(json_body={'message': 'Gagal memperbarui user. Data mungkin tidak valid.'})
    except DBAPIError as e:
        log.error(f"Database error during user update for user {user_id}: {e}")
        request.dbsession.rollback()
        raise Response(status=500, json_body={'message': 'Terjadi kesalahan pada database.'})

    log.info(f"User {existing_user.username} updated by {request.identity.get('sub', 'Unknown User')}.")
    return user_schema.dump(existing_user)

    return user_schema.dump(existing_user)

@view_config(route_name='users_delete', renderer='json', request_method='DELETE', permission='role:admin')
def users_delete(request):
    """
    Deletes a user. Only accessible by admin.
    Admin cannot delete their own account.
    """
    user_id = request.matchdict['id']

    # Admin tidak bisa menghapus akunnya sendiri
    current_user_id = request.identity.get('id_user')
    if current_user_id is not None and int(user_id) == current_user_id:
        raise HTTPBadRequest(json_body={'message': 'Admin tidak dapat menghapus akun sendiri.'})


    try:
        user_to_delete = request.dbsession.query(User).filter(User.id_user == user_id).one()
    except NoResultFound:
        raise HTTPNotFound(json_body={'message': 'Pengguna tidak ditemukan.'})
    except DBAPIError as e:
        log.error(f"Database error deleting user {user_id}: {e}")
        raise Response(status=500, json_body={'message': 'Terjadi kesalahan pada database.'})

    request.dbsession.delete(user_to_delete)
    try:
        request.dbsession.flush()
    except IntegrityError:
        request.dbsession.rollback()
        raise HTTPBadRequest(json_body={'message': 'Gagal menghapus user. User mungkin memiliki relasi data lain.'})
    except DBAPIError as e:
        log.error(f"Database error during user deletion for user {user_id}: {e}")
        request.dbsession.rollback()
        raise Response(status=500, json_body={'message': 'Terjadi kesalahan pada database.'})

    log.info(f"User {user_to_delete.username} deleted by {request.identity.get('sub', 'Unknown User')}.")
    return Response(status=204) # No Content