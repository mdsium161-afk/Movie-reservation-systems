const express = require("express");
const Booking = require("../models/Booking");
const Movie = require("../models/Movie");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

// Create booking
router.post("/", auth, async (req, res) => {
  try {
    const { movieId, showtimeIndex, seats } = req.body;
    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    const showtime = movie.showtimes[showtimeIndex];
    if (!showtime) return res.status(404).json({ message: "Showtime not found" });

    // Check seats not already booked
    const conflict = seats.filter((s) => showtime.bookedSeats.includes(s));
    if (conflict.length > 0)
      return res.status(400).json({ message: `Seats already taken: ${conflict.join(", ")}` });

    // Mark seats as booked
    showtime.bookedSeats.push(...seats);
    await movie.save();

    const TICKET_PRICE = 12;
    const bookingRef = "CIN" + Math.random().toString(36).substr(2, 8).toUpperCase();

    const booking = await Booking.create({
      userId: req.user.id,
      movieId,
      movieTitle: movie.title,
      poster: movie.poster,
      showtime: { date: showtime.date, time: showtime.time, hall: showtime.hall },
      seats,
      totalPrice: seats.length * TICKET_PRICE,
      bookingRef,
    });

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Booking failed" });
  }
});

// Get user bookings
router.get("/my", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// Cancel booking
router.patch("/:id/cancel", auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Free the seats
    const movie = await Movie.findById(booking.movieId);
    if (movie) {
      const st = movie.showtimes.find(
        (s) => s.date === booking.showtime.date && s.time === booking.showtime.time
      );
      if (st) {
        st.bookedSeats = st.bookedSeats.filter((s) => !booking.seats.includes(s));
        await movie.save();
      }
    }

    booking.status = "cancelled";
    await booking.save();
    res.json({ message: "Booking cancelled", booking });
  } catch (err) {
    res.status(500).json({ message: "Cancellation failed" });
  }
});

module.exports = router;
