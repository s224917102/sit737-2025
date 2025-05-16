const mongoose = require('mongoose');

// MongoDB User Schema
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
});



const User = mongoose.model('User', userSchema);

module.exports = User;
