import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  Avatar, 
  Divider,
  Alert
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';

const UserProfile = () => {
  const { user, updateProfile, loading, error } = useContext(AuthContext);
  
  // Use useMemo to create the initial form data only once when component mounts
  const initialFormData = useMemo(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || ''
  }), []);
  
  const [formData, setFormData] = useState(initialFormData);
  
  // Update form data when user data changes (e.g., after profile update)
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || initialFormData.name,
        email: user.email || initialFormData.email,
        phone: user.phone || initialFormData.phone,
        address: user.address || initialFormData.address,
        bio: user.bio || initialFormData.bio
      });
    }
  }, [user, initialFormData]);
  
  const [success, setSuccess] = useState(false);
  
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Profile update error:', error);
    }
  }, [formData, updateProfile]);
  
  // Memoize the formatted user role to prevent recalculation on each render
  const formattedRole = useMemo(() => {
    return user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';
  }, [user?.role]);

  // Memoize the formatted date to prevent recalculation on each render
  const memberSinceDate = useMemo(() => {
    return user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '';
  }, [user?.createdAt]);
  
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar 
                src={user?.profileImage} 
                alt={user?.name} 
                sx={{ width: 100, height: 100, mb: 2 }}
              />
              
              <Typography variant="h6" gutterBottom>
                {user?.name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.email}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Role: {formattedRole}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Member Since: {memberSinceDate}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Edit Profile
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Profile updated successfully!
              </Alert>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    margin="normal"
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    margin="normal"
                    required
                    disabled // Email cannot be changed
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    margin="normal"
                    multiline
                    rows={4}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    sx={{ mt: 2 }}
                  >
                    Update Profile
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserProfile;
