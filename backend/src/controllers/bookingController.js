const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const {
      serviceId,
      date,
      startTime,
      endTime,
      notes,
      location
    } = req.body;

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Validate that the provider is active
    const provider = await User.findById(service.provider);
    if (!provider || !provider.isActive) {
      return res.status(400).json({ message: 'Service provider is unavailable' });
    }

    // Calculate total price (can add additional logic for discounts, etc.)
    const totalPrice = service.price;

    // Create the booking
    const booking = await Booking.create({
      service: serviceId,
      customer: req.user.id,
      provider: service.provider,
      date,
      startTime,
      endTime,
      totalPrice,
      notes,
      location
    });

    // Populate service and provider details for the response
    await booking.populate([
      { path: 'service', select: 'name price duration' },
      { path: 'provider', select: 'name email' }
    ]);

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error while creating booking' });
  }
};

// Get bookings for the logged-in user (customer or provider)
exports.getMyBookings = async (req, res) => {
  try {
    let bookings;
    const { status, role } = req.query;

    // Build query based on user role and status filter
    const query = {};
    
    // Filter by status if provided
    if (status && ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'].includes(status)) {
      query.status = status;
    }

    // If user is a customer, show their bookings
    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    } 
    // If user is a provider, show bookings assigned to them
    else if (req.user.role === 'provider') {
      query.provider = req.user.id;
    }

    // Get bookings with populated service and customer/provider details
    bookings = await Booking.find(query)
      .populate('service', 'name price duration')
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .sort({ date: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error while fetching bookings' });
  }
};

// Get a single booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service', 'name price duration category')
      .populate('customer', 'name email phone')
      .populate('provider', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ensure the user is either the customer, provider, or admin
    if (
      booking.customer._id.toString() !== req.user.id &&
      booking.provider._id.toString() !== req.user.id && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error while fetching booking' });
  }
};

// Update booking status (confirm, complete, cancel, reschedule)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    
    if (!['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization based on the action
    // Providers can confirm, complete bookings
    // Customers can cancel bookings
    // Both can reschedule
    let authorized = false;
    
    if (status === 'confirmed' || status === 'completed') {
      authorized = booking.provider.toString() === req.user.id || req.user.role === 'admin';
    } else if (status === 'cancelled') {
      authorized = booking.customer.toString() === req.user.id || 
                  booking.provider.toString() === req.user.id || 
                  req.user.role === 'admin';
      
      // Add cancellation reason if provided
      if (reason) {
        booking.cancellationReason = reason;
      }
    } else if (status === 'rescheduled') {
      authorized = booking.customer.toString() === req.user.id || 
                  booking.provider.toString() === req.user.id || 
                  req.user.role === 'admin';
    }

    if (!authorized) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    booking.status = status;
    await booking.save();

    res.json(booking);
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error while updating booking' });
  }
};

// Add a rating to a completed booking
exports.addRating = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only the customer can add a rating
    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the customer can add a rating' });
    }

    // Can only rate completed bookings
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed bookings' });
    }

    // Add the rating
    booking.rating = {
      value: rating,
      comment,
      createdAt: new Date()
    };
    
    await booking.save();
    
    // Update the service's average rating
    const service = await Service.findById(booking.service);
    
    if (service) {
      // Calculate new average rating
      const bookings = await Booking.find({ 
        service: service._id,
        'rating.value': { $exists: true }
      });
      
      const totalRatings = bookings.length;
      const ratingSum = bookings.reduce((sum, b) => sum + b.rating.value, 0);
      const averageRating = totalRatings > 0 ? ratingSum / totalRatings : 0;
      
      // Update service rating
      service.rating = {
        average: averageRating,
        count: totalRatings
      };
      
      await service.save();
    }

    res.json(booking);
  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({ message: 'Server error while adding rating' });
  }
};
