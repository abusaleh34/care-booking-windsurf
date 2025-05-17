import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPayment, setCurrentPayment] = useState(null);

  // Process payment for a booking
  const processPayment = async (paymentData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !user.token) {
        throw new Error('You must be logged in to make a payment');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      const response = await axios.post(
        'http://localhost:5000/api/payments/process',
        paymentData,
        config
      );
      
      // Update payments list
      const newPayment = response.data.payment;
      setPayments([newPayment, ...payments]);
      setCurrentPayment(newPayment);
      
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Payment processing failed. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get user's payments
  const fetchUserPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !user.token) {
        throw new Error('You must be logged in to view payments');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      const response = await axios.get(
        'http://localhost:5000/api/payments/me',
        config
      );
      
      setPayments(response.data);
      
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Failed to fetch payments. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get a single payment by ID
  const getPaymentById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !user.token) {
        throw new Error('You must be logged in to view payment details');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      const response = await axios.get(
        `http://localhost:5000/api/payments/${id}`,
        config
      );
      
      setCurrentPayment(response.data);
      
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Failed to fetch payment details. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Process refund (admin only)
  const processRefund = async (refundData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !user.token || user.role !== 'admin') {
        throw new Error('Only administrators can process refunds');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      const response = await axios.post(
        'http://localhost:5000/api/payments/refund',
        refundData,
        config
      );
      
      // Update payments list and current payment
      const updatedPayment = response.data.payment;
      setPayments(payments.map(payment => 
        payment._id === updatedPayment._id ? updatedPayment : payment
      ));
      
      if (currentPayment && currentPayment._id === updatedPayment._id) {
        setCurrentPayment(updatedPayment);
      }
      
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Refund processing failed. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaymentContext.Provider
      value={{
        payments,
        loading,
        error,
        currentPayment,
        processPayment,
        fetchUserPayments,
        getPaymentById,
        processRefund
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};
