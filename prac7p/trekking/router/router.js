const express = require('express');
const { editUserProfile, getAllUsers, deleteUser, signup, login, logout, forgotPassword } = require('../controller/authController');

const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

// Define routes
router.post('/register', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
//
router.get('/all', protect, admin, getAllUsers); // Admin: Get all users
router.delete('/:id', protect, admin, deleteUser); // Admin: Delete user by ID

// Edit user profile
router.put('/profile', protect, editUserProfile);


// Endpoint to return current user details
router.get('/me', protect, (req, res) => {
    // The protect middleware attaches req.user if token is valid.
    res.json({ user: req.user });
});

// Add a route to handle the root `/api/user/`
router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the User API' });
});

module.exports = router;
