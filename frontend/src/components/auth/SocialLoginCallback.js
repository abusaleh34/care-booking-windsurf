import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { 
  Container, 
  Typography, 
  CircularProgress, 
  Box, 
  Paper,
  Alert
} from '@mui/material';

/**
 * Component that handles OAuth callbacks from social login providers
 * Extracts provider and token from URL and processes the login
 */
const SocialLoginCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { socialLogin, loading, error } = useContext(AuthContext);
  
  const [localError, setLocalError] = useState('');
  const [processingCallback, setProcessingCallback] = useState(true);
  
  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get query parameters from URL
        const searchParams = new URLSearchParams(location.search);
        const provider = searchParams.get('provider');
        const token = searchParams.get('token');
        
        if (!provider || !token) {
          setLocalError(t('auth.invalidSocialCallback'));
          setProcessingCallback(false);
          return;
        }
        
        // Process the social login with the provider and token
        await socialLogin(provider, token);
        
        // If successful, redirect to home page
        navigate('/');
      } catch (error) {
        console.error('Social login callback error:', error);
        setProcessingCallback(false);
      }
    };
    
    processCallback();
  }, [location, socialLogin, navigate, t]);
  
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {t('auth.socialLogin')}
        </Typography>
        
        {(error || localError) ? (
          <Box>
            <Alert severity="error" sx={{ mb: 3 }}>
              {localError || error}
            </Alert>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body1">
                {t('auth.socialLoginFailed')}
              </Typography>
              <Box 
                sx={{ 
                  mt: 2, 
                  cursor: 'pointer', 
                  color: 'primary.main', 
                  textDecoration: 'underline'
                }}
                onClick={() => navigate('/login')}
              >
                {t('auth.backToLogin')}
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress size={48} sx={{ mb: 3 }} />
            <Typography variant="body1">
              {t('auth.completingLogin')}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default SocialLoginCallback;
