import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/api/movies/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setMovie(data);
        // default to first available date
        if (data.showtimes?.length) {
          const dates = [...new Set(data.showtimes.map((s) => s.date))];
          setSelectedDate(dates[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!movie) return <div style={{ color: "#fff", padding: 40 }}>Movie not found.</div>;

  const allDates = [...new Set(movie.showtimes.map((s) => s.date))];
  const timesForDate = movie.showtimes.filter((s) => s.date === selectedDate);

  const availableCount = (st) => st.totalSeats - st.bookedSeats.length;
  const showtimeIndex = (st) => movie.showtimes.findIndex((s) => s.date === st.date && s.time === st.time && s.hall === st.hall);

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>

      {/* Backdrop hero */}
      <div style={{
        position: "relative", height: "70vh", minHeight: 480,
        backgroundImage: `url(${movie.backdrop || movie.poster})`,
        backgroundSize: "cover", backgroundPosition: "center 20%",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, #0a0a0a 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.3) 100%)" }}/>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.7) 0%, transparent 60%)" }}/>

        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          style={{
            position: "absolute", top: 80, left: "5%",
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8,
            color: "#fff", fontSize: 13, fontWeight: 500, padding: "8px 16px",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </button>

        {/* Movie info overlay */}
        <div style={{ position: "absolute", bottom: 0, left: "5%", right: "5%", display: "flex", gap: 32, alignItems: "flex-end", paddingBottom: 40 }}>
          {/* Poster */}
          <img
            src={movie.poster}
            alt={movie.title}
            style={{ width: 160, borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.6)", flexShrink: 0, display: "block" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {movie.genre.map((g) => (
                <span key={g} style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 4, background: "rgba(229,9,20,0.2)", border: "1px solid rgba(229,9,20,0.35)", color: "#ff6b6b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{g}</span>
              ))}
            </div>
            <h1 style={{ fontSize: 44, fontWeight: 900, color: "#fff", lineHeight: 1.05, marginBottom: 10, letterSpacing: "-1px" }}>{movie.title}</h1>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 14 }}>
              <MetaItem icon="★" value={movie.rating} color="#ffd700" />
              <MetaItem icon="🕐" value={`${movie.duration} min`} />
              <MetaItem icon="📅" value={movie.year} />
              <MetaItem icon="🎬" value={movie.director} />
              <MetaItem icon="🌐" value={movie.language} />
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, maxWidth: 600 }}>{movie.description}</p>
          </div>
        </div>
      </div>

      {/* DETAILS SECTION */}
      <div style={{ padding: "0 5% 60px" }}>

        {/* Cast */}
        {movie.cast?.length > 0 && (
          <div style={{ marginBottom: 36 }}>
            <SectionTitle>Cast</SectionTitle>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {movie.cast.map((c) => (
                <span key={c} style={{ fontSize: 13, padding: "7px 16px", borderRadius: 20, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)" }}>{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* Showtimes */}
        <div>
          <SectionTitle>Book Tickets</SectionTitle>

          {/* Date selector */}
          <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
            {allDates.map((date) => {
              const d = new Date(date);
              const label = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
              return (
                <button key={date} onClick={() => setSelectedDate(date)} style={{
                  padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                  border: selectedDate === date ? "1px solid rgba(229,9,20,0.6)" : "1px solid rgba(255,255,255,0.12)",
                  background: selectedDate === date ? "rgba(229,9,20,0.18)" : "rgba(255,255,255,0.05)",
                  color: selectedDate === date ? "#ff6b6b" : "rgba(255,255,255,0.65)",
                  cursor: "pointer", transition: "all 0.2s",
                }}>{label}</button>
              );
            })}
          </div>

          {/* Showtimes grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
            {timesForDate.map((st, i) => {
              const avail = availableCount(st);
              const isSoldOut = avail === 0;
              const idx = showtimeIndex(st);
              return (
                <div key={i} style={{
                  background: "#111", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14, padding: "18px 20px",
                  opacity: isSoldOut ? 0.5 : 1,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{st.time}</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{st.hall}</div>
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
                      background: isSoldOut ? "rgba(255,255,255,0.06)" : avail < 10 ? "rgba(229,9,20,0.2)" : "rgba(34,197,94,0.15)",
                      color: isSoldOut ? "rgba(255,255,255,0.3)" : avail < 10 ? "#ff6b6b" : "#4ade80",
                      border: `1px solid ${isSoldOut ? "rgba(255,255,255,0.08)" : avail < 10 ? "rgba(229,9,20,0.3)" : "rgba(34,197,94,0.25)"}`,
                    }}>
                      {isSoldOut ? "Sold out" : `${avail} left`}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                      £12 / seat · {st.totalSeats} total
                    </div>
                    <button
                      disabled={isSoldOut}
                      onClick={() => navigate(`/movie/${id}/seats/${idx}`)}
                      style={{
                        padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                        background: isSoldOut ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#e50914,#b20710)",
                        color: isSoldOut ? "rgba(255,255,255,0.3)" : "#fff",
                        border: "none", cursor: isSoldOut ? "not-allowed" : "pointer",
                        boxShadow: isSoldOut ? "none" : "0 2px 12px rgba(229,9,20,0.3)",
                      }}
                    >
                      {isSoldOut ? "Unavailable" : "Select Seats"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaItem({ icon, value, color }) {
  return (
    <span style={{ fontSize: 13, color: color || "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: 5 }}>
      <span>{icon}</span> {value}
    </span>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, marginTop: 32 }}>
      <div style={{ width: 3, height: 20, background: "#e50914", borderRadius: 2 }}/>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{children}</h2>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 44, height: 44, border: "3px solid rgba(229,9,20,0.2)", borderTop: "3px solid #e50914", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Loading movie...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
