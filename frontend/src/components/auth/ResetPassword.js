import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { resetPassword, loading, error } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [token, setToken] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { password, confirmPassword } = formData;
  
  // Extract token from URL query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get('token');
    
    if (!tokenParam) {
      setFormError(t('auth.errorInvalidLink'));
    } else {
      setToken(tokenParam);
    }
  }, [location, t]);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!token) {
      setFormError(t('auth.errorInvalidLink'));
      return;
    }
    
    if (!password) {
      setFormError(t('auth.errorPasswordRequired'));
      return;
    }
    
    if (password.length < 6) {
      setFormError(t('auth.errorPasswordLength'));
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError(t('auth.errorPasswordsDoNotMatch'));
      return;
    }
    
    try {
      await resetPassword(token, password);
      setSuccess(true);
      
      // Redirect to login after successful password reset (3 seconds delay)
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Password reset error:', error);
      // Error is already set in context
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {t('auth.resetPasswordTitle')}
        </Typography>
        
        {success ? (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              {t('auth.passwordResetSuccess')}
            </Alert>
            <Typography variant="body1" paragraph>
              {t('auth.redirectingToLogin')}
            </Typography>
          </Box>
        ) : (
          <Box>
            {!token ? (
              <Box>
                <Alert severity="error" sx={{ mb: 2 }}>
                  {formError}
                </Alert>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                    {t('auth.requestNewLink')}
                  </Link>
                </Box>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit}>
                {(error || formError) && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {formError || error}
                  </Alert>
                )}
                
                <TextField
                  label={t('auth.newPassword')}
                  variant="outlined"
                  fullWidth
                  required
                  type="password"
                  margin="normal"
                  name="password"
                  value={password}
                  onChange={handleChange}
                />
                
                <TextField
                  label={t('auth.confirmPassword')}
                  variant="outlined"
                  fullWidth
                  required
                  type="password"
                  margin="normal"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleChange}
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
                  {loading ? <CircularProgress size={24} /> : t('auth.setNewPassword')}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ResetPassword;
