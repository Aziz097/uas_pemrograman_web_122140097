import transaction
import datetime
import logging

# Impor fungsi yang diperlukan dari package aplikasi Anda
from pyramid.paster import get_appsettings, setup_logging
from sqlalchemy import engine_from_config

# Impor model dan fungsi sesi dari superbmd_backend.models
from ..models import get_session_factory, get_tm_session
from ..models.mymodel import User, Lokasi, Barang, KondisiBarang, UserRole
from ..security.auth import hash_password # Untuk hashing password user

log = logging.getLogger(__name__)

def main(argv=None):
    if argv is None:
        argv = []
    
    # Konfigurasi logging agar output terlihat di konsol
    setup_logging('development.ini') # Menggunakan development.ini untuk logging

    # Dapatkan pengaturan aplikasi dari development.ini
    config_uri = 'development.ini'
    settings = get_appsettings(config_uri)
    
    # Dapatkan engine database
    engine = engine_from_config(settings, 'sqlalchemy.')
    
    # Dapatkan session factory
    session_factory = get_session_factory(engine)
    
    log.info("Starting database initialization...")

    with transaction.manager:
        dbsession = get_tm_session(session_factory, transaction.manager)
        
        # --- Tambah Data Awal User ---
        log.info("Adding initial users...")
        users_data = [
            {'username': 'admin', 'password': 'admin123', 'role': UserRole.ADMIN},
            {'username': 'penanggungjawab', 'password': 'pj123', 'role': UserRole.PENANGGUNG_JAWAB},
            {'username': 'viewer', 'password': 'viewer123', 'role': UserRole.VIEWER},
        ]
        
        for user_info in users_data:
            existing_user = dbsession.query(User).filter_by(username=user_info['username']).first()
            if not existing_user:
                hashed_password = hash_password(user_info['password'])
                new_user = User(
                    username=user_info['username'],
                    password=hashed_password,
                    role=user_info['role']
                )
                dbsession.add(new_user)
                log.info(f"Added user: {user_info['username']}")
            else:
                log.info(f"User {user_info['username']} already exists, skipping.")
        dbsession.flush() # Flush untuk mendapatkan ID user jika diperlukan untuk Barang/Lokasi

        # --- Tambah Data Awal Lokasi ---
        log.info("Adding initial locations...")
        lokasi_data = [
            {'nama_lokasi': 'Kantor Pusat', 'kode_lokasi': 'KP001', 'alamat_lokasi': 'Jl. Merdeka No. 1, Jakarta'},
            {'nama_lokasi': 'Gudang Utama', 'kode_lokasi': 'GDG001', 'alamat_lokasi': 'Jl. Industri No. 10, Bekasi'},
            {'nama_lokasi': 'Cabang Bandung', 'kode_lokasi': 'CBD001', 'alamat_lokasi': 'Jl. Asia Afrika No. 5, Bandung'},
        ]

        # Simpan objek lokasi yang ditambahkan untuk referensi FK
        added_lokasi_map = {}
        for loc_info in lokasi_data:
            existing_lokasi = dbsession.query(Lokasi).filter_by(kode_lokasi=loc_info['kode_lokasi']).first()
            if not existing_lokasi:
                new_lokasi = Lokasi(**loc_info)
                dbsession.add(new_lokasi)
                dbsession.flush() # Flush untuk mendapatkan ID lokasi
                added_lokasi_map[new_lokasi.kode_lokasi] = new_lokasi
                log.info(f"Added location: {loc_info['nama_lokasi']}")
            else:
                added_lokasi_map[existing_lokasi.kode_lokasi] = existing_lokasi
                log.info(f"Location {loc_info['nama_lokasi']} already exists, skipping.")
        dbsession.flush()

        # --- Tambah Data Awal Barang ---
        log.info("Adding initial assets...")
        barang_data = [
            {
                'nama_barang': 'Laptop Premium',
                'kode_barang': 'LT001',
                'kondisi': KondisiBarang.BAIK,
                'kode_lokasi': 'KP001', # Menggunakan kode lokasi untuk mendapatkan ID
                'penanggung_jawab': 'admin',
                'tanggal_masuk': datetime.datetime(2023, 1, 15),
                'gambar_aset': None
            },
            {
                'nama_barang': 'Meja Ergonomis',
                'kode_barang': 'MJ001',
                'kondisi': KondisiBarang.RUSAK_RINGAN,
                'kode_lokasi': 'KP001',
                'penanggung_jawab': 'penanggungjawab',
                'tanggal_masuk': datetime.datetime(2023, 3, 20),
                'gambar_aset': None
            },
            {
                'nama_barang': 'Proyektor Ultra HD',
                'kode_barang': 'PJ001',
                'kondisi': KondisiBarang.BAIK,
                'kode_lokasi': 'GDG001',
                'penanggung_jawab': 'admin',
                'tanggal_masuk': datetime.datetime(2024, 2, 10),
                'gambar_aset': 'https://example.com/projector.jpg'
            },
        ]

        for item_info in barang_data:
            existing_barang = dbsession.query(Barang).filter_by(kode_barang=item_info['kode_barang']).first()
            if not existing_barang:
                # Dapatkan objek Lokasi dari kode_lokasi
                lokasi_obj = added_lokasi_map.get(item_info['kode_lokasi'])
                if lokasi_obj:
                    # Hapus 'kode_lokasi' dan tambahkan 'id_lokasi'
                    barang_fields = {k: v for k, v in item_info.items() if k != 'kode_lokasi'}
                    barang_fields['id_lokasi'] = lokasi_obj.id # FK ke id dari BaseModel

                    new_barang = Barang(**barang_fields)
                    dbsession.add(new_barang)
                    log.info(f"Added asset: {item_info['nama_barang']}")
                else:
                    log.warning(f"Location with code {item_info['kode_lokasi']} not found for asset {item_info['nama_barang']}, skipping.")
            else:
                log.info(f"Asset {item_info['nama_barang']} already exists, skipping.")
        dbsession.flush() # Commit semua perubahan sekaligus
    
    log.info("Database initialization complete.")

if __name__ == '__main__':
    main()