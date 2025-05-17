const express = require('express');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  addRating
} = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// All booking routes are protected
router.use(protect);

// Create a new booking
router.post('/', createBooking);

// Get all bookings for the logged-in user
router.get('/me', getMyBookings);

// Get, update, and rate a specific booking
router.get('/:id', getBookingById);
router.put('/:id/status', updateBookingStatus);
router.post('/:id/rating', addRating);

module.exports = router;
