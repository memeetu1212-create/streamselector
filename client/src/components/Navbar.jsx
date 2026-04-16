import { Link, useNavigate } from "react-router-dom";
import { getToken } from "../api.js";

export default function Navbar() {
  const navigate = useNavigate();
  const token = getToken();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="font-bold text-gray-900">Student Classifier</div>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className="text-gray-700 hover:text-gray-900">
            Home
          </Link>
          <Link to="/history" className="text-gray-700 hover:text-gray-900">
            History
          </Link>
          {token ? (
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

