import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      login({ username });
      navigate("/dashboard");
    } else {
      alert("Username atau password salah");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md shadow-lg"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">Login SUPER BMD</h2>
        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 px-4 py-2 rounded-lg bg-white bg-opacity-20 focus:outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-2 rounded-lg bg-white bg-opacity-20 focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full py-2 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition"
        >
          Masuk
        </button>
      </form>
    </div>
  );
}
