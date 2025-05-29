// src/pages/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { showToast } from '../components/common/Toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx'; // Untuk export Excel
import jsPDF from 'jspdf'; // Untuk export PDF
import 'jspdf-autotable'; // Untuk tabel di PDF

const ReportsPage = () => {
    const [reportType, setReportType] = useState('assets_by_location');
    const [filters, setFilters] = useState({
        start_date: '',
        end_date: '',
        location_id: '',
        condition: '',
    });
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [locations, setLocations] = useState([]); // Untuk dropdown lokasi

    // Dummy data for locations (in a real app, fetch this from API)
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await api.get('/lokasi');
                setLocations(response.data.items);
            } catch (error) {
                console.error('Error fetching locations for reports:', error);
            }
        };
        fetchLocations();
    }, []);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleGenerateReport = async () => {
        setIsLoading(true);
        try {
            let endpoint = '';
            let params = {
                start_date: filters.start_date,
                end_date: filters.end_date,
            };

            if (reportType === 'assets_by_location') {
                endpoint = '/report/assets-by-location';
                // Backend akan mengelompokkan sendiri
            } else if (reportType === 'assets_by_condition') {
                endpoint = '/report/assets-by-condition';
                // Backend akan mengelompokkan sendiri
            } else if (reportType === 'assets_in_out') {
                endpoint = '/report/assets-in-out';
                // Backend akan handle berdasarkan tanggal masuk/pembaruan
            }

            if (filters.location_id) params.location_id = filters.location_id;
            if (filters.condition) params.condition = filters.condition;

            const response = await api.get(endpoint, { params });
            setReportData(response.data);
            showToast('Laporan berhasil dibuat!', 'success');
        } catch (error) {
            showToast('Gagal membuat laporan.', 'error');
            console.error('Error generating report:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const exportToExcel = () => {
        if (reportData.length === 0) {
            showToast('Tidak ada data untuk diekspor.', 'warning');
            return;
        }

        const ws = XLSX.utils.json_to_sheet(reportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, `${reportType}_report.xlsx`);
        showToast('Laporan berhasil diekspor ke Excel!', 'success');
    };

    const exportToPdf = () => {
        if (reportData.length === 0) {
            showToast('Tidak ada data untuk diekspor.', 'warning');
            return;
        }

        const doc = new jsPDF();
        const columns = Object.keys(reportData[0]).map(key => ({ header: key.replace(/_/g, ' ').toUpperCase(), dataKey: key }));
        const rows = reportData.map(item => Object.values(item));

        doc.text(`Laporan ${reportType.replace(/_/g, ' ').toUpperCase()}`, 14, 15);
        doc.autoTable({
            startY: 20,
            head: [columns.map(col => col.header)],
            body: rows,
            columns: columns.map(col => ({ header: col.header, dataKey: col.dataKey })),
            theme: 'striped',
            headStyles: { fillColor: [52, 189, 137] }, // Warna hijau yang mirip dengan tema
        });
        doc.save(`${reportType}_report.pdf`);
        showToast('Laporan berhasil diekspor ke PDF!', 'success');
    };

    const renderReportTable = () => {
        if (reportData.length === 0) {
            return <p className="text-center text-gray-600 mt-4">Tidak ada data laporan untuk ditampilkan.</p>;
        }

        // Contoh sederhana, perlu disesuaikan dengan struktur data laporan sebenarnya
        const columns = Object.keys(reportData[0]).map(key => ({
            header: key.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            accessor: key
        }));

        return (
            <div className="overflow-x-auto mt-4">
                <Table data={reportData} columns={columns} />
            </div>
        );
    };

    const renderReportChart = () => {
        if (reportData.length === 0) return null;

        let chartData = [];
        let dataKey = 'value'; // Default
        let nameKey = 'name'; // Default

        if (reportType === 'assets_by_location') {
            chartData = reportData; // Asumsi format [{ location_name: 'A', total_assets: 10 }, ...]
            dataKey = 'total_assets';
            nameKey = 'location_name';
        } else if (reportType === 'assets_by_condition') {
            chartData = reportData; // Asumsi format [{ condition: 'Baik', total_assets: 10 }, ...]
            dataKey = 'total_assets';
            nameKey = 'condition';
        } else {
            return null; // Aset masuk/keluar mungkin lebih cocok dengan line chart atau data tabular
        }

        return (
            <ResponsiveContainer width="100%" height={300} className="mt-8">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={nameKey} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey={dataKey} fill="#8884d8" name="Jumlah Aset" />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    const conditions = ['Baik', 'Rusak Ringan', 'Rusak Berat'];

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Laporan Aset</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label htmlFor="reportType" className="block text-gray-700 text-sm font-bold mb-2">Jenis Laporan:</label>
                    <select
                        id="reportType"
                        name="reportType"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option value="assets_by_location">Aset per Lokasi</option>
                        <option value="assets_by_condition">Aset per Kondisi</option>
                        <option value="assets_in_out">Aset Masuk/Keluar</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="location_id" className="block text-gray-700 text-sm font-bold mb-2">Filter Lokasi:</label>
                    <select
                        id="location_id"
                        name="location_id"
                        value={filters.location_id}
                        onChange={handleFilterChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        disabled={reportType === 'assets_by_location'}
                    >
                        <option value="">Semua Lokasi</option>
                        {locations.map(loc => (
                            <option key={loc.id_lokasi} value={loc.id_lokasi}>{loc.nama_lokasi}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="condition" className="block text-gray-700 text-sm font-bold mb-2">Filter Kondisi:</label>
                    <select
                        id="condition"
                        name="condition"
                        value={filters.condition}
                        onChange={handleFilterChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        disabled={reportType === 'assets_by_condition'}
                    >
                        <option value="">Semua Kondisi</option>
                        {conditions.map(cond => (
                            <option key={cond} value={cond}>{cond}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="start_date" className="block text-gray-700 text-sm font-bold mb-2">Dari Tanggal:</label>
                    <input
                        type="date"
                        id="start_date"
                        name="start_date"
                        value={filters.start_date}
                        onChange={handleFilterChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div>
                    <label htmlFor="end_date" className="block text-gray-700 text-sm font-bold mb-2">Sampai Tanggal:</label>
                    <input
                        type="date"
                        id="end_date"
                        name="end_date"
                        value={filters.end_date}
                        onChange={handleFilterChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-4 mb-6">
                <button
                    onClick={handleGenerateReport}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                    disabled={isLoading}
                >
                    {isLoading ? 'Membuat Laporan...' : 'Buat Laporan'}
                </button>
                <button
                    onClick={exportToExcel}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                    disabled={reportData.length === 0}
                >
                    Export Excel
                </button>
                <button
                    onClick={exportToPdf}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                    disabled={reportData.length === 0}
                >
                    Export PDF
                </button>
            </div>

            {reportData.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Hasil Laporan</h2>
                    {renderReportTable()}
                    {(reportType === 'assets_by_location' || reportType === 'assets_by_condition') && renderReportChart()}
                </div>
            )}
        </div>
    );
};

export default ReportsPage;