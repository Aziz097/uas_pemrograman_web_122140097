# superbmd_backend/views/__init__.py

# Import semua view functions dari modul-modul spesifik Anda
# Ini diperlukan agar config.scan() di __init__.py utama dapat menemukannya
from .auth_views import login # Hanya login yang diekspos jika add_initial_admin_user tidak diekspos sebagai view
from .user_views import (
    users_list,
    users_create,
    users_detail,
    users_update,
    users_delete
)
from .lokasi_views import (
    lokasi_list,    lokasi_create,
    lokasi_detail,
    lokasi_update,
    lokasi_delete
)
from .barang_views import (
    barang_list,
    barang_create,
    barang_detail,
    barang_update,
    barang_delete
)
from .dashboard_views import dashboard_data
from .report_views import (
    report_assets_by_location,
    report_assets_by_condition,
    report_assets_in_out
)

# Setelah mengimpornya di sini, config.scan('superbmd_backend.views')
# atau config.scan() di __init__.py utama akan menemukan semua view ini.