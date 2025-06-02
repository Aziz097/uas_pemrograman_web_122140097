// src/pages/Assets/AssetFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { showToast } from '../../components/common/Toast';
import Loading from '../../components/common/Loading';
import { useLocationList } from '../../hooks/useLocations';
import { useUserList } from '../../hooks/useUsers';
import { useBarangById, useCreateBarang, useUpdateBarang } from '../../hooks/useAssets';
import { 
  ArrowLeftIcon, 
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const AssetFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    // Form handling
    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();

    // Data fetching hooks
    const { locations } = useLocationList();
    const { users } = useUserList();
    const { barang: assetDetail, loading: loadingAsset, error: assetError } = useBarangById(isEditMode ? id : null);
    const { createBarang, loading: creating, error: createError, success: createSuccess } = useCreateBarang();
    const { updateBarang, loading: updating, error: updateError, success: updateSuccess } = useUpdateBarang();

    // Local state for form
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Populate form with asset data in edit mode
    useEffect(() => {
        if (isEditMode && assetDetail) {
            const formData = {
                nama_barang: assetDetail.nama_barang,
                kode_barang: assetDetail.kode_barang,
                kondisi: assetDetail.kondisi,
                location_id: assetDetail.location_id ? assetDetail.location_id.toString() : '',
                penanggung_jawab: assetDetail.penanggung_jawab,
                deskripsi: assetDetail.deskripsi || '',
                tanggal_masuk: assetDetail.tanggal_masuk ? new Date(assetDetail.tanggal_masuk).toISOString().split('T')[0] : ''
            };

            // Set form values
            Object.entries(formData).forEach(([key, value]) => {
                setValue(key, value);
            });

            // Set date
            if (assetDetail.tanggal_masuk) {
                setSelectedDate(new Date(assetDetail.tanggal_masuk));
            }
        }
    }, [assetDetail, isEditMode, setValue]);

    // Handle success and error states for create/update operations
    useEffect(() => {
        if (createSuccess) {
            showToast('Barang berhasil ditambahkan!', 'success');
            navigate('/assets');
        } else if (updateSuccess) {
            showToast('Barang berhasil diperbarui!', 'success');
            navigate('/assets');
        }

        if (createError) {
            showToast(`Gagal menambahkan barang: ${createError}`, 'error');
        } else if (updateError) {
            showToast(`Gagal memperbarui barang: ${updateError}`, 'error');
        }
    }, [createSuccess, updateSuccess, createError, updateError, navigate]);

    // Handle asset fetch error
    useEffect(() => {
        if (assetError && isEditMode) {
            showToast(`Gagal memuat data barang: ${assetError}`, 'error');
            navigate('/assets');
        }
    }, [assetError, isEditMode, navigate]);

    // Form submission handler
    const onSubmit = (data) => {
        const assetData = {
            ...data,
            tanggal_masuk: data.tanggal_masuk,
            location_id: parseInt(data.location_id, 10)
        };

        if (isEditMode) {
            updateBarang(id, assetData);
        } else {
            createBarang(assetData);
        }
    };

    // If loading the asset data in edit mode
    if (isEditMode && loadingAsset) {
        return <Loading text="Memuat data barang..." size="medium" />;
    }

    const isLoading = creating || updating;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {isEditMode ? 'Edit Barang' : 'Tambah Barang Baru'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {isEditMode ? 'Perbarui informasi barang yang sudah ada' : 'Tambahkan barang baru ke dalam sistem'}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/assets')}
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-all duration-200 self-start md:self-center"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Kembali ke Daftar
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Nama Barang */}
                        <div>
                            <label htmlFor="nama_barang" className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">
                                Nama Barang <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="nama_barang"
                                type="text"
                                {...register('nama_barang', { required: 'Nama barang harus diisi' })}
                                className={`w-full px-4 py-2.5 rounded-lg border ${errors.nama_barang ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all duration-200`}
                                placeholder="Masukkan nama barang"
                            />
                            {errors.nama_barang && (
                                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                    <ExclamationCircleIcon className="w-4 h-4" />
                                    {errors.nama_barang.message}
                                </p>
                            )}
                        </div>

                        {/* Kode Barang */}
                        <div>
                            <label htmlFor="kode_barang" className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">
                                Kode Barang <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="kode_barang"
                                type="text"
                                {...register('kode_barang', { required: 'Kode barang harus diisi' })}
                                className={`w-full px-4 py-2.5 rounded-lg border ${errors.kode_barang ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all duration-200`}
                                placeholder="Masukkan kode barang"
                            />
                            {errors.kode_barang && (
                                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                    <ExclamationCircleIcon className="w-4 h-4" />
                                    {errors.kode_barang.message}
                                </p>
                            )}
                        </div>

                        {/* Kondisi */}
                        <div>
                            <label htmlFor="kondisi" className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">
                                Kondisi <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="kondisi"
                                {...register('kondisi', { required: 'Kondisi harus dipilih' })}
                                className={`w-full px-4 py-2.5 rounded-lg border ${errors.kondisi ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all duration-200`}
                            >
                                <option value="">Pilih Kondisi</option>
                                <option value="Baik">Baik</option>
                                <option value="Rusak Ringan">Rusak Ringan</option>
                                <option value="Rusak Berat">Rusak Berat</option>
                            </select>
                            {errors.kondisi && (
                                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                    <ExclamationCircleIcon className="w-4 h-4" />
                                    {errors.kondisi.message}
                                </p>
                            )}
                        </div>

                        {/* Lokasi */}
                        <div>
                            <label htmlFor="location_id" className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">
                                Lokasi <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="location_id"
                                {...register('location_id', { required: 'Lokasi harus dipilih' })}
                                className={`w-full px-4 py-2.5 rounded-lg border ${errors.location_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all duration-200`}
                            >
                                <option value="">Pilih Lokasi</option>
                                {locations.map(location => (
                                    <option key={location.id} value={location.id.toString()}>
                                        {location.nama_lokasi}
                                    </option>
                                ))}
                            </select>
                            {errors.location_id && (
                                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                    <ExclamationCircleIcon className="w-4 h-4" />
                                    {errors.location_id.message}
                                </p>
                            )}
                        </div>

                        {/* Penanggung Jawab */}
                        <div>
                            <label htmlFor="penanggung_jawab" className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">
                                Penanggung Jawab <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="penanggung_jawab"
                                {...register('penanggung_jawab', { required: 'Penanggung jawab harus dipilih' })}
                                className={`w-full px-4 py-2.5 rounded-lg border ${errors.penanggung_jawab ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all duration-200`}
                            >
                                <option value="">Pilih Penanggung Jawab</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.username}>
                                        {user.username}
                                    </option>
                                ))}
                            </select>
                            {errors.penanggung_jawab && (
                                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                    <ExclamationCircleIcon className="w-4 h-4" />
                                    {errors.penanggung_jawab.message}
                                </p>
                            )}
                        </div>

                        {/* Tanggal Masuk */}
                        <div>
                            <label htmlFor="tanggal_masuk" className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">
                                Tanggal Masuk <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="tanggal_masuk"
                                type="date"
                                {...register('tanggal_masuk', { required: 'Tanggal masuk harus diisi' })}
                                className={`w-full px-4 py-2.5 rounded-lg border ${errors.tanggal_masuk ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all duration-200`}
                            />
                            {errors.tanggal_masuk && (
                                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                    <ExclamationCircleIcon className="w-4 h-4" />
                                    {errors.tanggal_masuk.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Deskripsi */}
                    <div>
                        <label htmlFor="deskripsi" className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">
                            Deskripsi
                        </label>
                        <textarea
                            id="deskripsi"
                            {...register('deskripsi')}
                            rows={4}
                            className={`w-full px-4 py-2.5 rounded-lg border ${errors.deskripsi ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all duration-200 resize-none`}
                            placeholder="Masukkan deskripsi barang (opsional)"
                        />
                        {errors.deskripsi && (
                            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                <ExclamationCircleIcon className="w-4 h-4" />
                                {errors.deskripsi.message}
                            </p>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2.5 px-5 rounded-lg inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed min-w-[180px]"
                            >
                                <CheckCircleIcon className="w-5 h-5" />
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Menyimpan...
                                    </span>
                                ) : (isEditMode ? 'Perbarui Barang' : 'Simpan Barang')}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/assets')}
                                className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-2.5 px-5 rounded-lg inline-flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                            >
                                Batal
                            </button>
                        </div>
                    </div>

                    {(createError || updateError) && (
                        <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-start gap-3">
                            <ExclamationCircleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium">Terjadi kesalahan:</p>
                                <p>{createError || updateError}</p>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AssetFormPage;
