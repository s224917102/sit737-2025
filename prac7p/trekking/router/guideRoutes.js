const express = require('express');
const router = express.Router();
const guideController = require('../controller/guideController');

// Create a new guide
router.post('/', guideController.createGuide);

// Get all guides
router.get('/', guideController.getAllGuides);

// Get a specific guide by ID
router.get('/:id', guideController.getGuideById);

// Update a guide by ID
router.put('/:id', guideController.updateGuide);

// Delete a guide by ID
router.delete('/:id', guideController.deleteGuide);

module.exports = router;
