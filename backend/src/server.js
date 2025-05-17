const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const { connectDB } = require('./config/db');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Root route for API health check
app.get('/', (req, res) => {
  res.json({ message: 'Care Booking API is running' });
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chats', chatRoutes);

// Create HTTP server from Express app
const server = http.createServer(app);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize Socket.io for real-time communication
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow all origins in development
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'] // Enable all transport methods
});

// Handle socket connections
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Authentication middleware for socket
  socket.on('authenticate', async (token) => {
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret');
      
      // Store user ID in socket object
      socket.userId = decoded.id;
      
      // Join a personal room for this user
      socket.join(`user_${decoded.id}`);
      
      console.log(`User ${decoded.id} authenticated on socket`);
      
      // Acknowledge successful authentication
      socket.emit('authenticated', { success: true });
    } catch (error) {
      console.error('Socket authentication error:', error);
      socket.emit('authenticated', { success: false, error: 'Authentication failed' });
    }
  });
  
  // Join a chat room
  socket.on('join_chat', (chatId) => {
    if (!socket.userId) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }
    
    socket.join(`chat_${chatId}`);
    console.log(`User ${socket.userId} joined chat ${chatId}`);
  });
  
  // Leave a chat room
  socket.on('leave_chat', (chatId) => {
    socket.leave(`chat_${chatId}`);
    console.log(`User ${socket.userId} left chat ${chatId}`);
  });
  
  // New message event
  socket.on('send_message', async (data) => {
    try {
      const { chatId, content } = data;
      
      if (!socket.userId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }
      
      // Store the message in the database
      const Chat = require('./models/Chat');
      const chat = await Chat.findById(chatId);
      
      if (!chat) {
        socket.emit('error', { message: 'Chat not found' });
        return;
      }
      
      // Check if user is a participant
      if (!chat.participants.includes(socket.userId)) {
        socket.emit('error', { message: 'Not authorized to send messages in this chat' });
        return;
      }
      
      // Create the message
      const newMessage = {
        sender: socket.userId,
        content,
        timestamp: new Date(),
        read: false
      };
      
      // Add message to chat
      chat.messages.push(newMessage);
      
      // Update last message
      chat.lastMessage = {
        content,
        sender: socket.userId,
        timestamp: new Date()
      };
      
      // Increment unread count
      chat.unreadCount += 1;
      
      await chat.save();
      
      // Get the new message with its ID
      const message = chat.messages[chat.messages.length - 1];
      
      // Broadcast the message to all users in the chat room
      io.to(`chat_${chatId}`).emit('new_message', {
        chatId,
        message: {
          _id: message._id,
          sender: socket.userId,
          content,
          timestamp: message.timestamp,
          read: message.read
        }
      });
      
      // Also notify all participants who are not in the chat room
      chat.participants.forEach(participantId => {
        if (participantId.toString() !== socket.userId) {
          io.to(`user_${participantId}`).emit('chat_update', {
            chatId,
            lastMessage: {
              content,
              sender: socket.userId,
              timestamp: new Date()
            }
          });
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  // User typing event
  socket.on('typing', (chatId) => {
    if (!socket.userId) return;
    
    // Broadcast to everyone in the chat except the sender
    socket.to(`chat_${chatId}`).emit('user_typing', {
      chatId,
      userId: socket.userId
    });
  });
  
  // User stopped typing event
  socket.on('stop_typing', (chatId) => {
    if (!socket.userId) return;
    
    socket.to(`chat_${chatId}`).emit('user_stop_typing', {
      chatId,
      userId: socket.userId
    });
  });
  
  // Read receipts
  socket.on('mark_read', async (chatId) => {
    try {
      if (!socket.userId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }
      
      const Chat = require('./models/Chat');
      const chat = await Chat.findById(chatId);
      
      if (!chat) {
        socket.emit('error', { message: 'Chat not found' });
        return;
      }
      
      // Check if user is a participant
      if (!chat.participants.includes(socket.userId)) {
        socket.emit('error', { message: 'Not authorized for this chat' });
        return;
      }
      
      // Mark messages from other participants as read
      let updated = false;
      chat.messages.forEach(message => {
        if (message.sender.toString() !== socket.userId && !message.read) {
          message.read = true;
          updated = true;
        }
      });
      
      if (updated) {
        // Reset unread count
        chat.unreadCount = 0;
        await chat.save();
        
        // Notify the sender that their messages have been read
        const otherParticipant = chat.participants.find(
          p => p.toString() !== socket.userId
        );
        
        if (otherParticipant) {
          io.to(`user_${otherParticipant}`).emit('messages_read', {
            chatId,
            readBy: socket.userId
          });
        }
        
        // Also update the chat list for this user
        socket.emit('chat_update', {
          chatId,
          unreadCount: 0
        });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
      socket.emit('error', { message: 'Failed to mark messages as read' });
    }
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
  
  // Send notification to specific user
  socket.on('send_notification', async (data) => {
    try {
      const { userId, notificationType, content, entityId } = data;
      
      if (!socket.userId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }
      
      // Send notification to specific user
      io.to(`user_${userId}`).emit('notification', {
        type: notificationType,
        content,
        entityId,
        sender: socket.userId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      socket.emit('error', { message: 'Failed to send notification' });
    }
  });
  
  // User online status management
  socket.on('set_status', async (status) => {
    if (!socket.userId) return;
    
    const User = require('./models/User');
    try {
      // Update user status in the database
      await User.findByIdAndUpdate(socket.userId, {
        online: status === 'online',
        lastSeen: status === 'offline' ? new Date() : undefined
      });
      
      // Broadcast status change to all users who might be chatting with this user
      socket.broadcast.emit('user_status_change', {
        userId: socket.userId,
        status: status,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  });
});

// Connect to MongoDB (in-memory or external)
connectDB()
  .then(() => {
    console.log('Database connection established');
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });

// Export for use in index.js
module.exports = { app, server, io };
