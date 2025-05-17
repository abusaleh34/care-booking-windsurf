import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ServiceContext } from '../../context/ServiceContext';
import { BookingContext } from '../../context/BookingContext';
import { AuthContext } from '../../context/AuthContext';
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
  CardMedia,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, addMinutes, set, isBefore } from 'date-fns';

const DEFAULT_IMAGE = 'https://via.placeholder.com/300x200?text=Service';

const BookingForm = () => {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const { getServiceById } = useContext(ServiceContext);
  const { createBooking, loading, error } = useContext(BookingContext);
  const { user, isAuthenticated } = useContext(AuthContext);
  const { t } = useTranslation();
  
  const [service, setService] = useState(null);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceError, setServiceError] = useState(null);
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  
  const [formError, setFormError] = useState('');
  
  // Fetch service details when component mounts
  useEffect(() => {
    const fetchService = async () => {
      try {
        setServiceLoading(true);
        setServiceError(null);
        
        const serviceData = await getServiceById(serviceId);
        setService(serviceData);
        
        // If user is logged in and has addresses, pre-fill the first one
        if (user && user.customerProfile && user.customerProfile.addresses && user.customerProfile.addresses.length > 0) {
          const defaultAddress = user.customerProfile.addresses.find(a => a.isDefault) || user.customerProfile.addresses[0];
          setAddress(defaultAddress.address);
          setCity(defaultAddress.city);
        }
      } catch (error) {
        setServiceError(t('bookings.form.serviceNotFound'));
      } finally {
        setServiceLoading(false);
      }
    };
    
    if (serviceId) {
      fetchService();
    }
  }, [serviceId, getServiceById, user, t]);
  
  // Generate available time slots when date is selected
  useEffect(() => {
    if (!selectedDate || !service) return;
    
    const selectedDay = format(selectedDate, 'EEEE').toLowerCase();
    
    // Find available slots for the selected day
    const dayAvailability = service.availability?.find(a => a.day === selectedDay);
    
    if (dayAvailability && dayAvailability.slots) {
      // Generate time options from available slots
      const options = dayAvailability.slots
        .filter(slot => slot.available)
        .map(slot => ({
          value: slot.startTime,
          label: slot.startTime,
          endTime: slot.endTime
        }));
      
      // Filter out past times if booking for today
      const now = new Date();
      if (isSameDay(selectedDate, now)) {
        const currentTime = format(now, 'HH:mm');
        setAvailableTimes(options.filter(option => option.value > currentTime));
      } else {
        setAvailableTimes(options);
      }
    } else {
      setAvailableTimes([]);
    }
  }, [selectedDate, service]);
  
  // Helper to check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };
  
  // Calculate end time based on selected start time and service duration
  const getEndTime = (startTime) => {
    if (!startTime || !service) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = set(new Date(), { hours, minutes });
    const endDate = addMinutes(startDate, service.duration);
    
    return format(endDate, 'HH:mm');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/booking/${serviceId}` } });
      return;
    }
    
    if (!selectedDate) {
      setFormError(t('bookings.form.errorDate'));
      return;
    }
    
    if (!selectedTime) {
      setFormError(t('bookings.form.errorTime'));
      return;
    }
    
    try {
      const endTime = getEndTime(selectedTime);
      
      const bookingData = {
        serviceId,
        date: selectedDate,
        startTime: selectedTime,
        endTime,
        notes,
        location: {
          address,
          city
        }
      };
      
      const booking = await createBooking(bookingData);
      
      // Redirect to booking confirmation page
      navigate(`/bookings/${booking._id}/confirmation`);
    } catch (err) {
      // Error is already set in the context
      console.error('Booking error:', err);
    }
  };
  
  if (serviceLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (serviceError || !service) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {serviceError || t('bookings.form.serviceNotFound')}
      </Alert>
    );
  }
  
  // Format price to currency
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };
  
  // Format duration to readable format
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} ${t('bookings.form.minutes')}`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} ${hours > 1 ? t('bookings.form.hours') : t('bookings.form.hour')}${mins ? ` ${mins} ${t('bookings.form.minutes')}` : ''}`;
  };
  
  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('bookings.form.title')}
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardMedia
              component="img"
              height="200"
              image={service.images?.[0] || DEFAULT_IMAGE}
              alt={service.name}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {service.name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {service.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">{t('bookings.form.priceLabel')}</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatPrice(service.price)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">{t('bookings.form.durationLabel')}</Typography>
                <Typography variant="body1">
                  {formatDuration(service.duration)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">{t('bookings.form.categoryLabel')}</Typography>
                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                  {service.category}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleSubmit}>
              {formError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {formError}
                </Alert>
              )}
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Typography variant="h6" gutterBottom>
                {t('bookings.date')} & {t('bookings.time')}
              </Typography>
              
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t('bookings.form.dateLabel')}
                  value={selectedDate}
                  onChange={setSelectedDate}
                  renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
                  minDate={new Date()}
                />
              </LocalizationProvider>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>{t('bookings.form.timeLabel')}</InputLabel>
                <Select
                  value={selectedTime}
                  label={t('bookings.form.timeLabel')}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  disabled={!selectedDate || availableTimes.length === 0}
                >
                  {availableTimes.length === 0 && (
                    <MenuItem disabled value="">
                      <em>{t('bookings.form.noTimeSlots')}</em>
                    </MenuItem>
                  )}
                  
                  {availableTimes.map((time) => (
                    <MenuItem key={time.value} value={time.value}>
                      {time.label} - {time.endTime || getEndTime(time.value)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Typography variant="h6" gutterBottom>
                {t('common.contactInfo')}
              </Typography>
              
              <TextField
                label={t('bookings.form.addressLabel')}
                variant="outlined"
                fullWidth
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                sx={{ mb: 2 }}
                required
              />
              
              <TextField
                label={t('bookings.form.cityLabel')}
                variant="outlined"
                fullWidth
                value={city}
                onChange={(e) => setCity(e.target.value)}
                sx={{ mb: 2 }}
                required
              />
              
              <TextField
                label={t('bookings.form.notesLabel')}
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{ mb: 3 }}
                placeholder={t('bookings.form.notesPlaceholder')}
              />
              
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                size="large" 
                type="submit" 
                disabled={loading || !selectedDate || !selectedTime}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : t('bookings.form.submitButton')}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookingForm;
