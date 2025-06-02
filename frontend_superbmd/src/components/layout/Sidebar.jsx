// src/components/layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { HomeIcon, CubeIcon, MapPinIcon, UsersIcon, DocumentTextIcon } from '@heroicons/react/24/outline'; // Contoh ikon

const Sidebar = () => {
    const location = useLocation();
    const { user } = useAuth();
    const isDarkMode = false; // Akan diambil dari ThemeContext

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
        { name: 'Barang', path: '/assets', icon: CubeIcon },
        { name: 'Lokasi', path: '/locations', icon: MapPinIcon },
        { name: 'Laporan', path: '/reports', icon: DocumentTextIcon },
    ];

    return (
        <aside className={`w-64 flex-shrink-0 shadow-lg ${isDarkMode ? 'bg-gray-800 border-r border-gray-700' : 'bg-green-700 text-white'}`}>
            <div className="p-6 text-2xl font-bold text-center border-b border-gray-700 mb-6">
                SUPER BMD
            </div>
            <nav>
                <ul>
                    {navLinks.map((link) => (
                        <li key={link.name}>
                            <Link
                                to={link.path}
                                className={`flex items-center px-6 py-3 transition duration-200 ${
                                    location.pathname.startsWith(link.path) && link.path !== '/' // Handle root path properly
                                        ? 'bg-green-800 text-white'
                                        : 'hover:bg-green-600 text-white'
                                }`}
                            >
                                <link.icon className="h-6 w-6 mr-3" />
                                {link.name}
                            </Link>
                        </li>
                    ))}
                    {user?.role === 'admin' && (
                        <li>
                            <Link
                                to="/users"
                                className={`flex items-center px-6 py-3 transition duration-200 ${
                                    location.pathname.startsWith('/users')
                                        ? 'bg-green-800 text-white'
                                        : 'hover:bg-green-600 text-white'
                                }`}
                            >
                                <UsersIcon className="h-6 w-6 mr-3" />
                                Manajemen Pengguna
                            </Link>
                        </li>
                    )}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;