// src/pages/Auth/LoginPage.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../../components/common/Toast'; // Asumsi Toast component
import bmdLogo from '../../assets/bmd-logo.png'; // Asumsi logo

const LoginPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await login(data.username, data.password);
            showToast('Login Berhasil!', 'success');
            navigate('/dashboard'); // Redirect ke dashboard setelah login sukses
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat login.';
            showToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-yellow-500">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <img src={bmdLogo} alt="SUPER BMD Logo" className="h-24" />
                </div>
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login SUPER BMD</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.username ? 'border-red-500' : ''}`}
                            {...register('username', { required: 'Username harus diisi' })}
                        />
                        {errors.username && <p className="text-red-500 text-xs italic mt-1">{errors.username.message}</p>}
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${errors.password ? 'border-red-500' : ''}`}
                            {...register('password', { required: 'Password harus diisi' })}
                        />
                        {errors.password && <p className="text-red-500 text-xs italic mt-1">{errors.password.message}</p>}
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Loading...' : 'Login'}
                        </button>
                    </div>
                    <div className="text-center mt-4">
                        <a href="#" className="inline-block align-baseline font-bold text-sm text-green-500 hover:text-green-800">
                            Lupa Password?
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;