// src/pages/Auth/LoginPage.jsx

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../../components/common/Toast';
import bmdLogo from '../../assets/bmd-logo.png';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      await login(data.username, data.password);
      showToast('Login Berhasil!', 'success');
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Username atau password salah.';
      showToast(errorMessage, 'error');
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 to-emerald-800 bg-pattern">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-0"></div>
      <div className="relative z-10 bg-white dark:bg-gray-900 p-10 rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-fadeIn">
        <div className="flex justify-center mb-8">
          <img src={bmdLogo} alt="SUPER BMD Logo" className="h-28 drop-shadow-md" />
        </div>
        <h2 className="text-3xl font-extrabold text-center text-gray-800 dark:text-gray-100 mb-2">Selamat Datang</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Masuk ke Sistem Pengelolaan BMD</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Username</label>
            <div className="relative">
              <input
                type="text"
                id="username"
                {...register('username', { required: 'Username harus diisi' })}
                className={`block w-full px-4 py-3 rounded-lg border bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${errors.username ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                placeholder="Masukkan username"
              />
            </div>
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                {...register('password', { required: 'Password harus diisi' })}
                className={`block w-full px-4 py-3 rounded-lg border bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${errors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                placeholder="Masukkan password"
              />
              <button 
                type="button" 
                onClick={togglePasswordVisibility} 
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                tabIndex="-1"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          
          <div>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {authLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </span>
              ) : 'Masuk'}
            </button>
          </div>
          
          <div className="text-center pt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              &copy; 2025 SUPER BMD - Sistem Unggul Pengelolaan Elektronik dan Reporting BMD
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
