// src/pages/Users/UserListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import { showToast } from '../../components/common/Toast';
import { useAuth } from '../../contexts/AuthContext'; // Untuk cek role

function renderRole(role) {
    if (!role) return '';
    // Hilangkan UserRole. jika ada
    let displayRole = role;
    if (role.startsWith('UserRole.')) {
        displayRole = role.replace('UserRole.', '');
    }
    // Format ke "Penanggung Jawab" dst
    displayRole = displayRole
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/(^|\s)\S/g, l => l.toUpperCase());
    return displayRole;
}

const UserListPage = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const { user: currentUser } = useAuth(); // User yang sedang login

    const navigate = useNavigate();

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/users');
            setUsers(response.data.items);
            showToast('Data Pengguna berhasil dimuat!', 'success');
        } catch (error) {
            showToast('Gagal memuat data pengguna.', 'error');
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.role !== 'admin') {
            showToast('Anda tidak memiliki akses ke halaman ini.', 'error');
            navigate('/dashboard');
        } else {
            fetchUsers();
        }
    }, [currentUser, navigate]);

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (userToDelete) {
            try {
                await api.delete(`/users/delete/${userToDelete.id}`);
                showToast('Pengguna berhasil dihapus!', 'success');
                fetchUsers();
                setShowDeleteModal(false);
                setUserToDelete(null);
            } catch (error) {
                showToast('Gagal menghapus pengguna.', 'error');
                console.error('Error deleting user:', error);
            }
        }
    };

    const columns = [
        { header: 'Username', accessor: 'username', sortable: true },
        { 
            header: 'Role', 
            accessor: 'role', 
            sortable: true,
            render: (row) => renderRole(row.role)
        },
        {
            header: 'Aksi',
            render: (row) => (
                <div className="flex space-x-2">
                    <button onClick={() => navigate(`/users/edit/${row.id}`)} className="bg-yellow-500 hover:bg-yellow-700 text-white py-1 px-3 rounded text-sm">Edit</button>
                    {currentUser?.id !== row.id && (
                        <button onClick={() => handleDeleteClick(row)} className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded text-sm">Hapus</button>
                    )}
                </div>
            )
        },
    ];

    if (isLoading) {
        return <div className="p-6 text-center">Memuat daftar pengguna...</div>;
    }

    if (currentUser?.role !== 'admin') {
        return null; // Atau tampilkan pesan tidak ada akses
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Manajemen Pengguna</h1>

            <div className="flex justify-end mb-4">
                <button
                    onClick={() => navigate('/users/add')}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                    Tambah Pengguna
                </button>
            </div>

            <Table data={users} columns={columns} />

            <Modal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Konfirmasi Hapus Pengguna"
                message={`Anda yakin ingin menghapus pengguna "${userToDelete?.username}"?`}
            />
        </div>
    );
};

export default UserListPage;
