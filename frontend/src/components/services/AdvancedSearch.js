import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Chip,
  Box
} from '@mui/material';
import { ServiceContext } from '../../context/ServiceContext';

const AdvancedSearch = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { filters, updateFilters, fetchServices } = useContext(ServiceContext);
  const [localFilters, setLocalFilters] = useState({
    ...filters,
    priceRange: [filters.minPrice || 0, filters.maxPrice || 1000],
    rating: filters.rating || 0,
    availability: filters.availability || [],
    features: filters.features || [],
    distance: filters.distance || 50
  });
  
  const categories = [
    { value: 'medical', label: t('services.form.categories.medical') },
    { value: 'wellness', label: t('services.form.categories.wellness') },
    { value: 'homecare', label: t('services.form.categories.homecare') },
    { value: 'therapy', label: t('services.form.categories.therapy') },
    { value: 'specialneeds', label: t('services.form.categories.specialneeds') },
    { value: 'elderly', label: t('services.form.categories.elderly') },
    { value: 'other', label: t('services.form.categories.other') }
  ];
  
  const locations = [
    "Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", 
    "Taif", "Khobar", "Qatif", "Tabuk", "Abha", "Najran", "Yanbu"
  ];
  
  const serviceFeatures = [
    { value: 'homeVisit', label: t('services.features.homeVisit') },
    { value: 'onlineConsultation', label: t('services.features.onlineConsultation') },
    { value: '24hours', label: t('services.features.24hours') },
    { value: 'insurance', label: t('services.features.insurance') },
    { value: 'femaleStaff', label: t('services.features.femaleStaff') },
    { value: 'maleStaff', label: t('services.features.maleStaff') },
    { value: 'specialNeeds', label: t('services.features.specialNeeds') },
    { value: 'languageSupport', label: t('services.features.languageSupport') }
  ];
  
  const timeSlots = [
    { value: 'morning', label: t('services.timeSlots.morning') },
    { value: 'afternoon', label: t('services.timeSlots.afternoon') },
    { value: 'evening', label: t('services.timeSlots.evening') },
    { value: 'night', label: t('services.timeSlots.night') }
  ];
  
  useEffect(() => {
    if (open) {
      setLocalFilters({
        ...filters,
        priceRange: [filters.minPrice || 0, filters.maxPrice || 1000],
        rating: filters.rating || 0,
        availability: filters.availability || [],
        features: filters.features || [],
        distance: filters.distance || 50
      });
    }
  }, [open, filters]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePriceChange = (e, newValue) => {
    setLocalFilters(prev => ({ ...prev, priceRange: newValue }));
  };
  
  const handleRatingChange = (e, newValue) => {
    setLocalFilters(prev => ({ ...prev, rating: newValue }));
  };
  
  const handleDistanceChange = (e, newValue) => {
    setLocalFilters(prev => ({ ...prev, distance: newValue }));
  };
  
  const handleFeatureToggle = (feature) => {
    setLocalFilters(prev => {
      const features = [...(prev.features || [])];
      const index = features.indexOf(feature);
      
      if (index === -1) {
        features.push(feature);
      } else {
        features.splice(index, 1);
      }
      
      return { ...prev, features };
    });
  };
  
  const handleTimeSlotToggle = (slot) => {
    setLocalFilters(prev => {
      const availability = [...(prev.availability || [])];
      const index = availability.indexOf(slot);
      
      if (index === -1) {
        availability.push(slot);
      } else {
        availability.splice(index, 1);
      }
      
      return { ...prev, availability };
    });
  };
  
  const handleApply = () => {
    const filtersToApply = {
      ...localFilters,
      minPrice: localFilters.priceRange[0],
      maxPrice: localFilters.priceRange[1]
    };
    
    delete filtersToApply.priceRange;
    
    updateFilters(filtersToApply);
    fetchServices(1);
    onClose();
  };
  
  const handleReset = () => {
    const resetFilters = {
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
    };
    
    setLocalFilters({
      ...resetFilters,
      priceRange: [0, 1000]
    });
    
    updateFilters(resetFilters);
    fetchServices(1);
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t('services.filter.advancedSearchTitle')}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('services.filter.searchKeywords')}
              name="search"
              value={localFilters.search || ''}
              onChange={handleChange}
              placeholder={t('services.filter.searchPlaceholder')}
              variant="outlined"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('services.category')}</InputLabel>
              <Select
                name="category"
                value={localFilters.category || ''}
                onChange={handleChange}
                label={t('services.category')}
              >
                <MenuItem value="">{t('services.filter.allCategories')}</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('services.location')}</InputLabel>
              <Select
                name="city"
                value={localFilters.city || ''}
                onChange={handleChange}
                label={t('services.location')}
              >
                <MenuItem value="">{t('services.filter.allLocations')}</MenuItem>
                {locations.map(location => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Typography gutterBottom>
              {t('services.filter.priceRange')}: {localFilters.priceRange[0]} - {localFilters.priceRange[1]} {t('common.currency')}
            </Typography>
            <Slider
              value={localFilters.priceRange}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              min={0}
              max={1000}
              step={50}
              marks={[
                { value: 0, label: '0' },
                { value: 250, label: '250' },
                { value: 500, label: '500' },
                { value: 750, label: '750' },
                { value: 1000, label: '1000' }
              ]}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography gutterBottom>
              {t('services.filter.minimumRating')}: {localFilters.rating} {t('services.filter.stars')}
            </Typography>
            <Slider
              value={localFilters.rating}
              onChange={handleRatingChange}
              valueLabelDisplay="auto"
              min={0}
              max={5}
              step={0.5}
              marks={[
                { value: 0, label: '0' },
                { value: 1, label: '1' },
                { value: 2, label: '2' },
                { value: 3, label: '3' },
                { value: 4, label: '4' },
                { value: 5, label: '5' }
              ]}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography gutterBottom>
              {t('services.filter.maxDistance')}: {localFilters.distance} {t('services.filter.km')}
            </Typography>
            <Slider
              value={localFilters.distance}
              onChange={handleDistanceChange}
              valueLabelDisplay="auto"
              min={1}
              max={100}
              step={5}
              marks={[
                { value: 5, label: '5' },
                { value: 25, label: '25' },
                { value: 50, label: '50' },
                { value: 75, label: '75' },
                { value: 100, label: '100' }
              ]}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography gutterBottom>
              {t('services.filter.availableDays')}:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                <Chip
                  key={day}
                  label={t(`services.filter.days.${day}`)}
                  clickable
                  color={localFilters.day === day ? 'primary' : 'default'}
                  onClick={() => setLocalFilters(prev => ({ 
                    ...prev, 
                    day: prev.day === day ? '' : day 
                  }))}
                />
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Typography gutterBottom>
              {t('services.filter.timeSlots')}:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {timeSlots.map(slot => (
                <Chip
                  key={slot.value}
                  label={slot.label}
                  clickable
                  color={localFilters.availability.includes(slot.value) ? 'primary' : 'default'}
                  onClick={() => handleTimeSlotToggle(slot.value)}
                />
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Typography gutterBottom>
              {t('services.filter.features')}:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {serviceFeatures.map(feature => (
                <Chip
                  key={feature.value}
                  label={feature.label}
                  clickable
                  color={localFilters.features.includes(feature.value) ? 'primary' : 'default'}
                  onClick={() => handleFeatureToggle(feature.value)}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="secondary">
          {t('services.filter.resetAll')}
        </Button>
        <Button onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button onClick={handleApply} color="primary" variant="contained">
          {t('services.filter.applyFilters')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdvancedSearch;
