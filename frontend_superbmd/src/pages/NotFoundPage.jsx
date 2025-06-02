import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-green-600 dark:text-green-400">404</h1>
        <p className="text-2xl md:text-3xl font-light mb-4">Halaman Tidak Ditemukan</p>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Maaf, halaman yang Anda cari tidak ada.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition duration-300"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;