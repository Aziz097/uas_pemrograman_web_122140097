// src/pages/Assets/AssetListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { showToast } from '../../components/common/Toast';
import AssetFilter from '../../components/assets/AssetFilter';
import { formatDate } from '../../utils/helpers';
import { useDebounce } from '../../hooks/useDebounce';
import { useBarangList, useDeleteBarang } from '../../hooks/useAssets';
import { useLocationList } from '../../hooks/useLocations';
import { useUserList } from '../../hooks/useUsers';
import { 
  PlusIcon, 
  InformationCircleIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  QrCodeIcon 
} from '@heroicons/react/24/outline';

const AssetListPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [assetToDelete, setAssetToDelete] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        location_id: '',
        condition: '',
        penanggung_jawab: '',
        start_date: '',
        end_date: ''
    });

    const debouncedSearchTerm = useDebounce(filters.search, 500);
    const navigate = useNavigate();

    const {
        barang: assets,
        pagination,
        loading: isLoadingAssets,
        error: fetchAssetsError,
        refetchBarang,
    } = useBarangList({ ...filters, search: debouncedSearchTerm }, currentPage, itemsPerPage);

    const {
        deleteBarang,
        loading: deletingAsset,
        error: deleteAssetError,
        success: deleteAssetSuccess,
    } = useDeleteBarang();

    const { locations, loading: loadingLocations, error: fetchLocationsError } = useLocationList();
    const { users: penanggungJawabUsers, loading: loadingUsers, error: fetchUsersError } = useUserList();

    const penanggungJawabList = penanggungJawabUsers.map(user => user.username);

    useEffect(() => {
        if (fetchAssetsError) {
            showToast('Gagal memuat data barang.', 'error');
            console.error('Error fetching assets:', fetchAssetsError);
        }
        if (fetchLocationsError) {
            showToast('Gagal memuat data lokasi untuk filter.', 'error');
            console.error('Error fetching locations for filter:', fetchLocationsError);
        }
        if (fetchUsersError) {
            showToast('Gagal memuat data pengguna untuk filter penanggung jawab.', 'error');
            console.error('Error fetching users for penanggung jawab filter:', fetchUsersError);
        }
    }, [fetchAssetsError, fetchLocationsError, fetchUsersError]);

    useEffect(() => {
        if (deleteAssetSuccess) {
            showToast('Barang berhasil dihapus!', 'success');
            refetchBarang();
            setShowDeleteModal(false);
            setAssetToDelete(null);
        } else if (deleteAssetError) {
            showToast(`Gagal menghapus barang: ${deleteAssetError}`, 'error');
            console.error('Error deleting asset:', deleteAssetError);
        }
    }, [deleteAssetSuccess, deleteAssetError, refetchBarang]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setCurrentPage(1);
    };

    const handleDeleteClick = (asset) => {
        setAssetToDelete(asset);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (assetToDelete) {
            await deleteBarang(assetToDelete.id);
        }
    };

    const handleQrCodePrint = (asset) => {
        navigate(`/assets/qr/${asset.id}`);
    };

    const columns = [
        { header: 'Nama Barang', accessor: 'nama_barang', sortable: true },
        { header: 'Kode Barang', accessor: 'kode_barang', sortable: true },
        {
            header: 'Kondisi',
            accessor: 'kondisi',
            sortable: true,
            render: (row) => {
                const kondisiMap = {
                    'Baik': 'bg-gradient-to-r from-green-400 to-green-500',
                    'Rusak Ringan': 'bg-gradient-to-r from-amber-400 to-amber-500',
                    'Rusak Berat': 'bg-gradient-to-r from-red-400 to-red-500'
                };
                
                return (
                    <span className={`px-3 py-1 rounded-full text-white text-xs font-medium inline-flex items-center shadow-sm ${kondisiMap[row.kondisi] || 'bg-gray-500'}`}>
                        {row.kondisi}
                    </span>
                );
            }
        },
        { header: 'Lokasi', accessor: 'nama_lokasi', sortable: true },
        { header: 'Penanggung Jawab', accessor: 'penanggung_jawab', sortable: true },
        { 
            header: 'Tanggal Masuk', 
            accessor: 'tanggal_masuk', 
            sortable: true, 
            render: (row) => (
                <span className="text-gray-700 dark:text-gray-300">
                    {formatDate(row.tanggal_masuk)}
                </span>
            ) 
        },
        { 
            header: 'Tanggal Pembaruan', 
            accessor: 'tanggal_pembaruan', 
            sortable: true, 
            render: (row) => (
                <span className="text-gray-700 dark:text-gray-300">
                    {row.tanggal_pembaruan ? formatDate(row.tanggal_pembaruan) : 'N/A'}
                </span>
            ) 
        },
        {
            header: 'Aksi',
            render: (row) => (
                <div className="flex space-x-2">
                    <button 
                        onClick={() => navigate(`/assets/detail/${row.id}`)} 
                        className="bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-2.5 rounded-md text-xs font-medium inline-flex items-center gap-1 shadow-sm transition-all duration-200 hover:shadow focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
                    >
                        <InformationCircleIcon className="w-3.5 h-3.5" />
                        Detail
                    </button>
                    <button 
                        onClick={() => navigate(`/assets/edit/${row.id}`)} 
                        className="bg-amber-500 hover:bg-amber-600 text-white py-1.5 px-2.5 rounded-md text-xs font-medium inline-flex items-center gap-1 shadow-sm transition-all duration-200 hover:shadow focus:ring-2 focus:ring-amber-300 focus:ring-opacity-50"
                    >
                        <PencilSquareIcon className="w-3.5 h-3.5" />
                        Edit
                    </button>
                    <button 
                        onClick={() => handleDeleteClick(row)} 
                        className="bg-red-500 hover:bg-red-600 text-white py-1.5 px-2.5 rounded-md text-xs font-medium inline-flex items-center gap-1 shadow-sm transition-all duration-200 hover:shadow focus:ring-2 focus:ring-red-300 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={deletingAsset}
                    >
                        <TrashIcon className="w-3.5 h-3.5" />
                        Hapus
                    </button>
                    <button 
                        onClick={() => handleQrCodePrint(row)} 
                        className="bg-indigo-500 hover:bg-indigo-600 text-white py-1.5 px-2.5 rounded-md text-xs font-medium inline-flex items-center gap-1 shadow-sm transition-all duration-200 hover:shadow focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50"
                    >
                        <QrCodeIcon className="w-3.5 h-3.5" />
                        QR Code
                    </button>
                </div>
            )
        },
    ];

    const overallLoading = isLoadingAssets || loadingLocations || loadingUsers;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Daftar Barang</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola semua aset/barang dalam sistem</p>
                </div>
                <button
                    onClick={() => navigate('/assets/add')}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2.5 px-4 rounded-lg inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 self-start md:self-center"
                >
                    <PlusIcon className="w-5 h-5" />
                    Tambah Barang
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
                <AssetFilter
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    locations={locations}
                    penanggungJawabList={penanggungJawabList}
                />

                {overallLoading ? (
                    <div className="flex items-center justify-center h-64 w-full">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="h-12 w-12 bg-green-200 dark:bg-green-800 rounded-full mb-4"></div>
                            <div className="text-green-600 dark:text-green-400 font-medium">Memuat daftar barang...</div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                            <Table data={assets} columns={columns} />
                        </div>
                        <div className="mt-6">
                            <Pagination
                                currentPage={pagination.current_page}
                                totalPages={pagination.total_pages}
                                totalItems={pagination.total_items}
                                itemsPerPage={pagination.items_per_page}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    </>
                )}
            </div>

            <Modal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Konfirmasi Hapus Barang"
                message={`Anda yakin ingin menghapus barang "${assetToDelete?.nama_barang}"? Aksi ini tidak dapat dibatalkan.`}
                confirmButtonText={deletingAsset ? 'Menghapus...' : 'Hapus'}
                confirmButtonDisabled={deletingAsset}
            />
        </div>
    );
};

export default AssetListPage;