import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Rating, 
  Divider,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { ReviewContext } from '../../context/ReviewContext';
import { AuthContext } from '../../context/AuthContext';

const ReviewForm = ({ serviceId, onReviewSubmitted }) => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { 
    addReview, 
    updateReview, 
    loading, 
    error, 
    getUserReviewForService, 
    hasUserReviewed
  } = useContext(ReviewContext);

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [reviewId, setReviewId] = useState(null);
  const [success, setSuccess] = useState(false);

  // Check if user has already reviewed this service
  useEffect(() => {
    if (serviceId && user) {
      const userReview = getUserReviewForService(serviceId);
      if (userReview) {
        setRating(userReview.rating);
        setTitle(userReview.title || '');
        setComment(userReview.comment || '');
        setIsEditing(true);
        setReviewId(userReview._id);
      }
    }
  }, [serviceId, user, getUserReviewForService]);

  const validateForm = () => {
    setFormError(null);
    
    if (rating === 0) {
      setFormError(t('reviews.errors.ratingRequired'));
      return false;
    }
    
    if (!comment.trim()) {
      setFormError(t('reviews.errors.commentRequired'));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    
    if (!validateForm()) return;
    
    const reviewData = {
      rating,
      title: title.trim() || undefined, // Only include if not empty
      comment: comment.trim()
    };
    
    try {
      if (isEditing && reviewId) {
        await updateReview(reviewId, reviewData);
      } else {
        await addReview(serviceId, reviewData);
      }
      
      setSuccess(true);
      
      // Wait a moment before resetting form (if not editing)
      if (!isEditing) {
        setTimeout(() => {
          setRating(0);
          setTitle('');
          setComment('');
          setSuccess(false);
        }, 3000);
      }
      
      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  if (!user) {
    return (
      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          {t('reviews.loginToReview')}
        </Typography>
      </Paper>
    );
  }

  if (hasUserReviewed(serviceId) && !isEditing) {
    return (
      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          {t('reviews.alreadyReviewed')}
        </Typography>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={() => setIsEditing(true)}
          sx={{ mt: 1 }}
        >
          {t('reviews.editYourReview')}
        </Button>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" component="h3" gutterBottom>
        {isEditing ? t('reviews.editYourReview') : t('reviews.writeReview')}
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {formError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {formError}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {isEditing ? t('reviews.updateSuccess') : t('reviews.submitSuccess')}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Box sx={{ mb: 3 }}>
          <Typography component="legend" gutterBottom>
            {t('reviews.rateService')}
          </Typography>
          <Rating
            name="rating"
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue);
            }}
            size="large"
            precision={0.5}
          />
        </Box>
        
        <TextField
          label={t('reviews.titleOptional')}
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          inputProps={{ maxLength: 100 }}
        />
        
        <TextField
          label={t('reviews.comment')}
          fullWidth
          multiline
          rows={4}
          margin="normal"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          inputProps={{ maxLength: 500 }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          {isEditing && (
            <Button
              variant="outlined"
              sx={{ mr: 2 }}
              onClick={() => setIsEditing(false)}
            >
              {t('common.cancel')}
            </Button>
          )}
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {isEditing ? t('reviews.updateReview') : t('reviews.submitReview')}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ReviewForm;
