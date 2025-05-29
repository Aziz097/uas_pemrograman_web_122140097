from pyramid.config import Configurator
from sqlalchemy import engine_from_config
from .models.meta import Base
from pyramid.authentication import AuthTktAuthenticationPolicy
from pyramid.authorization import ACLAuthorizationPolicy
from .security.auth import get_user_roles
from pyramid.response import Response
from pyramid.view import view_config

from sqlalchemy.orm import sessionmaker, scoped_session
from zope.sqlalchemy import ZopeTransactionEvents 

# Import semua view modules yang baru dibuat
from .views import auth_views
from .views import user_views
from .views import lokasi_views
from .views import barang_views
from .views import dashboard_views
from .views import report_views

def add_cors_headers_response_callback(event):
    """Callback untuk menambahkan header CORS ke setiap respons."""
    def add_cors_headers(request, response):
        origin = request.headers.get('Origin')
        if origin and origin in request.registry.settings.get('pyramid.origins', '').split(','):
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Methods'] = 'POST,GET,DELETE,PUT,OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Max-Age'] = '3600'
        return response
    event.request.add_response_callback(add_cors_headers)

@view_config(route_name='options_fallback')
def options_view(request):
    """Handle CORS preflight requests (OPTIONS)."""
    response = Response()
    return response

def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    with Configurator(settings=settings) as config:
        # Konfigurasi database SQLAlchemy
        engine = engine_from_config(settings, 'sqlalchemy.')
        Base.metadata.bind = engine

        # Konfigurasi Sesi Database dengan pyramid_tm
        DBSession = scoped_session(sessionmaker(expire_on_commit=False))
        DBSession.configure(bind=engine) # Kaitkan sesi dengan engine

        # AKTIFKAN EVENT ZopeTransactionEvents setelah DBSession dibuat
        ZopeTransactionEvents(DBSession)

        config.include('pyramid_tm')
        config.include('pyramid_retry')

        # Konfigurasi Autentikasi dan Otorisasi
        config.include('pyramid_jwt')

        authn_policy = AuthTktAuthenticationPolicy(
            settings['pyramid_jwt.secret'],
            callback=get_user_roles,
            hashalg='sha512'
        )
        config.set_authentication_policy(authn_policy)

        authz_policy = ACLAuthorizationPolicy()
        config.set_authorization_policy(authz_policy)

        # Tambahkan callback untuk header CORS
        config.add_subscriber(add_cors_headers_response_callback, 'pyramid.events.NewResponse')
        config.add_route('options_fallback', '/{catchall:.*}', request_method='OPTIONS')


        # Konfigurasi Routes
        config.add_route('auth_login', '/api/auth/login')
        config.add_route('dashboard', '/api/dashboard')

        config.add_route('barang_list', '/api/barang', request_method='GET')
        config.add_route('barang_create', '/api/barang', request_method='POST')
        config.add_route('barang_detail', '/api/barang/{id}', request_method='GET')
        config.add_route('barang_update', '/api/barang/{id}', request_method='PUT')
        config.add_route('barang_delete', '/api/barang/{id}', request_method='DELETE')

        config.add_route('lokasi_list', '/api/lokasi', request_method='GET')
        config.add_route('lokasi_create', '/api/lokasi', request_method='POST')
        config.add_route('lokasi_detail', '/api/lokasi/{id}', request_method='GET')
        config.add_route('lokasi_update', '/api/lokasi/{id}', request_method='PUT')
        config.add_route('lokasi_delete', '/api/lokasi/{id}', request_method='DELETE')

        config.add_route('users_list', '/api/users', request_method='GET')
        config.add_route('users_create', '/api/users', request_method='POST')
        config.add_route('users_detail', '/api/users/{id}', request_method='GET')
        config.add_route('users_update', '/api/users/{id}', request_method='PUT')
        config.add_route('users_delete', '/api/users/{id}', request_method='DELETE')

        config.add_route('report_assets_by_location', '/api/report/assets-by-location')
        config.add_route('report_assets_by_condition', '/api/report/assets-by-condition')
        config.add_route('report_assets_in_out', '/api/report/assets-in-out')

        # Scan semua modul view
        config.scan('superbmd_backend.views.auth_views')
        config.scan('superbmd_backend.views.user_views')
        config.scan('superbmd_backend.views.lokasi_views')
        config.scan('superbmd_backend.views.barang_views')
        config.scan('superbmd_backend.views.dashboard_views')
        config.scan('superbmd_backend.views.report_views')

    return config.make_wsgi_app()