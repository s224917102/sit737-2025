const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: false,
    trim: true
  },
  email: {
    type: String,
    required: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Basic email validation regex
  },
  phone: {
    type: String,
    required: true,
    match: /^[0-9]{7,15}$/ // Validation for phone numbers with 7 to 15 digits
  },
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true
  },
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guide',
    required: false // Optional, as not all treks may require a guide
  },
  trekId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrekDestination',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  numberOfPeople: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'completed'],
    default: 'pending'
  },
  paymentDetails: {
    amountPaid: {
      type: Number,
      default: 0
    },
    transactionIds: [String]
  }
}, {
  timestamps: true
});

// Add index for faster queries
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ agencyId: 1, status: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;