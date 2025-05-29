// src/pages/Locations/LocationFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { showToast } from '../../components/common/Toast';

const LocationFormPage = () => {
    const { id } = useParams(); // Untuk mode edit
    const navigate = useNavigate();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        if (id) {
            setIsEditMode(true);
            const fetchLocation = async () => {
                setIsLoading(true);
                try {
                    const response = await api.get(`/lokasi/${id}`);
                    reset(response.data); // Isi form dengan data yang ada
                    showToast('Data Lokasi berhasil dimuat untuk diedit!', 'success');
                } catch (error) {
                    showToast(`Gagal memuat data lokasi: ${error.response?.data?.message || error.message}`, 'error');
                    console.error('Error fetching location:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchLocation();
        }
    }, [id, reset]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            if (isEditMode) {
                await api.put(`/lokasi/${id}`, data);
                showToast('Lokasi berhasil diperbarui!', 'success');
            } else {
                await api.post('/lokasi', data);
                showToast('Lokasi berhasil ditambahkan!', 'success');
            }
            navigate('/locations'); // Redirect ke daftar lokasi
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Terjadi kesalahan.';
            showToast(`Gagal menyimpan lokasi: ${errorMessage}`, 'error');
            console.error('Error saving location:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && isEditMode) {
        return <div className="p-6 text-center">Memuat form lokasi...</div>;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">{isEditMode ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label htmlFor="nama_lokasi" className="block text-gray-700 text-sm font-bold mb-2">Nama Lokasi</label>
                    <input
                        type="text"
                        id="nama_lokasi"
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.nama_lokasi ? 'border-red-500' : ''}`}
                        {...register('nama_lokasi', { required: 'Nama lokasi harus diisi' })}
                    />
                    {errors.nama_lokasi && <p className="text-red-500 text-xs italic mt-1">{errors.nama_lokasi.message}</p>}
                </div>
                <div>
                    <label htmlFor="kode_lokasi" className="block text-gray-700 text-sm font-bold mb-2">Kode Lokasi</label>
                    <input
                        type="text"
                        id="kode_lokasi"
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.kode_lokasi ? 'border-red-500' : ''}`}
                        {...register('kode_lokasi', { required: 'Kode lokasi harus diisi' })}
                    />
                    {errors.kode_lokasi && <p className="text-red-500 text-xs italic mt-1">{errors.kode_lokasi.message}</p>}
                </div>
                <div>
                    <label htmlFor="alamat_lokasi" className="block text-gray-700 text-sm font-bold mb-2">Alamat Lokasi</label>
                    <textarea
                        id="alamat_lokasi"
                        rows="3"
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.alamat_lokasi ? 'border-red-500' : ''}`}
                        {...register('alamat_lokasi', { required: 'Alamat lokasi harus diisi' })}
                    ></textarea>
                    {errors.alamat_lokasi && <p className="text-red-500 text-xs italic mt-1">{errors.alamat_lokasi.message}</p>}
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/locations')}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Menyimpan...' : (isEditMode ? 'Perbarui Lokasi' : 'Tambah Lokasi')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LocationFormPage;