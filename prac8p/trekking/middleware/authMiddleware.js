



const jwt = require('jsonwebtoken');
const User = require('../model/user');

const protect = async (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(401).json({ message: 'Not authorized' });
    }
};
// Middleware for checking if the user is an admin
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // If admin, proceed
    } else {
        res.status(403).json({ message: 'Access denied, admin only' });
    }
};

module.exports = { protect, admin };
