import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { showToast } from '../../components/common/Toast';
import LocationFilter from '../../components/locations/LocationFilter';
import { useAuth } from '../../contexts/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { useLocationList } from '../../hooks/useLocations';
import api from '../../services/api'; // Tambahan di sini!

const LocationListPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [filters, setFilters] = useState({ search: '' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [locationToDelete, setLocationToDelete] = useState(null);

    const debouncedSearchTerm = useDebounce(filters.search, 500);

    const { user } = useAuth();
    const navigate = useNavigate();

    const {
        locations,
        pagination,
        loading: isLoading,
        error: fetchError,
        refetchLocations,
    } = useLocationList(
        { search: debouncedSearchTerm },
        currentPage,
        itemsPerPage
    );

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setCurrentPage(1);
    };

    const handleDeleteClick = (location) => {
        setLocationToDelete(location);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (locationToDelete) {
            try {
                await api.delete(`/lokasi/delete/${locationToDelete.id}`);
                showToast('Lokasi berhasil dihapus!', 'success');
                refetchLocations();
                setShowDeleteModal(false);
                setLocationToDelete(null);
            } catch (error) {
                // Pesan error dari backend
                const backendMsg =
                    error?.response?.data?.message ||
                    error?.message ||
                    'Gagal menghapus lokasi.';
                showToast(backendMsg, 'error');
                setShowDeleteModal(false);
                setLocationToDelete(null);
                console.error('Error deleting location:', error);
            }
        }
    };

    const columns = [
        { header: 'Nama Lokasi', accessor: 'nama_lokasi', sortable: true },
        { header: 'Kode Lokasi', accessor: 'kode_lokasi', sortable: true },
        { header: 'Alamat Lokasi', accessor: 'alamat_lokasi', sortable: true },
        {
            header: 'Aksi',
            render: (row) => (
                <div className="flex space-x-2">
                    <button onClick={() => navigate(`/locations/edit/${row.id}`)} className="bg-yellow-500 hover:bg-yellow-700 text-white py-1 px-3 rounded text-sm">Edit</button>
                    <button onClick={() => handleDeleteClick(row)} className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded text-sm">Hapus</button>
                </div>
            )
        },
    ];

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Daftar Lokasi</h1>
            <LocationFilter filters={filters} onFilterChange={handleFilterChange} />
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => navigate('/locations/add')}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                    Tambah Lokasi
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-8 dark:text-gray-300">Memuat daftar lokasi...</div>
            ) : (
                <>
                    <Table data={locations} columns={columns} />
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
                title="Konfirmasi Hapus Lokasi"
                message={`Anda yakin ingin menghapus lokasi "${locationToDelete?.nama_lokasi}"? Semua barang yang terkait dengan lokasi ini mungkin akan terpengaruh.`}
            />
        </div>
    );
};

export default LocationListPage;
