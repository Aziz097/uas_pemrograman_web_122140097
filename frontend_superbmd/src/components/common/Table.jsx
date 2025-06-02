// src/components/common/Table.jsx
import React, { useState } from 'react';
import { ArrowUpIcon, ArrowDownIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';

const Table = ({ data, columns }) => {
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

    const handleSort = (column) => {
        if (column.sortable) {
            if (sortColumn === column.accessor) {
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
            } else {
                setSortColumn(column.accessor);
                setSortDirection('asc');
            }
        }
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortColumn) return 0;

        const valA = a[sortColumn] || '';
        const valB = b[sortColumn] || '';

        if (typeof valA === 'string' && typeof valB === 'string') {
            return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
            // For numbers or other types
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        }
    });

    const getSortIcon = (accessor) => {
        if (sortColumn === accessor) {
            return sortDirection === 'asc' ? <ArrowUpIcon className="h-4 w-4 ml-1" /> : <ArrowDownIcon className="h-4 w-4 ml-1" />;
        }
        return <ArrowsUpDownIcon className="h-4 w-4 ml-1 text-gray-400" />;
    };

    return (
        <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                scope="col"
                                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.sortable ? 'cursor-pointer select-none' : ''}`}
                                onClick={() => handleSort(col)}
                            >
                                <div className="flex items-center">
                                    {col.header}
                                    {col.sortable && getSortIcon(col.accessor)}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sortedData.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                Tidak ada data
                            </td>
                        </tr>
                    ) : (
                        sortedData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {col.render ? col.render(row) : (
                                            col.accessor.includes('.') // Handle nested accessors like 'lokasi.nama_lokasi'
                                                ? col.accessor.split('.').reduce((o, i) => (o ? o[i] : null), row)
                                                : row[col.accessor]
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;