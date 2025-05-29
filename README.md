# SUPER BMD (Sistem Unggul Pengelolaan Elektronik dan Reporting Barang Milik Daerah)

SUPER BMD adalah aplikasi manajemen aset web yang dirancang untuk instansi pemerintah daerah, memungkinkan pengelolaan barang milik daerah secara digital. Sistem ini menawarkan pencatatan, pelacakan, dan pelaporan aset yang akuntabel dan terstruktur secara real-time.

## Gambaran Umum Proyek

Proyek ini terdiri dari dua bagian utama: frontend (antarmuka pengguna) dan backend (API dan logika bisnis).

* **Frontend:** Dibangun dengan React JS (Vite) dan Tailwind CSS, menyediakan antarmuka pengguna yang modern dan responsif.
* **Backend:** Dibangun dengan Python Pyramid, SQLAlchemy, dan PostgreSQL, menyediakan API RESTful yang aman dan skalabel untuk mengelola data aset, lokasi, dan pengguna.

## Fitur Utama Aplikasi

* **Pengelolaan Aset Komprehensif:** Pencatatan detail barang, termasuk kode, kondisi, lokasi, dan penanggung jawab.
* **Manajemen Lokasi Efisien:** Strukturasi dan pelacakan aset berdasarkan lokasi fisik.
* **Manajemen Pengguna Berbasis Peran:** Kontrol akses yang granular dengan peran Admin, Penanggung Jawab, dan Viewer.
* **Dashboard Analitis:** Visualisasi data aset yang ringkas untuk tinjauan cepat.
* **Pelaporan Dinamis:** Pembuatan laporan yang dapat disesuaikan untuk analisis dan akuntabilitas.
* **Keamanan:** Autentikasi JWT dan hashing password untuk melindungi data.

## Teknologi yang Digunakan

* **Frontend:** React JS, Vite, Axios, React Hook Form, Tailwind CSS, React Router Dom, Recharts, js-cookie, Heroicons.
* **Backend:** Python Pyramid, SQLAlchemy, Alembic, PostgreSQL, Waitress, Bcrypt, Marshmallow, Pyramid JWT.

## Memulai (Development Setup)

Untuk menjalankan aplikasi ini di lingkungan pengembangan Anda, ikuti langkah-langkah di bawah ini:

### Persyaratan

* Node.js & npm (atau yarn/pnpm)
* Python 3.8+ & pip
* PostgreSQL Database Server

### Langkah-langkah

1.  **Setup Backend:**
    * Clone repositori backend:
        ```bash
        git clone [https://github.com/uas_pemrograman_web_122140097/backend-superbmd.git](https://github.com/uas_pemrograman_web_122140097/backend-superbmd.git)
        cd superbmd-backend
        ```
    * Ikuti instruksi di `superbmd-backend/README.md` untuk menginstal dependensi, menyiapkan database PostgreSQL, mengonfigurasi `development.ini`, menjalankan migrasi Alembic, dan menjalankan server backend.

2.  **Setup Frontend:**
    * Clone repositori frontend (di direktori terpisah atau sebagai subdirektori):
        ```bash
        git clone [https://github.com/uas_pemrograman_web_122140097/frontend-superbmd.git](https://github.com/uas_pemrograman_web_122140097/frontend-superbmd.git)
        cd superbmd-frontend
        ```
    * Ikuti instruksi di `superbmd-frontend/README.md` untuk menginstal dependensi dan menjalankan server frontend.

3.  **Integrasi dan Uji Coba:**
    * Pastikan kedua server (backend dan frontend) berjalan secara bersamaan.
    * Akses aplikasi frontend di browser Anda (misalnya `http://localhost:5173`).
    * Gunakan Postman (atau tool API lain) untuk membuat user admin awal di backend jika belum ada (lihat `superbmd-backend/README.md` untuk instruksi spesifik).
    * Login ke aplikasi frontend dengan kredensial admin tersebut dan mulai jelajahi fungsionalitasnya.

## Struktur Proyek Lengkap
```
uas_pemrograman_web_122140097/
├── frontend-superbmd/           # Direktori root untuk aplikasi frontend React (Vite)
│   └── (isi frontend README.md)
│       └── ...
├── backend-superbmd/            # Direktori root untuk aplikasi backend Python Pyramid
│   └── (isi backend README.md)
│       └── ...
└── README.md                    # File README utama ini
```