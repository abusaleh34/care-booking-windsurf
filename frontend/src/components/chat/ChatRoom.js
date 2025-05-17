import React, { useState, useContext, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
  InputAdornment
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { format } from 'date-fns';

const ChatRoom = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const { user } = useContext(AuthContext);
  const { 
    activeChat, 
    messages, 
    loading, 
    error, 
    getChatById, 
    sendMessage, 
    sendTypingStatus 
  } = useContext(ChatContext);
  
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // Fetch chat when component mounts or chat ID changes
  useEffect(() => {
    if (chatId && user) {
      // Only fetch chat if user is authenticated
      getChatById(chatId).catch(error => {
        console.error('Error fetching chat:', error);
        if (error.response && error.response.status === 401) {
          // If unauthorized, redirect to login
          navigate('/login?redirect=' + encodeURIComponent(`/chats/${chatId}`));
        }
      });
    } else if (!user) {
      // If not authenticated, redirect to login
      navigate('/login?redirect=' + encodeURIComponent(`/chats/${chatId}`));
    }
  }, [chatId, getChatById, user, navigate]);
  
  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Get other participant
  const getOtherParticipant = () => {
    if (!activeChat) return {};
    return activeChat.participants.find(p => p._id !== user.id) || {};
  };
  
  // Format timestamp for messages
  const formatTime = (timestamp) => {
    return format(new Date(timestamp), 'h:mm a');
  };
  
  // Send a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    try {
      setSending(true);
      await sendMessage(chatId, messageText);
      setMessageText('');
      
      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      sendTypingStatus(chatId, false);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };
  
  // Handle typing indicator
  const handleTyping = (e) => {
    setMessageText(e.target.value);
    
    // Send typing status
    sendTypingStatus(chatId, true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set a new timeout to stop typing indicator after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(chatId, false);
    }, 2000);
  };
  
  // Go back to chat list
  const handleBack = () => {
    navigate('/chats');
  };
  
  if (loading && !activeChat) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (!activeChat) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        Chat not found.
      </Alert>
    );
  }
  
  const otherParticipant = getOtherParticipant();
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', my: 4 }}>
      {/* Chat header */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          
          <Avatar 
            alt={otherParticipant.name}
            src={otherParticipant.profileImage}
            sx={{ mr: 2 }}
          />
          
          <Box>
            <Typography variant="h6">
              {otherParticipant.name}
            </Typography>
            {activeChat.booking && (
              <Typography variant="body2" color="text.secondary">
                Booking: {format(new Date(activeChat.booking.date), 'PPP')}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
      
      {/* Messages container */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          mb: 2, 
          flexGrow: 1, 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '100%' 
          }}>
            <Typography variant="body2" color="text.secondary">
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          <>
            {messages.map((message, index) => {
              const isCurrentUser = message.sender === user.id;
              
              return (
                <Box
                  key={message._id || index}
                  sx={{
                    display: 'flex',
                    justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                    mb: 2
                  }}
                >
                  {!isCurrentUser && (
                    <Avatar
                      alt={otherParticipant.name}
                      src={otherParticipant.profileImage}
                      sx={{ mr: 1, width: 32, height: 32 }}
                    />
                  )}
                  
                  <Box
                    sx={{
                      maxWidth: '70%',
                      p: 2,
                      borderRadius: 2,
                      bgcolor: isCurrentUser ? 'primary.main' : 'grey.100',
                      color: isCurrentUser ? 'white' : 'text.primary'
                    }}
                  >
                    <Typography variant="body1">
                      {message.content}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        textAlign: 'right',
                        mt: 0.5,
                        color: isCurrentUser ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                      }}
                    >
                      {formatTime(message.timestamp)}
                      {isCurrentUser && message.read && (
                        <span style={{ marginLeft: '4px' }}>✓</span>
                      )}
                    </Typography>
                  </Box>
                  
                  {isCurrentUser && (
                    <Avatar
                      alt={user.name}
                      sx={{ ml: 1, width: 32, height: 32 }}
                    />
                  )}
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </Paper>
      
      {/* Message input */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <form onSubmit={handleSendMessage}>
          <Box sx={{ display: 'flex' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={messageText}
              onChange={handleTyping}
              disabled={sending}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      type="submit"
                      disabled={!messageText.trim() || sending}
                      color="primary"
                      variant="contained"
                      sx={{ borderRadius: '50%', minWidth: '40px', width: '40px', height: '40px', p: 0 }}
                    >
                      {sending ? <CircularProgress size={24} /> : <SendIcon />}
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ChatRoom;
