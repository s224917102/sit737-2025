const asyncHandler = require('express-async-handler');
const Stripe = require('stripe');
const Booking = require('../model/bookingModel');

console.log('Request received in createPaymentIntent');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create payment intent
// @route   POST /api/payements/confirm-payement
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
  console.log('Request received in createPaymentIntent');
  const { bookingId } = req.body;
  console.log(bookingId);
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(304);
    throw new Error('Booking not found');
  }

  // Create payment intent with the booking amount
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(booking.totalPrice * 100), // Convert to cents
    currency: 'usd',
    metadata: {
      bookingId: booking._id.toString(),
      userId: req.user._id.toString()
    }
  });

  res.json({
    clientSecret: paymentIntent.client_secret
  });
});

// @desc    Webhook handler for Stripe events
// @route   POST /api/payements/webhook
// @access  Public
const handleWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle successful payment
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const bookingId = paymentIntent.metadata.bookingId;

    // Update booking payment status
    const booking = await Booking.findById(bookingId);
    if (booking) {
      booking.paymentStatus = 'completed';
      booking.paymentDetails = {
        amountPaid: paymentIntent.amount / 100,
        transactionIds: [paymentIntent.id]
      };
      booking.status = 'confirmed';
      await booking.save();
    }
  }

  res.json({ received: true });
});


const updateBooking = asyncHandler(async (req, res) => {
  const { transactionId } = req.body;
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
  }

  // Update the booking status and payment details
  booking.paymentStatus = 'completed';
  booking.paymentDetails = { transactionId };
  booking.status = 'confirmed';

  await booking.save();

  res.status(200).json({
      message: 'Booking confirmed and payment completed.',
  });
});


// Export all functions
module.exports = {
  createPaymentIntent, updateBooking, handleWebhook
};