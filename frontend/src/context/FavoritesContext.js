import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FAVORITES_ENDPOINTS } from '../utils/api';
import { AuthContext } from './AuthContext';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  // Fetch user favorites on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      // Clear favorites when user logs out
      setFavorites([]);
    }
  }, [user]);

  // Fetch user favorites
  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      const response = await axios.get(
        FAVORITES_ENDPOINTS.LIST,
        config
      );
      
      setFavorites(response.data.favorites);
      return response.data.favorites;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Failed to fetch favorites. Please try again.'
      );
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add service to favorites
  const addToFavorites = async (serviceId) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      const response = await axios.post(
        FAVORITES_ENDPOINTS.ADD,
        { serviceId },
        config
      );
      
      // Update local favorites state
      setFavorites(prev => [...prev, response.data.favorite]);
      return response.data.favorite;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Failed to add to favorites. Please try again.'
      );
      console.error('Error adding to favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  // Remove service from favorites
  const removeFromFavorites = async (serviceId) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      await axios.delete(
        FAVORITES_ENDPOINTS.REMOVE(serviceId),
        config
      );
      
      // Update local favorites state
      setFavorites(prev => prev.filter(fav => fav.service !== serviceId));
      return { success: true };
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Failed to remove from favorites. Please try again.'
      );
      console.error('Error removing from favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if a service is in favorites
  const isFavorite = (serviceId) => {
    return favorites.some(fav => fav.service === serviceId);
  };

  // Toggle favorite status
  const toggleFavorite = async (serviceId) => {
    if (isFavorite(serviceId)) {
      return removeFromFavorites(serviceId);
    } else {
      return addToFavorites(serviceId);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        error,
        fetchFavorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesProvider;
