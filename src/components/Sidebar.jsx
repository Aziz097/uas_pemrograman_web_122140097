import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const base = "block px-4 py-2 rounded-lg mb-2";
  const active = "bg-white text-purple-700";

  return (
    <aside className="w-56 p-6 bg-gradient-to-b from-purple-600 to-blue-500 text-white h-screen">
      <nav>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `${base} ${isActive ? active : "hover:bg-white hover:text-purple-700"}`}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/barang"
          className={({ isActive }) => `${base} ${isActive ? active : "hover:bg-white hover:text-purple-700"}`}
        >
          Barang
        </NavLink>
        <NavLink
          to="/lokasi"
          className={({ isActive }) => `${base} ${isActive ? active : "hover:bg-white hover:text-purple-700"}`}
        >
          Lokasi
        </NavLink>
        <NavLink
          to="/report"
          className={({ isActive }) => `${base} ${isActive ? active : "hover:bg-white hover:text-purple-700"}`}
        >
          Reporting
        </NavLink>
      </nav>
    </aside>
  );
}
