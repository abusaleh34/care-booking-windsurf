import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ServiceContext } from '../../context/ServiceContext';
import { FavoritesContext } from '../../context/FavoritesContext';
import { AuthContext } from '../../context/AuthContext';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Slider, 
  FormControl, 
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Card,
  CardContent,
  Stack,
  Chip,
  Rating,
  Tooltip,
  Container,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import NavigationIcon from '@mui/icons-material/Navigation';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

// Mock geolocation for development - replace with actual API in production
const MOCK_COORDINATES = {
  riyadh: { lat: 24.7136, lng: 46.6753 },
  jeddah: { lat: 21.5433, lng: 39.1728 },
  mecca: { lat: 21.3891, lng: 39.8579 },
  medina: { lat: 24.5247, lng: 39.5692 },
  dammam: { lat: 26.4207, lng: 50.0888 }
};

const MapView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { services, loading, error, filters, updateFilters, fetchServices } = useContext(ServiceContext);
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);
  const { user } = useContext(AuthContext);
  
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [distance, setDistance] = useState(filters.distance || 50);
  const [city, setCity] = useState(filters.city || '');
  const [category, setCategory] = useState(filters.category || '');
  
  const cities = [
    { value: 'riyadh', label: 'Riyadh' },
    { value: 'jeddah', label: 'Jeddah' },
    { value: 'mecca', label: 'Mecca' },
    { value: 'medina', label: 'Medina' },
    { value: 'dammam', label: 'Dammam' }
  ];
  
  const categories = [
    { value: '', label: t('services.filter.allCategories') },
    { value: 'medical', label: t('services.form.categories.medical') },
    { value: 'wellness', label: t('services.form.categories.wellness') },
    { value: 'homecare', label: t('services.form.categories.homecare') },
    { value: 'therapy', label: t('services.form.categories.therapy') },
    { value: 'specialneeds', label: t('services.form.categories.specialneeds') },
    { value: 'elderly', label: t('services.form.categories.elderly') },
    { value: 'other', label: t('services.form.categories.other') }
  ];
  
  // Format price to include currency
  const formatPrice = (price) => {
    return `${price} ${t('common.currency')}`;
  };
  
  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          
          // In a real app, we would make an API call to reverse geocode
          // For this example, we'll just set a mock city based on proximity
          let closestCity = 'riyadh';
          let minDistance = Number.MAX_VALUE;
          
          Object.entries(MOCK_COORDINATES).forEach(([cityName, coords]) => {
            const dist = calculateDistance(
              userPos.lat, userPos.lng,
              coords.lat, coords.lng
            );
            
            if (dist < minDistance) {
              minDistance = dist;
              closestCity = cityName;
            }
          });
          
          setCity(closestCity);
          
          // Center map on user location
          if (map) {
            map.setCenter(userPos);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Riyadh if location access is denied
          setUserLocation(MOCK_COORDINATES.riyadh);
          setCity('riyadh');
        }
      );
    } else {
      // Default to Riyadh if geolocation is not supported
      setUserLocation(MOCK_COORDINATES.riyadh);
      setCity('riyadh');
    }
  };
  
  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1); 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };
  
  // Initialize map
  const initMap = useCallback(() => {
    if (window.google && window.google.maps) {
      const initialLocation = userLocation || MOCK_COORDINATES[city] || MOCK_COORDINATES.riyadh;
      
      const mapInstance = new window.google.maps.Map(document.getElementById('map'), {
        center: initialLocation,
        zoom: 12,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false
      });
      
      // Add user location marker if available
      if (userLocation) {
        new window.google.maps.Marker({
          position: userLocation,
          map: mapInstance,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          },
          title: t('services.yourLocation')
        });
        
        // Draw circle for distance filter
        new window.google.maps.Circle({
          strokeColor: '#4285F4',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#4285F4',
          fillOpacity: 0.1,
          map: mapInstance,
          center: userLocation,
          radius: distance * 1000 // Convert km to meters
        });
      }
      
      setMap(mapInstance);
    } else {
      console.error('Google Maps JavaScript API not loaded');
    }
  }, [userLocation, city, distance, t]);
  
  // Load Google Maps API
  useEffect(() => {
    if (!window.google || !window.google.maps) {
      const googleMapsScript = document.createElement('script');
      googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
      googleMapsScript.async = true;
      googleMapsScript.defer = true;
      googleMapsScript.onload = () => {
        // Initialize map after API loads
        initMap();
      };
      document.head.appendChild(googleMapsScript);
      
      return () => {
        // Clean up
        document.head.removeChild(googleMapsScript);
      };
    } else {
      // API already loaded
      initMap();
    }
  }, [initMap]);
  
  // Get user location on component mount
  useEffect(() => {
    getUserLocation();
  }, []);
  
  // Apply filters and fetch services
  useEffect(() => {
    const newFilters = {
      ...filters,
      city,
      category,
      distance
    };
    updateFilters(newFilters);
  }, [city, category, distance]);
  
  // Create markers for services
  useEffect(() => {
    if (map && services.length > 0 && userLocation) {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));
      const newMarkers = [];
      
      services.forEach(service => {
        // In a real app, service would have lat/lng in its data
        // For this example, we'll use the city coordinates or add a small random offset
        let position;
        if (service.location && service.location.coordinates) {
          position = {
            lat: service.location.coordinates[1],
            lng: service.location.coordinates[0]
          };
        } else if (service.city && MOCK_COORDINATES[service.city.toLowerCase()]) {
          position = MOCK_COORDINATES[service.city.toLowerCase()];
          // Add a small random offset to avoid markers stacking
          position.lat += (Math.random() - 0.5) * 0.01;
          position.lng += (Math.random() - 0.5) * 0.01;
        } else {
          // Default to user location with offset if no location data
          position = {
            lat: userLocation.lat + (Math.random() - 0.5) * 0.05,
            lng: userLocation.lng + (Math.random() - 0.5) * 0.05
          };
        }
        
        const marker = new window.google.maps.Marker({
          position,
          map,
          title: service.name,
          animation: window.google.maps.Animation.DROP
        });
        
        marker.addListener('click', () => {
          setSelectedService(service);
        });
        
        newMarkers.push(marker);
      });
      
      setMarkers(newMarkers);
    }
  }, [map, services, userLocation]);
  
  const handleDistanceChange = (event, newValue) => {
    setDistance(newValue);
  };
  
  const handleCityChange = (event) => {
    const cityValue = event.target.value;
    setCity(cityValue);
    
    // Update map center when city changes
    if (map && MOCK_COORDINATES[cityValue]) {
      map.setCenter(MOCK_COORDINATES[cityValue]);
      setUserLocation(MOCK_COORDINATES[cityValue]);
    }
  };
  
  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };
  
  const handleServiceClick = (service) => {
    navigate(`/services/${service._id}`);
  };
  
  const handleFavoriteToggle = (e, service) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login?redirect=/services/map');
      return;
    }
    toggleFavorite(service._id);
  };
  
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('services.mapView')}
        </Typography>
        
        <Grid container spacing={3}>
          {/* Filters */}
          <Grid item xs={12} md={3}>
            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('services.filter.filters')}
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{t('services.location')}</InputLabel>
                <Select
                  value={city}
                  onChange={handleCityChange}
                  label={t('services.location')}
                >
                  {cities.map(city => (
                    <MenuItem key={city.value} value={city.value}>
                      {city.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<MyLocationIcon />}
                  onClick={getUserLocation}
                >
                  {t('services.useMyLocation')}
                </Button>
              </Box>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{t('services.category')}</InputLabel>
                <Select
                  value={category}
                  onChange={handleCategoryChange}
                  label={t('services.category')}
                >
                  {categories.map(cat => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Typography gutterBottom>
                {t('services.filter.maxDistance')}: {distance} {t('services.filter.km')}
              </Typography>
              <Slider
                value={distance}
                onChange={handleDistanceChange}
                valueLabelDisplay="auto"
                step={5}
                marks
                min={5}
                max={100}
              />
            </Paper>
            
            {/* Selected Service Info */}
            {selectedService && (
              <Paper elevation={3} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" noWrap sx={{ maxWidth: '85%' }}>
                    {selectedService.name}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => setSelectedService(null)}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
                
                <Box sx={{ mb: 1 }}>
                  <Rating 
                    value={selectedService.rating?.average || 0} 
                    precision={0.5} 
                    readOnly 
                    size="small" 
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {selectedService.description?.substring(0, 100)}...
                </Typography>
                
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <LocationOnIcon color="primary" fontSize="small" />
                  <Typography variant="body2" noWrap>
                    {selectedService.city || t('services.locationNotSpecified')}
                  </Typography>
                </Stack>
                
                <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                  {formatPrice(selectedService.price)}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={user && isFavorite(selectedService._id) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                    onClick={(e) => handleFavoriteToggle(e, selectedService)}
                  >
                    {user && isFavorite(selectedService._id) 
                      ? t('services.removeFavorite') 
                      : t('services.addFavorite')}
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={<NavigationIcon />}
                    onClick={() => handleServiceClick(selectedService)}
                  >
                    {t('services.viewDetails')}
                  </Button>
                </Box>
              </Paper>
            )}
          </Grid>
          
          {/* Map */}
          <Grid item xs={12} md={9}>
            <Paper 
              elevation={3} 
              sx={{ 
                height: '70vh', 
                position: 'relative',
                overflow: 'hidden' 
              }}
            >
              {loading && (
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    backgroundColor: 'rgba(255,255,255,0.7)', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    zIndex: 10
                  }}
                >
                  <CircularProgress />
                </Box>
              )}
              
              {error && (
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 10, 
                    left: 10, 
                    right: 10, 
                    zIndex: 10
                  }}
                >
                  <Alert severity="error">
                    {error}
                  </Alert>
                </Box>
              )}
              
              <div 
                id="map" 
                style={{ width: '100%', height: '100%' }}
              />
              
              {/* Display number of results */}
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: 10, 
                  left: 10, 
                  padding: '8px 16px',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: 1,
                  boxShadow: 1
                }}
              >
                <Typography variant="body2">
                  {services.length} {t('services.servicesFound')}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default MapView;
