const Chat = require('../models/Chat');
const User = require('../models/User');
const Booking = require('../models/Booking');

// Get all chats for the current user
exports.getUserChats = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Find all chats where the user is a participant
    const chats = await Chat.find({
      participants: req.user.id,
      isActive: true
    })
      .populate('participants', 'name email profileImage')
      .populate('booking', 'service date startTime endTime')
      .sort({ updatedAt: -1 });
    
    res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Server error while fetching chats' });
  }
};

// Get a single chat by ID
exports.getChatById = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'name email profileImage')
      .populate('booking', 'service date startTime endTime');
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Check if user is a participant in this chat
    if (!chat.participants.some(p => p._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view this chat' });
    }
    
    // Mark all messages as read for this user
    chat.messages.forEach(message => {
      if (message.sender.toString() !== req.user.id && !message.read) {
        message.read = true;
      }
    });
    
    // Reset unread count
    chat.unreadCount = 0;
    await chat.save();
    
    res.json(chat);
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ message: 'Server error while fetching chat' });
  }
};

// Create a new chat
exports.createChat = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { participantId, bookingId } = req.body;
    
    // Validate participant
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }
    
    // If booking ID is provided, validate the booking
    let booking = null;
    if (bookingId) {
      booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      // Check if the user is associated with this booking
      const isCustomer = booking.customer.toString() === req.user.id;
      const isProvider = booking.provider.toString() === req.user.id;
      
      if (!isCustomer && !isProvider) {
        return res.status(403).json({ message: 'Not authorized to create a chat for this booking' });
      }
      
      // Check if a chat already exists for this booking
      const existingChat = await Chat.findOne({ booking: bookingId });
      if (existingChat) {
        return res.status(400).json({ 
          message: 'A chat already exists for this booking',
          chatId: existingChat._id
        });
      }
    }
    
    // Create the chat
    const chat = await Chat.create({
      participants: [req.user.id, participantId],
      booking: bookingId,
      messages: [],
      isActive: true
    });
    
    // Populate the chat with participant details
    await chat.populate('participants', 'name email profileImage');
    if (bookingId) {
      await chat.populate('booking', 'service date startTime endTime');
    }
    
    res.status(201).json(chat);
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ message: 'Server error while creating chat' });
  }
};

// Add a message to a chat
exports.addMessage = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'name email profileImage');
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Check if user is a participant in this chat
    if (!chat.participants.some(p => p._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }
    
    // Create a new message
    const newMessage = {
      sender: req.user.id,
      content,
      timestamp: new Date(),
      read: false
    };
    
    // Add message to chat
    chat.messages.push(newMessage);
    
    // Update last message
    chat.lastMessage = {
      content,
      sender: req.user.id,
      timestamp: new Date()
    };
    
    // Increment unread count
    chat.unreadCount += 1;
    
    await chat.save();
    
    // Get the latest message
    const latestMessage = chat.messages[chat.messages.length - 1];
    
    res.status(201).json(latestMessage);
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ message: 'Server error while adding message' });
  }
};

// Mark all messages in a chat as read
exports.markAsRead = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const chat = await Chat.findById(req.params.id);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Check if user is a participant in this chat
    if (!chat.participants.some(p => p.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized for this chat' });
    }
    
    // Mark messages from other participants as read
    let updated = false;
    chat.messages.forEach(message => {
      if (message.sender.toString() !== req.user.id && !message.read) {
        message.read = true;
        updated = true;
      }
    });
    
    if (updated) {
      chat.unreadCount = 0;
      await chat.save();
    }
    
    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error while marking messages as read' });
  }
};
