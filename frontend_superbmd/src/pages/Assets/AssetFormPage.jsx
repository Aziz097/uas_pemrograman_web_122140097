// src/pages/Assets/AssetFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { showToast } from '../../components/common/Toast';
import { useBarangById, useCreateBarang, useUpdateBarang } from '../../hooks/useAssets'; // Import asset hooks
import { useLocationList } from '../../hooks/useLocations'; // Import location list hook

const AssetFormPage = () => {
    const { id } = useParams(); // Untuk mode edit
    const navigate = useNavigate();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const [isEditMode, setIsEditMode] = useState(false);

    // Menggunakan hooks
    const { barang: asset, loading: loadingAsset, error: errorAsset } = useBarangById(id);
    const { createBarang, loading: creatingBarang, error: createError } = useCreateBarang();
    const { updateBarang, loading: updatingBarang, error: updateError } = useUpdateBarang();
    const { locations, loading: loadingLocations, error: errorLocations } = useLocationList(); // Untuk dropdown lokasi

    // Gabungkan loading state
    const isLoading = loadingAsset || creatingBarang || updatingBarang || loadingLocations;

    useEffect(() => {
        if (id) {
            setIsEditMode(true);
            if (asset) { // Pastikan data aset sudah terambil
                // Format tanggal agar sesuai dengan input type="date"
                const formattedData = {
                    ...asset,
                    tanggal_masuk: asset.tanggal_masuk ? new Date(asset.tanggal_masuk).toISOString().split('T')[0] : '',
                    tanggal_pembaruan: asset.tanggal_pembaruan ? new Date(asset.tanggal_pembaruan).toISOString().split('T')[0] : '',
                };
                reset(formattedData); // Isi form dengan data yang ada
                showToast('Data Barang berhasil dimuat untuk diedit!', 'success');
            } else if (errorAsset) { // Tangani jika ada error saat memuat aset
                showToast(`Gagal memuat data aset: ${errorAsset.message}`, 'error');
                console.error('Error fetching asset:', errorAsset);
            }
        }
        // Jika ada error saat memuat lokasi
        if (errorLocations) {
            showToast(`Gagal memuat daftar lokasi: ${errorLocations.message}`, 'error');
            console.error('Error fetching locations for form:', errorLocations);
        }
    }, [id, asset, errorAsset, reset, errorLocations]);

    const onSubmit = async (data) => {
        let success = false;
        let errorMessage = '';

        const payload = { ...data };
        // Penanganan `gambar_aset` sebagai File perlu penanganan khusus.
        // Jika backend Anda menerima `FormData` untuk upload file, Anda harus membuat `FormData` di sini.
        if (payload.gambar_aset && payload.gambar_aset.length > 0) {
            const formData = new FormData();
            for (const key in payload) {
                if (key === 'gambar_aset' && payload[key][0]) {
                    formData.append(key, payload[key][0]); // Append the File object
                } else if (payload[key] !== undefined && payload[key] !== null) {
                    formData.append(key, payload[key]);
                }
            }
            // Overwrite payload with FormData for the API call
            // Note: Axios will automatically set 'Content-Type': 'multipart/form-data'
            // when sending FormData, so no need to set headers manually here.
            Object.assign(payload, formData);
        } else {
            // Jika tidak ada gambar baru atau gambar yang dipilih kosong, hapus dari payload
            delete payload.gambar_aset;
        }


        if (isEditMode) {
            success = await updateBarang(id, payload);
            errorMessage = updateError;
        } else {
            success = await createBarang(payload);
            errorMessage = createError;
        }

        if (success) {
            showToast(`Barang berhasil di${isEditMode ? 'perbarui' : 'tambahkan'}!`, 'success');
            navigate('/assets'); // Redirect ke daftar barang
        } else {
            showToast(`Gagal menyimpan barang: ${errorMessage || 'Terjadi kesalahan.'}`, 'error');
            console.error('Error saving asset:', errorMessage);
        }
    };

    const conditions = ['Baik', 'Rusak Ringan', 'Rusak Berat'];

    if (isLoading) { // Tampilkan loading selama data lokasi atau aset sedang dimuat
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
                    <label htmlFor="id" className="block text-gray-700 text-sm font-bold mb-2">Lokasi</label>
                    <select
                        id="id"
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.id ? 'border-red-500' : ''}`}
                        {...register('id', { required: 'Lokasi harus dipilih', valueAsNumber: true })}
                    >
                        <option value="">Pilih Lokasi</option>
                        {locations.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.nama_lokasi}</option>
                        ))}
                    </select>
                    {errors.id && <p className="text-red-500 text-xs italic mt-1">{errors.id.message}</p>}
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