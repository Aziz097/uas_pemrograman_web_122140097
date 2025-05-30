def includeme(config):
    """Configure routes for SUPER BMD API."""

    # Authentication Route
    config.add_route('auth_login', '/api/auth/login')

    # Dashboard Route
    config.add_route('dashboard', '/api/dashboard')

    # Barang (Assets) Routes
    # Perhatikan: Nama route harus sama dengan yang digunakan di views.py
    config.add_route('barang_list', '/api/barang') # GET (all) dan POST (create)
    config.add_route('barang_create', '/api/barang', request_method='POST') # Explicit POST for clarity
    config.add_route('barang_detail', '/api/barang/{id}') # GET (detail), PUT (update), DELETE (delete)
    config.add_route('barang_update', '/api/barang/{id}', request_method='PUT') # Explicit PUT
    config.add_route('barang_delete', '/api/barang/{id}', request_method='DELETE') # Explicit DELETE


    # Lokasi (Locations) Routes
    config.add_route('lokasi_list', '/api/lokasi') # GET (all) dan POST (create)
    config.add_route('lokasi_create', '/api/lokasi', request_method='POST') # Explicit POST
    config.add_route('lokasi_detail', '/api/lokasi/{id}') # GET (detail), PUT (update), DELETE (delete)
    config.add_route('lokasi_update', '/api/lokasi/{id}', request_method='PUT') # Explicit PUT
    config.add_route('lokasi_delete', '/api/lokasi/{id}', request_method='DELETE') # Explicit DELETE

    # Users Routes
    config.add_route('users_list', '/api/users') # GET (all) dan POST (create)
    config.add_route('users_create', '/api/users', request_method='POST') # Explicit POST
    config.add_route('users_detail', '/api/users/{id}') # GET (detail), PUT (update), DELETE (delete)
    config.add_route('users_update', '/api/users/{id}', request_method='PUT') # Explicit PUT
    config.add_route('users_delete', '/api/users/{id}', request_method='DELETE') # Explicit DELETE

    # Report Routes
    config.add_route('report_assets_by_location', '/api/report/assets-by-location')
    config.add_route('report_assets_by_condition', '/api/report/assets-by-condition')
    config.add_route('report_assets_in_out', '/api/report/assets-in-out')

    # Catch-all for CORS OPTIONS requests (This route should be configured in __init__.py)
    # config.add_route('options_fallback', '/{catchall:.*}', request_method='OPTIONS')
    # Route ini sudah kita definisikan di superbmd_backend/__init__.py,
    # jadi tidak perlu didefinisikan lagi di sini.