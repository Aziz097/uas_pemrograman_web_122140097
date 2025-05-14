import { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function Dashboard() {
  // kategori kondisi
  const KONDISI_CATEGORIES = [
    { value: "1", label: "Baru" },
    { value: "2", label: "Baik" },
    { value: "3", label: "Rusak Ringan" },
    { value: "4", label: "Perlu Perbaikan" },
    { value: "5", label: "Rusak Berat" },
  ];

  const [barangs, setBarangs] = useState([]);
  const [lokasis, setLokasis] = useState([]);

  // controls search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKondisi, setFilterKondisi] = useState("");
  const [filterLokasi, setFilterLokasi] = useState("");

  useEffect(() => {
    api.get("/barang").then(res => setBarangs(res.data));
    api.get("/lokasi").then(res => setLokasis(res.data));
  }, []);

  // jumlah total
  const totalBarang = barangs.length;
  const totalLokasi = lokasis.length;

  // hasil setelah search & filter
  const filteredBarangs = useMemo(() => {
    return barangs
      .filter(b => b.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(b => (filterKondisi ? b.kondisi === filterKondisi : true))
      .filter(b => (filterLokasi ? String(b.id_lokasi) === filterLokasi : true));
  }, [barangs, searchTerm, filterKondisi, filterLokasi]);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />

        <main className="p-6 space-y-6">
          {/* STATISTIK */}
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <h2 className="text-xl font-medium">Total Barang</h2>
              <p className="text-4xl font-bold">{totalBarang}</p>
            </div>
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <h2 className="text-xl font-medium">Total Lokasi</h2>
              <p className="text-4xl font-bold">{totalLokasi}</p>
            </div>
          </div>

          {/* SEARCH & FILTER */}
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <input
              type="text"
              placeholder="Cari nama barang..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none"
            />
            <select
              value={filterKondisi}
              onChange={e => setFilterKondisi(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none"
            >
              <option value="">Filter Kondisi</option>
              {KONDISI_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <select
              value={filterLokasi}
              onChange={e => setFilterLokasi(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none"
            >
              <option value="">Filter Lokasi</option>
              {lokasis.map(l => (
                <option key={l.id_lokasi} value={l.id_lokasi}>
                  {l.nama_lokasi}
                </option>
              ))}
            </select>
          </div>

          {/* TABEL BARANG */}
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Nama</th>
                  <th className="px-4 py-2 text-left">Kode</th>
                  <th className="px-4 py-2 text-left">Kondisi</th>
                  <th className="px-4 py-2 text-left">Lokasi</th>
                </tr>
              </thead>
              <tbody>
                {filteredBarangs.map((b, i) => {
                  const kondisiLabel =
                    KONDISI_CATEGORIES.find(cat => cat.value === b.kondisi)?.label ||
                    b.kondisi;
                  const lokasiName =
                    lokasis.find(l => l.id_lokasi === b.id_lokasi)?.nama_lokasi ||
                    "-";
                  return (
                    <tr key={b.id_barang} className="even:bg-gray-50">
                      <td className="px-4 py-2">{i + 1}</td>
                      <td className="px-4 py-2">{b.nama_barang}</td>
                      <td className="px-4 py-2">{b.kode_barang}</td>
                      <td className="px-4 py-2">{kondisiLabel}</td>
                      <td className="px-4 py-2">{lokasiName}</td>
                    </tr>
                  );
                })}
                {filteredBarangs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      Tidak ada data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
