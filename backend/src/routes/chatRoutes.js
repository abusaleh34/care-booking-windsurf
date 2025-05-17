const express = require('express');
const {
  getUserChats,
  getChatById,
  createChat,
  addMessage,
  markAsRead
} = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// All chat routes require authentication
router.use(protect);

// Get user's chats
router.get('/me', getUserChats);

// Get a specific chat
router.get('/:id', getChatById);

// Create a new chat
router.post('/', createChat);

// Add a message to a chat
router.post('/:id/messages', addMessage);

// Mark messages as read
router.put('/:id/read', markAsRead);

module.exports = router;
