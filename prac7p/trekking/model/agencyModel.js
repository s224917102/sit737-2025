const mongoose = require('mongoose');

const agencySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true }, // Image URL
    services: { type: [String], required: true }, // Array of services
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Agency = mongoose.model('Agency', agencySchema);

module.exports = Agency;