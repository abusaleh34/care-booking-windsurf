import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PaymentContext } from '../../context/PaymentContext';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { format } from 'date-fns';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { paymentId } = useParams();
  const { getPaymentById, loading, error } = useContext(PaymentContext);
  const [payment, setPayment] = useState(null);
  
  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const data = await getPaymentById(paymentId);
        setPayment(data);
      } catch (err) {
        console.error('Error fetching payment:', err);
      }
    };
    
    if (paymentId) {
      fetchPayment();
    }
  }, [paymentId, getPaymentById]);
  
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
  
  if (!payment) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        Payment information could not be found.
      </Alert>
    );
  }
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy h:mm a');
  };
  
  // Format payment method for display
  const formatPaymentMethod = (method) => {
    switch (method) {
      case 'credit_card':
        return 'Credit Card';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'cash':
        return 'Cash';
      default:
        return method;
    }
  };
  
  return (
    <Box sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', mb: 4 }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Payment Successful!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your payment has been processed successfully and your booking is now confirmed.
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          Transaction ID: <strong>{payment.transactionId}</strong>
        </Typography>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <ReceiptIcon sx={{ mr: 1 }} />
          <Typography variant="h5" component="h2">
            Payment Receipt
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Payment Date
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {formatDate(payment.paymentDate)}
            </Typography>
            
            <Typography variant="subtitle2" color="text.secondary">
              Payment Method
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {formatPaymentMethod(payment.paymentMethod)}
            </Typography>
            
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Chip 
              label={payment.status.toUpperCase()} 
              color={payment.status === 'completed' ? 'success' : 'default'} 
              size="small" 
              sx={{ textTransform: 'capitalize', mb: 2 }} 
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Customer
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {payment.customer.name}
            </Typography>
            
            <Typography variant="subtitle2" color="text.secondary">
              Provider
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {payment.provider.name}
            </Typography>
            
            <Typography variant="subtitle2" color="text.secondary">
              Booking Reference
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {payment.booking._id}
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Total Amount
            </Typography>
            <Typography variant="h5" component="p" sx={{ fontWeight: 'bold' }}>
              ${payment.amount.toFixed(2)}
            </Typography>
          </Box>
          
          <Box>
            <Button 
              variant="outlined" 
              onClick={() => window.print()}
              startIcon={<ReceiptIcon />}
            >
              Print Receipt
            </Button>
          </Box>
        </Box>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="outlined"
            onClick={() => navigate('/bookings/me')}
          >
            View My Bookings
          </Button>
          
          <Button 
            variant="contained"
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PaymentSuccess;
