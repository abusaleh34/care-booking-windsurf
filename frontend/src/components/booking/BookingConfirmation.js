import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookingContext } from '../../context/BookingContext';
import { AuthContext } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { format } from 'date-fns';

const BookingConfirmation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const { getBookingById, loading, error } = useContext(BookingContext);
  const { user } = useContext(AuthContext);
  const [booking, setBooking] = useState(null);
  
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await getBookingById(bookingId);
        setBooking(data);
      } catch (err) {
        console.error('Error fetching booking:', err);
      }
    };
    
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId, getBookingById]);
  
  if (loading) {
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
  
  if (!booking) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        Booking information could not be found.
      </Alert>
    );
  }
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'EEEE, MMMM d, yyyy');
  };
  
  // Format price with currency
  const formatPrice = (price) => {
    return `${price.toFixed(2)} ${t('common.currency')}`;
  };
  
  // Get payment method name
  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'creditCard':
        return t('checkout.creditCard');
      case 'bankTransfer':
        return t('checkout.bankTransfer');
      case 'cashOnDelivery':
        return t('checkout.cashOnDelivery');
      default:
        return method;
    }
  };

  // Get the status color based on booking status
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', mb: 4 }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          {t('bookings.confirmationTitle')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('bookings.confirmationMessage')}
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          {t('bookings.reference')}: <strong>{booking._id}</strong>
        </Typography>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {t('checkout.bookingDetails')}
        </Typography>
        
        <List disablePadding>
          <ListItem sx={{ py: 1.5 }}>
            <ListItemIcon>
              <ReceiptIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary={t('services.title')}
              secondary={booking.service.name}
            />
          </ListItem>
          
          <ListItem sx={{ py: 1.5 }}>
            <ListItemIcon>
              <EventIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary={t('bookings.dateTime')}
              secondary={formatDate(booking.date)}
            />
          </ListItem>
          
          {(booking.startTime && booking.endTime) && (
            <ListItem sx={{ py: 1.5 }}>
              <ListItemIcon>
                <EventIcon color="primary" sx={{ visibility: 'hidden' }} />
              </ListItemIcon>
              <ListItemText 
                primary={t('bookings.time')}
                secondary={`${booking.startTime} - ${booking.endTime}`}
              />
            </ListItem>
          )}
          
          {booking.provider && (
            <ListItem sx={{ py: 1.5 }}>
              <ListItemIcon>
                <PersonIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary={t('bookings.provider')}
                secondary={booking.provider.name}
              />
            </ListItem>
          )}
          
          {booking.location && (
            <ListItem sx={{ py: 1.5 }}>
              <ListItemIcon>
                <LocationOnIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary={t('bookings.location')}
                secondary={`${booking.location?.address || ''}, ${booking.location?.city || ''}`}
              />
            </ListItem>
          )}
          
          <ListItem sx={{ py: 1.5 }}>
            <ListItemIcon>
              <PaymentIcon color="primary" />
            </ListItemIcon>
            <Grid container>
              <Grid item xs={12} sx={{ mb: 1 }}>
                <Typography variant="subtitle2">
                  {t('bookings.status')}
                </Typography>
                <Chip 
                  label={t(`bookings.statuses.${booking.status}`)} 
                  color={getStatusColor(booking.status)} 
                  size="small" 
                  sx={{ textTransform: 'capitalize' }} 
                />
              </Grid>
              
              {booking.paymentDetails && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">
                      {t('checkout.paymentMethod')}
                    </Typography>
                    <Typography variant="body2">
                      {getPaymentMethodName(booking.paymentDetails.method)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">
                      {t('checkout.paymentStatus')}
                    </Typography>
                    <Chip 
                      label={t(`bookings.paymentStatuses.${booking.paymentDetails.status}`)}
                      color={booking.paymentDetails.status === 'paid' ? 'success' : 'warning'} 
                      size="small" 
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </ListItem>
        </List>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {t('checkout.orderSummary')}
        </Typography>
        
        <List disablePadding>
          <ListItem sx={{ py: 1.5 }}>
            <ListItemText primary={t('checkout.subtotal')} />
            <Typography variant="body1">
              {formatPrice(booking.totalPrice ? booking.totalPrice / 1.15 : 0)}
            </Typography>
          </ListItem>
          
          <ListItem sx={{ py: 1.5 }}>
            <ListItemText primary={t('checkout.tax')} />
            <Typography variant="body1">
              {formatPrice(booking.totalPrice ? booking.totalPrice * 0.15 / 1.15 : 0)}
            </Typography>
          </ListItem>
          
          <Divider sx={{ my: 1 }} />
          
          <ListItem sx={{ py: 1.5 }}>
            <ListItemText primary={t('checkout.total')} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {formatPrice(booking.totalPrice || 0)}
            </Typography>
          </ListItem>
        </List>
        
        {booking.notes && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {t('bookings.notes')}
            </Typography>
            <Typography variant="body2">
              {booking.notes}
            </Typography>
          </Box>
        )}
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button 
          variant="outlined"
          onClick={() => navigate('/bookings/me')}
        >
          {t('bookings.viewAllBookings')}
        </Button>
        
        <Button 
          variant="contained"
          onClick={() => navigate('/')}
        >
          {t('common.returnToHome')}
        </Button>
        </Box>
    </Container>
  );
};

export default BookingConfirmation;
