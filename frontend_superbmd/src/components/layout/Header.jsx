// src/components/layout/Header.jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { SunIcon, MoonIcon, ArrowRightEndOnRectangleIcon } from '@heroicons/react/24/outline'; // Contoh ikon

const Header = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const isDarkMode = theme === 'dark';

    return (
        <header className={`flex items-center justify-between p-4 shadow-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            <div className="text-xl font-bold text-green-600">SUPER BMD</div>
            <div className="flex items-center space-x-4">
                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-200">
                    {isDarkMode ? <SunIcon className="h-6 w-6 text-yellow-400" /> : <MoonIcon className="h-6 w-6 text-gray-600" />}
                </button>
                {user && (
                    <span className="text-sm font-medium">Halo, {user.username} ({user.role})</span>
                )}
                <button onClick={logout} className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded transition duration-300">
                    <ArrowRightEndOnRectangleIcon className="h-5 w-5" />
                    <span>Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Header;