import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FavoritesContext } from '../../context/FavoritesContext';
import { AuthContext } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Rating,
  Chip,
  CardActions,
  Divider,
  Stack,
  Tooltip,
  IconButton
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HomeIcon from '@mui/icons-material/Home';
import VideocamIcon from '@mui/icons-material/Videocam';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

// Default image if service has no images
const DEFAULT_IMAGE = 'https://via.placeholder.com/300x200?text=Service';

const ServiceItem = ({ service }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { isFavorite, toggleFavorite, loading } = useContext(FavoritesContext);
  
  const isServiceFavorite = user ? isFavorite(service._id) : false;
  
  const handleFavoriteToggle = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login?redirect=/services');
      return;
    }
    toggleFavorite(service._id);
  };
  
  // Format price to two decimal places with currency
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };
  
  // Convert duration in minutes to readable format
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} ${t('services.minutes')}`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}${t('services.hour')}${mins ? ` ${mins}${t('services.minute')}` : ''}`;
  };
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        }
      }}
    >
      <CardMedia
        component="img"
        height="140"
        image={service.images?.[0] || DEFAULT_IMAGE}
        alt={service.name}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography gutterBottom variant="h6" component="div" sx={{ flexGrow: 1 }} noWrap>
            {service.name}
          </Typography>
          <Tooltip title={isServiceFavorite ? t('services.removeFavorite') : t('services.addFavorite')}>
            <IconButton 
              size="small" 
              color="error" 
              sx={{ mt: -1, mr: -1 }}
              onClick={handleFavoriteToggle}
              disabled={loading}
            >
              {isServiceFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating 
            value={service.rating?.average || 0} 
            precision={0.5} 
            readOnly 
            size="small" 
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({service.rating?.count || 0})
          </Typography>
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 2, height: '3em', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {service.description}
        </Typography>
        
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <LocationOnIcon color="primary" fontSize="small" />
          <Typography variant="body2" noWrap>
            {service.city || t('services.locationNotSpecified')}
          </Typography>
        </Stack>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="h6" color="primary">
            {formatPrice(service.price)}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {formatDuration(service.duration)}
            </Typography>
          </Stack>
        </Box>
        
        <Divider sx={{ mb: 1.5 }} />
        
        <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
          <Chip 
            label={t(`services.form.categories.${service.category}`) || service.category} 
            size="small" 
            color="primary"
            variant="outlined"
          />
          
          {service.features?.includes('homeVisit') && (
            <Tooltip title={t('services.features.homeVisit')}>
              <Chip icon={<HomeIcon />} size="small" label={t('services.features.homeVisit')} />
            </Tooltip>
          )}
          
          {service.features?.includes('onlineConsultation') && (
            <Tooltip title={t('services.features.onlineConsultation')}>
              <Chip icon={<VideocamIcon />} size="small" label={t('services.features.onlineConsultation')} />
            </Tooltip>
          )}
          
          {service.features?.includes('24hours') && (
            <Tooltip title={t('services.features.24hours')}>
              <Chip icon={<WatchLaterIcon />} size="small" label={t('services.features.24hours')} />
            </Tooltip>
          )}
        </Stack>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          onClick={() => navigate(`/services/${service._id}`)}
        >
          {t('services.viewDetails')}
        </Button>
        <Button 
          size="small" 
          variant="contained" 
          color="primary"
          onClick={() => navigate(`/booking/${service._id}`)}
          sx={{ ml: 'auto' }}
        >
          {t('bookings.bookNow')}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ServiceItem;
