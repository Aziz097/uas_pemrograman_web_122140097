// src/pages/Assets/AssetDetailPage.jsx
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBarangById } from '../../hooks/useAssets';
import { formatDate } from '../../utils/helpers';
import Loading from '../../components/common/Loading';
import { 
  ArrowLeftIcon, 
  PencilSquareIcon, 
  ExclamationCircleIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  TagIcon,
  DocumentTextIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

const AssetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { barang: asset, loading, error } = useBarangById(id);

  if (loading) {
    return <Loading text="Memuat data barang..." size="medium" />;
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4">
        <div className="flex items-start">
          <ExclamationCircleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Terjadi kesalahan</h3>
            <div className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</div>
            <button
              className="mt-3 text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-500 dark:hover:text-red-200"
              onClick={() => navigate('/assets')}
            >
              Kembali ke daftar barang
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 my-4">
        <div className="flex">
          <ExclamationCircleIcon className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Barang tidak ditemukan</h3>
            <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
              Barang dengan ID {id} tidak tersedia atau telah dihapus.
            </div>
            <button
              className="mt-3 text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:text-yellow-500 dark:hover:text-yellow-200"
              onClick={() => navigate('/assets')}
            >
              Kembali ke daftar barang
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getConditionColor = (kondisi) => {
    switch (kondisi) {
      case 'Baik':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Rusak Ringan':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Rusak Berat':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Detail Barang
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Informasi lengkap mengenai barang
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/assets')}
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-all duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Kembali ke Daftar
          </button>
          <Link
            to={`/assets/edit/${id}`}
            className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-400 font-medium py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-all duration-200"
          >
            <PencilSquareIcon className="w-5 h-5" />
            Edit Barang
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{asset.nama_barang}</h2>
              <div className="flex items-center mt-1">
                <TagIcon className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-gray-500 dark:text-gray-400 text-sm">{asset.kode_barang}</span>
              </div>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConditionColor(asset.kondisi)}`}>
                {asset.kondisi}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Informasi Dasar</h3>
              <dl className="space-y-3">
                <div className="flex items-start">
                  <dt className="w-36 flex-shrink-0 flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Lokasi</span>
                  </dt>
                  <dd className="text-gray-900 dark:text-gray-100 font-medium">
                    {asset.lokasi?.nama_lokasi || 'Tidak ada data'}
                  </dd>
                </div>
                <div className="flex items-start">
                  <dt className="w-36 flex-shrink-0 flex items-center">
                    <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Penanggung Jawab</span>
                  </dt>
                  <dd className="text-gray-900 dark:text-gray-100 font-medium">
                    {asset.penanggung_jawab || 'Tidak ada data'}
                  </dd>
                </div>
                <div className="flex items-start">
                  <dt className="w-36 flex-shrink-0 flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Tanggal Masuk</span>
                  </dt>
                  <dd className="text-gray-900 dark:text-gray-100 font-medium">
                    {asset.tanggal_masuk ? formatDate(asset.tanggal_masuk) : 'Tidak ada data'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Informasi Tambahan</h3>
              <dl className="space-y-3">
                <div className="flex items-start">
                  <dt className="w-36 flex-shrink-0 flex items-center">
                    <CheckBadgeIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Status</span>
                  </dt>
                  <dd className="text-gray-900 dark:text-gray-100 font-medium">
                    Aktif
                  </dd>
                </div>
                <div className="flex items-start">
                  <dt className="w-36 flex-shrink-0 flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Deskripsi</span>
                  </dt>
                  <dd className="text-gray-900 dark:text-gray-100 font-medium">
                    {asset.deskripsi || 'Tidak ada deskripsi'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">Riwayat Barang</h3>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm italic">Riwayat belum tersedia</p>
          </div>
          <ul className="border border-dashed border-gray-200 dark:border-gray-700 rounded-lg h-36 opacity-50"></ul>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-end mt-6">
        <button
          type="button"
          onClick={() => navigate(`/assets/edit/${id}`)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2.5 px-5 rounded-lg inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <PencilSquareIcon className="w-5 h-5" />
          Edit Barang
        </button>
        <button
          type="button"
          onClick={() => navigate('/assets')}
          className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-2.5 px-5 rounded-lg inline-flex items-center justify-center gap-2 transition-all duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Kembali
        </button>
      </div>
    </div>
  );
};

export default AssetDetailPage;
