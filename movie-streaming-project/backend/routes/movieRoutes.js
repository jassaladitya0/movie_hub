const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

// GET trending movies
router.get('/trending', movieController.getTrendingMovies);

// GET top-rated movies
router.get('/top-rated', movieController.getTopRatedMovies);

// GET movies by genre
router.get('/genre/:genre', movieController.getMoviesByGenre);

// GET movie by ID
router.get('/:id', movieController.getMovieById);

// Search movies
router.get('/search', movieController.searchMovies);

module.exports = router;