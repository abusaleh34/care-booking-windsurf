import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const { forgotPassword, loading, error } = useContext(AuthContext);
  
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess(false);
    
    if (!email) {
      setFormError(t('auth.errorEmailRequired'));
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError(t('auth.errorInvalidEmail'));
      return;
    }
    
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (error) {
      console.error('Password reset request error:', error);
      // Error is already set in context
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {t('auth.forgotPasswordTitle')}
        </Typography>
        
        {success ? (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              {t('auth.passwordResetSent')}
            </Alert>
            <Typography variant="body1" paragraph>
              {t('auth.passwordResetInstructions')}
            </Typography>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                {t('auth.backToLogin')}
              </Link>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" paragraph>
              {t('auth.forgotPasswordInstructions')}
            </Typography>
            
            {(error || formError) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError || error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                label={t('auth.email')}
                variant="outlined"
                fullWidth
                required
                margin="normal"
                name="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
              />
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ mt: 2, mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : t('auth.resetPasswordButton')}
              </Button>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  {t('auth.backToLogin')}
                </Link>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
