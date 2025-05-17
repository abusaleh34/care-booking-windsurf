const express = require('express');
const {
  processPayment,
  getPaymentById,
  getUserPayments,
  processRefund
} = require('../controllers/paymentController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// All payment routes require authentication
router.use(protect);

// Process a payment
router.post('/process', processPayment);

// Get user's payments
router.get('/me', getUserPayments);

// Get a specific payment
router.get('/:id', getPaymentById);

// Process a refund (admin only)
router.post('/refund', restrictTo('admin'), processRefund);

module.exports = router;
