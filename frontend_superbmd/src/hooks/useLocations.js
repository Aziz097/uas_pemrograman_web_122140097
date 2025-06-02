// src/hooks/useLocation.js
import { useState, useEffect, useCallback } from "react";
import api from '../services/api'; // Menggunakan instance Axios yang sudah dikonfigurasi

const API_BASE_URL = "/lokasi"; // Endpoint dasar untuk daftar lokasi (GET)

// Hook for fetching all Locations
export function useLocationList(filters = {}, currentPage = 1, itemsPerPage = 10) {
    const [locations, setLocations] = useState([]);
    const [pagination, setPagination] = useState({
        total_items: 0,
        total_pages: 1,
        current_page: 1,
        items_per_page: itemsPerPage,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLocations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                ...filters,
            };
            const response = await api.get(API_BASE_URL, { params });
            setLocations(response.data.items);
            setPagination({
                total_items: Number(response.data.pagination?.total_items) || 0,
                total_pages: Number(response.data.pagination?.total_pages) || 1,
                current_page: Number(response.data.pagination?.current_page) || 1,
                items_per_page: Number(response.data.pagination?.items_per_page) || 10,
            });
            
            setLoading(false);
        } catch (err) {
            setError(err);
            setLoading(false);
        }
    }, [JSON.stringify(filters), currentPage, itemsPerPage]);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    return { locations, pagination, loading, error, refetchLocations: fetchLocations };
}

// Hook for fetching a single Location by ID
export function useLocationById(id) {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLocation = useCallback(async () => {
        if (!id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Rute GET untuk detail lokasi adalah /api/lokasi/detail/{id}
            const response = await api.get(`${API_BASE_URL}/detail/${id}`);
            setLocation(response.data);
            setLoading(false);
        } catch (err) {
            console.error(`Failed to fetch location with ID ${id}:`, err);
            setError(err);
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchLocation();
    }, [fetchLocation]);

    return { location, loading, error, refetchLocation: fetchLocation };
}

// Hook for creating a Location
export function useCreateLocation() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [newLocation, setNewLocation] = useState(null);

    const createLocation = async (formData) => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        setNewLocation(null);

        try {
            // Rute POST untuk create lokasi adalah /api/lokasi/create
            const response = await api.post(`${API_BASE_URL}/create`, formData);
            setSuccess(true);
            setNewLocation(response.data); // Store the newly created location data
            return true;
        } catch (err) {
            console.error("Failed to create location:", err);
            const errorMessage = err.response?.data?.message || err.message || "Unexpected error";
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { createLocation, loading, error, success, newLocation };
}

// Hook for updating a Location
export function useUpdateLocation() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [updatedLocation, setUpdatedLocation] = useState(null);

    const updateLocation = async (id, formData) => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        setUpdatedLocation(null);

        try {
            // Rute PUT untuk update lokasi adalah /api/lokasi/update/{id} (memperbaiki typo 'uptade')
            const response = await api.put(`${API_BASE_URL}/update/${id}`, formData);
            setSuccess(true);
            setUpdatedLocation(response.data); // Store the updated location data
            return true;
        } catch (err) {
            console.error(`Failed to update location with ID ${id}:`, err);
            const errorMessage = err.response?.data?.message || err.message || "Unexpected error";
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { updateLocation, loading, error, success, updatedLocation };
}

// Hook for deleting a Location
export function useDeleteLocation() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const deleteLocation = async (id) => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            // Rute DELETE untuk delete lokasi adalah /api/lokasi/delete/{id}
            await api.delete(`${API_BASE_URL}/delete/${id}`);
            setSuccess(true);
            return true;
        } catch (err) {
            console.error(`Failed to delete location with ID ${id}:`, err);
            const errorMessage = err.response?.data?.message || err.message || "Unexpected error";
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { deleteLocation, loading, error, success };
}