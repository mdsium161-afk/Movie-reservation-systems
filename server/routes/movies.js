const express = require("express");
const Movie = require("../models/Movie");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

// Get all movies (with optional search/genre filter)
router.get("/", async (req, res) => {
  try {
    const { search, genre } = req.query;
    let query = {};
    if (search) query.title = { $regex: search, $options: "i" };
    if (genre) query.genre = { $in: [genre] };
    const movies = await Movie.find(query).sort({ createdAt: -1 });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch movies" });
  }
});

// Get single movie
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch movie" });
  }
});

module.exports = router;
