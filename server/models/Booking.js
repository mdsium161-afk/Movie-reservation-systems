const mongoose = require("mongoose");
const BookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    movieTitle: String,
    poster: String,
    showtime: {
      date: String,
      time: String,
      hall: String,
    },
    seats: [String],
    totalPrice: Number,
    status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
    bookingRef: String,
  },
  { timestamps: true }
);
module.exports = mongoose.model("Booking", BookingSchema);
