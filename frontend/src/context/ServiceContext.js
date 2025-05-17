import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { SERVICE_ENDPOINTS } from '../utils/api';

export const ServiceContext = createContext();

export const ServiceProvider = ({ children }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    city: '',
    search: '',
    day: '',
    rating: 0,
    features: [],
    availability: [],
    distance: 50,
    sort: '-createdAt'
  });

  // Fetch services with current filters and pagination
  const fetchServices = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query string from filters
      let queryParams = `?page=${page}&limit=${pagination.limit}`;
      
      if (filters.category) queryParams += `&category=${filters.category}`;
      if (filters.minPrice) queryParams += `&minPrice=${filters.minPrice}`;
      if (filters.maxPrice) queryParams += `&maxPrice=${filters.maxPrice}`;
      if (filters.city) queryParams += `&city=${filters.city}`;
      if (filters.search) queryParams += `&search=${filters.search}`;
      if (filters.day) queryParams += `&day=${filters.day}`;
      if (filters.rating > 0) queryParams += `&rating=${filters.rating}`;
      if (filters.distance) queryParams += `&distance=${filters.distance}`;
      if (filters.sort) queryParams += `&sort=${filters.sort}`;
      
      // Add features as multiple parameters
      if (filters.features && filters.features.length > 0) {
        filters.features.forEach(feature => {
          queryParams += `&features[]=${feature}`;
        });
      }
      
      // Add availability time slots as multiple parameters
      if (filters.availability && filters.availability.length > 0) {
        filters.availability.forEach(timeSlot => {
          queryParams += `&availability[]=${timeSlot}`;
        });
      }
      
      const response = await axios.get(
        `${SERVICE_ENDPOINTS.LIST}${queryParams}`
      );
      
      setServices(response.data.services);
      setPagination({
        ...pagination,
        ...response.data.pagination,
        page
      });
      
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Failed to fetch services. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get a single service by ID
  const getServiceById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        SERVICE_ENDPOINTS.DETAIL(id)
      );
      
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Failed to fetch service details. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update filters and fetch services
  const updateFilters = async (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Reset to page 1 when filters change
    return fetchServices(1);
  };

  // Provider-only function to create a service
  const createService = async (serviceData, token) => {
    try {
      setLoading(true);
      setError(null);
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.post(
        SERVICE_ENDPOINTS.CREATE,
        serviceData,
        config
      );
      
      // Refresh the services list
      await fetchServices(pagination.page);
      
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Failed to create service. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Provider-only function to update a service
  const updateService = async (id, serviceData, token) => {
    try {
      setLoading(true);
      setError(null);
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.put(
        SERVICE_ENDPOINTS.UPDATE(id),
        serviceData,
        config
      );
      
      // Refresh the services list
      await fetchServices(pagination.page);
      
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Failed to update service. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Provider-only function to delete a service
  const deleteService = async (id, token) => {
    try {
      setLoading(true);
      setError(null);
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.delete(
        SERVICE_ENDPOINTS.DELETE(id),
        config
      );
      
      // Refresh the services list
      await fetchServices(pagination.page);
      
      return { success: true, message: 'Service deleted successfully' };
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Failed to delete service. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ServiceContext.Provider
      value={{
        services,
        loading,
        error,
        pagination,
        filters,
        fetchServices,
        getServiceById,
        updateFilters,
        createService,
        updateService,
        deleteService
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};
