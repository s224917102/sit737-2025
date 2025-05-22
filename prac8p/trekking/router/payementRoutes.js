const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');

const { 
    createPaymentIntent,
    updateBooking,
    handleWebhook
} = require('../controller/paymentController');

const router = express.Router();

router.post
('/confirm-payement', protect, createPaymentIntent);

router.post
('/:bookingId/confirm-payement', protect, updateBooking);

router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;