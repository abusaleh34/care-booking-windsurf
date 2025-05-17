import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { BookingContext } from '../../context/BookingContext';
import { styled } from '@mui/material/styles';
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Rating
} from '@mui/material';
import { format } from 'date-fns';

// Create super stable components with no transitions or animations
const StableContainer = styled('div')({
  transform: 'translateZ(0)',
  position: 'static',
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  minHeight: '500px'
});

const StableButton = styled(Button)({
  transition: 'none !important',
  animation: 'none !important',
  transform: 'translateZ(0)',
  willChange: 'transform'
});

const StableCard = styled(Paper)({
  transform: 'translateZ(0)',
  willChange: 'transform',
  transition: 'none !important',
  animation: 'none !important',
  position: 'static'
});

const StableChip = styled(Chip)({
  transition: 'none !important',
  animation: 'none !important'
});

// Main component with maximum stability optimizations
const MyBookings = memo(() => {
  const navigate = useNavigate();
  const {
    bookings = [],
    fetchMyBookings,
    updateBookingStatus,
    addBookingRating,
    loading,
    error
  } = useContext(BookingContext);

  // Local UI state
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  // Tab configuration
  const tabs = [
    { label: 'All', value: '' },
    { label: 'Upcoming', value: 'pending,confirmed' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  // Load bookings only once on mount
  useEffect(() => {
    fetchMyBookings().catch(err => console.error('Error loading bookings:', err));
  }, [fetchMyBookings]);

  // Static filtering function
  const getFilteredBookings = useCallback(() => {
    if (!bookings || bookings.length === 0) return [];
    if (selectedTab === 0) return bookings;
    
    const statusFilters = tabs[selectedTab].value.split(',');
    return bookings.filter(booking => statusFilters.includes(booking.status));
  }, [bookings, selectedTab, tabs]);

  // Event handlers with useCallback
  const handleSelectTab = useCallback((tabIndex) => {
    setSelectedTab(tabIndex);
  }, []);

  const handleViewBooking = useCallback((bookingId) => {
    navigate(`/bookings/${bookingId}`);
  }, [navigate]);

  const handleRetry = useCallback(() => {
    fetchMyBookings().catch(err => console.error('Retry failed:', err));
  }, [fetchMyBookings]);

  const handleCancelBooking = useCallback((booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  }, []);

  const confirmCancelBooking = useCallback(async () => {
    if (!selectedBooking) return;
    
    try {
      await updateBookingStatus(
        selectedBooking._id,
        'cancelled',
        cancellationReason
      );
      setCancelDialogOpen(false);
      setCancellationReason('');
      setSelectedBooking(null);
      fetchMyBookings();
    } catch (err) {
      console.error('Error cancelling booking:', err);
    }
  }, [updateBookingStatus, selectedBooking, cancellationReason, fetchMyBookings]);

  const handleRateBooking = useCallback((booking) => {
    setSelectedBooking(booking);
    setRatingDialogOpen(true);
  }, []);

  const submitRating = useCallback(async () => {
    if (!selectedBooking) return;
    
    try {
      await addBookingRating(
        selectedBooking._id,
        rating,
        ratingComment
      );
      setRatingDialogOpen(false);
      setRating(5);
      setRatingComment('');
      setSelectedBooking(null);
      fetchMyBookings();
    } catch (err) {
      console.error('Error submitting rating:', err);
    }
  }, [addBookingRating, selectedBooking, rating, ratingComment, fetchMyBookings]);

  // Helper functions
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  }, []);

  // Filtered bookings
  const filteredBookings = getFilteredBookings();
  
  return (
    <StableContainer>
      <Box sx={{ py: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium' }}>
          My Bookings
        </Typography>
        
        {/* Error state */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <StableButton color="inherit" size="small" onClick={handleRetry}>
                Retry
              </StableButton>
            }
          >
            {error}
          </Alert>
        )}
        
        {/* Tab buttons */}
        <Box 
          sx={{ 
            display: 'flex', 
            mb: 3,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          {tabs.map((tab, index) => (
            <StableButton
              key={index}
              variant={selectedTab === index ? "contained" : "text"}
              onClick={() => handleSelectTab(index)}
              sx={{
                minWidth: 100,
                py: 1.5,
                borderRadius: 0,
                borderBottom: selectedTab === index ? '2px solid' : 'none',
                borderColor: 'primary.main',
                color: selectedTab === index ? 'primary.main' : 'text.primary',
                backgroundColor: selectedTab === index ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                '&:hover': {
                  backgroundColor: selectedTab === index ? 'rgba(25, 118, 210, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                  transition: 'none'
                }
              }}
            >
              {tab.label}
            </StableButton>
          ))}
        </Box>
        
        {/* Loading state */}
        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress disableShrink />
          </Box>
        )}
        
        {/* Empty state */}
        {!loading && !error && filteredBookings.length === 0 && (
          <StableCard elevation={2} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No bookings found
            </Typography>
            <StableButton
              variant="contained"
              color="primary"
              onClick={() => navigate('/services')}
              sx={{ mt: 2 }}
            >
              Browse Services
            </StableButton>
          </StableCard>
        )}
        
        {/* Bookings list */}
        {!loading && !error && filteredBookings.length > 0 && (
          <StableCard elevation={2}>
            <List disablePadding>
              {filteredBookings.map((booking, index) => (
                <React.Fragment key={booking._id || index}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem 
                    alignItems="flex-start" 
                    sx={{ 
                      py: 2,
                      transition: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.01)',
                        transition: 'none'
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" component="span">
                          {booking.service?.name || 'Unnamed Service'}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" component="span">
                            Date: {formatDate(booking.date)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                            <StableChip 
                              label={booking.status} 
                              color={getStatusColor(booking.status)} 
                              size="small" 
                              variant="outlined"
                            />
                            {booking.provider && (
                              <Typography variant="body2" color="text.secondary" component="span">
                                Provider: {booking.provider.name}
                              </Typography>
                            )}
                          </Box>
                          
                          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            <StableButton
                              variant="outlined"
                              size="small"
                              onClick={() => handleViewBooking(booking._id)}
                            >
                              View Details
                            </StableButton>
                            
                            {booking.status === 'pending' && (
                              <StableButton
                                variant="outlined"
                                size="small"
                                color="error"
                                onClick={() => handleCancelBooking(booking)}
                              >
                                Cancel
                              </StableButton>
                            )}
                            
                            {booking.status === 'completed' && !booking.rating && (
                              <StableButton
                                variant="outlined"
                                size="small"
                                color="primary"
                                onClick={() => handleRateBooking(booking)}
                              >
                                Rate Service
                              </StableButton>
                            )}
                            
                            {booking.rating && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <Typography variant="body2" color="text.secondary" component="span" sx={{ mr: 1 }}>
                                  Your rating:
                                </Typography>
                                <Rating value={booking.rating.value} readOnly size="small" />
                              </Box>
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </StableCard>
        )}
        
        {/* Cancellation Dialog */}
        <Dialog 
          open={cancelDialogOpen} 
          onClose={() => setCancelDialogOpen(false)}
          TransitionProps={{ style: { transition: 'none' } }}
        >
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Reason for cancellation (optional)"
              fullWidth
              multiline
              rows={3}
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialogOpen(false)}>
              Back
            </Button>
            <Button onClick={confirmCancelBooking} color="error" variant="contained">
              Confirm Cancellation
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Rating Dialog */}
        <Dialog 
          open={ratingDialogOpen} 
          onClose={() => setRatingDialogOpen(false)}
          TransitionProps={{ style: { transition: 'none' } }}
        >
          <DialogTitle>Rate Your Experience</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please rate your experience with this service.
            </DialogContentText>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
              <Rating
                name="rating"
                value={rating}
                onChange={(event, newValue) => {
                  setRating(newValue);
                }}
                size="large"
              />
            </Box>
            <TextField
              margin="dense"
              label="Comments (optional)"
              fullWidth
              multiline
              rows={3}
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRatingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitRating} color="primary" variant="contained">
              Submit Rating
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </StableContainer>
  );
});

// Add display name for debugging
MyBookings.displayName = 'StableMyBookings';

export default MyBookings;
