# SUPER BMD: Sistem Unggul Pengelolaan Elektronik dan Reporting Barang Milik Daerah

## Deskripsi Aplikasi Web
SUPER BMD adalah aplikasi web berbasis **Python Pyramid** (backend) dan **React JS** (frontend) yang dirancang untuk membantu instansi pemerintah daerah dalam mengelola aset (Barang Milik Daerah) secara digital. Fitur utamanya meliputi pencatatan, pelacakan, reporting, dan dashboard ringkas untuk memantau jumlah barang dan lokasi.

## Dependensi Paket

### Backend (Python Pyramid)
- Python ≥ 3.8  
- pyramid  
- sqlalchemy  
- alembic  
- psycopg2-binary  
- passlib (untuk hashing password)  
- pytest & coverage (untuk unit test)

Instalasi:
```bash
pip install pyramid sqlalchemy alembic psycopg2-binary passlib pytest coverage
````

### Frontend (React JS + Vite + Tailwind)

* Node.js ≥ 14
* vite
* react
* react-dom
* react-router-dom
* axios
* react-hook-form
* tailwindcss

Instalasi:

```bash
npm install
npm install -D tailwindcss
npm install react-router-dom axios react-hook-form
```

## Fitur Aplikasi

1. **Autentikasi Dasar**

   * Login dengan username/password (hashed) sebelum mengakses dashboard.
2. **CRUD Barang**

   * Create, Read, Update, Delete entitas *Barang* (nama, kode, kondisi, lokasi).
3. **CRUD Lokasi**

   * Create, Read, Update, Delete entitas *Lokasi* (nama, kode, alamat).
4. **Dashboard Ringkas**

   * Tampilkan total jumlah barang dan lokasi secara real-time.
5. **Routing & Proteksi Halaman**

   * Navigasi antar halaman menggunakan React Router DOM; proteksi endpoint menggunakan React “PrivateRoute” dan autentikasi backend.

## Referensi

* **Pyramid Web Framework**
  [https://docs.pylonsproject.org/projects/pyramid/en/latest/](https://docs.pylonsproject.org/projects/pyramid/en/latest/)
* **SQLAlchemy (ORM)**
  [https://docs.sqlalchemy.org/](https://docs.sqlalchemy.org/)
* **Alembic (DB Migrations)**
  [https://alembic.sqlalchemy.org/](https://alembic.sqlalchemy.org/)
* **React JS**
  [https://reactjs.org/](https://reactjs.org/)
* **Vite**
  [https://vitejs.dev/](https://vitejs.dev/)
* **Tailwind CSS**
  [https://tailwindcss.com/](https://tailwindcss.com/)
* **React Router DOM**
  [https://reactrouter.com/](https://reactrouter.com/)
* **Axios**
  [https://axios-http.com/](https://axios-http.com/)
