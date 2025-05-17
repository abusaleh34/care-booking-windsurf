import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import ListAltIcon from '@mui/icons-material/ListAlt';
import StarIcon from '@mui/icons-material/Star';
import SettingsIcon from '@mui/icons-material/Settings';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { ProviderContext } from '../../context/ProviderContext';
import { AuthContext } from '../../context/AuthContext';
import ProviderOverview from './ProviderOverview';
import ProviderBookings from './ProviderBookings';
import ProviderServices from './ProviderServices';
import ProviderReviews from './ProviderReviews';
import ProviderAvailability from './ProviderAvailability';
import ProviderProfile from './ProviderProfile';
import ProviderMetrics from './ProviderMetrics';

const ProviderDashboard = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { 
    isProvider,
    getProviderProfile,
    getProviderMetrics, 
    loading, 
    error 
  } = useContext(ProviderContext);
  
  const [tabValue, setTabValue] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Check if user is provider and redirect if not
  useEffect(() => {
    if (!isProvider()) {
      // If not a provider, we'll show an error message
      return;
    }
    
    // Load provider data
    const loadProviderData = async () => {
      await getProviderProfile();
      await getProviderMetrics();
    };
    
    loadProviderData();
  }, [isProvider, getProviderProfile, getProviderMetrics, refreshTrigger]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Refresh dashboard data
  const refreshDashboard = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Not a provider
  if (!isProvider()) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {t('provider.notAuthorized')}
        </Alert>
        <Button 
          variant="contained" 
          href="/"
        >
          {t('common.returnToHome')}
        </Button>
      </Container>
    );
  }
  
  // Loading state
  if (loading && refreshTrigger === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {t('common.loading')}
        </Typography>
      </Container>
    );
  }
  
  // Show any errors
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={refreshDashboard}
        >
          {t('common.retry')}
        </Button>
      </Container>
    );
  }

  // Tab content components
  const tabComponents = [
    <ProviderOverview key="overview" onRefresh={refreshDashboard} />,
    <ProviderBookings key="bookings" onRefresh={refreshDashboard} />,
    <ProviderServices key="services" onRefresh={refreshDashboard} />,
    <ProviderReviews key="reviews" onRefresh={refreshDashboard} />,
    <ProviderAvailability key="availability" onRefresh={refreshDashboard} />,
    <ProviderMetrics key="metrics" onRefresh={refreshDashboard} />,
    <ProviderProfile key="profile" onRefresh={refreshDashboard} />
  ];
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('provider.dashboard')}
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
            sx={{ mb: 1 }}
          >
            <Tab 
              icon={<DashboardIcon />} 
              label={!isMobile && t('provider.overview')} 
              iconPosition="start"
              sx={{ minWidth: isMobile ? 'auto' : 140 }}
            />
            <Tab 
              icon={<EventIcon />} 
              label={!isMobile && t('provider.bookings')} 
              iconPosition="start"
              sx={{ minWidth: isMobile ? 'auto' : 140 }}
            />
            <Tab 
              icon={<ListAltIcon />} 
              label={!isMobile && t('provider.services')} 
              iconPosition="start"
              sx={{ minWidth: isMobile ? 'auto' : 140 }}
            />
            <Tab 
              icon={<StarIcon />} 
              label={!isMobile && t('provider.reviews')} 
              iconPosition="start"
              sx={{ minWidth: isMobile ? 'auto' : 140 }}
            />
            <Tab 
              icon={<EventIcon />} 
              label={!isMobile && t('provider.availability')} 
              iconPosition="start"
              sx={{ minWidth: isMobile ? 'auto' : 140 }}
            />
            <Tab 
              icon={<ShowChartIcon />} 
              label={!isMobile && t('provider.metrics')} 
              iconPosition="start"
              sx={{ minWidth: isMobile ? 'auto' : 140 }}
            />
            <Tab 
              icon={<SettingsIcon />} 
              label={!isMobile && t('provider.profile')} 
              iconPosition="start"
              sx={{ minWidth: isMobile ? 'auto' : 140 }}
            />
          </Tabs>
        </Box>
        
        {tabComponents[tabValue]}
      </Paper>
    </Container>
  );
};

export default ProviderDashboard;
