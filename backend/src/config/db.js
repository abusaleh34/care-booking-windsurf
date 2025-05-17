const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

// Connect to MongoDB (production) or in-memory MongoDB (development)
const connectDB = async () => {
  try {
    let dbUrl;
    
    // Check if we're using MongoDB Atlas or another external MongoDB
    if (process.env.MONGODB_URI) {
      dbUrl = process.env.MONGODB_URI;
      console.log('Using external MongoDB instance');
    } else {
      // Create an in-memory MongoDB instance
      mongod = await MongoMemoryServer.create();
      dbUrl = mongod.getUri();
      console.log('Using in-memory MongoDB instance');
    }
    
    const conn = await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for better query performance
    await createIndexes();
    
    // Seed database with initial data if it's empty
    await seedDatabase();
    
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error}`);
    process.exit(1);
  }
};

// Create indexes for better performance
const createIndexes = async () => {
  try {
    const User = require('../models/User');
    const Service = require('../models/Service');
    const Booking = require('../models/Booking');
    const Chat = require('../models/Chat');
    
    // Ensure indexes are created
    await User.createIndexes();
    await Service.createIndexes();
    await Booking.createIndexes();
    await Chat.createIndexes();
    
    console.log('Database indexes created');
  } catch (error) {
    console.error(`Error creating indexes: ${error}`);
  }
};

// Seed the database with initial test data
const seedDatabase = async () => {
  try {
    const User = require('../models/User');
    const Service = require('../models/Service');
    
    // Only seed if no users exist
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already has data, skipping seed');
      return;
    }
    
    // Create test users
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: '$2a$10$c/D.hCiIt15XCp0ATCNs0OeZJqKkN9tnubIyHsOoIsPBHvJSIZO6i', // password123
      role: 'admin',
      phone: '+123456789',
    });
    
    const providerUser = new User({
      name: 'Service Provider',
      email: 'provider@example.com',
      password: '$2a$10$c/D.hCiIt15XCp0ATCNs0OeZJqKkN9tnubIyHsOoIsPBHvJSIZO6i', // password123
      role: 'provider',
      phone: '+1987654321',
    });
    
    const customerUser = new User({
      name: 'Customer User',
      email: 'customer@example.com',
      password: '$2a$10$c/D.hCiIt15XCp0ATCNs0OeZJqKkN9tnubIyHsOoIsPBHvJSIZO6i', // password123
      role: 'customer',
      phone: '+1122334455',
    });
    
    await adminUser.save();
    await providerUser.save();
    await customerUser.save();
    
    // Create test services
    const service1 = new Service({
      name: 'Home Healthcare',
      description: 'Professional healthcare services in the comfort of your home',
      provider: providerUser._id,
      category: 'homecare',
      price: 75,
      duration: 60, // 1 hour
      availability: [
        { 
          day: 'monday', 
          slots: [{
            startTime: '09:00',
            endTime: '17:00',
            available: true
          }]
        },
        { 
          day: 'wednesday', 
          slots: [{
            startTime: '09:00',
            endTime: '17:00',
            available: true
          }]
        },
        { 
          day: 'friday', 
          slots: [{
            startTime: '09:00',
            endTime: '17:00',
            available: true
          }]
        },
      ],
      location: {
        address: '123 Health St',
        city: 'Medical City',
        region: 'MC'
      }
    });
    
    const service2 = new Service({
      name: 'Elder Care Assistance',
      description: 'Compassionate care for elderly family members',
      provider: providerUser._id,
      category: 'homecare',
      price: 65,
      duration: 120, // 2 hours
      availability: [
        { 
          day: 'tuesday', 
          slots: [{
            startTime: '08:00',
            endTime: '18:00',
            available: true
          }]
        },
        { 
          day: 'thursday', 
          slots: [{
            startTime: '08:00',
            endTime: '18:00',
            available: true
          }]
        },
        { 
          day: 'saturday', 
          slots: [{
            startTime: '10:00',
            endTime: '15:00',
            available: true
          }]
        },
      ],
      location: {
        address: '456 Elder Ave',
        city: 'Care City',
        region: 'CC'
      }
    });
    
    const service3 = new Service({
      name: 'Physical Therapy',
      description: 'Specialized physical therapy services for recovery and mobility',
      provider: providerUser._id,
      category: 'therapy',
      price: 90,
      duration: 45, // 45 minutes
      availability: [
        { 
          day: 'monday', 
          slots: [{
            startTime: '10:00',
            endTime: '16:00',
            available: true
          }]
        },
        { 
          day: 'tuesday', 
          slots: [{
            startTime: '10:00',
            endTime: '16:00',
            available: true
          }]
        },
        { 
          day: 'wednesday', 
          slots: [{
            startTime: '10:00',
            endTime: '16:00',
            available: true
          }]
        },
        { 
          day: 'thursday', 
          slots: [{
            startTime: '10:00',
            endTime: '16:00',
            available: true
          }]
        },
        { 
          day: 'friday', 
          slots: [{
            startTime: '10:00',
            endTime: '16:00',
            available: true
          }]
        },
      ],
      location: {
        address: '789 Therapy Blvd',
        city: 'Wellness City',
        region: 'WC'
      }
    });
    
    await service1.save();
    await service2.save();
    await service3.save();
    
    console.log('Database seeded with test data');
  } catch (error) {
    console.error(`Error seeding database: ${error}`);
  }
};

// Disconnect from MongoDB
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error(`MongoDB disconnection error: ${error}`);
  }
};

module.exports = { connectDB, disconnectDB };
