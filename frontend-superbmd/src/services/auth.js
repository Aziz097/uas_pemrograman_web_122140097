// import api from './api';

// export const loginUser = async (username, password) => {
//     try {
//         const response = await api.post('/auth/login', { username, password });
//         return response.data;
//     } catch (error) {
//         throw error;
//     }
// };

// export const logoutUser = () => {
//     return Promise.resolve(); // Mengembalikan Promise agar kompatibel dengan async/await
// };


// src/services/auth.js
// import api from './api'; // Nonaktifkan import api sementara jika belum ada backend

export const loginUser = async (username, password) => {
    // --- Bagian ini diubah untuk dummy login ---
    return new Promise((resolve, reject) => {
        setTimeout(() => { // Simulasi delay network
            if (username === 'admin' && password === 'admin123') {
                resolve({
                    token: 'dummy-jwt-token-for-admin', // Token dummy
                    user: {
                        id_user: 1,
                        username: 'admin',
                        role: 'admin' // Role untuk admin
                    }
                });
            } else if (username === 'penanggungjawab' && password === 'pj123') {
                resolve({
                    token: 'dummy-jwt-token-for-penanggungjawab', // Token dummy
                    user: {
                        id_user: 2,
                        username: 'penanggungjawab',
                        role: 'penanggung_jawab' // Role untuk penanggung jawab
                    }
                });
            } else {
                reject({
                    response: {
                        data: {
                            message: 'Username atau password salah.'
                        }
                    }
                });
            }
        }, 500); // Delay 500ms
    });
    // --- Akhir bagian dummy login ---

    // // Bagian ini akan diaktifkan kembali ketika backend sudah ada:
    // try {
    //     const response = await api.post('/auth/login', { username, password });
    //     return response.data;
    // } catch (error) {
    //     throw error;
    // }
};

export const logoutUser = () => {
    // Untuk dummy, tidak perlu melakukan apa-apa di sini selain resolve Promise
    return Promise.resolve();
};