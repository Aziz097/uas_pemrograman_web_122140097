import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const baseClasses = "block px-4 py-2 rounded-lg mb-2 text-black";
  const activeClasses = "bg-purple-700";

  return (
    <aside className="w-56 p-6 bg-white bg-opacity-10 h-screen">
      <nav>
        <NavLink to="/dashboard" className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : ""}`}>
          Dashboard
        </NavLink>
        <NavLink to="/barang" className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : ""}`}>
          Barang
        </NavLink>
        <NavLink to="/lokasi" className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : ""}`}>
          Lokasi
        </NavLink>
      </nav>
    </aside>
  );
}
