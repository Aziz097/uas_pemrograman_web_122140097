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
import { useBarangList, useDeleteBarang } from '../../hooks/useAssets'; // Import asset hooks
import { useLocationList } from '../../hooks/useLocations'; // Import location list hook
import { useUserList } from '../../hooks/useUsers'; // Import user list hook (for penanggung jawab)



const AssetListPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Default items per page
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

    // Menggunakan hooks
    const {
        barang: assets,
        pagination,
        loading: isLoadingAssets,
        error: fetchAssetsError,
        refetchBarang, // Fungsi untuk refresh data aset
    } = useBarangList({ ...filters, search: debouncedSearchTerm }, currentPage, itemsPerPage);

    const {
        deleteBarang,
        loading: deletingAsset,
        error: deleteAssetError,
        success: deleteAssetSuccess,
    } = useDeleteBarang();

    const { locations, loading: loadingLocations, error: fetchLocationsError } = useLocationList();
    const { users: penanggungJawabUsers, loading: loadingUsers, error: fetchUsersError } = useUserList(); // Asumsi userList bisa digunakan untuk penanggung jawab

    // Filtered penanggung jawab list for dropdown
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
            refetchBarang(); // Refresh list setelah penghapusan
            setShowDeleteModal(false);
            setAssetToDelete(null);
        } else if (deleteAssetError) {
            showToast(`Gagal menghapus barang: ${deleteAssetError}`, 'error');
            console.error('Error deleting asset:', deleteAssetError);
        }
    }, [deleteAssetSuccess, deleteAssetError, refetchBarang]);


    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setCurrentPage(1); // Reset page when filters change
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
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-white text-xs ${
                    row.kondisi === 'Baik' ? 'bg-green-500' :
                    row.kondisi === 'Rusak Ringan' ? 'bg-yellow-500' :
                    'bg-red-500'
                }`}>
                    {row.kondisi}
                </span>
            )
        },
        { header: 'Lokasi', accessor: 'nama_lokasi', sortable: true },
        { header: 'Penanggung Jawab', accessor: 'penanggung_jawab', sortable: true },
        { header: 'Tanggal Masuk', accessor: 'tanggal_masuk', sortable: true, render: (row) => formatDate(row.tanggal_masuk) },
        { header: 'Tanggal Pembaruan', accessor: 'tanggal_pembaruan', sortable: true, render: (row) => row.tanggal_pembaruan ? formatDate(row.tanggal_pembaruan) : 'N/A' },
        {
            header: 'Aksi',
            render: (row) => (
                <div className="flex space-x-2">
                    <button onClick={() => navigate(`/assets/detail/${row.id}`)} className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm">Detail</button>
                    <button onClick={() => navigate(`/assets/edit/${row.id}`)} className="bg-yellow-500 hover:bg-yellow-700 text-white py-1 px-3 rounded text-sm">Edit</button>
                    <button onClick={() => handleDeleteClick(row)} className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded text-sm" disabled={deletingAsset}>Hapus</button>
                    <button onClick={() => handleQrCodePrint(row)} className="bg-purple-500 hover:bg-purple-700 text-white py-1 px-3 rounded text-sm">QR Code</button>
                </div>
            )
        },
    ];

    const overallLoading = isLoadingAssets || loadingLocations || loadingUsers;

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Daftar Barang</h1>

            <AssetFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                locations={locations}
                penanggungJawabList={penanggungJawabList}
            />

            <div className="flex justify-end mb-4">
                <button
                    onClick={() => navigate('/assets/add')}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                    Tambah Barang
                </button>
            </div>

            {overallLoading ? (
                <div className="text-center py-8 dark:text-gray-300">Memuat daftar barang...</div>
            ) : (
                <>
                    <Table data={assets} columns={columns} />
                    <Pagination
                        currentPage={pagination.current_page}
                        totalPages={pagination.total_pages}
                        totalItems={pagination.total_items}
                        itemsPerPage={pagination.items_per_page}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}

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