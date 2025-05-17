import React, { createContext, useState, useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/api';

export const ProviderContext = createContext();

export const ProviderProvider = ({ children }) => {
  const [providerProfile, setProviderProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [metrics, setMetrics] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    bookingsThisMonth: 0,
    pendingBookings: 0,
    revenueByMonth: [],
    topServices: [],
    bookingsByStatus: {},
    bookingsByDay: [],
    averageRating: 0,
    repeatCustomersPercentage: 0,
    retentionRate: 0,
    averageCustomerValue: 0,
    growthRate: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, token } = useContext(AuthContext);

  // Check if user is a provider
  const isProvider = useCallback(() => {
    return user && (user.role === 'provider' || user.role === 'admin');
  }, [user]);

  // Get provider profile
  const getProviderProfile = useCallback(async () => {
    if (!isProvider() || !token) {
      setProviderProfile(null);
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_ENDPOINTS.providers + '/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProviderProfile(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching provider profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isProvider, token]);

  // Update provider profile
  const updateProviderProfile = useCallback(async (profileData) => {
    if (!isProvider() || !token) {
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(
        API_ENDPOINTS.providers + '/profile',
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProviderProfile(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating provider profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isProvider, token]);

  // Get provider services
  const getProviderServices = useCallback(async () => {
    if (!isProvider() || !token) {
      setServices([]);
      return [];
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        API_ENDPOINTS.providers + '/services',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setServices(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching provider services');
      return [];
    } finally {
      setLoading(false);
    }
  }, [isProvider, token]);

  // Add a new service
  const addService = useCallback(async (serviceData) => {
    if (!isProvider() || !token) {
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        API_ENDPOINTS.services,
        serviceData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the services list
      setServices(prev => [...prev, response.data]);
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding service');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isProvider, token]);

  // Update a service
  const updateService = useCallback(async (serviceId, serviceData) => {
    if (!isProvider() || !token) {
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(
        `${API_ENDPOINTS.services}/${serviceId}`,
        serviceData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the services list
      setServices(prev => 
        prev.map(service => service._id === serviceId ? response.data : service)
      );
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating service');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isProvider, token]);

  // Delete a service
  const deleteService = useCallback(async (serviceId) => {
    if (!isProvider() || !token) {
      return false;
    }

    setLoading(true);
    setError(null);
    try {
      await axios.delete(
        `${API_ENDPOINTS.services}/${serviceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the services list
      setServices(prev => prev.filter(service => service._id !== serviceId));
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting service');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isProvider, token]);

  // Get provider bookings
  const getProviderBookings = useCallback(async (params = {}) => {
    if (!isProvider() || !token) {
      setBookings([]);
      return [];
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        API_ENDPOINTS.providers + '/bookings',
        { 
          headers: { Authorization: `Bearer ${token}` },
          params
        }
      );
      setBookings(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching provider bookings');
      return [];
    } finally {
      setLoading(false);
    }
  }, [isProvider, token]);

  // Update booking status
  const updateBookingStatus = useCallback(async (bookingId, status, notes = '') => {
    if (!isProvider() || !token) {
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(
        `${API_ENDPOINTS.bookings}/${bookingId}/status`,
        { status, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update bookings list
      setBookings(prev => 
        prev.map(booking => booking._id === bookingId ? response.data : booking)
      );
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating booking status');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isProvider, token]);

  // Get provider metrics
  const getProviderMetrics = useCallback(async (timeRange = 'month') => {
    if (!isProvider() || !token) {
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        API_ENDPOINTS.providers + '/metrics',
        { 
          headers: { Authorization: `Bearer ${token}` },
          params: { timeRange } 
        }
      );
      
      setMetrics(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching provider metrics');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isProvider, token]);

  // Get provider availability
  const getProviderAvailability = useCallback(async () => {
    if (!isProvider() || !token) {
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        API_ENDPOINTS.providers + '/availability',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setAvailability(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching provider availability');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isProvider, token]);

  // Update provider availability
  const updateProviderAvailability = useCallback(async (availabilityData) => {
    if (!isProvider() || !token) {
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(
        API_ENDPOINTS.providers + '/availability',
        availabilityData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setAvailability(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating provider availability');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isProvider, token]);

  // Respond to a review
  const respondToReview = useCallback(async (reviewId, response) => {
    if (!isProvider() || !token) {
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        `${API_ENDPOINTS.reviews}/${reviewId}/respond`,
        { response },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error responding to review');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isProvider, token]);

  // Get provider insights
  const getProviderInsights = useCallback(async () => {
    if (!isProvider() || !token) {
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        API_ENDPOINTS.providers + '/insights',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching provider insights');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isProvider, token]);

  const value = {
    providerProfile,
    services,
    bookings,
    availability,
    metrics,
    loading,
    error,
    isProvider,
    getProviderProfile,
    updateProviderProfile,
    getProviderServices,
    addService,
    updateService,
    deleteService,
    getProviderBookings,
    updateBookingStatus,
    getProviderMetrics,
    getProviderAvailability,
    updateProviderAvailability,
    respondToReview,
    getProviderInsights
  };

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  );
};

export default ProviderProvider;
