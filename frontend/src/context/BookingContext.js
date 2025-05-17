import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { BOOKING_ENDPOINTS } from '../utils/api';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentBooking, setCurrentBooking] = useState(null);

  // Create a new booking
  const createBooking = async (bookingData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !user.token) {
        throw new Error('You must be logged in to create a booking');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      const response = await axios.post(
        BOOKING_ENDPOINTS.CREATE,
        bookingData,
        config
      );
      
      // Update bookings list
      setBookings([response.data, ...bookings]);
      setCurrentBooking(response.data);
      
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Failed to create booking. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get bookings for the current user
  const fetchMyBookings = async (status = '') => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !user.token) {
        throw new Error('You must be logged in to view bookings');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      const queryParams = status ? `?status=${status}` : '';
      
      const response = await axios.get(
        `${BOOKING_ENDPOINTS.LIST_MY}${queryParams}`,
        config
      );
      
      setBookings(response.data);
      
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Failed to fetch bookings. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get a single booking by ID
  const getBookingById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !user.token) {
        throw new Error('You must be logged in to view booking details');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      const response = await axios.get(
        BOOKING_ENDPOINTS.DETAIL(id),
        config
      );
      
      setCurrentBooking(response.data);
      
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Failed to fetch booking details. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update booking status
  const updateBookingStatus = async (id, status, reason = '') => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !user.token) {
        throw new Error('You must be logged in to update booking');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      const response = await axios.put(
        BOOKING_ENDPOINTS.UPDATE_STATUS(id),
        { status, reason },
        config
      );
      
      // Update bookings list and current booking
      setBookings(bookings.map(booking => 
        booking._id === id ? response.data : booking
      ));
      
      if (currentBooking && currentBooking._id === id) {
        setCurrentBooking(response.data);
      }
      
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Failed to update booking status. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add a rating to a booking
  const addBookingRating = async (id, rating, comment = '') => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !user.token) {
        throw new Error('You must be logged in to rate a booking');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      const response = await axios.post(
        BOOKING_ENDPOINTS.ADD_RATING(id),
        { rating, comment },
        config
      );
      
      // Update bookings list and current booking
      setBookings(bookings.map(booking => 
        booking._id === id ? response.data : booking
      ));
      
      if (currentBooking && currentBooking._id === id) {
        setCurrentBooking(response.data);
      }
      
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Failed to add rating. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        loading,
        error,
        currentBooking,
        createBooking,
        fetchMyBookings,
        getBookingById,
        updateBookingStatus,
        addBookingRating
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
