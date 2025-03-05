const Movie = require('../models/Movie');

exports.getTrendingMovies = async (req, res) => {
    try {
        const movies = await Movie.findTrending()
            .limit(10)
            .select('-__v');
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching trending movies', error: error.message });
    }
};

exports.getTopRatedMovies = async (req, res) => {
    try {
        const movies = await Movie.findTopRated()
            .limit(10)
            .select('-__v');
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching top rated movies', error: error.message });
    }
};

exports.searchMovies = async (req, res) => {
    try {
        const { q } = req.query;
        const movies = await Movie.find({
            $text: { 
                $search: q,
                $caseSensitive: false
            }
        })
        .limit(20)
        .select('-__v');
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: 'Error searching movies', error: error.message });
    }
};

exports.getMoviesByGenre = async (req, res) => {
    try {
        const { genre } = req.params;
        const movies = await Movie.findByGenre(genre)
            .limit(20)
            .select('-__v');
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching movies by genre', error: error.message });
    }
};

exports.getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id).select('-__v');
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.json(movie);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching movie', error: error.message });
    }
};