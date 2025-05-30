import { useState, useEffect, useCallback } from "react";
import api from '../services/api'; // Menggunakan instance Axios yang sudah dikonfigurasi

const API_BASE_URL = "/barang"; // Endpoint dasar untuk barang

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

    // Gunakan useCallback untuk memastikan fungsi fetch tidak berubah pada setiap render
    const fetchBarang = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                ...filters, // Gabungkan semua filter yang diberikan
            };
            const response = await api.get(API_BASE_URL, { params });
            setBarang(response.data.items);
            setPagination({
                total_items: response.data.total_items,
                total_pages: response.data.total_pages,
                current_page: response.data.current_page,
                items_per_page: response.data.items_per_page,
            });
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch barang:", err);
            setError(err);
            setLoading(false);
        }
    }, [filters, currentPage, itemsPerPage]); // Dependencies for useCallback

    useEffect(() => {
        fetchBarang();
    }, [fetchBarang]); // useEffect akan memanggil fetchBarang ketika fetchBarang berubah (karena dependencies-nya)

    return { barang, pagination, loading, error, refetchBarang: fetchBarang }; // Sertakan refetch function
}

// Hook for fetching a single Barang by ID
export function useBarangById(id) {
    const [barang, setBarang] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBarang = useCallback(async () => {
        if (!id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`${API_BASE_URL}/${id}`);
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
            const response = await api.post(API_BASE_URL, formData);
            setSuccess(true);
            setNewBarang(response.data); // Store the newly created barang data
            return true;
        } catch (err) {
            console.error("Failed to create barang:", err);
            // Error dari Axios interceptor atau backend
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

    const updateBarang = async (id, formData) => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        setUpdatedBarang(null);

        try {
            const response = await api.put(`${API_BASE_URL}/${id}`, formData);
            setSuccess(true);
            setUpdatedBarang(response.data); // Store the updated barang data
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
            await api.delete(`${API_BASE_URL}/${id}`);
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