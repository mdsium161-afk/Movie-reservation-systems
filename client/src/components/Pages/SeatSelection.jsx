import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const COLS = Array.from({ length: 10 }, (_, i) => i + 1);

export default function SeatSelection() {
  const { id, showtimeIndex } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [showtime, setShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [error, setError] = useState("");

  const TICKET_PRICE = 12;

  useEffect(() => {
    fetch(`http://localhost:5000/api/movies/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setMovie(data);
        setShowtime(data.showtimes[parseInt(showtimeIndex)]);
        setLoading(false);
      });
  }, [id, showtimeIndex]);

  const seatId = (row, col) => `${row}${col}`;
  const isBooked = (row, col) => showtime?.bookedSeats?.includes(seatId(row, col));
  const isSelected = (row, col) => selectedSeats.includes(seatId(row, col));

  const toggleSeat = (row, col) => {
    if (isBooked(row, col)) return;
    const seat = seatId(row, col);
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) { setError("Please select at least one seat."); return; }
    setError("");
    setBooking(true);
    try {
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          movieId: id,
          showtimeIndex: parseInt(showtimeIndex),
          seats: selectedSeats,
        }),
      });
      const data = await res.json();
      setBooking(false);
      if (res.ok) {
        setBookingData(data);
        setBooked(true);
        // Update local showtime booked seats
        setShowtime((prev) => ({ ...prev, bookedSeats: [...(prev.bookedSeats || []), ...selectedSeats] }));
        setSelectedSeats([]);
      } else {
        setError(data.message || "Booking failed. Please try again.");
      }
    } catch {
      setBooking(false);
      setError("Cannot connect to server.");
    }
  };

  if (loading) return <LoadingScreen />;
  if (!movie || !showtime) return <div style={{ color: "#fff", padding: 40 }}>Showtime not found.</div>;

  const availableSeats = showtime.totalSeats - (showtime.bookedSeats?.length || 0);
  const total = selectedSeats.length * TICKET_PRICE;

  // Booking confirmation modal
  if (booked && bookingData) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0a0a0a",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}>
        <div style={{
          background: "#111", border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: 20, padding: "44px 40px", maxWidth: 480, width: "100%",
          textAlign: "center", position: "relative",
        }}>
          <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: 2, borderRadius: "0 0 4px 4px", background: "linear-gradient(90deg,#22c55e,#16a34a)" }}/>

          {/* Check icon */}
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Booking Confirmed!</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 28 }}>Your tickets are ready. Enjoy the film!</p>

          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 24px", marginBottom: 24, textAlign: "left" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Booking Details</div>
            <ConfirmRow label="Booking Ref" value={bookingData.bookingRef} highlight />
            <ConfirmRow label="Movie" value={bookingData.movieTitle} />
            <ConfirmRow label="Date" value={bookingData.showtime?.date} />
            <ConfirmRow label="Time" value={bookingData.showtime?.time} />
            <ConfirmRow label="Hall" value={bookingData.showtime?.hall} />
            <ConfirmRow label="Seats" value={bookingData.seats?.join(", ")} />
            <ConfirmRow label="Total Paid" value={`£${bookingData.totalPrice}`} highlight />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => navigate("/my-bookings")}
              style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg,#e50914,#b20710)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              View My Bookings
            </button>
            <button
              onClick={() => navigate("/")}
              style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.07)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Back to Movies
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", paddingTop: 80 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px 60px" }}>

        {/* Header */}
        <button
          onClick={() => navigate(`/movie/${id}`)}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 24, padding: 0 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to {movie.title}
        </button>

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap" }}>
          <img src={movie.poster} alt={movie.title} style={{ width: 64, borderRadius: 8 }} onError={(e) => { e.target.style.display = "none"; }}/>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{movie.title}</h1>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>📅 {showtime.date}</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>🕐 {showtime.time}</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>🎭 {showtime.hall}</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>🪑 {availableSeats} seats available</span>
            </div>
          </div>
        </div>

        {/* SCREEN */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            display: "inline-block", width: "70%", height: 6,
            background: "linear-gradient(90deg, transparent, rgba(229,9,20,0.6), transparent)",
            borderRadius: "50%", marginBottom: 6,
            boxShadow: "0 0 20px rgba(229,9,20,0.4)",
          }}/>
          <div style={{ fontSize: 11, letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>Screen</div>
        </div>

        {/* SEAT MAP */}
        <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            {ROWS.map((row) => (
              <div key={row} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, justifyContent: "center" }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", width: 16, textAlign: "right", fontWeight: 600 }}>{row}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {COLS.map((col) => {
                    const booked = isBooked(row, col);
                    const selected = isSelected(row, col);
                    return (
                      <button
                        key={col}
                        onClick={() => toggleSeat(row, col)}
                        disabled={booked}
                        title={`Seat ${row}${col}`}
                        style={{
                          width: 32, height: 30, borderRadius: "6px 6px 3px 3px",
                          border: selected ? "1px solid rgba(229,9,20,0.8)" : booked ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.15)",
                          background: booked
                            ? "rgba(255,255,255,0.06)"
                            : selected
                            ? "linear-gradient(135deg,#e50914,#b20710)"
                            : "rgba(255,255,255,0.1)",
                          cursor: booked ? "not-allowed" : "pointer",
                          boxShadow: selected ? "0 0 10px rgba(229,9,20,0.4)" : "none",
                          transition: "all 0.15s",
                          fontSize: 9, color: selected ? "#fff" : booked ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)",
                          fontWeight: 600,
                        }}
                      >
                        {col}
                      </button>
                    );
                  })}
                </div>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", width: 16, fontWeight: 600 }}>{row}</span>
              </div>
            ))}

            {/* Legend */}
            <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
              <Legend color="rgba(255,255,255,0.1)" border="rgba(255,255,255,0.15)" label="Available" />
              <Legend color="linear-gradient(135deg,#e50914,#b20710)" border="rgba(229,9,20,0.8)" label="Selected" />
              <Legend color="rgba(255,255,255,0.06)" border="rgba(255,255,255,0.06)" label="Taken" />
            </div>
          </div>

          {/* BOOKING PANEL */}
          <div style={{ width: 240, flexShrink: 0 }}>
            <div style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "22px 20px", position: "sticky", top: 80 }}>
              <div style={{ position: "absolute", display: "none" }}/>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 18 }}>Your Selection</h3>

              {selectedSeats.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🪑</div>
                  Click seats to select them
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Selected Seats</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {selectedSeats.map((s) => (
                        <span key={s} style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 6, background: "rgba(229,9,20,0.2)", border: "1px solid rgba(229,9,20,0.35)", color: "#ff6b6b" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 14, marginBottom: 16 }}>
                    <SummaryRow label={`${selectedSeats.length} ticket${selectedSeats.length > 1 ? "s" : ""}`} value={`£${selectedSeats.length} × £12`} />
                    <SummaryRow label="Total" value={`£${total}`} bold />
                  </div>
                </>
              )}

              {error && (
                <div style={{ background: "rgba(229,9,20,0.1)", border: "1px solid rgba(229,9,20,0.25)", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "#ff6b6b" }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={booking || selectedSeats.length === 0}
                style={{
                  width: "100%", padding: "12px",
                  background: selectedSeats.length === 0 ? "rgba(255,255,255,0.06)" : booking ? "rgba(229,9,20,0.4)" : "linear-gradient(135deg,#e50914,#b20710)",
                  color: selectedSeats.length === 0 ? "rgba(255,255,255,0.25)" : "#fff",
                  border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700,
                  cursor: selectedSeats.length === 0 || booking ? "not-allowed" : "pointer",
                  boxShadow: selectedSeats.length > 0 && !booking ? "0 4px 16px rgba(229,9,20,0.35)" : "none",
                }}
              >
                {booking ? "Processing..." : selectedSeats.length === 0 ? "Select Seats" : `Confirm Booking · £${total}`}
              </button>

              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: 10 }}>
                Free cancellation before showtime
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, border, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 20, height: 18, borderRadius: "4px 4px 2px 2px", background: color, border: `1px solid ${border}` }}/>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{label}</span>
    </div>
  );
}

function SummaryRow({ label, value, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
      <span style={{ fontSize: bold ? 14 : 12, fontWeight: bold ? 700 : 400, color: bold ? "#fff" : "rgba(255,255,255,0.45)" }}>{label}</span>
      <span style={{ fontSize: bold ? 14 : 12, fontWeight: bold ? 700 : 400, color: bold ? "#e50914" : "rgba(255,255,255,0.6)" }}>{value}</span>
    </div>
  );
}

function ConfirmRow({ label, value, highlight }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: highlight ? 700 : 500, color: highlight ? "#e50914" : "#fff" }}>{value}</span>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 44, height: 44, border: "3px solid rgba(229,9,20,0.2)", borderTop: "3px solid #e50914", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Loading seats...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
