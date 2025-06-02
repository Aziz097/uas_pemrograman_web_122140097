// src/pages/DashboardPage.jsx
import React from 'react';
import { showToast } from '../components/common/Toast';
import StatCard from '../components/dashboard/StatCard';
import AssetConditionChart from '../components/dashboard/AssetConditionChart';
import LocationDistributionChart from '../components/dashboard/LocationDistributionChart';
import { CubeIcon, MapPinIcon, CheckCircleIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { useDashboardData } from '../hooks/useDashboard';

const DashboardPage = () => {
    const { dashboardData, loading: isLoading, error: dashboardError } = useDashboardData();

    React.useEffect(() => {
        if (dashboardError) {
            showToast('Gagal memuat data dashboard.', 'error');
            console.error('Error fetching dashboard data:', dashboardError);
        } else if (!isLoading && dashboardData?.total_assets > 0) {
            showToast('Data Dashboard berhasil dimuat!', 'success');
        }
    }, [dashboardError, isLoading, dashboardData]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 w-full">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-green-200 rounded-full mb-4"></div>
                    <div className="text-green-600 font-medium">Memuat data dashboard...</div>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="p-8 text-center text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl shadow-inner">
                <div className="text-xl font-semibold mb-2">Terjadi kesalahan memuat data dashboard</div>
                <p className="text-red-500 dark:text-red-400">Silakan coba muat ulang halaman</p>
            </div>
        );
    }

    const assetsBaik = dashboardData.assets_by_condition.find(item => item.name === 'Baik')?.value || 0;

    return (
        <div className="space-y-6 max-w-full overflow-hidden px-1 sm:px-0">
            {/* Dashboard Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-2">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">Ringkasan data dan statistik SUPER BMD</p>
                </div>
                <div className="self-start sm:self-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400">
                        <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                        Data Terbaru
                    </span>
                </div>
            </div>

            {/* Stat Cards - Responsive grid for all screen sizes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                <StatCard
                    title="Total Barang"
                    value={dashboardData.total_assets}
                    icon={CubeIcon}
                    bgColor="bg-gradient-to-br from-green-500 to-emerald-600"
                    textColor="text-white"
                />
                <StatCard
                    title="Total Lokasi"
                    value={dashboardData.total_locations}
                    icon={MapPinIcon}
                    bgColor="bg-gradient-to-br from-amber-400 to-amber-600"
                    textColor="text-white"
                />
                <StatCard
                    title="Aset Baik"
                    value={assetsBaik}
                    icon={CheckCircleIcon}
                    bgColor="bg-gradient-to-br from-sky-400 to-blue-600"
                    textColor="text-white"
                />
            </div>

            {/* Charts - Stack on mobile, side by side on larger screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 transition-all duration-300 hover:shadow-md overflow-hidden">
                    <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-gray-700 dark:text-gray-200">Distribusi Aset per Lokasi</h2>
                    <div className="h-60 sm:h-72 md:h-80 w-full max-w-full overflow-auto">
                        <LocationDistributionChart data={dashboardData.assets_by_location} />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 transition-all duration-300 hover:shadow-md overflow-hidden">
                    <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-gray-700 dark:text-gray-200">Kondisi Aset</h2>
                    <div className="h-60 sm:h-72 md:h-80 w-full max-w-full overflow-auto">
                        <AssetConditionChart data={dashboardData.assets_by_condition} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;