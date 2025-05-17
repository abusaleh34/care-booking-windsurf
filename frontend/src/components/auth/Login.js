import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
  CircularProgress,
  Divider,
  Checkbox,
  FormControlLabel,
  Stack,
  IconButton
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import AppleIcon from '@mui/icons-material/Apple';
import PhoneIcon from '@mui/icons-material/Phone';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { 
    login, 
    loading, 
    error, 
    socialLogin,
    rememberMe: contextRememberMe
  } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formError, setFormError] = useState('');
  const [rememberMe, setRememberMeState] = useState(false);
  
  // Get redirect path from location state or query params
  const redirectPath = location.state?.from || new URLSearchParams(location.search).get('redirect') || '/';
  
  const { email, password } = formData;
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!email || !password) {
      setFormError(t('auth.errorEmptyFields'));
      return;
    }
    
    try {
      await login(email, password, rememberMe);
      navigate(redirectPath);
    } catch (error) {
      console.error('Login error:', error);
      // Error is already set in the context
    }
  };
  
  // Handle social login
  const handleSocialLogin = async (provider) => {
    try {
      // In a real implementation, this would integrate with the provider's SDK
      // For now, we'll simulate the OAuth flow with a mock token
      const mockToken = 'mock-oauth-token-' + Date.now();
      await socialLogin(provider, mockToken);
      navigate(redirectPath);
    } catch (error) {
      console.error(`${provider} login error:`, error);
      // Error is already set in the context
    }
  };
  
  // Handle remember me change
  const handleRememberMe = (e) => {
    setRememberMeState(e.target.checked);
  };
  
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {t('auth.login')}
        </Typography>
        
        {(error || formError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError || error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={handleChange}
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={handleRememberMe}
                color="primary"
              />
            }
            label={t('auth.rememberMe')}
            sx={{ mt: 1 }}
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
            {loading ? <CircularProgress size={24} /> : t('auth.login')}
          </Button>
          
          <Box sx={{ mt: 1, mb: 2, textAlign: 'center' }}>
            <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
              {t('auth.forgotPassword')}
            </Link>
          </Box>
          
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {t('auth.orLoginWith')}
            </Typography>
          </Divider>
          
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
            <IconButton 
              aria-label="login with Google" 
              size="large" 
              onClick={() => handleSocialLogin('google')} 
              sx={{ 
                bgcolor: '#f2f2f2', 
                '&:hover': { bgcolor: '#e6e6e6' } 
              }}
            >
              <GoogleIcon sx={{ color: '#DB4437' }} />
            </IconButton>
            <IconButton 
              aria-label="login with Facebook" 
              size="large" 
              onClick={() => handleSocialLogin('facebook')} 
              sx={{ 
                bgcolor: '#f2f2f2', 
                '&:hover': { bgcolor: '#e6e6e6' } 
              }}
            >
              <FacebookIcon sx={{ color: '#4267B2' }} />
            </IconButton>
            <IconButton 
              aria-label="login with Apple" 
              size="large" 
              onClick={() => handleSocialLogin('apple')} 
              sx={{ 
                bgcolor: '#f2f2f2', 
                '&:hover': { bgcolor: '#e6e6e6' } 
              }}
            >
              <AppleIcon sx={{ color: '#000000' }} />
            </IconButton>
            <IconButton 
              aria-label="login with Phone" 
              size="large" 
              onClick={() => navigate('/login/phone')} 
              sx={{ 
                bgcolor: '#f2f2f2', 
                '&:hover': { bgcolor: '#e6e6e6' } 
              }}
            >
              <PhoneIcon sx={{ color: '#00C853' }} />
            </IconButton>
          </Stack>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              {t('auth.noAccount')}{' '}
              <Link to="/register" style={{ textDecoration: 'none' }}>
                {t('auth.register')}
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
