// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { showToast } from '../components/common/Toast';
import StatCard from '../components/dashboard/StatCard';
import AssetConditionChart from '../components/dashboard/AssetConditionChart';
import LocationDistributionChart from '../components/dashboard/LocationDistributionChart';
import { CubeIcon, MapPinIcon, CheckCircleIcon } from '@heroicons/react/24/outline'; // Contoh ikon

const DashboardPage = () => {
    const [dashboardData, setDashboardData] = useState({
        total_assets: 0,
        total_locations: 0,
        assets_by_condition: [],
        assets_by_location: [],
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/dashboard');
                setDashboardData(response.data);
                showToast('Data Dashboard berhasil dimuat!', 'success');
            } catch (error) {
                showToast('Gagal memuat data dashboard.', 'error');
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (isLoading) {
        return <div className="p-6 text-center dark:text-gray-300">Memuat data dashboard...</div>;
    }

    const assetsBaik = dashboardData.assets_by_condition.find(item => item.name === 'Baik')?.value || 0;

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Total Barang"
                    value={dashboardData.total_assets}
                    icon={CubeIcon}
                    bgColor="bg-gradient-to-r from-green-500 to-green-600"
                    textColor="text-white"
                />
                <StatCard
                    title="Total Lokasi"
                    value={dashboardData.total_locations}
                    icon={MapPinIcon}
                    bgColor="bg-gradient-to-r from-yellow-500 to-yellow-600"
                    textColor="text-white"
                />
                <StatCard
                    title="Aset Baik"
                    value={assetsBaik}
                    icon={CheckCircleIcon}
                    bgColor="bg-gradient-to-r from-teal-500 to-teal-600"
                    textColor="text-white"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <LocationDistributionChart data={dashboardData.assets_by_location} />
                <AssetConditionChart data={dashboardData.assets_by_condition} />
            </div>
        </div>
    );
};

export default DashboardPage;