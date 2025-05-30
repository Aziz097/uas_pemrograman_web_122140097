# superbmd_backend/views/auth_views.py
from pyramid.view import view_config
from pyramid.response import Response
from pyramid.httpexceptions import HTTPBadRequest, HTTPUnauthorized
from sqlalchemy.exc import DBAPIError
from sqlalchemy.orm.exc import NoResultFound
from marshmallow import ValidationError # Import ValidationError [cite: 46]
import logging

from ..schemas.myschema import LoginSchema, UserSchema # UserSchema untuk response user info
from ..models.mymodel import User # Import model User
from ..security.auth import verify_password, hash_password # Untuk hashing dan verifikasi password

log = logging.getLogger(__name__)

@view_config(route_name='auth_login', renderer='json', request_method='POST')
def login(request):
    """
    Handles user login and issues a JWT token.
    """
    try:
        login_data = LoginSchema().load(request.json_body)
    except ValidationError as e: # Catch ValidationError dari Marshmallow [cite: 46]
        log.error(f"Login validation error: {e.messages}")
        raise HTTPBadRequest(json_body={'message': 'Invalid request body', 'errors': e.messages})

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
    claims = {
        'sub': user.username, # Subject of the token (username)
        'role': user.role.value, # Role user
        'id_user': user.id # ID user dari BaseModel
    }
    token = request.create_jwt_token(user.username, claims=claims)

    log.info(f"User {username} logged in successfully.")
    return {
        'message': 'Login successful',
        'token': token,
        'user': {
            'id_user': user.id, # Kirim ID dari BaseModel
            'username': user.username,
            'role': user.role.value
        }
    }

# Endpoint untuk pembuatan admin awal (sementara, untuk bootstrapping)
# Setelah admin pertama dibuat, aktifkan kembali permission='role:admin' di __init__.py
# Pastikan ini hanya untuk tujuan dev, tidak di produksi
# @view_config(route_name='users_create', renderer='json', request_method='POST') # Dikomen agar tidak konflik dengan user_views.users_create
def add_initial_admin_user_dev_only(request):
    """
    Adds an initial admin user if not exists. For development bootstrapping ONLY.
    Should be run once, then permission re-enabled for users_create or this removed.
    """
    from ..services.user_service import UserService # Import di sini untuk menghindari circular import jika ada
    
    username = request.json_body.get('username')
    password = request.json_body.get('password')
    role = request.json_body.get('role', 'admin')

    if not username or not password:
        raise HTTPBadRequest(json_body={'message': 'Username dan password harus diisi.'})

    try:
        # Cek apakah user sudah ada melalui service
        existing_user = UserService.get_user_by_username(request.dbsession, username)
        if existing_user:
            return Response(status=200, json_body={'message': 'Admin user already exists.'})

        # Buat user melalui service
        new_user = UserService.create_user(request.dbsession, {'username': username, 'password': password, 'role': role})

        return Response(status=201, json_body={'message': 'Initial admin user created successfully!', 'user_id': new_user.id})
    except Exception as e:
        log.error(f"Error creating initial admin user: {e}")
        raise Response(status=500, json_body={'message': 'Failed to create initial admin user.'})