// src/pages/Assets/AssetFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { showToast } from '../../components/common/Toast';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';
import FormDatePicker from '../../components/common/FormDatePicker';
import FormTextarea from '../../components/common/FormTextarea';
import Loading from '../../components/common/Loading';
import { useLocationList } from '../../hooks/useLocations';
import { useUserList } from '../../hooks/useUsers';
import { useBarangDetail, useCreateBarang, useUpdateBarang } from '../../hooks/useAssets';
import { SaveIcon, ArrowLeftIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const AssetFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    // Form handling
    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();

    // Data fetching hooks
    const { locations } = useLocationList();
    const { users } = useUserList();
    const { barang: assetDetail, loading: loadingAsset, error: assetError } = useBarangDetail(id, isEditMode);
    const { createBarang, loading: creating, error: createError, success: createSuccess } = useCreateBarang();
    const { updateBarang, loading: updating, error: updateError, success: updateSuccess } = useUpdateBarang();

    // Local state for form
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Filter users to only include those who can be penanggung_jawab
    const penanggungJawabOptions = users.map(user => ({
        value: user.username,
        label: user.username
    }));

    // Populate form with asset data in edit mode
    useEffect(() => {
        if (isEditMode && assetDetail) {
            const formData = {
                nama_barang: assetDetail.nama_barang,
                kode_barang: assetDetail.kode_barang,
                kondisi: assetDetail.kondisi,
                location_id: assetDetail.location_id.toString(),
                penanggung_jawab: assetDetail.penanggung_jawab,
                deskripsi: assetDetail.deskripsi || '',
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
            tanggal_masuk: selectedDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
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
        return (
            <div className="flex items-center justify-center h-64 w-full">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-16 w-16 bg-green-200 dark:bg-green-800 rounded-full mb-4 flex items-center justify-center">
                        <div className="h-8 w-8 bg-green-400 dark:bg-green-600 rounded-full animate-ping"></div>
                    </div>
                    <div className="text-green-600 dark:text-green-400 font-medium text-lg">Memuat data barang...</div>
                </div>
            </div>
        );
    }

    const locationOptions = locations.map(location => ({
        value: location.id.toString(),
        label: location.nama_lokasi
    }));

    const kondisiOptions = [
        { value: 'Baik', label: 'Baik' },
        { value: 'Rusak Ringan', label: 'Rusak Ringan' },
        { value: 'Rusak Berat', label: 'Rusak Berat' }
    ];

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
                        <FormInput
                            label="Nama Barang"
                            name="nama_barang"
                            register={register}
                            required="Nama barang harus diisi"
                            errors={errors}
                            placeholder="Masukkan nama barang"
                        />

                        <FormInput
                            label="Kode Barang"
                            name="kode_barang"
                            register={register}
                            required="Kode barang harus diisi"
                            errors={errors}
                            placeholder="Masukkan kode barang"
                        />

                        <FormSelect
                            label="Kondisi"
                            name="kondisi"
                            register={register}
                            required="Kondisi harus dipilih"
                            errors={errors}
                            options={kondisiOptions}
                        />

                        <FormSelect
                            label="Lokasi"
                            name="location_id"
                            register={register}
                            required="Lokasi harus dipilih"
                            errors={errors}
                            options={locationOptions}
                        />

                        <FormSelect
                            label="Penanggung Jawab"
                            name="penanggung_jawab"
                            register={register}
                            required="Penanggung jawab harus dipilih"
                            errors={errors}
                            options={penanggungJawabOptions}
                        />

                        <FormDatePicker
                            label="Tanggal Masuk"
                            name="tanggal_masuk"
                            value={selectedDate}
                            onChange={setSelectedDate}
                        />
                    </div>

                    <div>
                        <FormTextarea
                            label="Deskripsi"
                            name="deskripsi"
                            register={register}
                            errors={errors}
                            placeholder="Masukkan deskripsi barang (opsional)"
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                type="submit"
                                disabled={creating || updating}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2.5 px-5 rounded-lg inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed min-w-[180px]"
                            >
                                <SaveIcon className="w-5 h-5" />
                                {creating || updating ? (
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
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { showToast } from '../../components/common/Toast';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';
import FormDatePicker from '../../components/common/FormDatePicker';
import FormTextarea from '../../components/common/FormTextarea';
import Loading from '../../components/common/Loading';
import { useLocationList } from '../../hooks/useLocations';
import { useUserList } from '../../hooks/useUsers';
import { useBarangDetail, useCreateBarang, useUpdateBarang } from '../../hooks/useAssets';
import { SaveIcon, ArrowLeftIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const AssetFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    // Form handling
    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();

    // Data fetching hooks
    const { locations } = useLocationList();
    const { users } = useUserList();
    const { barang: assetDetail, loading: loadingAsset, error: assetError } = useBarangDetail(id, isEditMode);
    const { createBarang, loading: creating, error: createError, success: createSuccess } = useCreateBarang();
    const { updateBarang, loading: updating, error: updateError, success: updateSuccess } = useUpdateBarang();

    // Local state for form
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Filter users to only include those who can be penanggung_jawab
    const penanggungJawabOptions = users.map(user => ({
        value: user.username,
        label: user.username
    }));

    // Populate form with asset data in edit mode
    useEffect(() => {
        if (isEditMode && assetDetail) {
            const formData = {
                nama_barang: assetDetail.nama_barang,
                kode_barang: assetDetail.kode_barang,
                kondisi: assetDetail.kondisi,
                location_id: assetDetail.location_id.toString(),
                penanggung_jawab: assetDetail.penanggung_jawab,
                deskripsi: assetDetail.deskripsi || '',
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
            tanggal_masuk: selectedDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
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
        return (
            <div className="flex items-center justify-center h-64 w-full">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-16 w-16 bg-green-200 dark:bg-green-800 rounded-full mb-4 flex items-center justify-center">
                        <div className="h-8 w-8 bg-green-400 dark:bg-green-600 rounded-full animate-ping"></div>
                    </div>
                    <div className="text-green-600 dark:text-green-400 font-medium text-lg">Memuat data barang...</div>
                </div>
            </div>
        );
    }

    const locationOptions = locations.map(location => ({
        value: location.id.toString(),
        label: location.nama_lokasi
    }));

    const kondisiOptions = [
        { value: 'Baik', label: 'Baik' },
        { value: 'Rusak Ringan', label: 'Rusak Ringan' },
        { value: 'Rusak Berat', label: 'Rusak Berat' }
    ];

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
                        <FormInput
                            label="Nama Barang"
                            name="nama_barang"
                            register={register}
                            required="Nama barang harus diisi"
                            errors={errors}
                            placeholder="Masukkan nama barang"
                        />

                        <FormInput
                            label="Kode Barang"
                            name="kode_barang"
                            register={register}
                            required="Kode barang harus diisi"
                            errors={errors}
                            placeholder="Masukkan kode barang"
                        />

                        <FormSelect
                            label="Kondisi"
                            name="kondisi"
                            register={register}
                            required="Kondisi harus dipilih"
                            errors={errors}
                            options={kondisiOptions}
                        />

                        <FormSelect
                            label="Lokasi"
                            name="location_id"
                            register={register}
                            required="Lokasi harus dipilih"
                            errors={errors}
                            options={locationOptions}
                        />

                        <FormSelect
                            label="Penanggung Jawab"
                            name="penanggung_jawab"
                            register={register}
                            required="Penanggung jawab harus dipilih"
                            errors={errors}
                            options={penanggungJawabOptions}
                        />

                        <FormDatePicker
                            label="Tanggal Masuk"
                            name="tanggal_masuk"
                            value={selectedDate}
                            onChange={setSelectedDate}
                        />
                    </div>

                    <div>
                        <FormTextarea
                            label="Deskripsi"
                            name="deskripsi"
                            register={register}
                            errors={errors}
                            placeholder="Masukkan deskripsi barang (opsional)"
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                type="submit"
                                disabled={creating || updating}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2.5 px-5 rounded-lg inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed min-w-[180px]"
                            >
                                <SaveIcon className="w-5 h-5" />
                                {creating || updating ? (
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
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { showToast } from '../../components/common/Toast';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';
import FormDatePicker from '../../components/common/FormDatePicker';
import FormTextarea from '../../components/common/FormTextarea';
import Loading from '../../components/common/Loading';
import { useLocationList } from '../../hooks/useLocations';
import { useUserList } from '../../hooks/useUsers';
import { useBarangDetail, useCreateBarang, useUpdateBarang } from '../../hooks/useAssets';
import { SaveIcon, ArrowLeftIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const AssetFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    // Form handling
    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();

    // Data fetching hooks
    const { locations } = useLocationList();
    const { users } = useUserList();
    const { barang: assetDetail, loading: loadingAsset, error: assetError } = useBarangDetail(id, isEditMode);
    const { createBarang, loading: creating, error: createError, success: createSuccess } = useCreateBarang();
    const { updateBarang, loading: updating, error: updateError, success: updateSuccess } = useUpdateBarang();

    // Local state for form
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Filter users to only include those who can be penanggung_jawab
    const penanggungJawabOptions = users.map(user => ({
        value: user.username,
        label: user.username
    }));

    // Populate form with asset data in edit mode
    useEffect(() => {
        if (isEditMode && assetDetail) {
            const formData = {
                nama_barang: assetDetail.nama_barang,
                kode_barang: assetDetail.kode_barang,
                kondisi: assetDetail.kondisi,
                location_id: assetDetail.location_id.toString(),
                penanggung_jawab: assetDetail.penanggung_jawab,
                deskripsi: assetDetail.deskripsi || '',
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
            tanggal_masuk: selectedDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
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
        return (
            <div className="flex items-center justify-center h-64 w-full">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-16 w-16 bg-green-200 dark:bg-green-800 rounded-full mb-4 flex items-center justify-center">
                        <div className="h-8 w-8 bg-green-400 dark:bg-green-600 rounded-full animate-ping"></div>
                    </div>
                    <div className="text-green-600 dark:text-green-400 font-medium text-lg">Memuat data barang...</div>
                </div>
            </div>
        );
    }

    const locationOptions = locations.map(location => ({
        value: location.id.toString(),
        label: location.nama_lokasi
    }));

    const kondisiOptions = [
        { value: 'Baik', label: 'Baik' },
        { value: 'Rusak Ringan', label: 'Rusak Ringan' },
        { value: 'Rusak Berat', label: 'Rusak Berat' }
    ];

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