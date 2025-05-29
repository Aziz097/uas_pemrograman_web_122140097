import api from './api';

export const loginUser = async (username, password) => {
    try {
        const response = await api.post('/auth/login', { username, password });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const logoutUser = () => {
    return Promise.resolve(); // Mengembalikan Promise agar kompatibel dengan async/await
};

