import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  Divider, 
  Chip,
  Avatar,
  Rating,
  Skeleton,
  Alert,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import { ServiceContext } from '../../context/ServiceContext';
import { AuthContext } from '../../context/AuthContext';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getServiceById } = useContext(ServiceContext);
  const { isAuthenticated } = useContext(AuthContext);
  const { t } = useTranslation();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Define all callbacks at the component top level
  const handleNavigateToServices = React.useCallback(() => {
    navigate('/services');
  }, [navigate]);
  
  const handleBookService = React.useCallback(() => {
    if (isAuthenticated) {
      navigate(`/booking/${id}`);
    } else {
      // Redirect to login with a return path to this service
      navigate(`/login?redirect=/services/${id}`);
    }
  }, [isAuthenticated, navigate, id]);
  
  useEffect(() => {
    let isMounted = true;
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const serviceData = await getServiceById(id);
        
        // Only update state if component is still mounted
        if (isMounted) {
          setService(serviceData);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching service details:', error);
        if (isMounted) {
          setError(t('services.detail.loadError'));
          setLoading(false);
        }
      }
    };
    
    fetchServiceDetails();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [id, getServiceById, t]);
  
  // Format availability slots for display - memoized to prevent recalculation
  const formatAvailability = React.useCallback((availability) => {
    if (!availability || availability.length === 0) return [];
    
    const daysMap = {
      monday: t('services.filter.days.monday'),
      tuesday: t('services.filter.days.tuesday'),
      wednesday: t('services.filter.days.wednesday'),
      thursday: t('services.filter.days.thursday'),
      friday: t('services.filter.days.friday'),
      saturday: t('services.filter.days.saturday'),
      sunday: t('services.filter.days.sunday')
    };
    
    return availability.map(day => {
      if (!day) return { day: t('services.detail.unknown'), slots: t('services.detail.notAvailable') };
      
      const slots = day.slots && day.slots.length > 0 
        ? day.slots.map(slot => `${slot.startTime} - ${slot.endTime}`).join(', ') 
        : t('services.detail.allDay');
      
      return {
        day: daysMap[day.day] || day.day,
        slots: slots
      };
    });
  }, [t]);
  
  // Format availability data - memoized to prevent recalculations
  const availabilityData = React.useMemo(() => {
    // Safe access to service data
    if (!service || !service.availability) return [];
    return formatAvailability(service.availability);
  }, [service, formatAvailability]);
  
  // Loading skeleton
  if (loading) {
    return (
      <Box sx={{ py: 4 }}>
        <Skeleton variant="rectangular" width="100%" height={300} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="70%" height={60} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={30} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="100%" height={30} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" width="100%" height={300} />
          </Grid>
        </Grid>
      </Box>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={handleNavigateToServices}
          sx={{ mt: 2 }}
        >
          {t('services.detail.backToServices')}
        </Button>
      </Box>
    );
  }
  
  // If service doesn't exist
  if (!service) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          {t('services.detail.serviceNotFound')}
        </Alert>
        <Button 
          variant="contained" 
          onClick={handleNavigateToServices}
          sx={{ mt: 2 }}
        >
          {t('services.detail.backToServices')}
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ py: 4 }}>
      {/* Breadcrumb navigation */}
      <Box sx={{ display: 'flex', mb: 2 }}>
        <Typography 
          variant="body2" 
          sx={{ cursor: 'pointer' }} 
          onClick={handleNavigateToServices}
        >
          {t('services.title')}
        </Typography>
        <Typography variant="body2" sx={{ mx: 1 }}>/</Typography>
        <Typography variant="body2" color="text.secondary">
          {service.name}
        </Typography>
      </Box>
      
      {/* Service header */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom>
              {service.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={service.rating?.average || 0} precision={0.5} readOnly />
              <Typography variant="body2" sx={{ ml: 1 }}>
                ({service.rating?.count || 0} {t('services.detail.reviews')})
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip 
                icon={<AttachMoneyIcon />} 
                label={`$${service.price} ${t('services.detail.perSession')}`} 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                icon={<AccessTimeIcon />} 
                label={`${service.duration} ${t('services.minutes')}`} 
                variant="outlined" 
              />
              <Chip 
                icon={<LocationOnIcon />} 
                label={`${service.location?.city || t('services.detail.locationNotProvided')}`} 
                variant="outlined" 
              />
              <Chip 
                label={service.category} 
                variant="outlined" 
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
            {isAuthenticated ? (
              <Button 
                variant="contained" 
                size="large" 
                color="primary" 
                onClick={handleBookService}
                sx={{ px: 4, py: 1.5 }}
              >
                {t('bookings.bookNow')}
              </Button>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {t('services.detail.pleaseLogin')} <Button
                  size="small"
                  onClick={() => navigate('/login')}
                  sx={{ mx: 0.5, p: 0 }}
                >
                  {t('auth.login')}
                </Button> {t('services.detail.toBook')}
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* Left column: Service details */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              {t('services.description')}
            </Typography>
            <Typography variant="body1" paragraph>
              {service.description}
            </Typography>

            {service.location && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  {t('services.location')}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <LocationOnIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={service.location.address}
                      secondary={`${service.location.city}, ${service.location.region}`}
                    />
                  </ListItem>
                </List>
              </>
            )}
          </Paper>
          
          {/* Provider information */}
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              {t('services.provider')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ mr: 2 }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {service.provider?.name || 'Care Provider'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('services.detail.professionalProvider')}
                </Typography>
              </Box>
            </Box>
            
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => navigate(`/chats/new?provider=${service.provider?._id}`)}
              sx={{ mt: 1 }}
              disabled={!isAuthenticated}
            >
              {t('services.detail.contactProvider')}
            </Button>
          </Paper>
        </Grid>
        
        {/* Right column: Booking and availability */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CalendarTodayIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                {t('services.detail.availability')}
              </Typography>
              
              {availabilityData.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('services.detail.day')}</TableCell>
                        <TableCell>{t('services.detail.hours')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {availabilityData.map((slot, index) => (
                        <TableRow key={index}>
                          <TableCell>{slot.day}</TableCell>
                          <TableCell>{slot.slots}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  {t('services.detail.noAvailability')}
                </Box>
              )}
            </CardContent>
            <CardActions>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={handleBookService}
                startIcon={<EventAvailableIcon />}
                disabled={!isAuthenticated}
              >
                {t('bookings.bookNow')}
              </Button>
            </CardActions>
          </Card>
          
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('services.detail.serviceDetails')}
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary={t('services.detail.sessionDuration')}
                    secondary={`${service.duration} ${t('services.minutes')}`}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText
                    primary={t('services.price')}
                    secondary={`$${service.price} ${t('services.detail.perSession')}`}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText
                    primary={t('services.category')}
                    secondary={service.category}
                  />
                </ListItem>
                {service.provider && (
                  <>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary={t('services.provider')}
                        secondary={service.provider.name}
                      />
                    </ListItem>
                  </>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ServiceDetail;
