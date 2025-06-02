import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { showToast } from '../../components/common/Toast';
import { useLocationById, useCreateLocation, useUpdateLocation } from '../../hooks/useLocations';
import Loading from '../../components/common/Loading';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

const LocationFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    
    // Form setup with react-hook-form
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    
    // Hooks for getting location data and handling create/update
    const { location: locationDetail, loading: loadingDetail, error: detailError } = useLocationById(id);
    const { createLocation, loading: creating, error: createError, success: createSuccess } = useCreateLocation();
    const { updateLocation, loading: updating, error: updateError, success: updateSuccess } = useUpdateLocation();

    const isLoading = loadingDetail || creating || updating;
    const isError = detailError || createError || updateError;

    // Pre-fill form values when in edit mode
    useEffect(() => {
        if (isEditMode && locationDetail) {
            const formData = {
                nama_lokasi: locationDetail.nama_lokasi || '',
                kode_lokasi: locationDetail.kode_lokasi || '',
                alamat_lokasi: locationDetail.alamat_lokasi || ''
            };
            
            // Set form values
            Object.entries(formData).forEach(([key, value]) => {
                setValue(key, value);
            });
        }
    }, [locationDetail, isEditMode, setValue]);

    // Handle form submission
    const onSubmit = async (data) => {
        try {
            // Make sure id is included in the request for updates
            if (isEditMode) {
                console.log(`Updating location ID ${id} with data:`, data);
                // Ensure we're sending a properly formatted object without any double colons
                const cleanData = {
                    nama_lokasi: data.nama_lokasi,
                    kode_lokasi: data.kode_lokasi,
                    alamat_lokasi: data.alamat_lokasi
                };
                await updateLocation(id, cleanData);
            } else {
                await createLocation(data);
            }
        } catch (err) {
            console.error('Form submission error:', err);
            showToast(`Gagal ${isEditMode ? 'memperbarui' : 'menambahkan'} lokasi: ${err.message}`, 'error');
        }
    };

    // Handle success and error states for create/update operations
    useEffect(() => {
        if (createSuccess) {
            showToast('Lokasi berhasil ditambahkan!', 'success');
            navigate('/locations');
        } else if (updateSuccess) {
            showToast('Lokasi berhasil diperbarui!', 'success');
            navigate('/locations');
        }

        if (createError) {
            showToast(`Gagal menambahkan lokasi: ${createError}`, 'error');
        } else if (updateError) {
            showToast(`Gagal memperbarui lokasi: ${updateError}`, 'error');
        }
    }, [createSuccess, updateSuccess, createError, updateError, navigate]);

    if (isLoading && isEditMode) {
        return <Loading text="Memuat data lokasi..." />;
    }

    if (isEditMode && detailError) {
        return (
            <div className="p-8 text-center text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl shadow-inner">
                <div className="text-xl font-semibold mb-2">Terjadi kesalahan memuat data lokasi</div>
                <p className="text-red-500 dark:text-red-400 mb-4">{detailError.message || 'Silakan coba muat ulang halaman'}</p>
                <button 
                    onClick={() => navigate('/locations')}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                    Kembali ke Daftar Lokasi
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 max-w-4xl mx-auto">
            {/* Back button */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/locations')}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    <span>Kembali ke Daftar</span>
                </button>
            </div>
            
            {/* Form header */}
            <h1 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {isEditMode ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}
            </h1>
            
            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nama Lokasi */}
                    <div>
                        <label htmlFor="nama_lokasi" className={`block mb-1 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            Nama Lokasi
                        </label>
                        <input
                            type="text"
                            id="nama_lokasi"
                            {...register('nama_lokasi', { required: 'Nama lokasi harus diisi' })}
                            className={`w-full px-4 py-2 rounded-lg border ${errors.nama_lokasi ? 'border-red-500 bg-red-50' : isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-green-500' : 'focus:ring-green-500'} transition-colors`}
                        />
                        {errors.nama_lokasi && (
                            <p className="text-red-500 text-sm mt-1">{errors.nama_lokasi.message}</p>
                        )}
                    </div>

                    {/* Kode Lokasi */}
                    <div>
                        <label htmlFor="kode_lokasi" className={`block mb-1 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            Kode Lokasi
                        </label>
                        <input
                            type="text"
                            id="kode_lokasi"
                            {...register('kode_lokasi', { required: 'Kode lokasi harus diisi' })}
                            className={`w-full px-4 py-2 rounded-lg border ${errors.kode_lokasi ? 'border-red-500 bg-red-50' : isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-green-500' : 'focus:ring-green-500'} transition-colors`}
                        />
                        {errors.kode_lokasi && (
                            <p className="text-red-500 text-sm mt-1">{errors.kode_lokasi.message}</p>
                        )}
                    </div>
                </div>

                {/* Alamat Lokasi */}
                <div>
                    <label htmlFor="alamat_lokasi" className={`block mb-1 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Alamat Lokasi
                    </label>
                    <textarea
                        id="alamat_lokasi"
                        rows="3"
                        {...register('alamat_lokasi', { required: 'Alamat lokasi harus diisi' })}
                        className={`w-full px-4 py-2 rounded-lg border ${errors.alamat_lokasi ? 'border-red-500 bg-red-50' : isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-green-500' : 'focus:ring-green-500'} transition-colors`}
                    ></textarea>
                    {errors.alamat_lokasi && (
                        <p className="text-red-500 text-sm mt-1">{errors.alamat_lokasi.message}</p>
                    )}
                </div>

                {/* Submit and Cancel buttons */}
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/locations')}
                        className={`px-5 py-2.5 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {isEditMode ? 'Menyimpan...' : 'Menambahkan...'}
                            </span>
                        ) : isEditMode ? 'Simpan Perubahan' : 'Tambah Lokasi'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LocationFormPage;
