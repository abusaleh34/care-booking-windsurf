import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Switch,
  Divider,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { ProviderContext } from '../../context/ProviderContext';

// Days of the week
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const ProviderAvailability = ({ onRefresh }) => {
  const { t } = useTranslation();
  const { 
    getProviderAvailability, 
    updateProviderAvailability, 
    loading, 
    error 
  } = useContext(ProviderContext);
  
  const [availability, setAvailability] = useState({
    monday: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] },
    tuesday: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] },
    wednesday: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] },
    thursday: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] },
    friday: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] },
    saturday: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] },
    sunday: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] }
  });
  
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Load provider availability
  useEffect(() => {
    const loadAvailability = async () => {
      try {
        const data = await getProviderAvailability();
        if (data) {
          setAvailability(data);
        }
      } catch (err) {
        console.error('Error loading availability:', err);
      }
    };
    
    loadAvailability();
  }, [getProviderAvailability]);
  
  // Toggle day availability
  const handleToggleDay = (day) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled
      }
    }));
  };
  
  // Update slot time
  const handleSlotChange = (day, slotIndex, field, value) => {
    setAvailability(prev => {
      const updatedSlots = [...prev[day].slots];
      updatedSlots[slotIndex] = {
        ...updatedSlots[slotIndex],
        [field]: value
      };
      
      return {
        ...prev,
        [day]: {
          ...prev[day],
          slots: updatedSlots
        }
      };
    });
  };
  
  // Add new time slot
  const handleAddSlot = (day) => {
    setAvailability(prev => {
      const lastSlot = prev[day].slots[prev[day].slots.length - 1];
      const newSlot = { start: lastSlot.end, end: '18:00' };
      
      return {
        ...prev,
        [day]: {
          ...prev[day],
          slots: [...prev[day].slots, newSlot]
        }
      };
    });
  };
  
  // Remove time slot
  const handleRemoveSlot = (day, slotIndex) => {
    setAvailability(prev => {
      // Don't remove if it's the only slot
      if (prev[day].slots.length <= 1) return prev;
      
      const updatedSlots = prev[day].slots.filter((_, i) => i !== slotIndex);
      
      return {
        ...prev,
        [day]: {
          ...prev[day],
          slots: updatedSlots
        }
      };
    });
  };
  
  // Copy availability to other days
  const handleCopyToDay = (fromDay, toDay) => {
    setAvailability(prev => ({
      ...prev,
      [toDay]: {
        ...prev[fromDay]
      }
    }));
  };
  
  // Copy to all weekdays
  const handleCopyToWeekdays = (fromDay) => {
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    
    setAvailability(prev => {
      const updated = { ...prev };
      
      weekdays.forEach(day => {
        if (day !== fromDay) {
          updated[day] = { ...prev[fromDay] };
        }
      });
      
      return updated;
    });
  };
  
  // Copy to weekend
  const handleCopyToWeekend = (fromDay) => {
    const weekend = ['saturday', 'sunday'];
    
    setAvailability(prev => {
      const updated = { ...prev };
      
      weekend.forEach(day => {
        if (day !== fromDay) {
          updated[day] = { ...prev[fromDay] };
        }
      });
      
      return updated;
    });
  };
  
  // Copy to all days
  const handleCopyToAll = (fromDay) => {
    setAvailability(prev => {
      const updated = { ...prev };
      
      DAYS.forEach(day => {
        if (day !== fromDay) {
          updated[day] = { ...prev[fromDay] };
        }
      });
      
      return updated;
    });
  };
  
  // Save availability
  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    
    try {
      await updateProviderAvailability(availability);
      setSuccess(true);
      
      // Clear success message after a few seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving availability:', err);
    } finally {
      setSaving(false);
    }
  };
  
  // Format day name for display
  const formatDayName = (day) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };
  
  // Validate time slot
  const isSlotValid = (slot) => {
    if (!slot.start || !slot.end) return false;
    
    // Check if end time is after start time
    return slot.end > slot.start;
  };
  
  // Check if availability can be saved
  const canSave = () => {
    for (const day of DAYS) {
      if (availability[day].enabled) {
        for (const slot of availability[day].slots) {
          if (!isSlotValid(slot)) {
            return false;
          }
        }
      }
    }
    
    return true;
  };
  
  // Format time for display
  const formatTime = (time) => {
    if (!time) return '';
    
    try {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      return time;
    }
  };
  
  if (loading && !availability) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        {t('provider.manageAvailability')}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button onClick={onRefresh} sx={{ ml: 2 }}>
            {t('common.retry')}
          </Button>
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {t('provider.availabilitySaved')}
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('provider.setYourSchedule')}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {t('provider.availabilityInstructions')}
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          {DAYS.map(day => (
            <Card key={day} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={availability[day].enabled}
                        onChange={() => handleToggleDay(day)}
                        color="primary"
                      />
                    }
                    label={formatDayName(day)}
                    sx={{ mr: 2, minWidth: 150 }}
                  />
                  
                  {availability[day].enabled && (
                    <Box sx={{ display: 'flex', flexGrow: 1, justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1 }}
                        onClick={() => handleCopyToWeekdays(day)}
                      >
                        {t('provider.copyToWeekdays')}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1 }}
                        onClick={() => handleCopyToWeekend(day)}
                      >
                        {t('provider.copyToWeekend')}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleCopyToAll(day)}
                      >
                        {t('provider.copyToAll')}
                      </Button>
                    </Box>
                  )}
                </Box>
                
                {availability[day].enabled && (
                  <Box>
                    {availability[day].slots.map((slot, slotIndex) => (
                      <Grid container spacing={2} key={slotIndex} alignItems="center" sx={{ mb: 1 }}>
                        <Grid item xs={5} sm={5} md={4}>
                          <TextField
                            label={t('provider.startTime')}
                            type="time"
                            value={slot.start}
                            onChange={(e) => handleSlotChange(day, slotIndex, 'start', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                            fullWidth
                            size="small"
                            required
                            error={!slot.start || (slot.end && slot.start >= slot.end)}
                          />
                        </Grid>
                        
                        <Grid item xs={5} sm={5} md={4}>
                          <TextField
                            label={t('provider.endTime')}
                            type="time"
                            value={slot.end}
                            onChange={(e) => handleSlotChange(day, slotIndex, 'end', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                            fullWidth
                            size="small"
                            required
                            error={!slot.end || slot.start >= slot.end}
                          />
                        </Grid>
                        
                        <Grid item xs={2} sm={2} md={4}>
                          <Box sx={{ display: 'flex' }}>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={availability[day].slots.length <= 1}
                              onClick={() => handleRemoveSlot(day, slotIndex)}
                              aria-label={t('provider.removeSlot')}
                            >
                              <DeleteIcon />
                            </IconButton>
                            
                            {slotIndex === availability[day].slots.length - 1 && (
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleAddSlot(day)}
                                aria-label={t('provider.addSlot')}
                              >
                                <AddIcon />
                              </IconButton>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    ))}
                  </Box>
                )}
              </CardContent>
              
              {availability[day].enabled && (
                <CardActions sx={{ justifyContent: 'flex-end', bgcolor: 'background.default' }}>
                  <Typography variant="body2" color="text.secondary">
                    {availability[day].slots.length} {t('provider.timeSlots')}
                  </Typography>
                </CardActions>
              )}
            </Card>
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving || !canSave()}
          >
            {saving ? <CircularProgress size={24} /> : t('provider.saveAvailability')}
          </Button>
        </Box>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('provider.availabilitySummary')}
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <List>
              {DAYS.filter(day => availability[day].enabled).map(day => (
                <ListItem key={day} divider>
                  <ListItemText
                    primary={formatDayName(day)}
                    secondary={
                      availability[day].slots.map(slot => 
                        `${formatTime(slot.start)} - ${formatTime(slot.end)}`
                      ).join(', ')
                    }
                  />
                </ListItem>
              ))}
              
              {!DAYS.some(day => availability[day].enabled) && (
                <ListItem>
                  <ListItemText
                    primary={t('provider.noDaysEnabled')}
                    secondary={t('provider.enableDaysAbove')}
                  />
                </ListItem>
              )}
            </List>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Alert severity="info">
              <AlertTitle>{t('provider.availabilityNote')}</AlertTitle>
              {t('provider.availabilityExplanation')}
            </Alert>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProviderAvailability;
