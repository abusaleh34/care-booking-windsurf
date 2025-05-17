import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import BookIcon from '@mui/icons-material/Book';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import StarIcon from '@mui/icons-material/Star';
import PendingIcon from '@mui/icons-material/Pending';
import { ProviderContext } from '../../context/ProviderContext';
import { format } from 'date-fns';

const ProviderOverview = ({ onRefresh }) => {
  const { t } = useTranslation();
  const { 
    getProviderMetrics, 
    getProviderBookings, 
    metrics, 
    loading,
    error 
  } = useContext(ProviderContext);
  
  const [recentBookings, setRecentBookings] = useState([]);
  
  useEffect(() => {
    const loadData = async () => {
      await getProviderMetrics();
      
      // Get recent bookings (last 10)
      const bookings = await getProviderBookings({ 
        limit: 5, 
        sort: '-createdAt' 
      });
      
      setRecentBookings(bookings || []);
    };
    
    loadData();
  }, [getProviderMetrics, getProviderBookings]);
  
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'PPP');
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Loading state
  if (loading && !metrics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
        <Button onClick={onRefresh} sx={{ ml: 2 }}>
          {t('common.retry')}
        </Button>
      </Alert>
    );
  }
  
  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        {t('provider.dashboardOverview')}
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              bgcolor: 'primary.light',
              color: 'primary.contrastText'
            }}
          >
            <BookIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" component="div">
              {metrics?.totalBookings || 0}
            </Typography>
            <Typography variant="body2">
              {t('provider.totalBookings')}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              bgcolor: 'success.light',
              color: 'success.contrastText'
            }}
          >
            <MonetizationOnIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" component="div">
              {formatCurrency(metrics?.totalRevenue || 0)}
            </Typography>
            <Typography variant="body2">
              {t('provider.totalRevenue')}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              bgcolor: 'warning.light',
              color: 'warning.contrastText'
            }}
          >
            <PendingIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" component="div">
              {metrics?.pendingBookings || 0}
            </Typography>
            <Typography variant="body2">
              {t('provider.pendingBookings')}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              bgcolor: 'info.light',
              color: 'info.contrastText'
            }}
          >
            <StarIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" component="div">
              {metrics?.averageRating?.toFixed(1) || '0.0'}
            </Typography>
            <Typography variant="body2">
              {t('provider.averageRating')}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        {/* Recent Bookings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('provider.recentBookings')}
              </Typography>
              
              {recentBookings.length > 0 ? (
                <List disablePadding>
                  {recentBookings.map((booking, index) => (
                    <React.Fragment key={booking._id}>
                      <ListItem>
                        <ListItemText
                          primary={booking.service?.name || t('provider.unknownService')}
                          secondary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {formatDate(booking.date)} • {booking.startTime}
                              </Typography>
                              {` — ${booking.user?.name || t('provider.anonymousUser')}`}
                            </React.Fragment>
                          }
                        />
                        <Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 'bold',
                              color: 
                                booking.status === 'confirmed' ? 'success.main' : 
                                booking.status === 'pending' ? 'warning.main' :
                                booking.status === 'cancelled' ? 'error.main' : 'text.primary'
                            }}
                          >
                            {t(`provider.status.${booking.status}`)}
                          </Typography>
                          <Typography variant="body2">
                            {formatCurrency(booking.totalPrice || 0)}
                          </Typography>
                        </Box>
                      </ListItem>
                      {index < recentBookings.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  {t('provider.noRecentBookings')}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="text"
                  onClick={() => window.location.href = '#/provider/bookings'}
                >
                  {t('common.viewAll')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Top Services */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('provider.topServices')}
              </Typography>
              
              {metrics?.topServices?.length > 0 ? (
                <List disablePadding>
                  {metrics.topServices.map((service, index) => (
                    <React.Fragment key={service._id || index}>
                      <ListItem>
                        <ListItemText
                          primary={service.name}
                          secondary={`${service.bookingCount} ${t('provider.bookings')}`}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <StarIcon sx={{ color: 'gold', mr: 0.5, fontSize: 20 }} />
                          <Typography variant="body2">
                            {service.rating?.toFixed(1) || '0.0'}
                          </Typography>
                        </Box>
                      </ListItem>
                      {index < metrics.topServices.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  {t('provider.noServicesYet')}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="text"
                  onClick={() => window.location.href = '#/provider/services'}
                >
                  {t('common.viewAll')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProviderOverview;
