import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Box, Alert, Button, Typography } from '@mui/material';

/**
 * ChatErrorBoundary component
 * 
 * This component provides consistent error handling for chat components.
 * It ensures users are authenticated and gracefully handles network errors.
 */
const ChatErrorBoundary = ({ children, fallbackRoute = '/login' }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    // Handle global errors
    const handleGlobalError = (event) => {
      console.error('Global error caught by ChatErrorBoundary:', event);
      
      // Only handle network errors related to chat functionality
      if (event.message && event.message.includes('network')) {
        setError('Network error occurred. Please check your connection and try again.');
      }
    };

    // Listen for error events
    window.addEventListener('error', handleGlobalError);

    // Check if user is authenticated
    if (!user || !user.token) {
      setError('You must be logged in to access the chat functionality.');
    }

    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, [user, fallbackRoute]);

  // If error occurred, show error UI
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Please log in to continue using the chat feature.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate(`${fallbackRoute}?redirect=${encodeURIComponent(window.location.pathname)}`)}
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  // No error, render children
  return children;
};

export default ChatErrorBoundary;
