const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/user');

// Signup Controller
const signup = async (req, res) => {
    const { fullName, phone, email, password, confirmPassword, gender } = req.body;
    try {
        // Check for missing fields
        if (!fullName || !phone || !email || !password || !confirmPassword || !gender) {
            return res.status(400).json({ statusCode: 400, message: 'Missing required fields' });
        }

        // Validate password match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ fullName, phone, email, password: hashedPassword, gender });
        await newUser.save();

        res.status(201).json({ status: 'success', message: 'User created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

// Login Controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input presence
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Validate password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Ensure JWT_SECRET is defined
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ message: 'JWT_SECRET not defined in .env file' });
        }

        // Generate JWT token (expires in 1 hour)
        const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });

        // Sanitize user data (omit sensitive fields)
        const userData = {
            id: user._id,
            fullName: user.fullName,
            phone: user.phone,
            email: user.email,
            gender: user.gender,
            role: user.role,
            // include other non-sensitive fields if needed
        };

        // Inside your login controller
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Ensure secure in production
            maxAge: 3600000, // 1 hour in milliseconds
        });
        res.json({
            message: 'Login successful',
            user: userData, // Send sanitized user data if needed
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

// In your authController.js
const logout = (req, res) => {
    res.clearCookie('token'); // Clear the token cookie
    res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};

// Forgot Password Controller
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // In a complete implementation, generate a reset token and send password reset instructions
        res.status(200).json({ status: 'success', message: 'Password reset instructions sent' });
    } catch (error) {
        console.error('Forgot Password error:', error);
        res.status(500).json({ message: 'Error sending reset instructions', error: error.message });
    }
};

// Get all users (only for admin)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }); // Fetch all users except admins
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};


// Delete a user (only for admin)
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const deletedUser = await User.findByIdAndDelete(userId); // Delete user by ID
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
};

// Edit User Profile (for authenticated users)
const editUserProfile = async (req, res) => {
    try {
        // Get the updates from request body
        const updates = req.body;
        const userId = req.user._id; // Protected route ensures req.user is populated

        // If the update includes a new password, hash it before updating
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        // Update the user; using runValidators to ensure updated data passes the schema validations
        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};


module.exports = { editUserProfile, getAllUsers, deleteUser, signup, login, logout, forgotPassword };
