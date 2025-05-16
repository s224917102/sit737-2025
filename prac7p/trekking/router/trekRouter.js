const express = require('express');
const { updateTrekDestination,
    deleteTrekDestination, getUserReviewForTrek, updateUserReview, deleteUserReview, createTrekDestination, getAllTrekDestinations, getTrekDestinationById, searchTrekDestinations, addReview } = require('../controller/trekController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();


// Route to create a trek destination (for admin)
router.post('/create', protect, admin, createTrekDestination);

// Route to get all trek destinations
router.get('/', getAllTrekDestinations);

// Update a Trek Destination (for admin)
router.put('/:id', protect, admin, updateTrekDestination);

// Delete a Trek Destination (for admin)
router.delete('/:id', protect, admin, deleteTrekDestination);



// Search trek destinations route
router.get('/search', searchTrekDestinations);

// Route to get single trek destination by ID
router.get('/:id', getTrekDestinationById);



// Search trek destinations route
router.get('/search', searchTrekDestinations);
// Route to add review
// Route to add a review and rating to a specific trek destination
router.post('/:id/reviews', protect, addReview);
router.get('/:id/my-review', protect, getUserReviewForTrek);
router.put('/:id/my-review', protect, updateUserReview);
router.delete('/:id/my-review', protect, deleteUserReview);




module.exports = router;
