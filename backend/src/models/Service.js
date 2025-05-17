const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['medical', 'wellness', 'homecare', 'therapy', 'other'] // Example categories
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
    min: 15
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    address: String,
    city: String,
    region: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  availability: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    slots: [{
      startTime: String, // Format: "HH:MM"
      endTime: String,   // Format: "HH:MM"
      available: {
        type: Boolean,
        default: true
      }
    }]
  }],
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  images: [String], // URLs to service images
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add text index for search functionality
serviceSchema.index({ 
  name: 'text', 
  description: 'text',
  'location.city': 'text'
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
