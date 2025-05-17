import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  List, 
  ListItem, 
  ListItemAvatar,
  ListItemText, 
  Avatar, 
  Divider, 
  Button, 
  CircularProgress, 
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import { BOOKING_ENDPOINTS, USER_ENDPOINTS } from '../../utils/api';
import axios from 'axios';

const NewChat = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { createChat, loading, error } = useContext(ChatContext);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [fetchingBookings, setFetchingBookings] = useState(false);
  
  // Fetch recent bookings on component mount
  useEffect(() => {
    if (user && user.token) {
      fetchRecentBookings().catch(error => {
        console.error('Error fetching bookings:', error);
        if (error.response && error.response.status === 401) {
          // Redirect to login if unauthorized
          navigate('/login?redirect=/chats/new');
        }
      });
    }
  }, [user, navigate]);
  
  // Fetch the user's recent bookings to suggest chat participants
  const fetchRecentBookings = async () => {
    try {
      setFetchingBookings(true);
      
      if (!user || !user.token) {
        throw new Error('You must be logged in');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      const response = await axios.get(
        BOOKING_ENDPOINTS.LIST_MY,
        config
      );
      
      // Filter out duplicates based on the other participant (provider or customer)
      const bookings = response.data;
      const uniqueParticipants = [];
      const seen = new Set();
      
      bookings.forEach(booking => {
        const participantId = user.role === 'customer' 
          ? booking.service.provider._id 
          : booking.customer._id;
          
        if (!seen.has(participantId)) {
          seen.add(participantId);
          uniqueParticipants.push(booking);
        }
      });
      
      setRecentBookings(uniqueParticipants.slice(0, 5)); // Limit to 5 recent bookings
      
    } catch (error) {
      console.error('Error fetching recent bookings:', error);
    } finally {
      setFetchingBookings(false);
    }
  };
  
  // Search for users
  const searchUsers = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setSearching(true);
      setSearchError(null);
      
      if (!user || !user.token) {
        throw new Error('You must be logged in to search users');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      const response = await axios.get(
        USER_ENDPOINTS.SEARCH(searchTerm),
        config
      );
      
      // Filter out current user from results
      const filteredResults = response.data.filter(u => u._id !== user.id);
      setSearchResults(filteredResults);
      
    } catch (error) {
      setSearchError(
        error.response?.data?.message || 
        'Error searching for users. Please try again.'
      );
    } finally {
      setSearching(false);
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchUsers();
  };
  
  // Start a new chat with a user
  const handleStartChat = async (participantId, bookingId = null) => {
    try {
      const chat = await createChat(participantId, bookingId);
      navigate(`/chats/${chat._id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };
  
  // Go back to chat list
  const handleBack = () => {
    navigate('/chats');
  };
  
  // Get participant info from booking based on user role
  const getParticipantFromBooking = (booking) => {
    return user.role === 'customer' 
      ? booking.service.provider 
      : booking.customer;
  };
  
  return (
    <Box sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          New Conversation
        </Typography>
      </Box>
      
      {/* Search */}
      <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
        <form onSubmit={handleSearchSubmit}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for users..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    type="submit"
                    disabled={!searchTerm.trim() || searching}
                  >
                    {searching ? <CircularProgress size={24} /> : <SearchIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </form>
      </Paper>
      
      {/* Search Results */}
      {searchResults.length > 0 && (
        <Paper elevation={3} sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
            Search Results
          </Typography>
          <Divider />
          <List>
            {searchResults.map((result) => (
              <ListItem 
                key={result._id}
                button
                onClick={() => handleStartChat(result._id)}
              >
                <ListItemAvatar>
                  <Avatar 
                    alt={result.name}
                    src={result.profileImage}
                  />
                </ListItemAvatar>
                <ListItemText 
                  primary={result.name}
                  secondary={result.email}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
      
      {searchError && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {searchError}
        </Alert>
      )}
      
      {/* Recent Bookings */}
      <Paper elevation={3}>
        <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
          Recent Contacts
        </Typography>
        <Divider />
        
        {fetchingBookings ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : recentBookings.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No recent contacts found.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Search for users above to start a conversation.
            </Typography>
          </Box>
        ) : (
          <List>
            {recentBookings.map((booking) => {
              const participant = getParticipantFromBooking(booking);
              return (
                <ListItem 
                  key={booking._id}
                  button
                  onClick={() => handleStartChat(participant._id, booking._id)}
                >
                  <ListItemAvatar>
                    <Avatar 
                      alt={participant.name}
                      src={participant.profileImage}
                    />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={participant.name}
                    secondary={`Booking: ${booking.service.title}`}
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default NewChat;
