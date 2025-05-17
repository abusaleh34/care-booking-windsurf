const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  transactionId: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'cash', 'other'],
    default: 'credit_card'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  commissionAmount: {
    type: Number,
    required: true
  },
  providerAmount: {
    type: Number,
    required: true
  },
  refund: {
    refundId: String,
    amount: Number,
    reason: String,
    date: Date
  },
  paymentDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for common queries
paymentSchema.index({ customer: 1 });
paymentSchema.index({ provider: 1 });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
