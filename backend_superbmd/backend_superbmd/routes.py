def includeme(config):
    """Configure routes for SUPER BMD API."""

    # Authentication Route
    # Hapus baris ini karena autentikasi dipindahkan ke frontend
    # config.add_route('auth_login', '/api/auth/login') 

    # Dashboard Route
    config.add_route('dashboard', '/api/dashboard')

    # Barang (Assets) Routes
    # Perhatikan: Nama route harus sama dengan yang digunakan di views.py
    config.add_route('barang_list', '/api/barang') # GET (all) dan POST (create)
    config.add_route('barang_create', '/api/barang/create', request_method='POST') # Explicit POST for clarity
    config.add_route('barang_detail', '/api/barang/detail/{id}') # GET (detail), PUT (update), DELETE (delete)
    config.add_route('barang_update', '/api/barang/update/{id}', request_method='PUT') # Explicit PUT
    config.add_route('barang_delete', '/api/barang/delete/{id}', request_method='DELETE') # Explicit DELETE


    # Lokasi (Locations) Routes
    config.add_route('lokasi_list', '/api/lokasi') # GET (all) dan POST (create)
    config.add_route('lokasi_create', '/api/lokasi/create', request_method='POST') # Explicit POST
    config.add_route('lokasi_detail', '/api/lokasi/detail/{id}') # GET (detail), PUT (update), DELETE (delete)
    config.add_route('lokasi_update', '/api/lokasi/uptade/{id}', request_method='PUT') # Explicit PUT
    config.add_route('lokasi_delete', '/api/lokasi/delete/{id}', request_method='DELETE') # Explicit DELETE

    # Users Routes
    config.add_route('users_list', '/api/users') # GET (all) dan POST (create)
    config.add_route('users_create', '/api/users/create', request_method='POST') # Explicit POST
    config.add_route('users_detail', '/api/users/detail/{id}') # GET (detail), PUT (update), DELETE (delete)
    config.add_route('users_update', '/api/users/update/{id}', request_method='PUT') # Explicit PUT
    config.add_route('users_delete', '/api/users/delete/{id}', request_method='DELETE') # Explicit DELETE
    config.add_route('users_login', '/api/users/login', request_method='POST')

    # Report Routes
    config.add_route('report_assets_by_location', '/api/report/assets-by-location')
    config.add_route('report_assets_by_condition', '/api/report/assets-by-condition')
    config.add_route('report_assets_in_out', '/api/report/assets-in-out')

    # Catch-all for CORS OPTIONS requests (This route should be configured in __init__.py)
    # config.add_route('options_fallback', '/{catchall:.*}', request_method='OPTIONS')
    # Route ini sudah kita definisikan di superbmd_backend/__init__.py,
    # jadi tidak perlu didefinisikan lagi di sini.