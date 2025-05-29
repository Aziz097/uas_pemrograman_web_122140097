from pyramid.view import view_config
from pyramid.response import Response
from pyramid.httpexceptions import HTTPBadRequest, HTTPUnauthorized
# Hapus baris berikut: from pyramid_jwt import JWTClaims
from sqlalchemy.exc import DBAPIError
from sqlalchemy.orm.exc import NoResultFound
import logging

from ..schemas import LoginSchema, UserSchema
from ..models.mymodel import User
from ..security.auth import verify_password, hash_password

log = logging.getLogger(__name__)

@view_config(route_name='auth_login', renderer='json', request_method='POST')
def login(request):
    """
    Handles user login and issues a JWT token.
    """
    try:
        login_data = LoginSchema().load(request.json_body)
    except Exception as e:
        log.error(f"Login validation error: {e.messages if hasattr(e, 'messages') else e}")
        raise HTTPBadRequest(json_body={'message': 'Invalid request body', 'errors': e.messages if hasattr(e, 'messages') else str(e)})

    username = login_data['username']
    password = login_data['password']

    try:
        user = request.dbsession.query(User).filter(User.username == username).one()
    except NoResultFound:
        log.warning(f"Login attempt for non-existent user: {username}")
        raise HTTPUnauthorized(json_body={'message': 'Username atau password salah.'})
    except DBAPIError as e:
        log.error(f"Database error during login for user {username}: {e}")
        raise Response(status=500, json_body={'message': 'Terjadi kesalahan pada database.'})

    if not verify_password(password, user.password):
        log.warning(f"Failed login attempt for user: {username}")
        raise HTTPUnauthorized(json_body={'message': 'Username atau password salah.'})

    # Buat JWT claims sebagai dictionary biasa
    # Pyramid_jwt secara internal akan mengubah ini menjadi objek claims yang sesuai
    claims = {
        'sub': user.username, # Subject of the token (usually user ID or username)
        'role': user.role.value, # Custom claim for user role
        'id_user': user.id_user # Custom claim for user ID
    }
    token = request.create_jwt_token(user.username, claims=claims)

    log.info(f"User {username} logged in successfully.")
    return {
        'message': 'Login successful',
        'token': token,
        'user': {
            'id_user': user.id_user,
            'username': user.username,
            'role': user.role.value
        }
    }

# Contoh untuk menambahkan user awal (Hanya untuk dev/setup awal, JANGAN di production)
# Anda bisa menjalankan ini sekali secara manual atau membuat endpoint admin untuk pendaftaran
# @view_config(route_name='users_create', renderer='json', request_method='POST') # Re-use route for initial admin
def add_initial_admin_user(request):
    """
    Adds an initial admin user if not exists.
    This should be handled securely in production (e.g., via CLI, not API).
    """
    if request.json_body.get('username') != 'admin' or request.json_body.get('password') != 'admin123':
        raise HTTPBadRequest(json_body={'message': 'Hanya untuk pembuatan admin awal dengan kredensial spesifik.'})

    username = request.json_body.get('username')
    password = request.json_body.get('password')
    role = request.json_body.get('role', 'admin')

    try:
        existing_user = request.dbsession.query(User).filter(User.username == username).one_or_none()
        if existing_user:
            return Response(status=200, json_body={'message': 'Admin user already exists.'})

        hashed_password = hash_password(password)
        new_user = User(username=username, password=hashed_password, role=role)
        request.dbsession.add(new_user)
        request.dbsession.flush() # Flush to get id_user

        return Response(status=201, json_body={'message': 'Initial admin user created successfully!', 'user_id': new_user.id_user})
    except Exception as e:
        log.error(f"Error creating initial admin user: {e}")
        raise Response(status=500, json_body={'message': 'Failed to create initial admin user.'})