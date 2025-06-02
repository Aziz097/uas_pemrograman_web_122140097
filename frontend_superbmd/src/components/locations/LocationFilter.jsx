import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const LocationFilter = ({ filters, onFilterChange }) => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    return (
        <div className={`mb-6 p-4 rounded-lg shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <label htmlFor="search" className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cari Nama/Kode Lokasi:</label>
            <input
                type="text"
                id="search"
                name="search"
                value={filters.search}
                onChange={onFilterChange}
                placeholder="Cari lokasi..."
                className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'text-gray-700 border-gray-300'}`}
            />
        </div>
    );
};

export default LocationFilter;