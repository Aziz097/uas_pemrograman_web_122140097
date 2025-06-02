// src/components/layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { HomeIcon, CubeIcon, MapPinIcon, UsersIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const Sidebar = () => {
    const location = useLocation();
    const { user } = useAuth();
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
        { name: 'Barang', path: '/assets', icon: CubeIcon },
        { name: 'Lokasi', path: '/locations', icon: MapPinIcon },
        { name: 'Laporan', path: '/reports', icon: DocumentTextIcon },
    ];

    return (
        <aside className={`w-64 flex-shrink-0 shadow-xl z-10 ${isDarkMode ? 'bg-gray-900 border-r border-gray-700' : 'bg-white border-r border-gray-200'} flex flex-col h-screen`}>
            <div className={`p-4 text-2xl font-bold text-center border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} mb-6 flex justify-center items-center space-x-2`}>
                <img src="/bmd-logo.png" alt="SUPER BMD Logo" className="h-10" />
                <span className={`font-extrabold ${isDarkMode ? 'text-green-500' : 'text-green-600'}`}>SUPER BMD</span>
            </div>
            <nav className="px-2 flex-grow overflow-y-auto">
                <ul className="space-y-1 pb-20">
                    {navLinks.map((link) => {
                        const isActive = location.pathname.startsWith(link.path) && link.path !== '/';
                        return (
                            <li key={link.name}>
                                <Link
                                    to={link.path}
                                    className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${isActive 
                                        ? isDarkMode 
                                            ? 'bg-green-600 text-white shadow-md' 
                                            : 'bg-white text-green-600 shadow-md border border-green-500' 
                                        : isDarkMode 
                                            ? 'text-gray-200 hover:bg-white hover:text-green-600' 
                                            : 'text-gray-700 hover:bg-green-600 hover:text-white'}`}
                                >
                                    <link.icon className={`h-5 w-5 mr-3 ${isActive 
                                        ? isDarkMode 
                                            ? 'text-white' 
                                            : 'text-green-600' 
                                        : isDarkMode 
                                            ? 'text-gray-300 group-hover:text-green-600' 
                                            : 'text-gray-600 group-hover:text-white'}`} />
                                    <span className="font-medium">{link.name}</span>
                                    {isActive && (
                                        <span className={`ml-auto h-2 w-2 rounded-full ${isDarkMode ? 'bg-white' : 'bg-green-600'}`}></span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                    {user?.role === 'admin' && (
                        <li>
                            <Link
                                to="/users"
                                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${location.pathname.startsWith('/users') 
                                    ? isDarkMode 
                                        ? 'bg-green-600 text-white shadow-md' 
                                        : 'bg-white text-green-600 shadow-md border border-green-500'
                                    : isDarkMode 
                                        ? 'text-gray-200 hover:bg-white hover:text-green-600' 
                                        : 'text-gray-700 hover:bg-green-600 hover:text-white'}`}
                            >
                                <UsersIcon className={`h-5 w-5 mr-3 ${location.pathname.startsWith('/users') 
                                    ? isDarkMode 
                                        ? 'text-white' 
                                        : 'text-green-600' 
                                    : isDarkMode 
                                        ? 'text-gray-300 group-hover:text-green-600' 
                                        : 'text-gray-600 group-hover:text-white'}`} />
                                <span className="font-medium">Manajemen Pengguna</span>
                                {location.pathname.startsWith('/users') && (
                                    <span className={`ml-auto h-2 w-2 rounded-full ${isDarkMode ? 'bg-white' : 'bg-green-600'}`}></span>
                                )}
                            </Link>
                        </li>
                    )}
                </ul>
            </nav>
            <div className={`p-4 text-center text-xs ${isDarkMode ? 'text-gray-400 border-t border-gray-800' : 'text-gray-600 border-t border-gray-300'} mt-auto`}>
                © 2025 SUPER BMD
            </div>
        </aside>
    );
};

export default Sidebar;