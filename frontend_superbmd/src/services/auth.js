// src/services/auth.js

import api from './api';

export const loginUser = async (username, password) => {
    try {
      // POST ke endpoint login backend
      const response = await api.post('/users/login', { username, password });
      // response.data = { id, username, password, role }
      const user = response.data;
  
      // Pastikan field role ada
      if (!user || !user.role) {
        const err = new Error('Username atau password salah.');
        err.response = { data: { message: 'Username atau password salah.' } };
        throw err;
      }
  
      // Kembalikan data user, abaikan password
      return {
        id: user.id,
        username: user.username,
        role: user.role
      };
    } catch (error) {
      throw error;
    }
  };
  

export const logoutUser = () => {
  localStorage.removeItem('user');
  return Promise.resolve();
};
