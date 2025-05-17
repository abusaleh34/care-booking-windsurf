import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { format } from 'date-fns';
import { ProviderContext } from '../../context/ProviderContext';

const ProviderBookings = ({ onRefresh }) => {
  const { t } = useTranslation();
  const { 
    getProviderBookings, 
    updateBookingStatus, 
    bookings, 
    loading, 
    error 
  } = useContext(ProviderContext);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  
  // Load bookings
  useEffect(() => {
    loadBookings();
  }, []);
  
  // Apply filters
  useEffect(() => {
    if (!bookings) return;
    
    let result = [...bookings];
    
    // Filter by status
    if (filters.status !== 'all') {
      result = result.filter(booking => booking.status === filters.status);
    }
    
    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(booking => 
        (booking.service?.name?.toLowerCase().includes(searchLower)) ||
        (booking.user?.name?.toLowerCase().includes(searchLower)) ||
        (booking._id?.toLowerCase().includes(searchLower))
      );
    }
    
    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter(booking => 
        new Date(booking.date) >= fromDate
      );
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      // Set time to end of day
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(booking => 
        new Date(booking.date) <= toDate
      );
    }
    
    setFilteredBookings(result);
    
    // Reset to first page when filters change
    setPage(0);
  }, [bookings, filters]);
  
  const loadBookings = async () => {
    try {
      await getProviderBookings();
    } catch (err) {
      console.error('Error loading bookings:', err);
    }
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSearchChange = (event) => {
    handleFilterChange('search', event.target.value);
  };
  
  const openStatusDialog = (booking, status) => {
    setSelectedBooking(booking);
    setNewStatus(status);
    setStatusNote('');
    setStatusDialogOpen(true);
  };
  
  const closeStatusDialog = () => {
    setStatusDialogOpen(false);
    setSelectedBooking(null);
    setNewStatus('');
    setStatusNote('');
  };
  
  const handleStatusUpdate = async () => {
    if (!selectedBooking || !newStatus) return;
    
    try {
      await updateBookingStatus(selectedBooking._id, newStatus, statusNote);
      closeStatusDialog();
    } catch (err) {
      console.error('Error updating booking status:', err);
    }
  };
  
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'PPP');
  };
  
  const formatTime = (timeString) => {
    return timeString;
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };
  
  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        {t('provider.manageBookings')}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button onClick={onRefresh} sx={{ ml: 2 }}>
            {t('common.retry')}
          </Button>
        </Alert>
      )}
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder={t('provider.searchBookings')}
              variant="outlined"
              size="small"
              value={filters.search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              select
              fullWidth
              label={t('provider.status')}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              size="small"
            >
              <MenuItem value="all">{t('common.all')}</MenuItem>
              <MenuItem value="pending">{t('provider.status.pending')}</MenuItem>
              <MenuItem value="confirmed">{t('provider.status.confirmed')}</MenuItem>
              <MenuItem value="completed">{t('provider.status.completed')}</MenuItem>
              <MenuItem value="cancelled">{t('provider.status.cancelled')}</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              fullWidth
              label={t('provider.fromDate')}
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              fullWidth
              label={t('provider.toDate')}
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Button 
              variant="outlined" 
              fullWidth
              onClick={() => setFilters({
                status: 'all',
                search: '',
                dateFrom: '',
                dateTo: ''
              })}
            >
              {t('common.clear')}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Bookings Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white' }}>{t('provider.bookingId')}</TableCell>
              <TableCell sx={{ color: 'white' }}>{t('provider.service')}</TableCell>
              <TableCell sx={{ color: 'white' }}>{t('provider.client')}</TableCell>
              <TableCell sx={{ color: 'white' }}>{t('provider.date')}</TableCell>
              <TableCell sx={{ color: 'white' }}>{t('provider.time')}</TableCell>
              <TableCell sx={{ color: 'white' }}>{t('provider.price')}</TableCell>
              <TableCell sx={{ color: 'white' }}>{t('provider.status')}</TableCell>
              <TableCell sx={{ color: 'white' }}>{t('provider.actions')}</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {loading && !bookings ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 3 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 3 }}>
                  {t('provider.noBookingsFound')}
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((booking) => (
                  <TableRow key={booking._id} hover>
                    <TableCell>{booking._id.substring(0, 8)}...</TableCell>
                    <TableCell>{booking.service?.name}</TableCell>
                    <TableCell>{booking.user?.name}</TableCell>
                    <TableCell>{formatDate(booking.date)}</TableCell>
                    <TableCell>
                      {booking.startTime} - {booking.endTime}
                    </TableCell>
                    <TableCell>{formatPrice(booking.totalPrice)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={t(`provider.status.${booking.status}`)}
                        color={getStatusColor(booking.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {booking.status === 'pending' && (
                          <>
                            <Tooltip title={t('provider.confirm')}>
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => openStatusDialog(booking, 'confirmed')}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('provider.cancel')}>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => openStatusDialog(booking, 'cancelled')}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        
                        {booking.status === 'confirmed' && (
                          <>
                            <Tooltip title={t('provider.markComplete')}>
                              <IconButton 
                                size="small" 
                                color="info"
                                onClick={() => openStatusDialog(booking, 'completed')}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('provider.cancel')}>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => openStatusDialog(booking, 'cancelled')}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        
                        <Tooltip title={t('provider.viewDetails')}>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => {/* View details */}}
                          >
                            <DateRangeIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredBookings.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={t('common.rowsPerPage')}
        />
      </TableContainer>
      
      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onClose={closeStatusDialog}>
        <DialogTitle>
          {newStatus === 'confirmed' && t('provider.confirmBooking')}
          {newStatus === 'completed' && t('provider.completeBooking')}
          {newStatus === 'cancelled' && t('provider.cancelBooking')}
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText>
            {newStatus === 'confirmed' && t('provider.confirmBookingMessage')}
            {newStatus === 'completed' && t('provider.completeBookingMessage')}
            {newStatus === 'cancelled' && t('provider.cancelBookingMessage')}
          </DialogContentText>
          
          {selectedBooking && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">
                {t('provider.service')}: {selectedBooking.service?.name}
              </Typography>
              <Typography variant="subtitle2">
                {t('provider.client')}: {selectedBooking.user?.name}
              </Typography>
              <Typography variant="subtitle2">
                {t('provider.dateTime')}: {formatDate(selectedBooking.date)}, {selectedBooking.startTime}
              </Typography>
            </Box>
          )}
          
          <TextField
            margin="dense"
            label={t('provider.noteToClient')}
            fullWidth
            multiline
            rows={3}
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={closeStatusDialog}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleStatusUpdate} 
            color={
              newStatus === 'confirmed' ? 'success' : 
              newStatus === 'completed' ? 'info' : 
              'error'
            }
            variant="contained"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              newStatus === 'confirmed' ? t('provider.confirm') : 
              newStatus === 'completed' ? t('provider.complete') : 
              t('provider.cancel')
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProviderBookings;
