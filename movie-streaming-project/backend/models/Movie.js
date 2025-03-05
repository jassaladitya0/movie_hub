const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    genre: {
        type: [String],
        required: true
    },
    releaseYear: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
    },
    posterUrl: {
        type: String,
        required: true
    },
    trailerUrl: String,
    duration: {
        type: Number, // in minutes
        required: true
    },
    directors: [String],
    cast: [String],
    isTrending: {
        type: Boolean,
        default: false
    },
    isTopRated: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Text search index
movieSchema.index({ title: 'text', description: 'text' });

// Static methods for querying
movieSchema.statics.findByGenre = function(genre) {
    return this.find({ genre: genre });
};

movieSchema.statics.findTrending = function() {
    return this.find({ isTrending: true });
};

movieSchema.statics.findTopRated = function() {
    return this.find({ isTopRated: true });
};

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;