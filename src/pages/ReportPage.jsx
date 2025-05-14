import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function ReportPage() {
  const [barangs, setBarangs] = useState([]);
  const [lokasis, setLokasis] = useState([]);

  useEffect(() => {
    api.get("/barang").then(res => setBarangs(res.data));
    api.get("/lokasi").then(res => setLokasis(res.data));
  }, []);

  // Generate CSV and trigger download
  const downloadCSV = () => {
    const headers = ["ID Barang", "Nama", "Kode", "Kondisi", "Lokasi"];
    const rows = barangs.map(b => {
      const lokasi = lokasis.find(l => l.id_lokasi === b.id_lokasi)?.nama_lokasi || "";
      return [b.id_barang, b.nama_barang, b.kode_barang, b.kondisi, lokasi];
    });
    const csvContent =
      [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report_barang.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          <h1 className="text-3xl font-semibold mb-6">Reporting Barang & Lokasi</h1>
          <button
            onClick={downloadCSV}
            className="mb-6 px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition text-white"
          >
            Download Report CSV
          </button>
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  {["#", "Nama", "Kode", "Kondisi", "Lokasi"].map((h,i) => (
                    <th key={i} className="px-4 py-2 text-left text-sm font-medium text-gray-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {barangs.map((b,i) => {
                  const lokasi = lokasis.find(l => l.id_lokasi === b.id_lokasi)?.nama_lokasi || "";
                  return (
                    <tr key={b.id_barang} className="even:bg-gray-50">
                      <td className="px-4 py-2">{i + 1}</td>
                      <td className="px-4 py-2">{b.nama_barang}</td>
                      <td className="px-4 py-2">{b.kode_barang}</td>
                      <td className="px-4 py-2">{b.kondisi}</td>
                      <td className="px-4 py-2">{lokasi}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
