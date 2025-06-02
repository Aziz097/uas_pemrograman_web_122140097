// src/components/layout/Header.jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { SunIcon, MoonIcon, ArrowRightEndOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Header = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const isDarkMode = theme === 'dark';

    return (
        <header className={`flex items-center justify-between px-6 py-4 shadow-lg ${isDarkMode ? 'bg-gray-800 text-white border-b border-gray-700' : 'bg-white text-gray-800 border-b border-gray-100'}`}>
            <div className="hidden"></div>
            <div className="flex items-center space-x-5 ml-auto">
                {user && (
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={logout} 
                            className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                        >
                            <ArrowRightEndOnRectangleIcon className="h-5 w-5" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                        <div className="hidden md:flex items-center space-x-2">
                            <UserCircleIcon className="h-6 w-6 text-green-500" />
                            <div>
                                <span className="text-sm font-medium block">Halo, {user.username}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 block">{user.role}</span>
                            </div>
                        </div>
                    </div>
                )}
                <button 
                    onClick={toggleTheme} 
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    aria-label="Toggle dark mode"
                >
                    {isDarkMode ? 
                        <SunIcon className="h-5 w-5 text-yellow-300" /> : 
                        <MoonIcon className="h-5 w-5 text-gray-600" />}
                </button>
            </div>
        </header>
    );
};

export default Header;