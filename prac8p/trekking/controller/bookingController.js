const asyncHandler = require('express-async-handler');
const Agency = require('../model/agencyModel');
const Booking = require('../model/bookingModel');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  const {
    fullName,
    agencyId,
    trekId,
    startDate,
    endDate,
    numberOfPeople,
    email,
    phone
  } = req.body;

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start < new Date()) {
    res.status(400);
    throw new Error('Start date cannot be in the past');
  }

  if (end <= start) {
    res.status(400);
    throw new Error('End date must be after start date');
  }

  // Check agency availability
  const agencyBookings = await Booking.find({
    agencyId,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      { startDate: { $lte: end }, endDate: { $gte: start } }
    ]
  });

  if (agencyBookings.length > 0) {
    res.status(400);
    throw new Error('Agency is not available for selected dates');
  }

  // // If guide is selected, check guide availability
  // if (guideId) {
  //   const guideBookings = await Booking.find({
  //     guideId,
  //     status: { $in: ['pending', 'confirmed'] },
  //     $or: [
  //       { startDate: { $lte: end }, endDate: { $gte: start } }
  //     ]
  //   });

  //   if (guideBookings.length > 0) {
  //     res.status(400);
  //     throw new Error('Guide is not available for selected dates');
  //   }
  // }

  // Calculate total price (example calculation)
  const agency = await Agency.findById(agencyId);
  const basePrice = agency.pricePerDay || 100; // Default price if not set
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const totalPrice = basePrice * days * numberOfPeople;

  const booking = new Booking({
    userId: req.user._id,
    fullName,
    agencyId,
    trekId,
    startDate,
    endDate,
    numberOfPeople,
    totalPrice,
    email,
    phone
  });

  const createdBooking = await booking.save();
  res.status(201).json(createdBooking);
});

// @desc    Get user bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .populate('agencyId', 'name email phone')
    .populate('guideId', 'name phone')
    .populate('trekId', 'name description')
    .sort('-createdAt');

  res.json(bookings);
});

// @desc    Get agency bookings
// @route   GET /api/bookings/agency
// @access  Private/Agency
const getAgencyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ agencyId: req.agency._id })
    .populate('userId', 'name email')
    .populate('guideId', 'name phone')
    .populate('trekId', 'name description')
    .sort('-createdAt');

  res.json(bookings);
});

// @desc    Get all bookings (for admin)
// @route   GET /api/bookings/all
// @access  Private/Admin
const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .populate('userId', 'fullName email')      // Populate user details
    .populate('trekId', 'name description')  // Populate trek details
    .populate('agencyId', 'name')           // Populate agency details
    .sort('-createdAt');
  res.status(200).json(bookings);
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Agency
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Only agency can update status
  if (booking.agencyId.toString() !== req.agency._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  booking.status = status;
  const updatedBooking = await booking.save();
  res.json(updatedBooking);
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Only booking user or agency can cancel
  if (booking.userId.toString() !== req.user._id.toString() &&
    booking.agencyId.toString() !== req.agency?._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Check if booking can be cancelled (e.g., not too close to start date)
  const startDate = new Date(booking.startDate);
  const now = new Date();
  const daysUntilStart = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));

  if (daysUntilStart < 2) { // 48 hours cancellation policy
    res.status(400);
    throw new Error('Cannot cancel booking less than 48 hours before start');
  }

  booking.status = 'cancelled';
  const updatedBooking = await booking.save();
  res.json(updatedBooking);
});





// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private/Admin
const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  res.status(200).json({ message: 'Booking deleted successfully' });
});









module.exports = {
  createBooking,
  getMyBookings,
  getAgencyBookings,
  updateBookingStatus,
  cancelBooking,
  getAllBookings,
  deleteBooking,
};