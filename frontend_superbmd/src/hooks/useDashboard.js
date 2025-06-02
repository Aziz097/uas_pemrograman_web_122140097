// src/hooks/useDashboard.js
import { useState, useEffect, useCallback } from "react";
import api from '../services/api';

/**
 * Hook kustom untuk mengambil data dashboard.
 * Mengelola state loading, error, dan data dashboard.
 */
export function useDashboardData() {
    const [dashboardData, setDashboardData] = useState({
        total_assets: 0,
        total_locations: 0,
        assets_by_condition: [],
        assets_by_location: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/dashboard'); // Sesuai dengan rute /api/dashboard
            setDashboardData(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
            setError(err);
            setLoading(false);
        }
    }, []); // Tidak ada dependencies karena ini hanya fetch data statis dashboard

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return { dashboardData, loading, error, refetchDashboardData: fetchDashboardData };
}