// src/pages/Assets/AssetListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { showToast } from '../../components/common/Toast';
import AssetFilter from '../../components/assets/AssetFilter'; // Import AssetFilter
import { formatDate } from '../../utils/helpers'; // Import helper
import { useDebounce } from '../../hooks/useDebounce'; // Import useDebounce hook

const AssetListPage = () => {
    const [assets, setAssets] = useState([]);
    const [locations, setLocations] = useState([]);
    const [penanggungJawabList, setPenanggungJawabList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
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

    const debouncedSearchTerm = useDebounce(filters.search, 500); // Debounce search input

    const navigate = useNavigate();

    const fetchAssets = async () => {
        setIsLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                search: debouncedSearchTerm, // Gunakan debounced term
                location_id: filters.location_id,
                condition: filters.condition,
                penanggung_jawab: filters.penanggung_jawab,
                start_date: filters.start_date,
                end_date: filters.end_date,
            };
            const response = await api.get('/barang', { params });
            setAssets(response.data.items);
            setTotalPages(response.data.total_pages);
            setTotalItems(response.data.total_items);
            showToast('Data Barang berhasil dimuat!', 'success');
        } catch (error) {
            showToast('Gagal memuat data barang.', 'error');
            console.error('Error fetching assets:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFilterData = async () => {
        try {
            const [locRes, userRes] = await Promise.all([
                api.get('/lokasi'),
                api.get('/users') // Asumsi endpoint untuk mendapatkan daftar penanggung jawab
            ]);
            setLocations(locRes.data.items);
            // Asumsi userRes.data.items memiliki username yang relevan
            setPenanggungJawabList(userRes.data.items.map(u => u.username));
        } catch (error) {
            console.error('Error fetching filter data:', error);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, [currentPage, filters.location_id, filters.condition, filters.penanggung_jawab, filters.start_date, filters.end_date, debouncedSearchTerm]);

    useEffect(() => {
        fetchFilterData();
    }, []);

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
            try {
                await api.delete(`/barang/${assetToDelete.id_barang}`);
                showToast('Barang berhasil dihapus!', 'success');
                fetchAssets(); // Refresh list
                setShowDeleteModal(false);
                setAssetToDelete(null);
            } catch (error) {
                showToast('Gagal menghapus barang.', 'error');
                console.error('Error deleting asset:', error);
            }
        }
    };

    const handleQrCodePrint = (asset) => {
        navigate(`/assets/qr/${asset.id_barang}`);
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
        { header: 'Lokasi', accessor: 'lokasi.nama_lokasi', sortable: true },
        { header: 'Penanggung Jawab', accessor: 'penanggung_jawab', sortable: true },
        { header: 'Tanggal Masuk', accessor: 'tanggal_masuk', sortable: true, render: (row) => formatDate(row.tanggal_masuk) },
        { header: 'Tanggal Pembaruan', accessor: 'tanggal_pembaruan', sortable: true, render: (row) => row.tanggal_pembaruan ? formatDate(row.tanggal_pembaruan) : 'N/A' },
        {
            header: 'Aksi',
            render: (row) => (
                <div className="flex space-x-2">
                    <button onClick={() => navigate(`/assets/detail/${row.id_barang}`)} className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm">Detail</button>
                    <button onClick={() => navigate(`/assets/edit/${row.id_barang}`)} className="bg-yellow-500 hover:bg-yellow-700 text-white py-1 px-3 rounded text-sm">Edit</button>
                    <button onClick={() => handleDeleteClick(row)} className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded text-sm">Hapus</button>
                    <button onClick={() => handleQrCodePrint(row)} className="bg-purple-500 hover:bg-purple-700 text-white py-1 px-3 rounded text-sm">QR Code</button>
                </div>
            )
        },
    ];

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

            {isLoading ? (
                <div className="text-center py-8 dark:text-gray-300">Memuat daftar barang...</div>
            ) : (
                <>
                    <Table data={assets} columns={columns} />
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
                title="Konfirmasi Hapus Barang"
                message={`Anda yakin ingin menghapus barang "${assetToDelete?.nama_barang}"? Aksi ini tidak dapat dibatalkan.`}
            />
        </div>
    );
};

export default AssetListPage;