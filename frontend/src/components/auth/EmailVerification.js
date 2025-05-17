import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { verifyEmail, loading, error } = useContext(AuthContext);
  
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, success, error
  const [token, setToken] = useState('');
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get('token');
    
    if (!tokenParam) {
      setVerificationStatus('error');
      return;
    }
    
    setToken(tokenParam);
    
    const verifyUserEmail = async () => {
      try {
        await verifyEmail(tokenParam);
        setVerificationStatus('success');
        
        // Redirect to login after successful verification (3 seconds delay)
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        console.error('Email verification error:', error);
        setVerificationStatus('error');
      }
    };
    
    verifyUserEmail();
  }, [location, verifyEmail, navigate, t]);
  
  const renderContent = () => {
    switch (verificationStatus) {
      case 'success':
        return (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              {t('auth.emailVerificationSuccess')}
            </Alert>
            <Typography variant="body1" paragraph>
              {t('auth.redirectingToLogin')}
            </Typography>
          </Box>
        );
      case 'error':
        return (
          <Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || t('auth.emailVerificationFailed')}
            </Alert>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                {t('auth.backToLogin')}
              </Link>
            </Box>
          </Box>
        );
      default:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress size={48} sx={{ mb: 3 }} />
            <Typography variant="body1">
              {t('auth.verifyingEmail')}
            </Typography>
          </Box>
        );
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {t('auth.emailVerification')}
        </Typography>
        
        {renderContent()}
      </Paper>
    </Container>
  );
};

export default EmailVerification;
