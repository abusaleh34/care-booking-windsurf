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
  Stepper,
  Step,
  StepLabel
} from '@mui/material';

const PhoneLogin = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { requestOtp, verifyOtp, loading, error } = useContext(AuthContext);
  
  const [activeStep, setActiveStep] = useState(0);
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [formError, setFormError] = useState('');
  
  const steps = [
    t('auth.enterPhone'),
    t('auth.verifyCode')
  ];
  
  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
  };
  
  const handleCodeChange = (e) => {
    setOtpCode(e.target.value);
  };
  
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Basic phone validation
    if (!phone || phone.length < 10) {
      setFormError(t('auth.errorInvalidPhone'));
      return;
    }
    
    try {
      await requestOtp(phone);
      setActiveStep(1);
    } catch (error) {
      console.error('OTP request error:', error);
      // Error is already set in context
    }
  };
  
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!otpCode || otpCode.length < 4) {
      setFormError(t('auth.errorInvalidCode'));
      return;
    }
    
    try {
      await verifyOtp(phone, otpCode);
      navigate('/');
    } catch (error) {
      console.error('OTP verification error:', error);
      // Error is already set in context
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {t('auth.phoneLogin')}
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {(error || formError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError || error}
          </Alert>
        )}
        
        {activeStep === 0 ? (
          <Box component="form" onSubmit={handleRequestOTP}>
            <TextField
              label={t('auth.phoneNumber')}
              variant="outlined"
              fullWidth
              required
              margin="normal"
              name="phone"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+1 234 567 8900"
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
              {loading ? <CircularProgress size={24} /> : t('auth.sendCode')}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                {t('auth.backToLogin')}
              </Link>
            </Box>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleVerifyOTP}>
            <Typography variant="body1" gutterBottom align="center">
              {t('auth.codeSentTo')} {phone}
            </Typography>
            
            <TextField
              label={t('auth.verificationCode')}
              variant="outlined"
              fullWidth
              required
              margin="normal"
              name="otpCode"
              value={otpCode}
              onChange={handleCodeChange}
              placeholder="1234"
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
              {loading ? <CircularProgress size={24} /> : t('auth.verify')}
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="text"
                onClick={() => setActiveStep(0)}
                disabled={loading}
              >
                {t('auth.changePhone')}
              </Button>
              
              <Button
                variant="text"
                onClick={() => handleRequestOtp({ preventDefault: () => {} })}
                disabled={loading}
              >
                {t('auth.resendCode')}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PhoneLogin;
