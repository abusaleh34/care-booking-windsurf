import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Rating,
  Chip,
  Divider,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tab,
  Tabs,
  CircularProgress,
  Alert
} from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import { ProviderContext } from '../../context/ProviderContext';
import { ReviewContext } from '../../context/ReviewContext';
import { format } from 'date-fns';

const ProviderReviews = ({ onRefresh }) => {
  const { t } = useTranslation();
  const { 
    getProviderServices,
    services,
    respondToReview,
    loading: providerLoading,
    error: providerError
  } = useContext(ProviderContext);
  
  const {
    getServiceReviews,
    serviceReviews,
    loading: reviewLoading,
    error: reviewError
  } = useContext(ReviewContext);
  
  const [tabValue, setTabValue] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [reviewsData, setReviewsData] = useState([]);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  
  // Load services and their reviews
  useEffect(() => {
    const loadData = async () => {
      await getProviderServices();
    };
    
    loadData();
  }, [getProviderServices]);
  
  // Load reviews for services
  useEffect(() => {
    if (!services || services.length === 0) return;
    
    const loadReviews = async () => {
      await Promise.all(
        services.map(service => getServiceReviews(service._id))
      );
    };
    
    loadReviews();
  }, [services, getServiceReviews]);
  
  // Prepare reviews data
  useEffect(() => {
    if (!services || !serviceReviews) return;
    
    let allReviews = [];
    
    // Collect reviews for all services
    services.forEach(service => {
      const serviceId = service._id;
      const reviews = serviceReviews[serviceId] || [];
      
      // Add service information to each review
      const reviewsWithService = reviews.map(review => ({
        ...review,
        service: {
          _id: serviceId,
          name: service.name
        }
      }));
      
      allReviews = [...allReviews, ...reviewsWithService];
    });
    
    // Sort by date (newest first)
    allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setReviewsData(allReviews);
  }, [services, serviceReviews]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    if (newValue === 0) {
      // All reviews
      setSelectedService(null);
    } else {
      // Service-specific tab
      setSelectedService(services[newValue - 1]);
    }
  };
  
  // Open response dialog
  const handleOpenResponseDialog = (review) => {
    setSelectedReview(review);
    setResponseText(review.providerResponse || '');
    setResponseDialogOpen(true);
  };
  
  // Close response dialog
  const handleCloseResponseDialog = () => {
    setResponseDialogOpen(false);
    setSelectedReview(null);
    setResponseText('');
  };
  
  // Submit response
  const handleSubmitResponse = async () => {
    if (!selectedReview || !responseText.trim()) return;
    
    try {
      await respondToReview(selectedReview._id, responseText);
      handleCloseResponseDialog();
      
      // Refresh reviews for this service
      if (selectedReview.service?._id) {
        await getServiceReviews(selectedReview.service._id);
      }
    } catch (err) {
      console.error('Error responding to review:', err);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'PPP');
  };
  
  // Filter reviews based on search and filter values
  const getFilteredReviews = () => {
    if (!reviewsData) return [];
    
    let filtered = [...reviewsData];
    
    // Filter by selected service (if a tab is selected)
    if (selectedService) {
      filtered = filtered.filter(review => 
        review.service?._id === selectedService._id
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(review => 
        review.comment?.toLowerCase().includes(term) || 
        review.title?.toLowerCase().includes(term) ||
        review.user?.name?.toLowerCase().includes(term) ||
        review.service?.name?.toLowerCase().includes(term)
      );
    }
    
    // Filter by rating
    if (filterValue !== 'all') {
      const rating = parseInt(filterValue, 10);
      filtered = filtered.filter(review => 
        Math.floor(review.rating) === rating
      );
    }
    
    return filtered;
  };
  
  // Calculate average rating
  const calculateAverageRating = (serviceId) => {
    if (!serviceReviews || !serviceReviews[serviceId]) return 0;
    
    const reviews = serviceReviews[serviceId];
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };
  
  // Get count of reviews for a service
  const getReviewCount = (serviceId) => {
    return serviceReviews?.[serviceId]?.length || 0;
  };
  
  // Calculate ratings distribution for a service
  const getRatingDistribution = (serviceId) => {
    if (!serviceReviews || !serviceReviews[serviceId]) {
      return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    }
    
    const reviews = serviceReviews[serviceId];
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    reviews.forEach(review => {
      const rating = Math.floor(review.rating);
      if (distribution[rating] !== undefined) {
        distribution[rating]++;
      }
    });
    
    return distribution;
  };
  
  // Get percentage for a rating
  const getRatingPercentage = (serviceId, rating) => {
    const distribution = getRatingDistribution(serviceId);
    const total = Object.values(distribution).reduce((a, b) => a + b, 0);
    
    if (total === 0) return 0;
    return (distribution[rating] / total) * 100;
  };
  
  const filteredReviews = getFilteredReviews();
  const loading = providerLoading || reviewLoading;
  const error = providerError || reviewError;
  
  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        {t('provider.serviceReviews')}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button onClick={onRefresh} sx={{ ml: 2 }}>
            {t('common.retry')}
          </Button>
        </Alert>
      )}
      
      {/* Loading indicator */}
      {loading && (!services || services.length === 0) ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Tabs for all reviews vs. service-specific reviews */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label={t('provider.allReviews')} />
              
              {services && services.map((service, index) => (
                <Tab 
                  key={service._id}
                  label={`${service.name} (${getReviewCount(service._id)})`}
                />
              ))}
            </Tabs>
          </Box>
          
          {/* Filters and Search */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  placeholder={t('provider.searchReviews')}
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  label={t('provider.filterByRating')}
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: <FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                >
                  <MenuItem value="all">{t('common.all')}</MenuItem>
                  <MenuItem value="5">★★★★★ (5)</MenuItem>
                  <MenuItem value="4">★★★★☆ (4)</MenuItem>
                  <MenuItem value="3">★★★☆☆ (3)</MenuItem>
                  <MenuItem value="2">★★☆☆☆ (2)</MenuItem>
                  <MenuItem value="1">★☆☆☆☆ (1)</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('provider.totalReviews')}: {filteredReviews.length}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Service Rating Overview (if service tab is selected) */}
          {selectedService && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                      {calculateAverageRating(selectedService._id).toFixed(1)}
                    </Typography>
                    
                    <Rating 
                      value={calculateAverageRating(selectedService._id)} 
                      precision={0.5} 
                      readOnly 
                      size="large" 
                      sx={{ my: 1 }}
                    />
                    
                    <Typography variant="body2" color="text.secondary">
                      {t('provider.basedOn', { count: getReviewCount(selectedService._id) })}
                    </Typography>
                  </Box>
                </Grid>
                
                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
                
                <Grid item xs={12} md={7}>
                  <Box>
                    {[5, 4, 3, 2, 1].map(rating => (
                      <Box 
                        key={rating} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 1 
                        }}
                      >
                        <Typography variant="body2" sx={{ minWidth: 20 }}>
                          {rating}
                        </Typography>
                        
                        <Box 
                          sx={{ 
                            flexGrow: 1, 
                            bgcolor: 'background.default', 
                            ml: 2, 
                            height: 12, 
                            borderRadius: 1,
                            overflow: 'hidden'
                          }}
                        >
                          <Box 
                            sx={{ 
                              width: `${getRatingPercentage(selectedService._id, rating)}%`, 
                              bgcolor: 'primary.main', 
                              height: '100%'
                            }} 
                          />
                        </Box>
                        
                        <Typography variant="body2" sx={{ ml: 2, minWidth: 30 }}>
                          {getRatingDistribution(selectedService._id)[rating]}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}
          
          {/* Reviews List */}
          {filteredReviews.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                {t('provider.noReviews')}
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredReviews.map(review => (
                <Grid item xs={12} key={review._id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={8}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar 
                              src={review.user?.profileImage}
                              alt={review.user?.name}
                              sx={{ mr: 2 }}
                            >
                              {review.user?.name?.charAt(0)}
                            </Avatar>
                            
                            <Box>
                              <Typography variant="subtitle1">
                                {review.user?.name || t('provider.anonymousUser')}
                              </Typography>
                              
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(review.createdAt)}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Rating value={review.rating} precision={0.5} readOnly sx={{ mb: 1 }} />
                          
                          {review.title && (
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                              {review.title}
                            </Typography>
                          )}
                          
                          <Typography variant="body1" paragraph>
                            {review.comment}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ 
                            bgcolor: 'background.default', 
                            p: 2, 
                            borderRadius: 1,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                          }}>
                            <Typography variant="subtitle2" gutterBottom>
                              {t('provider.serviceDetails')}:
                            </Typography>
                            
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>{t('provider.service')}:</strong> {review.service?.name}
                            </Typography>
                            
                            {review.booking && (
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>{t('provider.booking')}:</strong> {format(new Date(review.booking.date), 'P')}
                              </Typography>
                            )}
                            
                            {review.verified && (
                              <Chip 
                                label={t('provider.verifiedPurchase')}
                                size="small"
                                color="success"
                                sx={{ alignSelf: 'flex-start', mb: 1 }}
                              />
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                      
                      {/* Provider Response (if any) */}
                      {review.providerResponse && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            {t('provider.yourResponse')}:
                          </Typography>
                          <Typography variant="body2">
                            {review.providerResponse}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                    
                    <Divider />
                    
                    <CardActions>
                      <Button
                        startIcon={<CommentIcon />}
                        onClick={() => handleOpenResponseDialog(review)}
                        color={review.providerResponse ? 'secondary' : 'primary'}
                      >
                        {review.providerResponse 
                          ? t('provider.editResponse') 
                          : t('provider.respondToReview')
                        }
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          
          {/* Response Dialog */}
          <Dialog
            open={responseDialogOpen}
            onClose={handleCloseResponseDialog}
            fullWidth
            maxWidth="md"
          >
            <DialogTitle>
              {selectedReview?.providerResponse 
                ? t('provider.editYourResponse') 
                : t('provider.respondToReview')
              }
            </DialogTitle>
            
            <DialogContent>
              {selectedReview && (
                <>
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {t('provider.reviewDetails')}:
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        <strong>{t('provider.rating')}:</strong>
                      </Typography>
                      <Rating value={selectedReview.rating} precision={0.5} readOnly size="small" />
                    </Box>
                    
                    {selectedReview.title && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>{t('provider.title')}:</strong> {selectedReview.title}
                      </Typography>
                    )}
                    
                    <Typography variant="body2">
                      <strong>{t('provider.comment')}:</strong> {selectedReview.comment}
                    </Typography>
                  </Box>
                  
                  <DialogContentText sx={{ mb: 2 }}>
                    {t('provider.responseGuidelines')}
                  </DialogContentText>
                  
                  <TextField
                    autoFocus
                    multiline
                    rows={4}
                    fullWidth
                    label={t('provider.yourResponse')}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    variant="outlined"
                  />
                </>
              )}
            </DialogContent>
            
            <DialogActions>
              <Button onClick={handleCloseResponseDialog}>
                {t('common.cancel')}
              </Button>
              <Button 
                onClick={handleSubmitResponse}
                variant="contained" 
                color="primary"
                disabled={!responseText.trim() || loading}
              >
                {selectedReview?.providerResponse 
                  ? t('provider.updateResponse') 
                  : t('provider.submitResponse')
                }
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default ProviderReviews;
