import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Divider,
  Paper,
  Avatar,
  Rating,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import format from 'date-fns/format';
import { ReviewContext } from '../../context/ReviewContext';
import { AuthContext } from '../../context/AuthContext';
import ReviewForm from './ReviewForm';

const ServiceReviews = ({ serviceId }) => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const {
    getServiceReviews,
    serviceReviews,
    loading,
    error,
    calculateAverageRating,
    deleteReview
  } = useContext(ReviewContext);

  const [sortedReviews, setSortedReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [ratingStats, setRatingStats] = useState({
    average: 0,
    count: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    if (serviceId) {
      loadReviews();
    }
  }, [serviceId]);

  const loadReviews = async () => {
    try {
      await getServiceReviews(serviceId);
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  };

  useEffect(() => {
    if (serviceReviews[serviceId]) {
      // Calculate rating stats
      const reviews = serviceReviews[serviceId];
      const average = calculateAverageRating(serviceId);
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      
      reviews.forEach(review => {
        const ratingKey = Math.floor(review.rating);
        if (distribution[ratingKey] !== undefined) {
          distribution[ratingKey]++;
        }
      });
      
      setRatingStats({
        average,
        count: reviews.length,
        distribution
      });
      
      // Sort reviews (newest first)
      const sorted = [...reviews].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setSortedReviews(sorted);
    }
  }, [serviceReviews, serviceId, calculateAverageRating]);

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm(t('reviews.confirmDelete'))) {
      try {
        await deleteReview(reviewId, serviceId);
      } catch (err) {
        console.error('Error deleting review:', err);
      }
    }
  };

  const handleReviewSubmitted = () => {
    loadReviews();
    setShowReviewForm(false);
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'PPP');
  };

  const canModifyReview = (reviewUserId) => {
    return user && (user._id === reviewUserId || user.role === 'admin');
  };

  // Display rating distribution as percentages
  const getRatingPercentage = (rating) => {
    if (ratingStats.count === 0) return 0;
    return (ratingStats.distribution[rating] / ratingStats.count) * 100;
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {t('reviews.title')}
      </Typography>
      
      {loading && !serviceReviews[serviceId] ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <>
          <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                    {ratingStats.average.toFixed(1)}
                  </Typography>
                  
                  <Rating 
                    value={ratingStats.average} 
                    precision={0.5} 
                    readOnly 
                    size="large" 
                    sx={{ my: 1 }}
                  />
                  
                  <Typography variant="body2" color="text.secondary">
                    {t('reviews.basedOn', { count: ratingStats.count })}
                  </Typography>
                </Box>
              </Grid>
              
              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
              
              <Grid item xs={12} md={7}>
                <Box>
                  {Object.keys(ratingStats.distribution)
                    .sort((a, b) => Number(b) - Number(a))
                    .map(rating => (
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
                              width: `${getRatingPercentage(rating)}%`, 
                              bgcolor: 'primary.main', 
                              height: '100%'
                            }} 
                          />
                        </Box>
                        
                        <Typography variant="body2" sx={{ ml: 2, minWidth: 30 }}>
                          {ratingStats.distribution[rating]}
                        </Typography>
                      </Box>
                    ))}
                </Box>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => setShowReviewForm(true)}
                    sx={{ display: showReviewForm ? 'none' : 'block' }}
                  >
                    {t('reviews.writeReview')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {showReviewForm && (
            <ReviewForm 
              serviceId={serviceId} 
              onReviewSubmitted={handleReviewSubmitted} 
            />
          )}
          
          {sortedReviews.length > 0 ? (
            <Box>
              {sortedReviews.map(review => (
                <Card 
                  key={review._id} 
                  elevation={0} 
                  variant="outlined" 
                  sx={{ mb: 2 }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={review.user.profileImage}
                          alt={review.user.name}
                          sx={{ mr: 2 }}
                        >
                          {review.user.name.charAt(0)}
                        </Avatar>
                        
                        <Box>
                          <Typography variant="subtitle1">
                            {review.user.name}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(review.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Rating value={review.rating} precision={0.5} readOnly />
                    </Box>
                    
                    {review.title && (
                      <Typography variant="subtitle1" gutterBottom>
                        {review.title}
                      </Typography>
                    )}
                    
                    <Typography variant="body2" paragraph>
                      {review.comment}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Box>
                        {review.verified && (
                          <Chip 
                            label={t('reviews.verifiedPurchase')} 
                            size="small" 
                            color="success"
                            sx={{ mr: 1 }}
                          />
                        )}
                        
                        {review.helpful > 0 && (
                          <Chip 
                            icon={<ThumbUpIcon fontSize="small" />}
                            label={t('reviews.helpful', { count: review.helpful })}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      
                      {canModifyReview(review.user._id) && (
                        <Box>
                          <Button
                            startIcon={<EditIcon />}
                            size="small"
                            onClick={() => setShowReviewForm(true)}
                            sx={{ mr: 1 }}
                          >
                            {t('common.edit')}
                          </Button>
                          
                          <Button
                            startIcon={<DeleteIcon />}
                            size="small"
                            color="error"
                            onClick={() => handleDeleteReview(review._id)}
                          >
                            {t('common.delete')}
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Paper 
              elevation={0} 
              variant="outlined" 
              sx={{ p: 3, textAlign: 'center', mt: 2 }}
            >
              <Typography variant="body1" color="text.secondary">
                {t('reviews.noReviews')}
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => setShowReviewForm(true)}
                sx={{ mt: 2, display: showReviewForm ? 'none' : 'inline-flex' }}
              >
                {t('reviews.beTheFirst')}
              </Button>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default ServiceReviews;
