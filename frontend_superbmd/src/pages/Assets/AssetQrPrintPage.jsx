// src/pages/Assets/AssetQrPrintPage.jsx
import React, { useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import { showToast } from '../../components/common/Toast';
import { useBarangById } from '../../hooks/useAssets';

// Komponen isi print pakai forwardRef
const QrCardToPrint = React.forwardRef(({ assetData }, ref) => (
    <div ref={ref} className="p-8 border border-gray-300 rounded-lg max-w-lg mx-auto bg-white print:shadow-none">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">QR Code Barang Milik Daerah</h2>
        <div className="flex justify-center mb-6">
            <QRCodeSVG
                value={JSON.stringify({
                    id: assetData?.id,
                    kode_barang: assetData?.kode_barang,
                    nama_barang: assetData?.nama_barang,
                })}
                size={256}
            />
        </div>
        <div className="text-center text-lg font-semibold text-gray-700">
            <p className="mb-1">Nama Barang: {assetData?.nama_barang || '-'}</p>
            <p className="mb-1">Kode Barang: {assetData?.kode_barang || '-'}</p>
            <p className="mb-1">Kondisi: {assetData?.kondisi || '-'}</p>
            <p>Lokasi: {assetData?.lokasi?.nama_lokasi || assetData?.nama_lokasi || 'N/A'}</p>
        </div>
    </div>
));

const AssetQrPrintPage = () => {
    const { id } = useParams();
    const printRef = useRef(null);

    // Data asset
    const { barang: assetData, loading: isLoading, error: fetchError } = useBarangById(id);

    useEffect(() => {
        if (fetchError) {
            showToast('Gagal memuat data aset untuk QR.', 'error');
        } else if (!isLoading && assetData) {
            showToast('Data Aset untuk QR berhasil dimuat!', 'success');
        }
    }, [fetchError, isLoading, assetData]);

    // ===> Pakai contentRef, BUKAN content
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `QR_Code_${assetData?.kode_barang || 'Asset'}`,
    });

    if (isLoading) {
        return <div className="p-6 text-center">Memuat data QR Code...</div>;
    }
    if (!assetData) {
        return <div className="p-6 text-center text-red-600">Data aset tidak ditemukan.</div>;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Cetak QR Code</h1>
            {/* Komponen yang di-print HARUS hasil forwardRef */}
            <QrCardToPrint ref={printRef} assetData={assetData} />
            <div className="flex justify-center mt-6">
                <button
                    onClick={handlePrint}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300 print:hidden"
                    disabled={isLoading}
                >
                    Cetak QR Code
                </button>
            </div>
        </div>
    );
};

export default AssetQrPrintPage;
