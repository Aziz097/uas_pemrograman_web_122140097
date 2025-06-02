// src/hooks/useReports.js
import { useState, useEffect, useCallback } from "react";
import api from '../services/api';

/**
 * Hook kustom untuk mengambil data laporan.
 * Mengelola state loading, error, dan data laporan berdasarkan jenis dan filter.
 */
export function useReports() {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [locations, setLocations] = useState([]); // Untuk dropdown lokasi di filter

    // Fetch daftar lokasi saat hook dimuat
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await api.get('/lokasi'); // Asumsi rute ini sudah benar
                setLocations(response.data.items);
            } catch (err) {
                console.error('Error fetching locations for reports:', err);
                // setError(err); // Mungkin tidak perlu set error di sini jika ini hanya untuk filter
            }
        };
        fetchLocations();
    }, []);

    const generateReport = useCallback(async (reportType, filters) => {
        setLoading(true);
        setError(null);
        setReportData([]); // Clear previous data

        try {
            let endpoint = '';
            let params = { ...filters }; // Clone filters to modify

            if (reportType === 'assets_by_location') {
                endpoint = '/report/assets-by-location';
                // Filter location_id tidak relevan di sini jika backend memang mengelompokkan
                delete params.location_id;
                delete params.condition;
            } else if (reportType === 'assets_by_condition') {
                endpoint = '/report/assets-by-condition';
                // Filter condition tidak relevan di sini jika backend memang mengelompokkan
                delete params.location_id;
                delete params.condition;
            } else if (reportType === 'assets_in_out') {
                endpoint = '/report/assets-in-out';
                // Filter location_id dan condition bisa relevan jika backend mendukung
            } else {
                throw new Error('Jenis laporan tidak valid.');
            }

            // Hapus filter kosong agar tidak dikirim ke backend
            Object.keys(params).forEach(key => {
                if (!params[key]) {
                    delete params[key];
                }
            });

            const response = await api.get(endpoint, { params });
            setReportData(response.data);
            setLoading(false);
            return true; // Indicate success
        } catch (err) {
            console.error('Error generating report:', err);
            setError(err.response?.data?.message || err.message || 'Gagal membuat laporan.');
            setLoading(false);
            return false; // Indicate failure
        }
    }, []);

    return { reportData, loading, error, locations, generateReport };
}