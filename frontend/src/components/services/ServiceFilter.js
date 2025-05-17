import React, { useContext, useState } from 'react';
import { ServiceContext } from '../../context/ServiceContext';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Grid,
  TextField,
  InputAdornment,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Chip,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AdvancedSearch from './AdvancedSearch';

const ServiceFilter = () => {
  const { t } = useTranslation();
  const { filters, updateFilters } = useContext(ServiceContext);
  const [localFilters, setLocalFilters] = useState({ ...filters });
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);

  const categories = [
    { value: '', label: t('services.filter.allCategories') },
    { value: 'medical', label: t('services.form.categories.medical') },
    { value: 'wellness', label: t('services.form.categories.wellness') },
    { value: 'homecare', label: t('services.form.categories.homecare') },
    { value: 'therapy', label: t('services.form.categories.therapy') },
    { value: 'other', label: t('services.form.categories.other') }
  ];

  const days = [
    { value: '', label: t('services.filter.anyDay') },
    { value: 'monday', label: t('services.filter.days.monday') },
    { value: 'tuesday', label: t('services.filter.days.tuesday') },
    { value: 'wednesday', label: t('services.filter.days.wednesday') },
    { value: 'thursday', label: t('services.filter.days.thursday') },
    { value: 'friday', label: t('services.filter.days.friday') },
    { value: 'saturday', label: t('services.filter.days.saturday') },
    { value: 'sunday', label: t('services.filter.days.sunday') }
  ];

  const sortOptions = [
    { value: '-createdAt', label: t('services.filter.sort.newest') },
    { value: 'createdAt', label: t('services.filter.sort.oldest') },
    { value: 'price', label: t('services.filter.sort.priceLowToHigh') },
    { value: '-price', label: t('services.filter.sort.priceHighToLow') },
    { value: '-rating.average', label: t('services.filter.sort.highestRated') }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateFilters(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      city: '',
      search: '',
      day: '',
      sort: '-createdAt'
    };
    setLocalFilters(resetFilters);
    updateFilters(resetFilters);
  };

  const handleSearch = () => {
    updateFilters(localFilters);
  };

  const handleFilterDelete = (filter) => {
    const newFilters = { ...filters };
    delete newFilters[filter];
    updateFilters(newFilters);
  };

  const handleClearAllFilters = () => {
    const resetFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      city: '',
      search: '',
      day: '',
      sort: '-createdAt'
    };
    setLocalFilters(resetFilters);
    updateFilters(resetFilters);
  };

  const applyFilters = () => {
    updateFilters(localFilters);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder={t('services.filter.searchPlaceholder')}
            name="search"
            value={localFilters.search || ''}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>{t('services.category')}</InputLabel>
            <Select
              labelId="category-label"
              id="category"
              name="category"
              value={localFilters.category}
              label={t('services.category')}
              onChange={handleChange}
            >
              {categories.map(category => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={2}>
          <Button
            onClick={applyFilters}
            variant="contained"
            color="primary"
            sx={{ ml: 1 }}
          >
            {t('common.search')}
          </Button>
        </Grid>
        
        <Grid item xs={12} md={2}>
          <Button
            onClick={() => setAdvancedSearchOpen(true)}
            startIcon={<FilterListIcon />}
            variant="outlined"
            sx={{ ml: 1 }}
          >
            {t('services.filter.advanced')}
          </Button>
        </Grid>
        
        {Object.entries(filters).some(([key, value]) => 
          value && key !== 'sort' && key !== 'search'
        ) && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>Active filters:</Typography>
              {filters.category && (
                <Chip 
                  label={`Category: ${filters.category}`} 
                  onDelete={() => handleFilterDelete('category')} 
                  size="small"
                />
              )}
              {filters.city && (
                <Chip 
                  label={`Location: ${filters.city}`} 
                  onDelete={() => handleFilterDelete('city')} 
                  size="small"
                />
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <Chip 
                  label={`Price: $${filters.minPrice || 0} - $${filters.maxPrice || '∞'}`} 
                  onDelete={() => handleFilterDelete('price')} 
                  size="small"
                />
              )}
              {filters.day && (
                <Chip 
                  label={`Day: ${filters.day.charAt(0).toUpperCase() + filters.day.slice(1)}`} 
                  onDelete={() => handleFilterDelete('day')} 
                  size="small"
                />
              )}
              <Button 
                variant="text" 
                size="small" 
                onClick={handleClearAllFilters}
              >
                Clear All
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
      
      <AdvancedSearch 
        open={advancedSearchOpen} 
        onClose={() => setAdvancedSearchOpen(false)} 
      />
    </Paper>
  );
};

export default ServiceFilter;
