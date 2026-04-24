import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const STATUS_STYLE = {
  confirmed: {
    bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)", color: "#4ade80",
  },
  cancelled: {
    bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.35)",
  },
};

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("http://localhost:5000/api/bookings/my", {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((data) => { setBookings(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(bookingId);
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setBookings((prev) => prev.map((b) => b._id === bookingId ? { ...b, status: "cancelled" } : b));
      } else {
        alert(data.message || "Cancellation failed");
      }
    } catch {
      alert("Cannot connect to server.");
    }
    setCancelling(null);
  };

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const totalSpent = bookings.filter((b) => b.status === "confirmed").reduce((a, b) => a + b.totalPrice, 0);

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", paddingTop: 80 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", marginBottom: 6, letterSpacing: "-0.5px" }}>My Bookings</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.38)" }}>All your cinema reservations in one place</p>
        </div>

        {/* Stats strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
          <StatCard value={bookings.length} label="Total bookings" />
          <StatCard value={confirmedCount} label="Confirmed" color="#4ade80" />
          <StatCard value={`£${totalSpent}`} label="Total spent" color="#e50914" />
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[["all", "All"], ["confirmed", "Confirmed"], ["cancelled", "Cancelled"]].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{
              padding: "8px 18px", borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: "pointer",
              border: filter === val ? "1px solid rgba(229,9,20,0.5)" : "1px solid rgba(255,255,255,0.1)",
              background: filter === val ? "rgba(229,9,20,0.15)" : "rgba(255,255,255,0.04)",
              color: filter === val ? "#ff6b6b" : "rgba(255,255,255,0.55)",
              transition: "all 0.2s",
            }}>{label}</button>
          ))}
        </div>

        {/* Booking list */}
        {filtered.length === 0 ? (
          <EmptyState onBrowse={() => navigate("/")} filter={filter} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onCancel={handleCancel}
                cancelling={cancelling}
                onMovieClick={() => navigate(`/movie/${booking.movieId}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingCard({ booking, onCancel, cancelling, onMovieClick }) {
  const isCancelled = booking.status === "cancelled";
  const st = STATUS_STYLE[booking.status] || STATUS_STYLE.confirmed;

  return (
    <div style={{
      background: "#111", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, overflow: "hidden", opacity: isCancelled ? 0.65 : 1,
      transition: "box-shadow 0.2s",
    }}>
      <div style={{ display: "flex", gap: 0 }}>
        {/* Poster strip */}
        <div
          onClick={onMovieClick}
          style={{
            width: 80, flexShrink: 0, cursor: "pointer", overflow: "hidden",
            background: "rgba(255,255,255,0.05)",
          }}
        >
          {booking.poster ? (
            <img
              src={booking.poster}
              alt={booking.movieTitle}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🎬</div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            <div>
              <h3
                onClick={onMovieClick}
                style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 3, cursor: "pointer" }}
              >
                {booking.movieTitle}
              </h3>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                Ref: {booking.bookingRef}
              </div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
              background: st.bg, border: `1px solid ${st.border}`, color: st.color,
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              {booking.status}
            </span>
          </div>

          {/* Details row */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
            <Detail icon="📅" text={booking.showtime?.date} />
            <Detail icon="🕐" text={booking.showtime?.time} />
            <Detail icon="🎭" text={booking.showtime?.hall} />
            <Detail icon="🪑" text={`Seats: ${booking.seats?.join(", ")}`} />
            <Detail icon="🎟️" text={`${booking.seats?.length} ticket${booking.seats?.length > 1 ? "s" : ""}`} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
            <div>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Total paid: </span>
              <span style={{ fontSize: 16, fontWeight: 800, color: isCancelled ? "rgba(255,255,255,0.3)" : "#e50914" }}>£{booking.totalPrice}</span>
            </div>
            {!isCancelled && (
              <button
                onClick={() => onCancel(booking._id)}
                disabled={cancelling === booking._id}
                style={{
                  padding: "8px 18px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: "rgba(229,9,20,0.1)", border: "1px solid rgba(229,9,20,0.25)",
                  color: "#ff6b6b", cursor: cancelling === booking._id ? "not-allowed" : "pointer",
                  opacity: cancelling === booking._id ? 0.5 : 1,
                }}
              >
                {cancelling === booking._id ? "Cancelling..." : "Cancel Booking"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ icon, text }) {
  return (
    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ fontSize: 12 }}>{icon}</span> {text}
    </span>
  );
}

function StatCard({ value, label, color }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 18px", textAlign: "center" }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || "#fff", marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{label}</div>
    </div>
  );
}

function EmptyState({ onBrowse, filter }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px", color: "rgba(255,255,255,0.35)" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🎬</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 10 }}>
        {filter === "all" ? "No bookings yet" : `No ${filter} bookings`}
      </div>
      <p style={{ fontSize: 14, marginBottom: 24 }}>
        {filter === "all" ? "Start by browsing our movies and booking your first tickets!" : "Switch the filter to see other bookings."}
      </p>
      {filter === "all" && (
        <button
          onClick={onBrowse}
          style={{ padding: "12px 28px", background: "linear-gradient(135deg,#e50914,#b20710)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(229,9,20,0.3)" }}
        >
          Browse Movies
        </button>
      )}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 44, height: 44, border: "3px solid rgba(229,9,20,0.2)", borderTop: "3px solid #e50914", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Loading your bookings...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
