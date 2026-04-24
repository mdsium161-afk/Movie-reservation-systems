import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: "linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.75) 100%)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(229,9,20,0.15)",
      height: 64,
      display: "flex", alignItems: "center",
      padding: "0 5%",
      justifyContent: "space-between",
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          background: "#e50914",
          borderRadius: 8,
          width: 36, height: 36,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 900, fontSize: 18, color: "#fff", letterSpacing: "-1px"
        }}>C</div>
        <span style={{
          fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px",
          background: "linear-gradient(90deg, #fff 60%, #e50914)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
        }}>CineVault</span>
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <NavLink to="/" label="Movies" active={isActive("/")} />
        <NavLink to="/my-bookings" label="My Bookings" active={isActive("/my-bookings")} />
      </div>

      {/* User */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(229,9,20,0.1)", border: "1px solid rgba(229,9,20,0.2)",
          borderRadius: 24, padding: "5px 14px 5px 6px",
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, #e50914, #b20710)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#fff",
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>{user?.name}</span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: "rgba(229,9,20,0.12)", border: "1px solid rgba(229,9,20,0.3)",
            color: "#ff6b6b", fontSize: 12, fontWeight: 600,
            padding: "7px 16px", borderRadius: 8, cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}

function NavLink({ to, label, active }) {
  return (
    <Link to={to} style={{
      fontSize: 14, fontWeight: active ? 600 : 400,
      color: active ? "#fff" : "rgba(255,255,255,0.6)",
      padding: "6px 14px", borderRadius: 8,
      background: active ? "rgba(229,9,20,0.15)" : "transparent",
      border: active ? "1px solid rgba(229,9,20,0.25)" : "1px solid transparent",
      transition: "all 0.2s",
    }}>{label}</Link>
  );
}
