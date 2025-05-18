const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const User = require('../models/User');
const paymentService = require('../services/paymentService');
const { getCommissionRate } = require('../config/commission');

// Process payment for a booking
exports.processPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, cardInfo } = req.body;
    
    // Find the booking
    const booking = await Booking.findById(bookingId)
      .populate('service')
      .populate('provider');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Ensure the logged-in user is the customer for this booking
    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to make this payment' });
    }
    
    // Check if booking is already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'This booking has already been paid for' });
    }
    
    // Calculate commission based on service category
    const commissionRate = getCommissionRate(booking.service.category);
    const commissionAmount = booking.totalPrice * commissionRate;
    const providerAmount = booking.totalPrice - commissionAmount;
    
    // Process payment through the payment service
    try {
      const paymentResult = await paymentService.processPayment({
        amount: booking.totalPrice,
        currency: 'USD', // Default currency
        cardInfo,
        customerId: req.user.id
      });
      
      // Create payment record
      const payment = await Payment.create({
        booking: bookingId,
        customer: req.user.id,
        provider: booking.provider._id,
        amount: booking.totalPrice,
        currency: 'USD',
        transactionId: paymentResult.transactionId,
        paymentMethod,
        status: 'completed',
        commissionAmount,
        providerAmount,
        paymentDate: new Date()
      });
      
      // Update booking payment status
      booking.paymentStatus = 'paid';
      await booking.save();
      
      res.json({
        success: true,
        payment,
        message: 'Payment processed successfully'
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ message: 'Server error during payment processing' });
  }
};

// Get payment details
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking')
      .populate('customer', 'name email')
      .populate('provider', 'name email');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check authorization
    if (
      payment.customer._id.toString() !== req.user.id && 
      payment.provider._id.toString() !== req.user.id && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this payment' });
    }
    
    res.json(payment);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Server error while fetching payment' });
  }
};

// Get user's payments (customer or provider)
exports.getUserPayments = async (req, res) => {
  try {
    const query = {};
    
    // Get payments based on user role
    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    } else if (req.user.role === 'provider') {
      query.provider = req.user.id;
    } else if (req.user.role === 'admin') {
      // Admin can see all payments, so no filter needed
    } else {
      return res.status(403).json({ message: 'Not authorized to view payments' });
    }
    
    const payments = await Payment.find(query)
      .populate('booking', 'date startTime endTime')
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error while fetching payments' });
  }
};

// Process refund (admin only)
exports.processRefund = async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;
    
    // Only admin can process refunds
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to process refunds' });
    }
    
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    if (payment.status === 'refunded') {
      return res.status(400).json({ message: 'This payment has already been refunded' });
    }
    
    // Process refund through the payment service
    try {
      const refundResult = await paymentService.processRefund({
        transactionId: payment.transactionId,
        amount: amount || payment.amount, // Full refund if amount not provided
        reason
      });
      
      // Update payment with refund information
      payment.status = 'refunded';
      payment.refund = {
        refundId: refundResult.refundId,
        amount: amount || payment.amount,
        reason,
        date: new Date()
      };
      await payment.save();
      
      // Find and update the booking
      const booking = await Booking.findById(payment.booking);
      if (booking) {
        booking.paymentStatus = 'refunded';
        await booking.save();
      }
      
      res.json({
        success: true,
        payment,
        message: 'Refund processed successfully'
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({ message: 'Server error during refund processing' });
  }
};
