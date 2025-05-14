import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function Dashboard() {
  const [countBarang, setCountBarang] = useState(0);
  const [countLokasi, setCountLokasi] = useState(0);

  useEffect(() => {
    api.get("/barang").then(res => setCountBarang(res.data.length));
    api.get("/lokasi").then(res => setCountLokasi(res.data.length));
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-white bg-opacity-10 rounded-lg">
              <h2 className="text-xl">Total Barang</h2>
              <p className="text-4xl font-bold">{countBarang}</p>
            </div>
            <div className="p-6 bg-white bg-opacity-10 rounded-lg">
              <h2 className="text-xl">Total Lokasi</h2>
              <p className="text-4xl font-bold">{countLokasi}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
