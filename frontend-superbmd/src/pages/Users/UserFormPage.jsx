// src/pages/Users/UserFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { showToast } from '../../components/common/Toast';
import { useAuth } from '../../contexts/AuthContext';
import UserRoleSelector from '../../components/users/UserRoleSelector'; // Import component

const UserFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const { user: currentUser } = useAuth(); // User yang sedang login

    useEffect(() => {
        if (currentUser?.role !== 'admin') {
            showToast('Anda tidak memiliki akses untuk mengelola pengguna.', 'error');
            navigate('/dashboard');
            return;
        }

        if (id) {
            setIsEditMode(true);
            const fetchUser = async () => {
                setIsLoading(true);
                try {
                    const response = await api.get(`/users/${id}`);
                    reset(response.data);
                    showToast('Data Pengguna berhasil dimuat untuk diedit!', 'success');
                } catch (error) {
                    showToast(`Gagal memuat data pengguna: ${error.response?.data?.message || error.message}`, 'error');
                    console.error('Error fetching user:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUser();
        }
    }, [id, reset, currentUser, navigate]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const payload = { ...data };
            if (isEditMode) {
                if (!payload.password) {
                    delete payload.password;
                }
                await api.put(`/users/${id}`, payload);
                showToast('Pengguna berhasil diperbarui!', 'success');
            } else {
                await api.post('/users', payload);
                showToast('Pengguna berhasil ditambahkan!', 'success');
            }
            navigate('/users');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Terjadi kesalahan.';
            showToast(`Gagal menyimpan pengguna: ${errorMessage}`, 'error');
            console.error('Error saving user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && isEditMode) {
        return <div className="p-6 text-center dark:text-gray-300">Memuat form pengguna...</div>;
    }

    if (currentUser?.role !== 'admin') {
        return null; // Arahkan ke NotFoundPage melalui PrivateRoute
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">{isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Username</label>
                    <input
                        type="text"
                        id="username"
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline ${errors.username ? 'border-red-500' : ''}`}
                        {...register('username', { required: 'Username harus diisi' })}
                        disabled={isEditMode}
                    />
                    {errors.username && <p className="text-red-500 text-xs italic mt-1">{errors.username.message}</p>}
                </div>
                <div>
                    <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Password {isEditMode ? '(Isi jika ingin mengubah)' : ''}</label>
                    <input
                        type="password"
                        id="password"
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline ${errors.password ? 'border-red-500' : ''}`}
                        {...register('password', {
                            required: isEditMode ? false : 'Password harus diisi',
                            minLength: { value: 6, message: 'Password minimal 6 karakter' }
                        })}
                    />
                    {errors.password && <p className="text-red-500 text-xs italic mt-1">{errors.password.message}</p>}
                </div>

                <UserRoleSelector
                    register={register}
                    errors={errors}
                    defaultValue={null} // Default value akan diisi oleh reset() jika edit mode
                    disabled={currentUser?.id_user === parseInt(id)} // Admin tidak bisa mengubah role dirinya sendiri
                />

                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/users')}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Menyimpan...' : (isEditMode ? 'Perbarui Pengguna' : 'Tambah Pengguna')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserFormPage;