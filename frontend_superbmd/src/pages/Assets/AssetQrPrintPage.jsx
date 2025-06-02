// src/pages/Assets/AssetQrPrintPage.jsx
import React, { useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Cetak QR Code</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Cetak QR Code untuk barang</p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/assets')}
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-all duration-200 self-start md:self-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Kembali ke Daftar
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
                {/* Komponen yang di-print HARUS hasil forwardRef */}
                <QrCardToPrint ref={printRef} assetData={assetData} />
                <div className="flex justify-center mt-6 space-x-4">
                    <button
                        onClick={handlePrint}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-2.5 px-5 rounded-lg inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 print:hidden"
                        disabled={isLoading}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                        </svg>
                        Cetak QR Code
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => navigate(`/assets/detail/${id}`)}
                        className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-2.5 px-5 rounded-lg inline-flex items-center justify-center gap-2 transition-all duration-200 print:hidden"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        Detail Barang
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssetQrPrintPage;
