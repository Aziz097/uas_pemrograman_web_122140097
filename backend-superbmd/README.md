# SUPER BMD Backend

Backend untuk Sistem Unggul Pengelolaan Elektronik dan Reporting Barang Milik Daerah (SUPER BMD). Backend ini bertanggung jawab untuk mengelola data aset, lokasi, dan pengguna, serta menyediakan API RESTful untuk diakses oleh aplikasi frontend.

## Fitur Utama

* **Autentikasi Pengguna:** Berbasis JWT (JSON Web Tokens).
* **Manajemen Pengguna:** Fungsi CRUD untuk user dengan peran (admin, penanggung_jawab, viewer).
* **Manajemen Lokasi:** Fungsi CRUD untuk data lokasi aset.
* **Manajemen Barang (Aset):** Fungsi CRUD untuk data barang milik daerah, termasuk kondisi, lokasi, dan penanggung jawab.
* **Data Dashboard:** Endpoint API untuk mendapatkan ringkasan data agregat (total aset, total lokasi, aset per kondisi/lokasi).
* **Laporan:** Endpoint API untuk menghasilkan laporan aset per lokasi, per kondisi, dan riwayat masuk/keluar.
* **Otorisasi Berbasis Peran:** Menggunakan ACL Authorization Policy Pyramid untuk mengontrol akses endpoint berdasarkan peran pengguna (misal: hanya admin yang bisa CRUD user/lokasi).
* **Validasi Data:** Menggunakan Marshmallow untuk validasi data request.
* **Transaksi Database:** Menggunakan `pyramid_tm` untuk manajemen transaksi otomatis.
* **Migrasi Database:** Menggunakan Alembic untuk mengelola perubahan skema database.
* **CORS:** Dikonfigurasi untuk mengizinkan permintaan dari frontend Anda.

## Teknologi yang Digunakan

* **Framework:** Python Pyramid
* **Server WSGI:** Waitress
* **ORM:** SQLAlchemy
* **Driver Database:** Psycopg2 (untuk PostgreSQL)
* **Migrasi Database:** Alembic
* **Database:** PostgreSQL
* **Autentikasi:** Pyramid JWT
* **Hashing Password:** Bcrypt
* **Validasi & Serialisasi:** Marshmallow

## Instalasi dan Setup

Pastikan Anda memiliki Python (disarankan 3.8+) dan PostgreSQL terinstal.

1.  **Clone Repository Backend:**
    ```bash
    git clone [https://github.com/your-repo/superbmd-backend.git](https://github.com/your-repo/superbmd-backend.git) # Ganti dengan URL repo Anda
    cd superbmd-backend
    ```

2.  **Buat dan Aktifkan Virtual Environment:**
    ```bash
    python -m venv venv_superbmd_backend
    # Di Windows: .\venv_superbmd_backend\Scripts\activate
    # Di macOS/Linux: source venv_superbmd_backend/bin/activate
    ```

3.  **Instal Dependensi:**
    ```bash
    pip install -e . # Menginstal proyek ini dan semua dependensinya dari setup.py
    ```

4.  **Setup Database PostgreSQL:**
    Buat database PostgreSQL baru dan user khusus untuk aplikasi ini.
    * **Database Name:** `superbmd_db`
    * **User Name:** `superbmd_user`
    * **Password:** `your_secure_password` (Ganti dengan password yang kuat)

    Anda bisa menggunakan `psql` (command-line) atau pgAdmin (GUI). Contoh via `psql`:
    ```sql
    CREATE USER superbmd_user WITH PASSWORD 'your_secure_password';
    CREATE DATABASE superbmd_db OWNER superbmd_user;
    GRANT ALL PRIVILEGES ON DATABASE superbmd_db TO superbmd_user;
    ```

