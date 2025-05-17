import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookingContext } from '../../context/BookingContext';
import { PaymentContext } from '../../context/PaymentContext';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { format } from 'date-fns';

const PaymentForm = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const { getBookingById } = useContext(BookingContext);
  const { processPayment, loading, error } = useContext(PaymentContext);
  
  const [booking, setBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  
  // Form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  
  const [formError, setFormError] = useState('');
  
  // Fetch booking details when component mounts
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setBookingLoading(true);
        setBookingError(null);
        
        const bookingData = await getBookingById(bookingId);
        setBooking(bookingData);
      } catch (error) {
        setBookingError('Failed to load booking details');
      } finally {
        setBookingLoading(false);
      }
    };
    
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId, getBookingById]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Basic validation
    if (paymentMethod === 'credit_card') {
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        setFormError('Please fill in all card details');
        return;
      }
      
      if (cardNumber.length < 16) {
        setFormError('Please enter a valid card number');
        return;
      }
      
      if (cvv.length < 3) {
        setFormError('Please enter a valid CVV');
        return;
      }
    }
    
    try {
      const paymentData = {
        bookingId,
        paymentMethod,
        cardInfo: paymentMethod === 'credit_card' ? {
          cardNumber,
          cardName,
          expiryDate,
          cvv
        } : null
      };
      
      const result = await processPayment(paymentData);
      
      // Redirect to payment success page
      navigate(`/payments/${result.payment._id}/success`);
    } catch (err) {
      // Error is already set in the context
      console.error('Payment error:', err);
    }
  };
  
  if (bookingLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (bookingError || !booking) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {bookingError || 'Booking not found'}
      </Alert>
    );
  }
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy');
  };
  
  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Complete Payment
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Booking Summary
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Service
                </Typography>
                <Typography variant="body1">
                  {booking.service.name}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date & Time
                </Typography>
                <Typography variant="body1">
                  {formatDate(booking.date)}, {booking.startTime} - {booking.endTime}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Provider
                </Typography>
                <Typography variant="body1">
                  {booking.provider.name}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Total Amount:</Typography>
                <Typography variant="h6" fontWeight="bold">
                  ${booking.totalPrice.toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            {(error || formError) && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {formError || error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Typography variant="h6" gutterBottom>
                Payment Method
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="payment-method-label">Payment Method</InputLabel>
                <Select
                  labelId="payment-method-label"
                  id="payment-method"
                  value={paymentMethod}
                  label="Payment Method"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <MenuItem value="credit_card">Credit Card</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="cash">Cash on Delivery</MenuItem>
                </Select>
              </FormControl>
              
              {paymentMethod === 'credit_card' && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Card Details
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        label="Card Number"
                        fullWidth
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                        inputProps={{ maxLength: 16 }}
                        placeholder="1234 5678 9012 3456"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        label="Cardholder Name"
                        fullWidth
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </Grid>
                    
                    <Grid item xs={6}>
                      <TextField
                        label="Expiry Date"
                        fullWidth
                        required
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        placeholder="MM/YY"
                        inputProps={{ maxLength: 5 }}
                      />
                    </Grid>
                    
                    <Grid item xs={6}>
                      <TextField
                        label="CVV"
                        fullWidth
                        required
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        inputProps={{ maxLength: 3 }}
                        placeholder="123"
                      />
                    </Grid>
                  </Grid>
                </>
              )}
              
              {paymentMethod === 'bank_transfer' && (
                <Alert severity="info" sx={{ my: 2 }}>
                  Please use the following details to make a bank transfer:
                  <br />
                  Bank: Example Bank
                  <br />
                  Account Name: Care Booking Platform
                  <br />
                  Account Number: 1234567890
                  <br />
                  Reference: {booking._id}
                </Alert>
              )}
              
              {paymentMethod === 'cash' && (
                <Alert severity="info" sx={{ my: 2 }}>
                  You have selected to pay with cash. Please have the exact amount ready for the service provider.
                </Alert>
              )}
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  `Pay $${booking.totalPrice.toFixed(2)}`
                )}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaymentForm;
