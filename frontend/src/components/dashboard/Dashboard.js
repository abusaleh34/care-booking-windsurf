import React, { useState, useContext, useMemo, useCallback, memo } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  Grid,
  Divider,
  ButtonGroup
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../../context/AuthContext';
import MyBookings from '../booking/MyBookings';
import UserProfile from '../profile/UserProfile';
import ProviderServices from '../provider/ProviderServices';

// Create static components to completely prevent re-renders
const StaticBookings = memo(() => <MyBookings />);
StaticBookings.displayName = 'StaticBookings';

const StaticProfile = memo(() => <UserProfile />);
StaticProfile.displayName = 'StaticProfile';

const StaticServices = memo(() => <ProviderServices />);
StaticServices.displayName = 'StaticServices';

// Style the nav buttons for stable rendering
const StableButton = styled(Button)(({ theme, active }) => ({
  fontWeight: active ? 'bold' : 'normal',
  backgroundColor: active ? theme.palette.primary.main : 'transparent',
  color: active ? 'white' : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.main : 'rgba(0, 0, 0, 0.04)',
    transition: 'none'
  },
  transition: 'none',
  minWidth: '120px',
  height: '48px',
}));

// Create a layout that doesn't shift or vibrate
const StableLayout = styled(Box)({
  width: '100%',
  display: 'block',
  position: 'static',
  transform: 'translateZ(0)',
  willChange: 'transform',
  height: '600px',
  overflow: 'hidden'
});

// Create a stable content container
const StableContent = styled(Paper)({
  padding: '24px',
  marginTop: '16px',
  height: '100%',
  overflow: 'auto',
  transform: 'translateZ(0)',
  willChange: 'transform',
  position: 'relative'
});

// Use a completely different non-tab based approach
const Dashboard = memo(() => {
  const { user } = useContext(AuthContext);
  const [activeView, setActiveView] = useState('bookings');

  // Check if user is provider without re-rendering
  const isProvider = useMemo(() => {
    return user && user.role === 'provider';
  }, [user]);

  // Stable view switcher that doesn't cause re-renders
  const handleViewChange = useCallback((view) => {
    if (view === 'services' && !isProvider) return;
    setActiveView(view);
  }, [isProvider]);

  // Render only one component at a time and never switch between them
  // This approach completely eliminates the tab transitions that cause vibration
  const renderContent = useCallback(() => {
    switch(activeView) {
      case 'bookings':
        return <StaticBookings />;
      case 'profile':
        return <StaticProfile />;
      case 'services':
        return isProvider ? <StaticServices /> : null;
      default:
        return <StaticBookings />;
    }
  }, [activeView, isProvider]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Manage your bookings, profile, and more in one place.
        </Typography>
        
        {/* Use a static button group instead of tabs */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <ButtonGroup fullWidth variant="contained">
              <StableButton 
                active={activeView === 'bookings'}
                onClick={() => handleViewChange('bookings')}
              >
                My Bookings
              </StableButton>
              <StableButton 
                active={activeView === 'profile'}
                onClick={() => handleViewChange('profile')}
              >
                Profile
              </StableButton>
              {isProvider && (
                <StableButton 
                  active={activeView === 'services'}
                  onClick={() => handleViewChange('services')}
                >
                  My Services
                </StableButton>
              )}
            </ButtonGroup>
          </Grid>
        </Grid>
        
        {/* Stable content area */}
        <StableLayout>
          <StableContent elevation={3}>
            {renderContent()}
          </StableContent>
        </StableLayout>
      </Box>
    </Container>
  );
});

// Add display name for debugging purposes
Dashboard.displayName = 'Dashboard';

export default Dashboard;
