// src/pages/Assets/AssetQrPrintPage.jsx
import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react'; 
import { useReactToPrint } from 'react-to-print';
import api from '../../services/api';
import { showToast } from '../../components/common/Toast';

const AssetQrPrintPage = () => {
    const { id } = useParams();
    const componentRef = useRef();
    const [assetData, setAssetData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAssetData = async () => {
            try {
                const response = await api.get(`/barang/${id}`);
                setAssetData(response.data);
                showToast('Data Aset untuk QR berhasil dimuat!', 'success');
            } catch (error) {
                showToast('Gagal memuat data aset untuk QR.', 'error');
                console.error('Error fetching asset for QR:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAssetData();
    }, [id]);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `QR_Code_${assetData?.kode_barang || 'Asset'}`,
    });

    if (isLoading) {
        return <div className="p-6 text-center">Memuat data QR Code...</div>;
    }

    if (!assetData) {
        return <div className="p-6 text-center text-red-600">Data aset tidak ditemukan.</div>;
    }

    // Data yang akan di-encode dalam QR Code (bisa URL ke detail aset, atau JSON string)
    const qrValue = JSON.stringify({
        id_barang: assetData.id_barang,
        kode_barang: assetData.kode_barang,
        nama_barang: assetData.nama_barang,
        // Tambahkan data lain yang relevan jika ingin di-encode
    });

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Cetak QR Code</h1>

            <div ref={componentRef} className="p-8 border border-gray-300 rounded-lg max-w-lg mx-auto bg-white print:shadow-none">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">QR Code Barang Milik Daerah</h2>
                <div className="flex justify-center mb-6">
                    {/* Menggunakan QRCodeSVG dengan properti yang direkomendasikan */}
                    <QRCodeSVG
                        value={qrValue}
                        size={256}
                        level="H"
                        includeMargin={true}
                        bgColor="#ffffff" // Default, bisa dihilangkan jika tidak perlu diubah
                        fgColor="#000000" // Default, bisa dihilangkan jika tidak perlu diubah
                    />
                </div>
                <div className="text-center text-lg font-semibold text-gray-700">
                    <p className="mb-1">Nama Barang: {assetData.nama_barang}</p>
                    <p className="mb-1">Kode Barang: {assetData.kode_barang}</p>
                    <p className="mb-1">Kondisi: {assetData.kondisi}</p>
                    <p>Lokasi: {assetData.lokasi?.nama_lokasi || 'N/A'}</p>
                </div>
            </div>

            <div className="flex justify-center mt-6">
                <button
                    onClick={handlePrint}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300 print:hidden"
                >
                    Cetak QR Code
                </button>
            </div>
        </div>
    );
};

export default AssetQrPrintPage;