5.  **Konfigurasi `development.ini`:**
    Buka `development.ini` dan sesuaikan string koneksi database (`sqlalchemy.url`) dengan kredensial yang baru Anda buat. Sesuaikan juga `pyramid_jwt.secret` dengan kunci yang kuat (untuk pengembangan). Pastikan `pyramid.origins` sesuai dengan URL frontend pengembangan Anda (misalnya `http://localhost:5173`).

    ```ini
    # development.ini
    sqlalchemy.url = postgresql://superbmd_user:your_secure_password@localhost:5432/superbmd_db
    pyramid_jwt.secret = your_dev_secret_key
    pyramid.origins = http://localhost:5173
    ```

6.  **Inisialisasi dan Jalankan Migrasi Database dengan Alembic:**
    * Inisialisasi Alembic (hanya sekali):
        ```bash
        alembic init alembic
        ```
    * Pastikan `alembic/env.py` mengimpor metadata model Anda (`from superbmd_backend.models.meta import Base; target_metadata = Base.metadata`).
    * Buat migrasi awal (setelah model Anda didefinisikan):
        ```bash
        alembic revision --autogenerate -m "create initial tables"
        ```
    * Terapkan migrasi ke database Anda:
        ```bash
        alembic upgrade head
        ```

7.  **Jalankan Aplikasi Backend:**
    ```bash
    pserve development.ini --reload
    ```
    Server akan berjalan di `http://0.0.0.0:6543`.

## Struktur Proyek
```
backend-superbmd/
├── superbmd_backend/          # Direktori package Python utama
│   ├── init.py            # Main application setup
│   ├── models/                # Definisi model SQLAlchemy
│   │   ├── init.py
│   │   ├── meta.py            # Base metadata
│   │   └── mymodel.py         # Model entitas (User, Lokasi, Barang)
│   ├── schemas/               # Marshmallow schemas untuk validasi & serialisasi
│   │   └── init.py
│   ├── security/              # Modul keamanan (hashing, otorisasi)
│   │   ├── init.py
│   │   └── auth.py
│   └── views/                 # View API endpoints
│       ├── init.py
│       ├── auth_views.py
│       ├── user_views.py
│       ├── lokasi_views.py
│       ├── barang_views.py
│       ├── dashboard_views.py
│       └── report_views.py
├── alembic/                   # Direktori migrasi Alembic
│   ├── versions/
│   └── env.py
├── alembic.ini                # Konfigurasi Alembic
├── development.ini            # Konfigurasi untuk lingkungan pengembangan
├── production.ini             # Konfigurasi untuk lingkungan produksi
├── setup.py                   # Setup proyek Python (untuk pip install -e .)
└── README.md
```

## API Endpoints

[Salin bagian "Interaksi API (Endpoint Backend)" dari respons sebelumnya di sini. Contohnya:]

* **Autentikasi:**
    * `POST /api/auth/login` - Login pengguna.
* **Pengguna:**
    * `GET /api/users` - Daftar pengguna.
    * `POST /api/users` - Buat pengguna baru.
    * `GET /api/users/{id}` - Detail pengguna.
    * `PUT /api/users/{id}` - Perbarui pengguna.
    * `DELETE /api/users/{id}` - Hapus pengguna.
* **Lokasi:**
    * `GET /api/lokasi` - Daftar lokasi.
    * `POST /api/lokasi` - Buat lokasi baru.
    * `GET /api/lokasi/{id}` - Detail lokasi.
    * `PUT /api/lokasi/{id}` - Perbarui lokasi.
    * `DELETE /api/lokasi/{id}` - Hapus lokasi.
* **Barang:**
    * `GET /api/barang` - Daftar barang.
    * `POST /api/barang` - Buat barang baru.
    * `GET /api/barang/{id}` - Detail barang.
    * `PUT /api/barang/{id}` - Perbarui barang.
    * `DELETE /api/barang/{id}` - Hapus barang.
* **Dashboard:**
    * `GET /api/dashboard` - Data ringkasan dashboard.
* **Laporan:**
    * `GET /api/report/assets-by-location` - Laporan aset per lokasi.
    * `GET /api/report/assets-by-condition` - Laporan aset per kondisi.
    * `GET /api/report/assets-in-out` - Laporan aset masuk/keluar.
