import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const Register = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { register, loading, error } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  
  const [formError, setFormError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  
  const { name, email, phone, password, confirmPassword, role } = formData;
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Basic validation
    if (!name || !email || !password) {
      setFormError(t('auth.errorEmptyFields'));
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError(t('auth.errorInvalidEmail'));
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError(t('auth.errorPasswordsDoNotMatch'));
      return;
    }
    
    if (password.length < 6) {
      setFormError(t('auth.errorPasswordLength'));
      return;
    }
    
    // Validate phone number if provided
    if (phone && phone.length > 0 && phone.length < 10) {
      setFormError(t('auth.errorInvalidPhone'));
      return;
    }
    
    try {
      const userData = { name, email, phone, password, role };
      const result = await register(userData);
      
      if (result.requiresVerification) {
        setVerificationSent(true);
      } else {
        setRegistrationSuccess(true);
        
        // Redirect to dashboard after successful registration (3 seconds delay)
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Error is already set in the context
    }
  };
  
  // Render verification message if registration completed but verification required
  if (verificationSent) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            {t('auth.verificationRequired')}
          </Typography>
          
          <Alert severity="success" sx={{ mb: 3 }}>
            {t('auth.verificationEmailSent')}
          </Alert>
          
          <Typography variant="body1" paragraph>
            {t('auth.checkEmailForVerification')}
          </Typography>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              {t('auth.backToLogin')}
            </Link>
          </Box>
        </Paper>
      </Container>
    );
  }
  
  // Render success message if registration completed and no verification needed
  if (registrationSuccess) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            {t('auth.registerSuccess')}
          </Typography>
          
          <Alert severity="success" sx={{ mb: 3 }}>
            {t('auth.accountCreatedSuccess')}
          </Alert>
          
          <Typography variant="body1" paragraph>
            {t('auth.redirectingToDashboard')}
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Create an Account
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
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            fullWidth
            id="phone"
            label="Phone Number"
            name="phone"
            autoComplete="tel"
            value={phone}
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
            value={password}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">I am a</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              name="role"
              value={role}
              label="I am a"
              onChange={handleChange}
            >
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="provider">Service Provider</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : t('auth.register')}
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              {t('auth.hasAccount')}{' '}
              <Link to="/login" style={{ textDecoration: 'none' }}>
                {t('auth.login')}
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
