import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FavoritesContext } from '../../context/FavoritesContext';
import { AuthContext } from '../../context/AuthContext';
import ServiceItem from './ServiceItem';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Button, 
  CircularProgress,
  Alert,
  Divider,
  Paper
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SearchIcon from '@mui/icons-material/Search';

const MyFavorites = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { favorites, loading, error, fetchFavorites } = useContext(FavoritesContext);
  const { user } = useContext(AuthContext);
  const [services, setServices] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/favorites');
      return;
    }

    // Fetch favorites on component mount
    fetchFavorites();
  }, [user, navigate, fetchFavorites]);

  // Transform favorites into services array
  useEffect(() => {
    if (favorites.length > 0) {
      // Extract services from favorites
      // Note: This assumes your API returns the full service object with each favorite
      // If not, you may need to fetch individual service details
      const favoriteServices = favorites.map(fav => fav.service).filter(Boolean);
      setServices(favoriteServices);
    } else {
      setServices([]);
    }
  }, [favorites]);

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <FavoriteIcon color="error" sx={{ mr: 1 }} />
          {t('services.myFavorites')}
        </Typography>
        <Divider sx={{ mb: 4 }} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        ) : services.length > 0 ? (
          <Grid container spacing={3}>
            {services.map((service) => (
              <Grid item key={service._id} xs={12} sm={6} md={4}>
                <ServiceItem service={service} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', my: 4 }}>
            <Typography variant="h6" gutterBottom>
              {t('services.noFavorites')}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {t('services.addFavorites')}
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<SearchIcon />}
              onClick={() => navigate('/services')}
              sx={{ mt: 2 }}
            >
              {t('services.browseServices')}
            </Button>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default MyFavorites;
