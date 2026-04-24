import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setLoading(false);
      if (data.token) { login(data); navigate("/"); }
      else setError(data.message || "Registration failed");
    } catch {
      setLoading(false);
      setError("Cannot connect to server. Make sure the backend is running.");
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 500, height: 500, background: "radial-gradient(circle, rgba(229,9,20,0.06) 0%, transparent 70%)" }}/>
        <div style={{ position: "absolute", bottom: "-20%", left: "-10%", width: 400, height: 400, background: "radial-gradient(circle, rgba(180,0,10,0.04) 0%, transparent 70%)" }}/>
      </div>

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ background: "#e50914", borderRadius: 10, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 22, color: "#fff" }}>C</div>
            <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", background: "linear-gradient(90deg,#fff 60%,#e50914)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CineVault</span>
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Your premium movie booking experience</p>
        </div>

        <div style={{
          background: "#111", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, padding: "36px 32px", position: "relative",
        }}>
          <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: 2, borderRadius: "0 0 4px 4px", background: "linear-gradient(90deg,#e50914,#b20710)" }}/>

          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Create account</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", marginBottom: 28 }}>Start booking your favourite movies today</p>

          {error && (
            <div style={{ background: "rgba(229,9,20,0.12)", border: "1px solid rgba(229,9,20,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "#ff6b6b" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Field label="Full name">
              <input type="text" placeholder="John Doe" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={inputStyle} />
            </Field>
            <Field label="Email address">
              <input type="email" placeholder="you@example.com" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={inputStyle} />
            </Field>
            <Field label="Password">
              <input type="password" placeholder="Min 6 characters" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={inputStyle} />
            </Field>
            <button type="submit" disabled={loading} style={btnStyle(loading)}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#e50914", fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 7 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
  padding: "12px 16px", fontSize: 14, color: "#fff", outline: "none",
};

const btnStyle = (loading) => ({
  width: "100%", padding: "13px", marginTop: 8,
  background: loading ? "rgba(229,9,20,0.4)" : "linear-gradient(135deg,#e50914,#b20710)",
  color: "#fff", border: "none", borderRadius: 10,
  fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
  boxShadow: loading ? "none" : "0 4px 20px rgba(229,9,20,0.3)",
});
