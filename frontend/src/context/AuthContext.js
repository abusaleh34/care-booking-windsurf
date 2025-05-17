import React, { createContext, useState, useEffect } from 'react';
import { api, AUTH_ENDPOINTS } from '../utils/api';
import { useTranslation } from 'react-i18next';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Initialize auth state from localStorage or sessionStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Login user
  const login = async (email, password, remember = false) => {
    setLoading(true);
    setError('');
    setRememberMe(remember);
    
    try {
      const response = await api.post(AUTH_ENDPOINTS.LOGIN, { email, password });
      const data = response.data;
      
      setUser(data.user);
      
      // Store user data in localStorage (persistent) or sessionStorage (session only)
      if (remember) {
        localStorage.setItem('user', JSON.stringify(data.user));
        sessionStorage.removeItem('user');
      } else {
        sessionStorage.setItem('user', JSON.stringify(data.user));
        localStorage.removeItem('user');
      }
      
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || t('auth.loginFailed');
      setError(message);
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
  };

  // Forgot password
  const forgotPassword = async (email) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || t('auth.passwordResetFailed');
      setError(message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post(AUTH_ENDPOINTS.RESET_PASSWORD, { token, password });
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || t('auth.passwordResetFailed');
      setError(message);
      throw error;
    }
  };

  // Verify email
  const verifyEmail = async (token) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post(AUTH_ENDPOINTS.VERIFY_EMAIL, { token });
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || t('auth.emailVerificationFailed');
      setError(message);
      throw error;
    }
  };

  // Request OTP
  const requestOtp = async (phone) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post(AUTH_ENDPOINTS.REQUEST_OTP, { phone });
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || t('auth.otpRequestFailed');
      setError(message);
      throw error;
    }
  };

  // Verify OTP
  const verifyOtp = async (phone, code) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post(AUTH_ENDPOINTS.VERIFY_OTP, { phone, code });
      const data = response.data;
      
      setUser(data.user);
      
      // Store in session storage by default for OTP logins
      sessionStorage.setItem('user', JSON.stringify(data.user));
      
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || t('auth.otpVerificationFailed');
      setError(message);
      throw error;
    }
  };

  // Social login
  const socialLogin = async (provider, token) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post(AUTH_ENDPOINTS.SOCIAL_LOGIN, { provider, token });
      const data = response.data;
      
      setUser(data.user);
      
      // Store in session storage by default for social logins
      sessionStorage.setItem('user', JSON.stringify(data.user));
      
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || t('auth.socialLoginFailed');
      setError(message);
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError('');
      
      if (!user || !user.token) {
        throw new Error('You must be logged in to update your profile');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      const response = await api.put(AUTH_ENDPOINTS.PROFILE, profileData, config);
      
      const updatedUser = { ...user, ...response.data };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setLoading(false);
      return updatedUser;
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || t('auth.profileUpdateFailed');
      setError(message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        rememberMe,
        login,
        logout,
        forgotPassword,
        resetPassword,
        verifyEmail,
        requestOtp,
        verifyOtp,
        socialLogin,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
