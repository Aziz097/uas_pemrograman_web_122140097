import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { showToast } from '../../components/common/Toast';
import { formatDate } from '../../utils/helpers'; // Helper untuk format tanggal

const AssetDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [asset, setAsset] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAsset = async () => {
            try {
                const response = await api.get(`/barang/${id}`);
                setAsset(response.data);
                showToast('Detail barang berhasil dimuat!', 'success');
            } catch (error) {
                showToast('Gagal memuat detail barang.', 'error');
                console.error('Error fetching asset details:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAsset();
    }, [id]);

    if (isLoading) {
        return <div className="p-6 text-center">Memuat detail barang...</div>;
    }

    if (!asset) {
        return <div className="p-6 text-center text-red-600">Data barang tidak ditemukan.</div>;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Detail Barang</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">{asset.nama_barang}</h2>
                    <p className="text-gray-700 mb-2">
                        <span className="font-semibold">Kode Barang:</span> {asset.kode_barang}
                    </p>
                    <p className="text-gray-700 mb-2">
                        <span className="font-semibold">Kondisi:</span>{' '}
                        <span className={`px-2 py-1 rounded-full text-white text-xs ${
                            asset.kondisi === 'Baik' ? 'bg-green-500' :
                            asset.kondisi === 'Rusak Ringan' ? 'bg-yellow-500' :
                            'bg-red-500'
                        }`}>
                            {asset.kondisi}
                        </span>
                    </p>
                    <p className="text-gray-700 mb-2">
                        <span className="font-semibold">Lokasi:</span> {asset.lokasi?.nama_lokasi || 'N/A'} ({asset.lokasi?.kode_lokasi || 'N/A'})
                    </p>
                    <p className="text-gray-700 mb-2">
                        <span className="font-semibold">Alamat Lokasi:</span> {asset.lokasi?.alamat_lokasi || 'N/A'}
                    </p>
                    <p className="text-gray-700 mb-2">
                        <span className="font-semibold">Penanggung Jawab:</span> {asset.penanggung_jawab || 'N/A'}
                    </p>
                    <p className="text-gray-700 mb-2">
                        <span className="font-semibold">Tanggal Masuk:</span> {formatDate(asset.tanggal_masuk)}
                    </p>
                    <p className="text-gray-700 mb-2">
                        <span className="font-semibold">Tanggal Pembaruan:</span> {asset.tanggal_pembaruan ? formatDate(asset.tanggal_pembaruan) : 'Belum ada'}
                    </p>
                </div>
                {asset.gambar_aset && (
                    <div className="flex justify-center items-center">
                        <img
                            src={asset.gambar_aset}
                            alt={asset.nama_barang}
                            className="max-w-full h-auto rounded-lg shadow-md"
                            onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/300x200?text=No+Image" }}
                        />
                    </div>
                )}
            </div>

            <div className="flex justify-end mt-8 space-x-4">
                <button
                    onClick={() => navigate('/assets')}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                    Kembali
                </button>
                <button
                    onClick={() => navigate(`/assets/edit/${asset.id_barang}`)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                    Edit Barang
                </button>
                 <button
                    onClick={() => navigate(`/assets/qr/${asset.id_barang}`)}
                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                    Cetak QR Code
                </button>
            </div>
        </div>
    );
};

export default AssetDetailsPage;