const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['customer', 'provider', 'admin'],
    default: 'customer'
  },
  profileImage: String,
  preferredLanguage: {
    type: String,
    enum: ['en', 'ar'],
    default: 'en'
  },
  // Provider-specific fields
  providerProfile: {
    bio: String,
    specialties: [String],
    experience: Number, // Years of experience
    qualifications: [String],
    workingHours: [{
      day: String,
      from: String,
      to: String
    }]
  },
  // Customer-specific fields
  customerProfile: {
    savedServices: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    }],
    addresses: [{
      title: String,
      address: String,
      city: String,
      isDefault: Boolean
    }]
  },
  isVerified: {
    type: Boolean,
    default: false
  },
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
