// src/hooks/useUsers.js
import { useState, useEffect, useCallback } from "react";
import api from '../services/api';

const API_BASE_URL = "/users";

// Helper agar role selalu konsisten
function parseRole(roleString) {
    if (!roleString) return '';
    if (roleString.startsWith('UserRole.')) {
        return roleString.replace('UserRole.', '').toLowerCase();
    }
    return roleString.toLowerCase();
}

// FETCH ALL USERS
export function useUserList(filters = {}, currentPage = 1, itemsPerPage = 10) {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({
        total_items: 0,
        total_pages: 1,
        current_page: 1,
        items_per_page: itemsPerPage,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                ...filters,
            };
            const response = await api.get(API_BASE_URL, { params });
            // role parsing disini
            const parsedUsers = response.data.items.map(u => ({
                ...u,
                role: parseRole(u.role)
            }));
            setUsers(parsedUsers);
            setPagination({
                total_items: response.data.pagination?.total_items || 0,
                total_pages: response.data.pagination?.total_pages || 1,
                current_page: response.data.pagination?.current_page || 1,
                items_per_page: response.data.pagination?.items_per_page || itemsPerPage,
            });
            setLoading(false);
        } catch (err) {
            setError(err);
            setLoading(false);
        }
    }, [JSON.stringify(filters), currentPage, itemsPerPage]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { users, pagination, loading, error, refetchUsers: fetchUsers };
}

// FETCH SINGLE USER BY ID
export function useUserById(id) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUser = useCallback(async () => {
        if (!id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // /api/users/detail/{id}
            const response = await api.get(`${API_BASE_URL}/detail/${id}`);
            setUser({
                ...response.data,
                role: parseRole(response.data.role)
            });
            setLoading(false);
        } catch (err) {
            setError(err);
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return { user, loading, error, refetchUser: fetchUser };
}

// CREATE USER
export function useCreateUser() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [newUser, setNewUser] = useState(null);

    const createUser = async (formData) => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        setNewUser(null);

        try {
            // role harus string kecil
            const submitData = {
                ...formData,
                role: parseRole(formData.role),
            };
            const response = await api.post(`${API_BASE_URL}/create`, submitData);
            setSuccess(true);
            setNewUser({
                ...response.data,
                role: parseRole(response.data.role),
            });
            return true;
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Unexpected error");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { createUser, loading, error, success, newUser };
}

// UPDATE USER
export function useUpdateUser() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [updatedUser, setUpdatedUser] = useState(null);

    const updateUser = async (id, formData) => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        setUpdatedUser(null);

        try {
            // Perhatikan endpoint!
            // /api/users/update/{id}
            const submitData = {
                ...formData,
                role: parseRole(formData.role),
            };
            const response = await api.put(`${API_BASE_URL}/update/${id}`, submitData);
            setSuccess(true);
            setUpdatedUser({
                ...response.data,
                role: parseRole(response.data.role),
            });
            return true;
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Unexpected error");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { updateUser, loading, error, success, updatedUser };
}

// DELETE USER
export function useDeleteUser() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const deleteUser = async (id) => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            await api.delete(`${API_BASE_URL}/delete/${id}`);
            setSuccess(true);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Unexpected error");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { deleteUser, loading, error, success };
}
