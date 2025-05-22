// const express = require('express');
// const { createReview, getReviewsByEntityType, updateReview, deleteReview } = require('../controller/reviewController');
// const { protect, admin } = require('../middleware/authMiddleware');

// const router = express.Router();

// router.route('/:entityType/:entityId/reviews')
//     .post(protect, createReview)
//     .get(protect, getReviewsByEntityType);

// router.route('/:entityType/:entityId/reviews/:id')
//     .put(protect, updateReview)
//     .delete(protect, admin, deleteReview);

// module.exports = router;