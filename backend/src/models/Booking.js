const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
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
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, // Format: "HH:MM"
    required: true
  },
  endTime: {
    type: String, // Format: "HH:MM"
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending'
  },
  totalPrice: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'cash', 'other'],
    default: 'credit_card'
  },
  notes: {
    type: String
  },
  location: {
    address: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  cancellationReason: {
    type: String
  },
  rating: {
    value: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: Date
  }
}, {
  timestamps: true
});

// Create indexes for common queries
bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ provider: 1, status: 1 });
bookingSchema.index({ service: 1 });
bookingSchema.index({ date: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
