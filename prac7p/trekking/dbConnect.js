
require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URL;

const connectionOptions = {
    serverSelectionTimeoutMS: 30000,  // Timeout for selecting the server
    socketTimeoutMS: 30000,          // Timeout for socket connection
    bufferCommands: false,           // Disable command buffering
};

// Connect to MongoDB using mongoose
async function connectDB() {
    try {
        await mongoose.connect(uri, connectionOptions);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);  // Exit if connection fails
    }
}

connectDB();

module.exports = connectDB;
