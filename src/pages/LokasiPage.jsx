import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function LokasiPage() {
  const [lokasis, setLokasis] = useState([]);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchLokasi();
  }, []);

  const fetchLokasi = () => {
    api.get("/lokasi").then(res => setLokasis(res.data));
  };

  const onSubmit = data => {
    if (editing) {
      api.put(`/lokasi/${editing.id_lokasi}`, data).then(() => {
        fetchLokasi();
        reset();
        setEditing(null);
      });
    } else {
      api.post("/lokasi", data).then(() => {
        fetchLokasi();
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
      api.delete(`/lokasi/${id}`).then(fetchLokasi);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          <h1 className="text-3xl font-semibold mb-6">Manajemen Lokasi</h1>

          {/* Form Tambah/Edit */}
          <form onSubmit={handleSubmit(onSubmit)} className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              {...register("nama_lokasi", { required: true })}
              placeholder="Nama Lokasi"
              className="px-4 py-2 rounded-lg bg-white bg-opacity-20 focus:outline-none"
            />
            <input
              {...register("kode_lokasi", { required: true })}
              placeholder="Kode Lokasi"
              className="px-4 py-2 rounded-lg bg-white bg-opacity-20 focus:outline-none"
            />
            <input
              {...register("alamat_lokasi")}
              placeholder="Alamat Lokasi"
              className="px-4 py-2 rounded-lg bg-white bg-opacity-20 focus:outline-none"
            />
            <button
              type="submit"
              className="col-span-1 md:col-span-2 py-2 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition"
            >
              {editing ? "Update Lokasi" : "Tambah Lokasi"}
            </button>
          </form>

          {/* Tabel Lokasi */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white bg-opacity-10 rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Nama</th>
                  <th className="px-4 py-2">Kode</th>
                  <th className="px-4 py-2">Alamat</th>
                  <th className="px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {lokasis.map((l, i) => (
                  <tr key={l.id_lokasi} className="even:bg-white even:bg-opacity-5">
                    <td className="px-4 py-2">{i + 1}</td>
                    <td className="px-4 py-2">{l.nama_lokasi}</td>
                    <td className="px-4 py-2">{l.kode_lokasi}</td>
                    <td className="px-4 py-2">{l.alamat_lokasi}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => handleEdit(l)}
                        className="px-3 py-1 rounded-lg bg-yellow-500 hover:bg-yellow-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(l.id_lokasi)}
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
