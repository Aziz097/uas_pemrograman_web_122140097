import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BarangPage from "./pages/BarangPage";
import LokasiPage from "./pages/LokasiPage";
import NotFound from "./pages/NotFound";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/barang"
            element={
              <PrivateRoute>
                <BarangPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/lokasi"
            element={
              <PrivateRoute>
                <LokasiPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
