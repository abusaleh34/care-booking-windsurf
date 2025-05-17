import React, { useState, useRef } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  CircularProgress, 
  IconButton,
  InputAdornment,
  Paper
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

const ChatInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    try {
      setSending(true);
      await onSendMessage(message);
      setMessage('');
      
      // Focus the input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={message}
            onChange={handleChange}
            disabled={disabled || sending}
            inputRef={inputRef}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '20px' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton color="primary" disabled={disabled || sending}>
                    <EmojiEmotionsIcon />
                  </IconButton>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton color="primary" disabled={disabled || sending}>
                    <AttachFileIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!message.trim() || disabled || sending}
            sx={{ 
              ml: 1,
              borderRadius: '50%', 
              minWidth: '50px', 
              width: '50px', 
              height: '50px', 
              p: 0 
            }}
          >
            {sending ? <CircularProgress size={24} /> : <SendIcon />}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default ChatInput;
