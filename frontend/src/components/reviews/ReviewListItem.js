import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Avatar,
  Rating,
  Chip,
  Button,
  Card,
  CardContent
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import format from 'date-fns/format';
import { AuthContext } from '../../context/AuthContext';

const ReviewListItem = ({ review, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'PPP');
  };

  const canModifyReview = (reviewUserId) => {
    return user && (user._id === reviewUserId || user.role === 'admin');
  };

  return (
    <Card elevation={0} variant="outlined" sx={{ mb: 2 }}>
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
        
        {review.serviceInfo && (
          <Box sx={{ mt: 1, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {t('reviews.forService')}:
            </Typography>
            <Typography variant="subtitle2">
              {review.serviceInfo.name}
            </Typography>
          </Box>
        )}
        
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
                onClick={() => onEdit && onEdit(review)}
                sx={{ mr: 1 }}
              >
                {t('common.edit')}
              </Button>
              
              <Button
                startIcon={<DeleteIcon />}
                size="small"
                color="error"
                onClick={() => onDelete && onDelete(review._id)}
              >
                {t('common.delete')}
              </Button>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ReviewListItem;
