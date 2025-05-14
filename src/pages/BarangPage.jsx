import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function BarangPage() {
  const [barangs, setBarangs] = useState([]);
  const [lokasis, setLokasis] = useState([]);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchData();
    fetchLokasi();
  }, []);

  const fetchData = () => api.get("/barang").then(res => setBarangs(res.data));
  const fetchLokasi = () => api.get("/lokasi").then(res => setLokasis(res.data));

  const onSubmit = data => {
    const call = editing
      ? api.put(`/barang/${editing.id_barang}`, data)
      : api.post("/barang", data);
    call.then(() => {
      fetchData();
      reset();
      setEditing(null);
    });
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

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-white border border-gray-200 rounded-lg"
          >
            <input
              {...register("nama_barang", { required: true })}
              placeholder="Nama Barang"
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none"
            />
            <input
              {...register("kode_barang", { required: true })}
              placeholder="Kode Barang"
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none"
            />
            <input
              {...register("kondisi")}
              placeholder="Kondisi"
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none"
            />
            <select
              {...register("id_lokasi", { required: true })}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none"
            >
              <option value="">Pilih Lokasi</option>
              {lokasis.map(l => (
                <option key={l.id_lokasi} value={l.id_lokasi}>
                  {l.nama_lokasi}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="col-span-1 md:col-span-2 py-2 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition text-white"
            >
              {editing ? "Update Barang" : "Tambah Barang"}
            </button>
          </form>

          {/* Tabel */}
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  {["#", "Nama", "Kode", "Kondisi", "Aksi"].map((h, i) => (
                    <th key={i} className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {barangs.map((b, i) => (
                  <tr key={b.id_barang} className="even:bg-gray-50">
                    <td className="px-4 py-2">{i + 1}</td>
                    <td className="px-4 py-2">{b.nama_barang}</td>
                    <td className="px-4 py-2">{b.kode_barang}</td>
                    <td className="px-4 py-2">{b.kondisi}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => handleEdit(b)}
                        className="px-3 py-1 rounded-lg border border-yellow-500 text-yellow-500 hover:bg-yellow-50 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(b.id_barang)}
                        className="px-3 py-1 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 transition"
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
