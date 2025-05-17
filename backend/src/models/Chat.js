const mongoose = require('mongoose');

// Message Schema (nested in Chat)
const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Chat Schema
const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  messages: [messageSchema],
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for efficient querying
chatSchema.index({ participants: 1 });
chatSchema.index({ booking: 1 });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
