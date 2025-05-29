// src/pages/Locations/LocationListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { showToast } from '../../components/common/Toast';
import LocationFilter from '../../components/locations/LocationFilter'; // Import LocationFilter
import { useAuth } from '../../contexts/AuthContext';
import { useDebounce } from '../../hooks/useDebounce'; // Import useDebounce hook

const LocationListPage = () => {
    const [locations, setLocations] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [locationToDelete, setLocationToDelete] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
    });

    const debouncedSearchTerm = useDebounce(filters.search, 500); // Debounce search input

    const { user } = useAuth();

    const navigate = useNavigate();

    const fetchLocations = async () => {
        setIsLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                search: debouncedSearchTerm, // Gunakan debounced term
            };
            const response = await api.get('/lokasi', { params });
            setLocations(response.data.items);
            setTotalPages(response.data.total_pages);
            setTotalItems(response.data.total_items);
            showToast('Data Lokasi berhasil dimuat!', 'success');
        } catch (error) {
            showToast('Gagal memuat data lokasi.', 'error');
            console.error('Error fetching locations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, [currentPage, debouncedSearchTerm]);

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
                await api.delete(`/lokasi/${locationToDelete.id_lokasi}`);
                showToast('Lokasi berhasil dihapus!', 'success');
                fetchLocations();
                setShowDeleteModal(false);
                setLocationToDelete(null);
            } catch (error) {
                showToast('Gagal menghapus lokasi.', 'error');
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
                    <button onClick={() => navigate(`/locations/edit/${row.id_lokasi}`)} className="bg-yellow-500 hover:bg-yellow-700 text-white py-1 px-3 rounded text-sm">Edit</button>
                    <button onClick={() => handleDeleteClick(row)} className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded text-sm">Hapus</button>
                    {/* Jika assign penanggung jawab dilakukan di sini, bisa berupa modal atau navigasi ke form user edit */}
                    {/* {user?.role === 'admin' && (
                        <button onClick={() => alert('Assign PJ')} className="bg-indigo-500 hover:bg-indigo-700 text-white py-1 px-3 rounded text-sm">Assign PJ</button>
                    )} */}
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
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
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