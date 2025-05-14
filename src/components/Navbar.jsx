import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white bg-opacity-10">
      <Link to="/dashboard" className="text-2xl font-semibold">
        SUPER BMD
      </Link>
      <div className="flex items-center space-x-4">
        <span>Hi, {user.username}</span>
        <button
          onClick={handleLogout}
          className="px-4 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
