import axios from 'axios';
import Cookies from 'js-cookie';
import { showToast } from '../components/common/Toast'; // Import Toast utility

const api = axios.create({
    baseURL: 'http://localhost:6543/api', // Ganti dengan URL backend Pyramid Anda
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor untuk menambahkan token ke setiap request
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor untuk menangani error respons
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;

        // Cek jika error 401 Unauthorized dan bukan dari endpoint login
        if (error.response?.status === 401 && originalRequest.url !== '/auth/login') {
            // Hapus token dan redirect ke halaman login
            Cookies.remove('authToken');
            localStorage.removeItem('user'); // Pastikan juga user info dihapus
            showToast('Sesi Anda telah berakhir. Silakan login kembali.', 'error');
            // Gunakan window.location.href untuk hard redirect dan refresh aplikasi
            // Ini penting untuk memastikan state React tereset sepenuhnya
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000); // Beri sedikit waktu untuk toast muncul
        } else if (error.response?.status === 403) {
            showToast('Anda tidak memiliki izin untuk melakukan aksi ini.', 'error');
        } else {
            // Tampilkan pesan error umum jika belum ditangani di komponen
            const errorMessage = error.response?.data?.message || 'Terjadi kesalahan pada server.';
            // showToast(errorMessage, 'error'); // Tidak perlu di sini jika sudah ditangani di komponen page/form
        }
        return Promise.reject(error);
    }
);

export default api;