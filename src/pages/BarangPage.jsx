import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function BarangPage() {
  const [barangs, setBarangs] = useState([]);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    api.get("/barang").then(res => setBarangs(res.data));
  };

  const onSubmit = data => {
    if (editing) {
      api.put(`/barang/${editing.id_barang}`, data).then(() => {
        fetchData();
        reset();
        setEditing(null);
      });
    } else {
      api.post("/barang", data).then(() => {
        fetchData();
        reset();
      });
    }
  };

  const handleEdit = item => {
    setEditing(item);
    reset(item);
  };

  const handleDelete = id => {
    if (confirm("Yakin ingin menghapus?")) {
      api.delete(`/barang/${id}`).then(fetchData);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          <h1 className="text-3xl font-semibold mb-6">Manajemen Barang</h1>

          {/* Form Tambah/Edit */}
          <form onSubmit={handleSubmit(onSubmit)} className="mb-8 grid grid-cols-2 gap-4">
            <input
              {...register("nama_barang", { required: true })}
              placeholder="Nama Barang"
              className="px-4 py-2 rounded-lg bg-white bg-opacity-20 focus:outline-none"
            />
            <input
              {...register("kode_barang", { required: true })}
              placeholder="Kode Barang"
              className="px-4 py-2 rounded-lg bg-white bg-opacity-20 focus:outline-none"
            />
            <input
              {...register("kondisi")}
              placeholder="Kondisi"
              className="px-4 py-2 rounded-lg bg-white bg-opacity-20 focus:outline-none"
            />
            <select
              {...register("id_lokasi", { required: true })}
              className="px-4 py-2 rounded-lg bg-white bg-opacity-20 focus:outline-none"
            >
              <option value="">Pilih Lokasi</option>
              {/* asumsi lokasi sudah di-fetch */}
              {/* kamu bisa menambahkan state lokasi di sini */}
            </select>
            <button
              type="submit"
              className="col-span-2 py-2 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition"
            >
              {editing ? "Update Barang" : "Tambah Barang"}
            </button>
          </form>

          {/* Tabel Barang */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white bg-opacity-10 rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Nama</th>
                  <th className="px-4 py-2">Kode</th>
                  <th className="px-4 py-2">Kondisi</th>
                  <th className="px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {barangs.map((b, i) => (
                  <tr key={b.id_barang} className="even:bg-white even:bg-opacity-5">
                    <td className="px-4 py-2">{i + 1}</td>
                    <td className="px-4 py-2">{b.nama_barang}</td>
                    <td className="px-4 py-2">{b.kode_barang}</td>
                    <td className="px-4 py-2">{b.kondisi}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => handleEdit(b)}
                        className="px-3 py-1 rounded-lg bg-yellow-500 hover:bg-yellow-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(b.id_barang)}
                        className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 transition"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
