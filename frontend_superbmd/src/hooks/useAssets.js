// src/hooks/useAssets.js
import { useState, useEffect, useCallback } from "react";
import api from '../services/api'; // Menggunakan instance Axios yang sudah dikonfigurasi

const API_BASE_URL = "/barang"; // Endpoint dasar untuk barang (GET all)

// Hook for fetching all Barang
export function useBarangList(filters = {}, currentPage = 1, itemsPerPage = 10) {
    const [barang, setBarang] = useState([]);
    const [pagination, setPagination] = useState({
        total_items: 0,
        total_pages: 1,
        current_page: 1,
        items_per_page: itemsPerPage,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBarang = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                ...filters,
            };
            const response = await api.get(API_BASE_URL, { params });
            setBarang(response.data.items);
            setPagination({
                total_items: response.data.pagination.total_items,
                total_pages: response.data.pagination.total_pages,
                current_page: response.data.pagination.current_page,
                items_per_page: response.data.pagination.items_per_page,
            });
            setLoading(false);
        } catch (err) {
            setError(err);
            setLoading(false);
        }
    }, [JSON.stringify(filters), currentPage, itemsPerPage]);

    useEffect(() => {
        fetchBarang();
    }, [fetchBarang]);

    return { barang, pagination, loading, error, refetchBarang: fetchBarang };
}

// Hook for fetching a single Barang by ID
export function useBarangById(id) {
    const [barang, setBarang] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBarang = useCallback(async () => {
        if (!id) { // Jangan fetch jika ID tidak ada
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Rute GET untuk detail barang adalah /api/barang/detail/{id}
            const response = await api.get(`${API_BASE_URL}/detail/${id}`);
            setBarang(response.data);
            setLoading(false);
        } catch (err) {
            console.error(`Failed to fetch barang with ID ${id}:`, err);
            setError(err);
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchBarang();
    }, [fetchBarang]);

    return { barang, loading, error, refetchBarang: fetchBarang };
}

// Hook for creating a Barang
export function useCreateBarang() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [newBarang, setNewBarang] = useState(null);

    const createBarang = async (formData) => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        setNewBarang(null);

        try {
            // Rute POST untuk create barang adalah /api/barang/create
            const response = await api.post(`${API_BASE_URL}/create`, formData);
            setSuccess(true);
            setNewBarang(response.data);
            return true;
        } catch (err) {
            console.error("Failed to create barang:", err);
            const errorMessage = err.response?.data?.message || err.message || "Unexpected error";
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { createBarang, loading, error, success, newBarang };
}

// Hook for updating a Barang
export function useUpdateBarang() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [updatedBarang, setUpdatedBarang] = useState(null);

    // Hanya field ini yang boleh di-update sesuai schema backend
    const allowedFields = [
        'nama_barang',
        'kode_barang',
        'kondisi',
        'id_lokasi',
        'penanggung_jawab',
        'tanggal_masuk',
        'tanggal_pembaruan'
    ];

    const updateBarang = async (id, formData) => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        setUpdatedBarang(null);

        try {
            // Filter hanya field yang boleh dikirim ke API
            const payload = {};
            allowedFields.forEach(field => {
                if (formData[field] !== undefined) payload[field] = formData[field];
            });

            // Rute PUT untuk update barang adalah /api/barang/update/{id}
            const response = await api.put(`${API_BASE_URL}/update/${id}`, payload);
            setSuccess(true);
            setUpdatedBarang(response.data);
            return true;
        } catch (err) {
            console.error(`Failed to update barang with ID ${id}:`, err);
            const errorMessage = err.response?.data?.message || err.message || "Unexpected error";
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { updateBarang, loading, error, success, updatedBarang };
}

// Hook for deleting a Barang
export function useDeleteBarang() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const deleteBarang = async (id) => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            // Rute DELETE untuk delete barang adalah /api/barang/delete/{id}
            await api.delete(`${API_BASE_URL}/delete/${id}`);
            setSuccess(true);
            return true;
        } catch (err) {
            console.error(`Failed to delete barang with ID ${id}:`, err);
            const errorMessage = err.response?.data?.message || err.message || "Unexpected error";
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { deleteBarang, loading, error, success };
} 
