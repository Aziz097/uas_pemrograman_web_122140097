// src/pages/Users/UserFormPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserById, useCreateUser, useUpdateUser } from "../../hooks/useUsers";
import { useAuth } from "../../contexts/AuthContext";
import { showToast } from "../../components/common/Toast";

const UserFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    // Context user yang login
    const { user: currentUser } = useAuth();

    // State form
    const [formState, setFormState] = useState({
        username: "",
        password: "",
        role: "viewer",
    });

    // Hooks data user
    const { user: editUser, loading: loadingEdit, error: errorEdit } = useUserById(id, isEditMode);
    const { createUser, loading: loadingCreate } = useCreateUser();
    const { updateUser, loading: loadingUpdate } = useUpdateUser();

    useEffect(() => {
        if (isEditMode && editUser) {
            setFormState({
                username: editUser.username,
                password: "",
                role: editUser.role,
                id: editUser.id,
            });
        }
    }, [isEditMode, editUser]);

    // **Disable role edit jika admin edit dirinya sendiri**
    const isSelfEditAdmin =
        isEditMode && currentUser && currentUser.role === "admin" && Number(currentUser.id) === Number(id);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Submit logic
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Pastikan role string benar (admin/penanggung_jawab/viewer)
        const submitData = {
            username: formState.username,
            role: formState.role,
        };
        // Hanya sertakan password jika diisi (untuk edit)
        if (formState.password) {
            submitData.password = formState.password;
        }

        let success = false;
        if (isEditMode) {
            success = await updateUser(id, submitData);
        } else {
            success = await createUser(submitData);
        }

        if (success) {
            showToast(`User berhasil ${isEditMode ? "diperbarui" : "ditambahkan"}!`, "success");
            navigate("/users");
        }
    };

    if (loadingEdit) return <div className="p-4">Memuat data pengguna...</div>;
    if (errorEdit) return <div className="p-4 text-red-500">Gagal memuat user: {errorEdit}</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto border border-gray-300 dark:border-gray-600">
            <h1 className="text-2xl font-bold mb-6">{isEditMode ? "Edit Pengguna" : "Tambah Pengguna"}</h1>
            <form onSubmit={handleSubmit} autoComplete="off">
                <div className="mb-4">
                    <label htmlFor="username" className="block text-gray-700 font-bold mb-2">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formState.username}
                        onChange={handleChange}
                        className="form-input w-full"
                        disabled={isEditMode && currentUser && currentUser.role !== "admin"}
                        required
                    />
                </div>
                {!isEditMode && (
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700 font-bold mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formState.password}
                            onChange={handleChange}
                            className="form-input w-full"
                            required
                        />
                    </div>
                )}
                {isEditMode && (
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700 font-bold mb-2">
                            Password Baru (opsional)
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formState.password}
                            onChange={handleChange}
                            className="form-input w-full"
                            placeholder="Biarkan kosong jika tidak ingin mengubah password"
                        />
                    </div>
                )}

                {/* Dropdown role */}
                <div className="mb-4">
                    <label htmlFor="role" className="block text-gray-700 font-bold mb-2">
                        Role
                    </label>
                    {isSelfEditAdmin ? (
                        <input
                            type="text"
                            className="form-input w-full bg-gray-100"
                            value="Admin"
                            disabled
                        />
                    ) : (
                        <select
                            id="role"
                            name="role"
                            value={formState.role}
                            onChange={handleChange}
                            className="form-select w-full"
                        >
                            <option value="admin">Admin</option>
                            <option value="penanggung_jawab">Penanggung Jawab</option>
                            <option value="viewer">Viewer</option>
                        </select>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded"
                        onClick={() => navigate("/users")}
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                        disabled={loadingCreate || loadingUpdate}
                    >
                        {loadingCreate || loadingUpdate
                            ? "Menyimpan..."
                            : isEditMode
                            ? "Perbarui"
                            : "Tambah"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserFormPage;
