import React, { createContext, useState, useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/api';

export const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [serviceReviews, setServiceReviews] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, token } = useContext(AuthContext);

  // Get all reviews
  const getReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_ENDPOINTS.reviews, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setReviews(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching reviews');
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Get reviews for a specific service
  const getServiceReviews = useCallback(async (serviceId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_ENDPOINTS.services}/${serviceId}/reviews`);
      
      // Store the reviews in the serviceReviews object with the serviceId as key
      setServiceReviews(prev => ({
        ...prev,
        [serviceId]: response.data
      }));
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching service reviews');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user reviews
  const getUserReviews = useCallback(async () => {
    if (!user || !token) return [];
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_ENDPOINTS.userReviews, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching user reviews');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  // Add a review
  const addReview = useCallback(async (serviceId, reviewData) => {
    if (!user || !token) {
      setError('You must be logged in to leave a review');
      return null;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_ENDPOINTS.services}/${serviceId}/reviews`, reviewData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update the reviews list and service reviews
      setReviews(prev => [...prev, response.data]);
      setServiceReviews(prev => {
        const updatedServiceReviews = prev[serviceId] ? [...prev[serviceId], response.data] : [response.data];
        return {
          ...prev,
          [serviceId]: updatedServiceReviews
        };
      });
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding review');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  // Update a review
  const updateReview = useCallback(async (reviewId, reviewData) => {
    if (!user || !token) {
      setError('You must be logged in to update a review');
      return null;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${API_ENDPOINTS.reviews}/${reviewId}`, reviewData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update the reviews list
      setReviews(prev => prev.map(review => 
        review._id === reviewId ? response.data : review
      ));
      
      // Update the service reviews
      setServiceReviews(prev => {
        const updatedServiceReviews = {};
        Object.keys(prev).forEach(serviceId => {
          updatedServiceReviews[serviceId] = prev[serviceId].map(review => 
            review._id === reviewId ? response.data : review
          );
        });
        return updatedServiceReviews;
      });
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating review');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  // Delete a review
  const deleteReview = useCallback(async (reviewId, serviceId) => {
    if (!user || !token) {
      setError('You must be logged in to delete a review');
      return false;
    }
    
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_ENDPOINTS.reviews}/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update the reviews list
      setReviews(prev => prev.filter(review => review._id !== reviewId));
      
      // Update the service reviews
      if (serviceId) {
        setServiceReviews(prev => {
          if (!prev[serviceId]) return prev;
          
          return {
            ...prev,
            [serviceId]: prev[serviceId].filter(review => review._id !== reviewId)
          };
        });
      }
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting review');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  // Calculate average rating for a service
  const calculateAverageRating = useCallback((serviceId) => {
    if (!serviceReviews[serviceId] || serviceReviews[serviceId].length === 0) {
      return 0;
    }
    
    const totalRating = serviceReviews[serviceId].reduce(
      (sum, review) => sum + review.rating, 
      0
    );
    
    return totalRating / serviceReviews[serviceId].length;
  }, [serviceReviews]);

  // Check if user has reviewed a service
  const hasUserReviewed = useCallback((serviceId) => {
    if (!user || !serviceReviews[serviceId]) return false;
    
    return serviceReviews[serviceId].some(review => review.user._id === user._id);
  }, [user, serviceReviews]);

  // Get user's review for a service
  const getUserReviewForService = useCallback((serviceId) => {
    if (!user || !serviceReviews[serviceId]) return null;
    
    return serviceReviews[serviceId].find(review => review.user._id === user._id);
  }, [user, serviceReviews]);

  const value = {
    reviews,
    serviceReviews,
    loading,
    error,
    getReviews,
    getServiceReviews,
    getUserReviews,
    addReview,
    updateReview,
    deleteReview,
    calculateAverageRating,
    hasUserReviewed,
    getUserReviewForService
  };

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
};

export default ReviewProvider;
