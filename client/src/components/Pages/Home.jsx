import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GENRES = ["All", "Action", "Drama", "Sci-Fi", "Comedy", "Thriller", "Animation", "Crime", "Superhero", "Adventure", "History", "Family"];

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/movies")
      .then((r) => r.json())
      .then((data) => {
        setMovies(data);
        setFiltered(data);
        if (data.length > 0) setFeatured(data[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = movies;
    if (genre !== "All") result = result.filter((m) => m.genre.includes(genre));
    if (search.trim()) result = result.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [search, genre, movies]);

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>

      {/* HERO BANNER */}
      {featured && (
        <div style={{
          position: "relative", height: "88vh", minHeight: 560,
          backgroundImage: `url(${featured.backdrop || featured.poster})`,
          backgroundSize: "cover", backgroundPosition: "center top",
          marginTop: 0,
        }}>
          {/* Gradient overlays */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)" }}/>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, #0a0a0a 0%, transparent 50%)" }}/>
          {/* Top navbar space */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 25%)" }}/>

          <div style={{
            position: "absolute", bottom: "18%", left: "5%",
            maxWidth: 540,
          }}>
            {/* Badges */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {featured.genre.slice(0, 3).map((g) => (
                <span key={g} style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 4, background: "rgba(229,9,20,0.2)", border: "1px solid rgba(229,9,20,0.4)", color: "#ff6b6b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{g}</span>
              ))}
              <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 4, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}>
                ★ {featured.rating}
              </span>
            </div>

            <h1 style={{ fontSize: 52, fontWeight: 900, color: "#fff", lineHeight: 1.05, marginBottom: 16, letterSpacing: "-1px", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
              {featured.title}
            </h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", lineHeight: 1.65, marginBottom: 10, maxWidth: 460 }}>
              {featured.description}
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 28 }}>
              {featured.year} &nbsp;·&nbsp; {featured.duration} min &nbsp;·&nbsp; Directed by {featured.director}
            </p>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => navigate(`/movie/${featured._id}`)}
                style={{
                  padding: "13px 32px", background: "linear-gradient(135deg,#e50914,#b20710)",
                  color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
                  cursor: "pointer", boxShadow: "0 4px 20px rgba(229,9,20,0.4)",
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                Book Now
              </button>
              <button
                onClick={() => navigate(`/movie/${featured._id}`)}
                style={{
                  padding: "13px 28px", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)",
                  color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10,
                  fontSize: 15, fontWeight: 600, cursor: "pointer",
                }}
              >
                More Info
              </button>
            </div>
          </div>

          {/* Featured movie dots */}
          <div style={{ position: "absolute", bottom: "6%", left: "5%", display: "flex", gap: 6 }}>
            {movies.slice(0, 5).map((m, i) => (
              <div key={i} onClick={() => setFeatured(m)} style={{
                width: m._id === featured._id ? 24 : 8, height: 4, borderRadius: 2,
                background: m._id === featured._id ? "#e50914" : "rgba(255,255,255,0.3)",
                cursor: "pointer", transition: "all 0.3s",
              }}/>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH + FILTER BAR */}
      <div style={{ padding: "32px 5% 0", background: "#0a0a0a" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 28 }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 260px", minWidth: 200 }}>
            <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
            <input
              placeholder="Search movies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
                padding: "11px 16px 11px 42px", fontSize: 14, color: "#fff", outline: "none",
              }}
            />
          </div>
          {/* Genre pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {GENRES.map((g) => (
              <button key={g} onClick={() => setGenre(g)} style={{
                padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 500,
                border: genre === g ? "1px solid rgba(229,9,20,0.6)" : "1px solid rgba(255,255,255,0.1)",
                background: genre === g ? "rgba(229,9,20,0.2)" : "rgba(255,255,255,0.05)",
                color: genre === g ? "#ff6b6b" : "rgba(255,255,255,0.6)",
                cursor: "pointer", transition: "all 0.2s",
              }}>{g}</button>
            ))}
          </div>
        </div>

        {/* Section heading */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>
            {genre === "All" && !search ? "Now Showing" : `Results`}
            <span style={{ marginLeft: 10, fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.4)" }}>
              {filtered.length} {filtered.length === 1 ? "film" : "films"}
            </span>
          </h2>
        </div>

        {/* MOVIE GRID */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "rgba(255,255,255,0.35)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 8 }}>No movies found</div>
            <div>Try a different search or genre</div>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 20, paddingBottom: 60,
          }}>
            {filtered.map((movie) => (
              <MovieCard key={movie._id} movie={movie} onClick={() => navigate(`/movie/${movie._id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MovieCard({ movie, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 12, overflow: "hidden", cursor: "pointer",
        transform: hovered ? "scale(1.04) translateY(-4px)" : "scale(1)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        boxShadow: hovered ? "0 16px 40px rgba(0,0,0,0.6)" : "0 4px 12px rgba(0,0,0,0.3)",
        background: "#1a1a1a",
        position: "relative",
      }}
    >
      {/* Poster */}
      <div style={{ position: "relative", aspectRatio: "2/3", overflow: "hidden" }}>
        <img
          src={movie.poster}
          alt={movie.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease", transform: hovered ? "scale(1.08)" : "scale(1)" }}
          onError={(e) => { e.target.src = "https://via.placeholder.com/300x450/1a1a1a/555?text=No+Image"; }}
        />
        {/* Overlay on hover */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
          opacity: hovered ? 1 : 0.6, transition: "opacity 0.3s",
        }}/>
        {/* Rating badge */}
        <div style={{
          position: "absolute", top: 10, right: 10,
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
          borderRadius: 6, padding: "4px 8px", fontSize: 12, fontWeight: 700, color: "#ffd700",
          border: "1px solid rgba(255,215,0,0.2)",
        }}>
          ★ {movie.rating}
        </div>
        {/* Play button on hover */}
        {hovered && (
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            width: 52, height: 52, borderRadius: "50%",
            background: "rgba(229,9,20,0.9)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 24px rgba(229,9,20,0.6)",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "12px 14px 14px" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 5, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {movie.title}
        </h3>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{movie.year} · {movie.duration}m</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{movie.language}</span>
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {movie.genre.slice(0, 2).map((g) => (
            <span key={g} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "rgba(229,9,20,0.15)", color: "#ff6b6b", border: "1px solid rgba(229,9,20,0.25)" }}>{g}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 44, height: 44, border: "3px solid rgba(229,9,20,0.2)", borderTop: "3px solid #e50914", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Loading movies...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
