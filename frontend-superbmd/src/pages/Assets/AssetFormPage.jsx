// src/pages/Assets/AssetFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { showToast } from '../../components/common/Toast';

const AssetFormPage = () => {
    const { id } = useParams(); // Untuk mode edit
    const navigate = useNavigate();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const locResponse = await api.get('/lokasi');
                setLocations(locResponse.data.items);

                if (id) {
                    setIsEditMode(true);
                    const assetResponse = await api.get(`/barang/${id}`);
                    // Format tanggal agar sesuai dengan input type="date"
                    const formattedData = {
                        ...assetResponse.data,
                        tanggal_masuk: assetResponse.data.tanggal_masuk ? new Date(assetResponse.data.tanggal_masuk).toISOString().split('T')[0] : '',
                        tanggal_pembaruan: assetResponse.data.tanggal_pembaruan ? new Date(assetResponse.data.tanggal_pembaruan).toISOString().split('T')[0] : '',
                    };
                    reset(formattedData); // Isi form dengan data yang ada
                    showToast('Data Barang berhasil dimuat untuk diedit!', 'success');
                }
            } catch (error) {
                showToast(`Gagal memuat data: ${error.response?.data?.message || error.message}`, 'error');
                console.error('Error fetching data for form:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id, reset]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            // Hapus field yang tidak perlu dikirim ke backend jika kosong
            const payload = { ...data };
            if (payload.gambar_aset && payload.gambar_aset.length > 0) {
                // Handle file upload here. For simplicity, assume image is sent as base64 or via separate upload
                // In a real app, you'd send `FormData` or handle the file separately.
                // For now, let's assume `gambar_aset` is just a string URL if it's already there
                // If it's a new file, you'd convert it or send a FormData object.
                // For this example, we'll just remove it if it's an empty FileList
            } else {
                delete payload.gambar_aset; // Remove if no new file is selected
            }

            if (isEditMode) {
                await api.put(`/barang/${id}`, payload);
                showToast('Barang berhasil diperbarui!', 'success');
            } else {
                await api.post('/barang', payload);
                showToast('Barang berhasil ditambahkan!', 'success');
            }
            navigate('/assets'); // Redirect ke daftar barang
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Terjadi kesalahan.';
            showToast(`Gagal menyimpan barang: ${errorMessage}`, 'error');
            console.error('Error saving asset:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const conditions = ['Baik', 'Rusak Ringan', 'Rusak Berat'];

    if (isLoading && (isEditMode || locations.length === 0)) {
        return <div className="p-6 text-center">Memuat form barang...</div>;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">{isEditMode ? 'Edit Barang' : 'Tambah Barang Baru'}</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label htmlFor="nama_barang" className="block text-gray-700 text-sm font-bold mb-2">Nama Barang</label>
                    <input
                        type="text"
                        id="nama_barang"
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.nama_barang ? 'border-red-500' : ''}`}
                        {...register('nama_barang', { required: 'Nama barang harus diisi' })}
                    />
                    {errors.nama_barang && <p className="text-red-500 text-xs italic mt-1">{errors.nama_barang.message}</p>}
                </div>
                <div>
                    <label htmlFor="kode_barang" className="block text-gray-700 text-sm font-bold mb-2">Kode Barang</label>
                    <input
                        type="text"
                        id="kode_barang"
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.kode_barang ? 'border-red-500' : ''}`}
                        {...register('kode_barang', { required: 'Kode barang harus diisi' })}
                    />
                    {errors.kode_barang && <p className="text-red-500 text-xs italic mt-1">{errors.kode_barang.message}</p>}
                </div>
                <div>
                    <label htmlFor="kondisi" className="block text-gray-700 text-sm font-bold mb-2">Kondisi</label>
                    <select
                        id="kondisi"
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.kondisi ? 'border-red-500' : ''}`}
                        {...register('kondisi', { required: 'Kondisi harus dipilih' })}
                    >
                        <option value="">Pilih Kondisi</option>
                        {conditions.map(cond => (
                            <option key={cond} value={cond}>{cond}</option>
                        ))}
                    </select>
                    {errors.kondisi && <p className="text-red-500 text-xs italic mt-1">{errors.kondisi.message}</p>}
                </div>
                <div>
                    <label htmlFor="id_lokasi" className="block text-gray-700 text-sm font-bold mb-2">Lokasi</label>
                    <select
                        id="id_lokasi"
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.id_lokasi ? 'border-red-500' : ''}`}
                        {...register('id_lokasi', { required: 'Lokasi harus dipilih', valueAsNumber: true })}
                    >
                        <option value="">Pilih Lokasi</option>
                        {locations.map(loc => (
                            <option key={loc.id_lokasi} value={loc.id_lokasi}>{loc.nama_lokasi}</option>
                        ))}
                    </select>
                    {errors.id_lokasi && <p className="text-red-500 text-xs italic mt-1">{errors.id_lokasi.message}</p>}
                </div>
                <div>
                    <label htmlFor="penanggung_jawab" className="block text-gray-700 text-sm font-bold mb-2">Penanggung Jawab</label>
                    <input
                        type="text"
                        id="penanggung_jawab"
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.penanggung_jawab ? 'border-red-500' : ''}`}
                        {...register('penanggung_jawab', { required: 'Penanggung jawab harus diisi' })}
                    />
                    {errors.penanggung_jawab && <p className="text-red-500 text-xs italic mt-1">{errors.penanggung_jawab.message}</p>}
                </div>
                <div>
                    <label htmlFor="tanggal_masuk" className="block text-gray-700 text-sm font-bold mb-2">Tanggal Masuk</label>
                    <input
                        type="date"
                        id="tanggal_masuk"
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.tanggal_masuk ? 'border-red-500' : ''}`}
                        {...register('tanggal_masuk', { required: 'Tanggal masuk harus diisi' })}
                    />
                    {errors.tanggal_masuk && <p className="text-red-500 text-xs italic mt-1">{errors.tanggal_masuk.message}</p>}
                </div>
                <div>
                    <label htmlFor="tanggal_pembaruan" className="block text-gray-700 text-sm font-bold mb-2">Tanggal Pembaruan</label>
                    <input
                        type="date"
                        id="tanggal_pembaruan"
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.tanggal_pembaruan ? 'border-red-500' : ''}`}
                        {...register('tanggal_pembaruan')} // Not required, can be empty
                    />
                    {errors.tanggal_pembaruan && <p className="text-red-500 text-xs italic mt-1">{errors.tanggal_pembaruan.message}</p>}
                </div>
                {/* Optional: Field for image upload */}
                <div>
                    <label htmlFor="gambar_aset" className="block text-gray-700 text-sm font-bold mb-2">Gambar Aset (Opsional)</label>
                    <input
                        type="file"
                        id="gambar_aset"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        {...register('gambar_aset')}
                        accept="image/*"
                    />
                    <p className="text-gray-600 text-xs mt-1">Ukuran maksimal 2MB, format JPG/PNG.</p>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/assets')}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Menyimpan...' : (isEditMode ? 'Perbarui Barang' : 'Tambah Barang')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AssetFormPage;