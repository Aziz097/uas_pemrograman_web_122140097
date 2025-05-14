import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Halaman tidak ditemukan</p>
      <Link
        to="/"
        className="px-6 py-3 rounded-lg font-medium bg-white text-purple-700 hover:bg-gray-100 transition"
      >
        Kembali ke Login
      </Link>
    </div>
  );
}
