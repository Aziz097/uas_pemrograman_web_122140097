// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:6543/api', // Sesuaikan dengan base URL backend Pyramid Anda
    headers: {
        'Content-Type': 'application/json',
    },
});

// Optional: Interceptor untuk menangani respons error umum (misal 401 Unauthorized, jika backend mengembalikan tanpa token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // if (error.response && error.response.status === 401) {
        //     // Karena tidak ada token, 401 berarti kredensial yang dikirim salah
        //     // Atau jika backend tidak ada endpoint login, dan setiap request butuh kredensial.
        //     // Anda bisa memicu logout di sini jika 401 berarti user tidak valid.
        //     console.log("Authentication failed. Redirecting to login...");
        //     localStorage.removeItem('user'); // Hapus user info
        //     window.location.href = '/login'; // Redirect paksa
        // }
        return Promise.reject(error);
    }
);

export default api;