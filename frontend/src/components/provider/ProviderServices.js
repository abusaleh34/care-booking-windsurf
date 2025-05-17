import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { AuthContext } from '../../context/AuthContext';
import { ServiceContext } from '../../context/ServiceContext';

const ProviderServices = () => {
  const { user } = useContext(AuthContext);
  const { 
    getProviderServices, 
    createService, 
    updateService,
    deleteService,
    loading
  } = useContext(ServiceContext);
  
  const [services, setServices] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    location: {
      address: '',
      city: '',
      region: ''
    }
  });
  
  // Categories for select dropdown
  const categories = [
    'medical',
    'wellness',
    'homecare',
    'therapy',
    'other'
  ];
  
  // Memoize category counts to prevent recalculation on each render
  const categoriesWithCount = useMemo(() => {
    return categories.map(category => {
      const count = services.filter(service => service.category === category).length;
      return { category, label: `${category} (${count})` };
    });
  }, [categories, services]);
  
  // Memoize the fetchServices function to prevent recreation on each render
  const fetchServices = useCallback(async () => {
    try {
      const data = await getProviderServices();
      setServices(data);
    } catch (error) {
      setError('Failed to load services. Please try again.');
      console.error('Error fetching services:', error);
    }
  }, [getProviderServices]);
  
  // Fetch provider's services on component mount with proper dependencies
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);
  
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: '',
      location: {
        address: '',
        city: '',
        region: ''
      }
    });
    setSelectedService(null);
  }, []);
  
  const handleOpenDialog = useCallback((service = null) => {
    if (service) {
      // Edit mode - populate form with service data
      setFormData({
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        category: service.category,
        location: {
          address: service.location?.address || '',
          city: service.location?.city || '',
          region: service.location?.region || ''
        }
      });
      setSelectedService(service);
    } else {
      // Add mode - reset form
      resetForm();
    }
    
    setDialogOpen(true);
  }, [resetForm]);
  
  const handleOpenDeleteDialog = useCallback((service) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  }, []);
  
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    resetForm();
  }, [resetForm]);
  
  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedService(null);
  }, []);
  
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const handleLocationChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value
      }
    }));
  }, []);
  
  const handleSubmit = useCallback(async () => {
    try {
      const serviceData = {
        ...formData,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration, 10)
      };
      
      if (selectedService) {
        // Update existing service
        await updateService(selectedService._id, serviceData);
        setSuccess('Service updated successfully');
      } else {
        // Create new service
        await createService(serviceData);
        setSuccess('Service created successfully');
      }
      
      // Refresh services list
      fetchServices();
      
      // Close dialog
      handleCloseDialog();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setError(error.message || 'Failed to save service. Please try again.');
      console.error('Error saving service:', error);
    }
  }, [selectedService, formData, fetchServices, handleCloseDialog]);
  
  const handleDelete = useCallback(async () => {
    try {
      await deleteService(selectedService._id);
      setSuccess('Service deleted successfully');
      await fetchServices(); // Refresh list
      handleCloseDeleteDialog();
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setError(error.message || 'Failed to delete service. Please try again.');
      console.error('Error deleting service:', error);
    }
  }, [deleteService, selectedService, fetchServices, handleCloseDeleteDialog]);
  
  if (loading && services.length === 0) {
    return <CircularProgress />;
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" component="h2">
          My Services
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Service
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      {services.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="body1" color="text.secondary">
            You haven't added any services yet. Click "Add New Service" to get started.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {services.map(service => (
            <Grid item xs={12} sm={6} md={4} key={service._id}>
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
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {service.name}
                  </Typography>
                  
                  <Chip 
                    label={service.category} 
                    size="small" 
                    sx={{ mb: 2, textTransform: 'capitalize' }} 
                  />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {service.description.length > 100 
                      ? `${service.description.substring(0, 100)}...` 
                      : service.description}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Price:</strong> ${service.price}
                    </Typography>
                    
                    <Typography variant="body2">
                      <strong>Duration:</strong> {service.duration} minutes
                    </Typography>
                    
                    {service.location && service.location.city && (
                      <Typography variant="body2">
                        <strong>Location:</strong> {service.location.city}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleOpenDialog(service)}
                  >
                    <EditIcon />
                  </IconButton>
                  
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleOpenDeleteDialog(service)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Add/Edit Service Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {selectedService ? 'Edit Service' : 'Add New Service'}
        </DialogTitle>
        
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Service Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    label="Category"
                    onChange={handleChange}
                  >
                    {categories.map(category => (
                      <MenuItem 
                        key={category} 
                        value={category}
                        sx={{ textTransform: 'capitalize' }}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price ($)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  margin="normal"
                  inputProps={{ min: 0, step: "0.01" }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  margin="normal"
                  inputProps={{ min: 0 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  margin="normal"
                  multiline
                  rows={4}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Location Details
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Region/State"
                  name="location.region"
                  value={formData.location.region}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {selectedService ? 'Update Service' : 'Add Service'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the service "{selectedService?.name}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProviderServices;
