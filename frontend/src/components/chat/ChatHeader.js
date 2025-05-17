import React from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  IconButton, 
  Paper,
  Badge 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { format } from 'date-fns';

const ChatHeader = ({ chat, otherParticipant, onBack, typing = false }) => {
  if (!chat || !otherParticipant) {
    return null;
  }

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
          color="success"
          invisible={!otherParticipant.online}
        >
          <Avatar 
            alt={otherParticipant.name} 
            src={otherParticipant.profileImage}
            sx={{ width: 48, height: 48, mr: 2 }}
          />
        </Badge>
        
        <Box>
          <Typography variant="h6">
            {otherParticipant.name}
          </Typography>
          
          {typing ? (
            <Typography variant="body2" color="primary.main">
              Typing...
            </Typography>
          ) : chat.booking ? (
            <Typography variant="body2" color="text.secondary">
              Booking: {format(new Date(chat.booking.date), 'PPP')}
            </Typography>
          ) : otherParticipant.online ? (
            <Typography variant="body2" color="text.secondary">
              Online
            </Typography>
          ) : otherParticipant.lastSeen ? (
            <Typography variant="body2" color="text.secondary">
              Last seen {format(new Date(otherParticipant.lastSeen), 'PPP')}
            </Typography>
          ) : null}
        </Box>
      </Box>
      
      <IconButton>
        <MoreVertIcon />
      </IconButton>
    </Paper>
  );
};

export default ChatHeader;
