import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';

// Import all pages
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AssetListPage from './pages/Assets/AssetListPage';
import AssetFormPage from './pages/Assets/AssetFormPage';
import AssetDetailsPage from './pages/Assets/AssetDetailsPage';
import AssetQrPrintPage from './pages/Assets/AssetQrPrintPage';
import LocationListPage from './pages/Locations/LocationListPage';
import LocationFormPage from './pages/Locations/LocationFormPage';
import UserListPage from './pages/Users/UserListPage';
import UserFormPage from './pages/Users/UserFormPage';
import ReportsPage from './pages/ReportsPage';
import NotFoundPage from './pages/NotFoundPage';

// PrivateRoute component to protect routes
const PrivateRoute = ({ children, roles = [] }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        // Tampilkan loading screen sementara
        return <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">Memuat aplikasi...</div>;
    }

    if (!isAuthenticated) {
        // Redirect ke halaman login jika belum terautentikasi
        return <Navigate to="/login" replace />;
    }

    if (roles.length > 0 && !roles.includes(user?.role)) {
        // Redirect ke dashboard atau halaman tidak punya akses
        return <Navigate to="/dashboard" replace />; // Bisa juga ke '/unauthorized'
    }

    return <Layout>{children}</Layout>;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />

                {/* Assets Routes */}
                <Route path="/assets" element={<PrivateRoute><AssetListPage /></PrivateRoute>} />
                <Route path="/assets/add" element={<PrivateRoute><AssetFormPage /></PrivateRoute>} />
                <Route path="/assets/edit/:id" element={<PrivateRoute><AssetFormPage /></PrivateRoute>} />
                <Route path="/assets/detail/:id" element={<PrivateRoute><AssetDetailsPage /></PrivateRoute>} />
                <Route path="/assets/qr/:id" element={<PrivateRoute><AssetQrPrintPage /></PrivateRoute>} />

                {/* Locations Routes */}
                <Route path="/locations" element={<PrivateRoute><LocationListPage /></PrivateRoute>} />
                <Route path="/locations/add" element={<PrivateRoute><LocationFormPage /></PrivateRoute>} />
                <Route path="/locations/edit/:id" element={<PrivateRoute><LocationFormPage /></PrivateRoute>} />
                {/* Note: Fitur Assign Penanggung Jawab di Lokasi akan menjadi bagian dari form user management jika penanggung_jawab adalah field di user. */}

                {/* User Management Routes (Admin Only) */}
                <Route path="/users" element={<PrivateRoute roles={['admin']}><UserListPage /></PrivateRoute>} />
                <Route path="/users/add" element={<PrivateRoute roles={['admin']}><UserFormPage /></PrivateRoute>} />
                <Route path="/users/edit/:id" element={<PrivateRoute roles={['admin']}><UserFormPage /></PrivateRoute>} />

                {/* Reports Routes */}
                <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />

                {/* Catch all for 404 */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
}

export default App;