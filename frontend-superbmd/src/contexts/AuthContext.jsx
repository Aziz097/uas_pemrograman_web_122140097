import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { loginUser, logoutUser } from '../services/auth'; // Fungsi dari service

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Menyimpan { id_user, username, role }
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = Cookies.get('authToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setToken(storedToken);
                setIsAuthenticated(true);
            } catch (e) {
                console.error("Failed to parse user from localStorage or token invalid", e);
                handleLogout(); // Clear invalid data
            }
        }
        setLoading(false);
    }, []);

    const handleLogin = async (username, password) => {
        try {
            const { token: receivedToken, user: userInfo } = await loginUser(username, password);
            Cookies.set('authToken', receivedToken, { expires: 7, secure: true, sameSite: 'Strict' }); // Best practice for JWT
            localStorage.setItem('user', JSON.stringify(userInfo)); // Simpan info user
            setUser(userInfo);
            setToken(receivedToken);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            console.error('Login failed in AuthContext:', error);
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);
            throw error; // Lempar error agar bisa ditangani di LoginPage
        }
    };

    const handleLogout = () => {
        logoutUser();
        Cookies.remove('authToken');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login: handleLogin, logout: handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);