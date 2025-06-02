import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const AssetFilter = ({ filters, onFilterChange, locations, penanggungJawabList }) => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    const conditions = ['Baik', 'Rusak Ringan', 'Rusak Berat'];

    return (
        <div className={`mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-lg shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div>
                <label htmlFor="search" className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cari Nama/Kode:</label>
                <input
                    type="text"
                    id="search"
                    name="search"
                    value={filters.search}
                    onChange={onFilterChange}
                    placeholder="Cari barang..."
                    className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'text-gray-700 border-gray-300'}`}
                />
            </div>
            <div>
                <label htmlFor="location_id" className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Filter Lokasi:</label>
                <select
                    id="location_id"
                    name="location_id"
                    value={filters.location_id}
                    onChange={onFilterChange}
                    className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'text-gray-700 border-gray-300'}`}
                >
                    <option value="">Semua Lokasi</option>
                    {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.nama_lokasi}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="condition" className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Filter Kondisi:</label>
                <select
                    id="condition"
                    name="condition"
                    value={filters.condition}
                    onChange={onFilterChange}
                    className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'text-gray-700 border-gray-300'}`}
                >
                    <option value="">Semua Kondisi</option>
                    {conditions.map(cond => (
                        <option key={cond} value={cond}>{cond}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="penanggung_jawab" className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Filter Penanggung Jawab:</label>
                <select
                    id="penanggung_jawab"
                    name="penanggung_jawab"
                    value={filters.penanggung_jawab}
                    onChange={onFilterChange}
                    className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'text-gray-700 border-gray-300'}`}
                >
                    <option value="">Semua Penanggung Jawab</option>
                    {penanggungJawabList.map(pj => (
                        <option key={pj} value={pj}>{pj}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="start_date" className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Dari Tanggal Masuk:</label>
                <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={filters.start_date}
                    onChange={onFilterChange}
                    className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'text-gray-700 border-gray-300'}`}
                />
            </div>
            <div>
                <label htmlFor="end_date" className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sampai Tanggal Masuk:</label>
                <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={filters.end_date}
                    onChange={onFilterChange}
                    className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'text-gray-700 border-gray-300'}`}
                />
            </div>
        </div>
    );
};

export default AssetFilter;