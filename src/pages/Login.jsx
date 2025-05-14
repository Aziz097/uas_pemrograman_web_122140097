import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      login({ username });
      navigate("/dashboard");
    } else {
      setError("Username atau password salah");
    }
  };

  const inputClass = (hasError) =>
    `w-full mb-4 px-4 py-2 rounded-lg bg-white focus:outline-none ${
      hasError
        ? "border-2 border-orange-500"
        : "border border-gray-200"
    }`;

  return (
    <div className="flex items-center justify-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-8 w-full max-w-md shadow border border-gray-200"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Login SUPER BMD
        </h2>
        <input
          type="text"
          placeholder="Username"
          className={inputClass(error)}
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError("");
          }}
        />
        <input
          type="password"
          placeholder="Password"
          className={inputClass(error)}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
        />
        {error && (
          <p className="text-orange-600 text-sm mb-4">{error}</p>
        )}
        <button
          type="submit"
          className="w-full py-2 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition text-white"
        >
          Masuk
        </button>
      </form>
    </div>
  );
}
