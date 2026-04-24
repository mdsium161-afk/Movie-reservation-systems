const mongoose = require("mongoose");
const MovieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    genre: [String],
    description: { type: String },
    duration: { type: Number }, // in minutes
    rating: { type: Number, default: 0 },
    poster: { type: String },
    backdrop: { type: String },
    year: { type: Number },
    cast: [String],
    director: { type: String },
    language: { type: String, default: "English" },
    showtimes: [
      {
        date: String,
        time: String,
        hall: String,
        totalSeats: { type: Number, default: 60 },
        bookedSeats: [String],
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("Movie", MovieSchema);
