import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Button,
  Badge,
  CircularProgress,
  Alert
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

const ChatList = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { chats, fetchChats, loading, error } = useContext(ChatContext);
  
  useEffect(() => {
    if (user && user.token) {
      fetchChats().catch(error => {
        console.error('Error fetching chats:', error);
        if (error.response && error.response.status === 401) {
          // Handle authentication errors
          navigate('/login?redirect=/chats');
        }
      });
    }
  }, [fetchChats, user, navigate]);
  
  // Get the other participant in the chat (not the current user)
  const getOtherParticipant = (chat) => {
    return chat.participants.find(p => p._id !== user.id) || {};
  };
  
  const handleChatClick = (chatId) => {
    navigate(`/chats/${chatId}`);
  };
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };
  
  if (loading && chats.length === 0) {
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
  
  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Messages
        </Typography>
        
        <Button 
          variant="contained" 
          onClick={() => navigate('/chats/new')}
        >
          New Message
        </Button>
      </Box>
      
      {chats.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No conversations yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start a new conversation with a service provider or customer
          </Typography>
          <Button 
            variant="outlined"
            onClick={() => navigate('/chats/new')}
          >
            Start a Conversation
          </Button>
        </Paper>
      ) : (
        <Paper elevation={3}>
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {chats.map((chat, index) => {
              const otherParticipant = getOtherParticipant(chat);
              return (
                <React.Fragment key={chat._id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem 
                    alignItems="flex-start" 
                    button 
                    onClick={() => handleChatClick(chat._id)}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        color="error"
                        badgeContent={chat.unreadCount || 0}
                        invisible={!chat.unreadCount}
                      >
                        <Avatar 
                          alt={otherParticipant.name} 
                          src={otherParticipant.profileImage} 
                        />
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          component="span"
                          variant="body1"
                          fontWeight={chat.unreadCount > 0 ? 'bold' : 'normal'}
                        >
                          {otherParticipant.name}
                        </Typography>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                            noWrap
                            maxWidth={250}
                          >
                            {chat.lastMessage?.content || 'No messages yet'}
                          </Typography>
                          {" — "}
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="text.secondary"
                          >
                            {formatTime(chat.lastMessage?.timestamp)}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default ChatList;
