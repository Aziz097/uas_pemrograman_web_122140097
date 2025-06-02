# SUPER BMD Frontend

Sistem Unggul Pengelolaan Elektronik dan Reporting Barang Milik Daerah (SUPER BMD) adalah aplikasi web untuk pengelolaan aset atau barang milik daerah secara digital. Frontend ini menyediakan antarmuka pengguna yang interaktif untuk pencatatan, pelacakan, dan pelaporan barang milik daerah secara real-time dan terstruktur.

## Fitur Utama

* **Autentikasi Pengguna:** Login dengan peran (admin, penanggung_jawab, viewer).
* **Dashboard Interaktif:** Menampilkan ringkasan jumlah barang, lokasi, kondisi barang, dan grafik distribusi aset.
* **Manajemen Barang (Assets):**
    * Mencatat, melacak, dan mengelola detail barang milik daerah (nama, kode, kondisi, lokasi, penanggung jawab, tanggal).
    * Fungsi CRUD (Create, Read, Update, Delete) untuk entitas Barang.
    * Fitur filter dan pencarian dinamis.
    * Paginasi untuk daftar panjang.
    * Cetak QR Code untuk setiap aset.
* **Manajemen Lokasi:**
    * Mencatat dan mengelola detail lokasi (nama, kode, alamat).
    * Fungsi CRUD untuk entitas Lokasi.
    * Fitur filter dan pencarian.
* **Manajemen Pengguna (Admin Only):**
    * Mengelola daftar pengguna sistem.
    * Mengatur peran (role) pengguna (admin, penanggung_jawab, viewer).
    * Edit password pengguna.
* **Laporan Dinamis:**
    * Menghasilkan laporan aset berdasarkan lokasi, kondisi, dan riwayat masuk/keluar.
    * Opsi filter berdasarkan rentang tanggal, lokasi, atau kondisi.
    * Export laporan ke format PDF dan Excel.
* **Desain Responsif:** Tampilan yang adaptif untuk berbagai ukuran layar.
* **Tema Gelap/Terang:** Opsi untuk beralih antara tema gelap dan terang.
* **Notifikasi Interaktif:** Sistem Toast untuk umpan balik pengguna.

## Teknologi yang Digunakan

* **Framework:** React JS
* **Bundler:** Vite JS
* **Komunikasi API:** Axios
* **Manajemen Form:** React Hook Form
* **Styling:** Tailwind CSS (v4.1 Alpha)
* **Routing:** React Router Dom
* **State Management:** React Context API
* **Grafik:** Recharts
* **Cetak/Export:** `react-to-print`, `jspdf`, `jspdf-autotable`, `xlsx`
* **Ikon:** Heroicons

## Instalasi dan Setup

Pastikan Anda memiliki Node.js dan npm (atau yarn/pnpm) terinstal.

1.  **Clone Repository Frontend:**
    ```bash
    git clone [https://github.com/your-repo/superbmd-frontend.git](https://github.com/your-repo/superbmd-frontend.git) # Ganti dengan URL repo Anda
    cd superbmd-frontend
    ```

2.  **Instal Dependensi:**
    ```bash
    npm install
    # atau yarn install
    # atau pnpm install
    ```

3.  **Konfigurasi Tailwind CSS (sudah otomatis dengan Vite):**
    File `tailwind.config.js` sudah dikonfigurasi. Pastikan `src/index.css` memiliki `@import "tailwindcss";`.

4.  **Konfigurasi API Backend:**
    Buka `src/services/api.js` dan pastikan `baseURL` sesuai dengan alamat backend Pyramid Anda (default: `http://localhost:6543/api`).

    ```javascript
    // src/services/api.js
    const api = axios.create({
        baseURL: 'http://localhost:6543/api', // Sesuaikan jika backend Anda berjalan di port/host lain
        // ...
    });
    ```

5.  **Jalankan Aplikasi:**
    Pastikan backend Anda sudah berjalan.
    ```bash
    npm run dev
    # atau yarn dev
    # atau pnpm dev
    ```
    Aplikasi frontend akan berjalan di `http://localhost:5173` (atau port lain yang ditunjukkan oleh Vite).

## Autentikasi dan Otorisasi (Untuk Pengujian)

* Aplikasi ini menggunakan autentikasi JWT. Token disimpan dalam `js-cookie`.
* **User Admin Default:** Anda harus membuat user admin awal melalui Postman ke backend terlebih dahulu.
    * **Username:** `admin`
    * **Password:** `admin123`
    * **Role:** `admin`

## Struktur Proyek
```
frontend-superbmd/
├── public/
├── src/
│   ├── assets/              # Gambar, ikon, dll.
│   ├── components/          # Komponen UI yang bisa digunakan kembali
│   │   ├── common/          # Komponen generik (Table, Modal, Toast)
│   │   ├── dashboard/       # Komponen spesifik Dashboard
│   │   ├── layout/          # Komponen tata letak (Header, Sidebar)
│   │   ├── assets/          # Komponen spesifik Barang
│   │   ├── locations/       # Komponen spesifik Lokasi
│   │   └── users/           # Komponen spesifik Pengguna
│   ├── hooks/               # Custom React Hooks (useDebounce)
│   ├── services/            # Interaksi dengan API backend (axios, auth)
│   ├── contexts/            # Context API untuk state global (Auth, Theme)
│   ├── pages/               # Halaman utama aplikasi (Login, Dashboard, CRUD)
│   ├── utils/               # Fungsi-fungsi utility (formatters)
│   ├── App.jsx              # Komponen utama aplikasi, routing
│   ├── main.jsx             # Entry point Vite, mounting aplikasi
│   └── index.css            # Global styles dan import Tailwind
├── vite.config.js           # Konfigurasi Vite
├── tailwind.config.js       # Konfigurasi Tailwind CSS
└── package.json
```

## Kontribusi

Untuk berkontribusi, silakan fork repository ini, buat branch baru, dan ajukan Pull Request.