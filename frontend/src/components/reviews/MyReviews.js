import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Divider,
  Paper,
  CircularProgress,
  Alert,
  Container,
  Grid,
  Tabs,
  Tab
} from '@mui/material';
import { ReviewContext } from '../../context/ReviewContext';
import { AuthContext } from '../../context/AuthContext';
import ReviewListItem from './ReviewListItem';
import ReviewForm from './ReviewForm';

const MyReviews = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { getUserReviews, deleteReview, loading, error } = useContext(ReviewContext);
  
  const [reviews, setReviews] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [editingReview, setEditingReview] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadUserReviews();
  }, [user, refreshTrigger]);

  const loadUserReviews = async () => {
    if (!user) return;
    
    try {
      const userReviews = await getUserReviews();
      setReviews(userReviews);
    } catch (err) {
      console.error('Error loading user reviews:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm(t('reviews.confirmDelete'))) {
      try {
        await deleteReview(reviewId);
        setRefreshTrigger(prev => prev + 1);
      } catch (err) {
        console.error('Error deleting review:', err);
      }
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
  };

  const handleReviewSubmitted = () => {
    setEditingReview(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const getFilteredReviews = () => {
    if (selectedTab === 0) return reviews;
    
    // Filter by rating for other tabs
    const minRating = 5 - selectedTab;
    const maxRating = 5 - selectedTab + 1;
    
    return reviews.filter(review => 
      review.rating >= minRating && review.rating < maxRating
    );
  };

  if (!user) {
    return (
      <Alert severity="info">
        {t('common.pleaseLogin')}
      </Alert>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('reviews.myReviews')}
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      {loading && reviews.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <>
          {editingReview ? (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                {t('reviews.editYourReview')}
              </Typography>
              <ReviewForm 
                serviceId={editingReview.service} 
                onReviewSubmitted={handleReviewSubmitted} 
              />
            </Box>
          ) : null}
          
          <Paper elevation={1} sx={{ mb: 4 }}>
            <Tabs 
              value={selectedTab} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label={t('reviews.allRatings')} />
              <Tab label="5 ★" />
              <Tab label="4 ★" />
              <Tab label="3 ★" />
              <Tab label="2 ★" />
              <Tab label="1 ★" />
            </Tabs>
            
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {t('reviews.totalCount', { count: getFilteredReviews().length })}
              </Typography>
            </Box>
          </Paper>
          
          {getFilteredReviews().length > 0 ? (
            <Grid container spacing={2}>
              {getFilteredReviews().map(review => (
                <Grid item xs={12} key={review._id}>
                  <ReviewListItem 
                    review={review} 
                    onEdit={handleEditReview}
                    onDelete={handleDeleteReview}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper elevation={0} variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1">
                {t('reviews.noReviewsYet')}
              </Typography>
            </Paper>
          )}
        </>
      )}
    </Container>
  );
};

export default MyReviews;
