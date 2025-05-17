import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { ServiceContext } from '../../context/ServiceContext';
import { BookingContext } from '../../context/BookingContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';

const Checkout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingId } = useParams();
  const { user } = useContext(AuthContext);
  const { getServiceById } = useContext(ServiceContext);
  const { getBookingById, updateBooking, loading, error } = useContext(BookingContext);
  
  const [activeStep, setActiveStep] = useState(0);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Saudi Arabia'
  });
  const [formErrors, setFormErrors] = useState({});
  const [successDialog, setSuccessDialog] = useState(false);
  
  const steps = [
    t('checkout.reviewBooking'),
    t('checkout.paymentMethod'),
    t('checkout.confirmPayment')
  ];
  
  // Initialize checkout with booking details
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout/' + bookingId);
      return;
    }
    
    const fetchBookingDetails = async () => {
      try {
        const bookingData = await getBookingById(bookingId);
        setBookingDetails(bookingData);
        
        // Pre-fill address if it exists in booking
        if (bookingData.address) {
          setAddress(bookingData.address);
        }
        
        // Fetch service details
        const serviceData = await getServiceById(bookingData.service);
        setServiceDetails(serviceData);
        
      } catch (error) {
        console.error('Error fetching booking details:', error);
      }
    };
    
    fetchBookingDetails();
  }, [bookingId, user, navigate, getBookingById, getServiceById]);
  
  // Handle payment method change
  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };
  
  // Handle card details change
  const handleCardDetailsChange = (event) => {
    const { name, value } = event.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle address change
  const handleAddressChange = (event) => {
    const { name, value } = event.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Validate current step
  const validateCurrentStep = () => {
    const errors = {};
    
    if (activeStep === 1) {
      if (paymentMethod === 'creditCard') {
        if (!cardDetails.cardNumber) errors.cardNumber = t('checkout.errors.cardNumberRequired');
        else if (!/^[0-9]{13,19}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
          errors.cardNumber = t('checkout.errors.invalidCardNumber');
        }
        
        if (!cardDetails.cardHolder) errors.cardHolder = t('checkout.errors.cardHolderRequired');
        if (!cardDetails.expiryDate) errors.expiryDate = t('checkout.errors.expiryDateRequired');
        else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(cardDetails.expiryDate)) {
          errors.expiryDate = t('checkout.errors.invalidExpiryDate');
        }
        
        if (!cardDetails.cvv) errors.cvv = t('checkout.errors.cvvRequired');
        else if (!/^[0-9]{3,4}$/.test(cardDetails.cvv)) {
          errors.cvv = t('checkout.errors.invalidCvv');
        }
      } else if (paymentMethod === 'bankTransfer') {
        // Validate bank transfer details if needed
      } else if (paymentMethod === 'cashOnDelivery') {
        // Validate address
        if (!address.street) errors.street = t('checkout.errors.streetRequired');
        if (!address.city) errors.city = t('checkout.errors.cityRequired');
        if (!address.zipCode) errors.zipCode = t('checkout.errors.zipCodeRequired');
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle next step
  const handleNext = async () => {
    // Validate current step
    if (!validateCurrentStep()) return;
    
    // If last step, complete checkout
    if (activeStep === steps.length - 1) {
      await completeCheckout();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  
  // Handle back
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Complete checkout
  const completeCheckout = async () => {
    try {
      // Update booking with payment details
      const paymentDetails = {
        method: paymentMethod,
        status: 'paid', // or 'pending' for methods like bank transfer
        date: new Date().toISOString(),
        amount: calculateTotal()
      };
      
      // Add card details if paying by card (in real app, this would be tokenized)
      if (paymentMethod === 'creditCard') {
        paymentDetails.card = {
          last4: cardDetails.cardNumber.slice(-4),
          expiry: cardDetails.expiryDate
        };
      }
      
      const updatedBooking = await updateBooking(bookingId, {
        status: 'confirmed',
        paymentDetails,
        address
      });
      
      setBookingDetails(updatedBooking);
      setSuccessDialog(true);
    } catch (error) {
      console.error('Error completing checkout:', error);
    }
  };
  
  // Handle success dialog close
  const handleSuccessDialogClose = () => {
    setSuccessDialog(false);
    navigate(`/bookings/${bookingId}/confirmation`);
  };
  
  // Calculate subtotal
  const calculateSubtotal = () => {
    if (!serviceDetails) return 0;
    return serviceDetails.price;
  };
  
  // Calculate tax
  const calculateTax = () => {
    return calculateSubtotal() * 0.15; // 15% VAT in Saudi Arabia
  };
  
  // Calculate total
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };
  
  // Format price with currency
  const formatPrice = (price) => {
    return `${price.toFixed(2)} ${t('common.currency')}`;
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  // Render review booking step
  const renderReviewBooking = () => {
    if (!bookingDetails || !serviceDetails) {
      return <CircularProgress />;
    }
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Typography variant="h6" gutterBottom>
            {t('checkout.bookingDetails')}
          </Typography>
          
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" component="div">
                {serviceDetails.name}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <List disablePadding>
                  <ListItem sx={{ py: 1, px: 0 }}>
                    <EventIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <ListItemText 
                      primary={t('bookings.dateTime')} 
                      secondary={formatDate(bookingDetails.date)}
                    />
                  </ListItem>
                  
                  {bookingDetails.duration && (
                    <ListItem sx={{ py: 1, px: 0 }}>
                      <ListItemText 
                        primary={t('bookings.duration')} 
                        secondary={`${bookingDetails.duration} ${t('services.minutes')}`}
                      />
                    </ListItem>
                  )}
                  
                  {bookingDetails.location && (
                    <ListItem sx={{ py: 1, px: 0 }}>
                      <LocationOnIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText 
                        primary={t('bookings.location')} 
                        secondary={bookingDetails.location.name || bookingDetails.location.address}
                      />
                    </ListItem>
                  )}
                  
                  {bookingDetails.provider && (
                    <ListItem sx={{ py: 1, px: 0 }}>
                      <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText 
                        primary={t('bookings.provider')} 
                        secondary={bookingDetails.provider.name}
                      />
                    </ListItem>
                  )}
                  
                  {bookingDetails.notes && (
                    <ListItem sx={{ py: 1, px: 0 }}>
                      <ListItemText 
                        primary={t('bookings.notes')} 
                        secondary={bookingDetails.notes}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Typography variant="h6" gutterBottom>
            {t('checkout.orderSummary')}
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <List disablePadding>
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary={t('checkout.subtotal')} />
                <Typography variant="body2">
                  {formatPrice(calculateSubtotal())}
                </Typography>
              </ListItem>
              
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary={t('checkout.tax')} />
                <Typography variant="body2">
                  {formatPrice(calculateTax())}
                </Typography>
              </ListItem>
              
              <Divider sx={{ my: 1 }} />
              
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary={t('checkout.total')} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {formatPrice(calculateTotal())}
                </Typography>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    );
  };
  
  // Render payment method step
  const renderPaymentMethod = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Typography variant="h6" gutterBottom>
            {t('checkout.selectPaymentMethod')}
          </Typography>
          
          <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
            <FormControl component="fieldset">
              <RadioGroup
                name="paymentMethod"
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                <FormControlLabel 
                  value="creditCard" 
                  control={<Radio />} 
                  label={t('checkout.creditCard')} 
                />
                <FormControlLabel 
                  value="bankTransfer" 
                  control={<Radio />} 
                  label={t('checkout.bankTransfer')} 
                />
                <FormControlLabel 
                  value="cashOnDelivery" 
                  control={<Radio />} 
                  label={t('checkout.cashOnDelivery')} 
                />
              </RadioGroup>
            </FormControl>
          </Paper>
          
          {paymentMethod === 'creditCard' && (
            <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('checkout.cardDetails')}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name="cardNumber"
                    label={t('checkout.cardNumber')}
                    fullWidth
                    value={cardDetails.cardNumber}
                    onChange={handleCardDetailsChange}
                    error={!!formErrors.cardNumber}
                    helperText={formErrors.cardNumber}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    name="cardHolder"
                    label={t('checkout.cardHolder')}
                    fullWidth
                    value={cardDetails.cardHolder}
                    onChange={handleCardDetailsChange}
                    error={!!formErrors.cardHolder}
                    helperText={formErrors.cardHolder}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    name="expiryDate"
                    label={t('checkout.expiryDate')}
                    placeholder="MM/YY"
                    fullWidth
                    value={cardDetails.expiryDate}
                    onChange={handleCardDetailsChange}
                    error={!!formErrors.expiryDate}
                    helperText={formErrors.expiryDate}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    name="cvv"
                    label={t('checkout.cvv')}
                    fullWidth
                    value={cardDetails.cvv}
                    onChange={handleCardDetailsChange}
                    error={!!formErrors.cvv}
                    helperText={formErrors.cvv}
                  />
                </Grid>
              </Grid>
            </Paper>
          )}
          
          {paymentMethod === 'bankTransfer' && (
            <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('checkout.bankTransferInstructions')}
              </Typography>
              
              <Typography variant="body2" paragraph>
                {t('checkout.bankTransferDescription')}
              </Typography>
              
              <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>{t('checkout.bankName')}:</strong> Saudi National Bank
                </Typography>
                <Typography variant="body2">
                  <strong>{t('checkout.accountName')}:</strong> Care Booking Ltd
                </Typography>
                <Typography variant="body2">
                  <strong>{t('checkout.accountNumber')}:</strong> SA12 3456 7890 1234 5678 9012
                </Typography>
                <Typography variant="body2">
                  <strong>{t('checkout.reference')}:</strong> {bookingId}
                </Typography>
              </Box>
            </Paper>
          )}
          
          {paymentMethod === 'cashOnDelivery' && (
            <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('checkout.deliveryAddress')}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name="street"
                    label={t('checkout.street')}
                    fullWidth
                    value={address.street}
                    onChange={handleAddressChange}
                    error={!!formErrors.street}
                    helperText={formErrors.street}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="city"
                    label={t('checkout.city')}
                    fullWidth
                    value={address.city}
                    onChange={handleAddressChange}
                    error={!!formErrors.city}
                    helperText={formErrors.city}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="state"
                    label={t('checkout.state')}
                    fullWidth
                    value={address.state}
                    onChange={handleAddressChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="zipCode"
                    label={t('checkout.zipCode')}
                    fullWidth
                    value={address.zipCode}
                    onChange={handleAddressChange}
                    error={!!formErrors.zipCode}
                    helperText={formErrors.zipCode}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="country"
                    label={t('checkout.country')}
                    fullWidth
                    value={address.country}
                    onChange={handleAddressChange}
                    disabled
                  />
                </Grid>
              </Grid>
            </Paper>
          )}
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Typography variant="h6" gutterBottom>
            {t('checkout.orderSummary')}
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <List disablePadding>
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary={serviceDetails?.name} />
                <Typography variant="body2">
                  {formatPrice(calculateSubtotal())}
                </Typography>
              </ListItem>
              
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary={t('checkout.tax')} />
                <Typography variant="body2">
                  {formatPrice(calculateTax())}
                </Typography>
              </ListItem>
              
              <Divider sx={{ my: 1 }} />
              
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary={t('checkout.total')} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {formatPrice(calculateTotal())}
                </Typography>
              </ListItem>
            </List>
            
            {paymentMethod === 'creditCard' && (
              <Chip 
                label={t('checkout.securePayment')} 
                color="success" 
                size="small" 
                icon={<CheckCircleIcon />} 
                sx={{ mt: 2 }}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    );
  };
  
  // Render confirm payment step
  const renderConfirmPayment = () => {
    return (
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={8}>
          <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              {t('checkout.confirmYourPayment')}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <ReceiptIcon sx={{ fontSize: 60, color: 'primary.main' }} />
            </Box>
            
            <Typography variant="body1" paragraph>
              {t('checkout.youAreAboutToPay', { 
                amount: formatPrice(calculateTotal()),
                method: t(`checkout.${paymentMethod}`)
              })}
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              {paymentMethod === 'creditCard' 
                ? t('checkout.cardWillBeCharged') 
                : paymentMethod === 'bankTransfer'
                  ? t('checkout.checkBankDetails')
                  : t('checkout.cashOnDeliveryNote')
              }
            </Alert>
            
            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('checkout.summaryDetails')}:
              </Typography>
              <Typography variant="body2">
                <strong>{t('checkout.service')}:</strong> {serviceDetails?.name}
              </Typography>
              <Typography variant="body2">
                <strong>{t('checkout.date')}:</strong> {formatDate(bookingDetails?.date)}
              </Typography>
              <Typography variant="body2">
                <strong>{t('checkout.amount')}:</strong> {formatPrice(calculateTotal())}
              </Typography>
              <Typography variant="body2">
                <strong>{t('checkout.paymentMethod')}:</strong> {t(`checkout.${paymentMethod}`)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };
  
  // Render current step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderReviewBooking();
      case 1:
        return renderPaymentMethod();
      case 2:
        return renderConfirmPayment();
      default:
        return null;
    }
  };
  
  // Loading state
  if (!serviceDetails || !bookingDetails) {
    return (
      <Container sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  return (
    <Container sx={{ my: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {t('checkout.title')}
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {renderStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            {t('common.back')}
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={loading}
            endIcon={loading && <CircularProgress size={20} />}
          >
            {activeStep === steps.length - 1 
              ? t('checkout.completePayment') 
              : t('common.next')}
          </Button>
        </Box>
      </Paper>
      
      {/* Success Dialog */}
      <Dialog
        open={successDialog}
        onClose={handleSuccessDialogClose}
      >
        <DialogTitle>{t('checkout.paymentSuccessful')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
          </Box>
          <DialogContentText>
            {t('checkout.paymentSuccessMessage')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSuccessDialogClose} color="primary" autoFocus>
            {t('checkout.viewConfirmation')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Checkout;
