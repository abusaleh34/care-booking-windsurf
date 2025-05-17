import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Snackbar, 
  Button, 
  Box, 
  Typography, 
  Avatar 
} from '@mui/material';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';

const ChatNotification = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { newMessageNotification, clearNewMessageNotification } = useContext(ChatContext);
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    if (newMessageNotification) {
      setOpen(true);
    }
  }, [newMessageNotification]);
  
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    
    setOpen(false);
    clearNewMessageNotification();
  };
  
  const handleViewMessage = () => {
    if (newMessageNotification && newMessageNotification.chatId) {
      navigate(`/chats/${newMessageNotification.chatId}`);
    }
    handleClose();
  };
  
  if (!newMessageNotification) {
    return null;
  }
  
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      message={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            alt={newMessageNotification.sender?.name || 'User'}
            src={newMessageNotification.sender?.profileImage}
            sx={{ width: 32, height: 32, mr: 1 }}
          />
          <Box>
            <Typography variant="subtitle2">
              {newMessageNotification.sender?.name || 'User'}
            </Typography>
            <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {newMessageNotification.message}
            </Typography>
          </Box>
        </Box>
      }
      action={
        <Button color="primary" size="small" onClick={handleViewMessage}>
          View
        </Button>
      }
    />
  );
};

export default ChatNotification;
