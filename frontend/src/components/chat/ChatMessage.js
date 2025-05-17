import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { format } from 'date-fns';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';

const ChatMessage = ({ 
  message, 
  isCurrentUser, 
  sender,
  timestamp,
  read = false,
  avatar
}) => {
  const formatTime = (timestamp) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
        mb: 2
      }}
    >
      {!isCurrentUser && (
        <Avatar
          alt={sender?.name || 'User'}
          src={sender?.profileImage || avatar}
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
          {message}
        </Typography>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-end',
            mt: 0.5
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              color: isCurrentUser ? 'rgba(255,255,255,0.7)' : 'text.secondary'
            }}
          >
            {formatTime(timestamp)}
          </Typography>
          
          {isCurrentUser && (
            <Box sx={{ ml: 0.5, display: 'flex', alignItems: 'center' }}>
              {read ? (
                <DoneAllIcon sx={{ 
                  fontSize: '0.8rem', 
                  color: isCurrentUser ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                }} />
              ) : (
                <DoneIcon sx={{ 
                  fontSize: '0.8rem', 
                  color: isCurrentUser ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                }} />
              )}
            </Box>
          )}
        </Box>
      </Box>
      
      {isCurrentUser && (
        <Avatar
          alt="You"
          src={sender?.profileImage || avatar}
          sx={{ ml: 1, width: 32, height: 32 }}
        />
      )}
    </Box>
  );
};

export default ChatMessage;
