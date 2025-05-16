// models/TrekDestination.js

const mongoose = require('mongoose');



const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 }, // Rating between 1 and 5
    review: { type: String, required: true }, // Review text
    createdAt: { type: Date, default: Date.now }
});



const trekDestinationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    images: {
        type: [String], // Array of image URLs or filenames
        required: true
    },
    description: {
        type: String,
        required: true
    },
    totalDays: {
        type: Number,
        required: true
    },
    expenses: {
        type: Number, // Expected total expenses
        required: true
    },
    maxAltitude: {
        type: Number,
        required: true
    },
    difficultyLevel: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true
    },
    bestSeason: {
        type: String,
        required: true
    },
    trekMap: {
        type: String, // URL or file path to the downloadable map
        required: true
    },
    totalDistance: {
        type: String,
        required: true
    },
    // New location field
    location: {
        type: String, // You can use String for location (e.g., city name, coordinates, etc.)
        required: true
    },

    // New fields for reviews and ratings
    reviews: [reviewSchema], // Array of reviews
    averageRating: { type: Number, default: 0 } // Average rating, default to 0


});

const TrekDestination = mongoose.model('TrekDestination', trekDestinationSchema);
module.exports = TrekDestination;
