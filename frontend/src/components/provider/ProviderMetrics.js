import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Cell
} from 'recharts';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventIcon from '@mui/icons-material/Event';
import StarIcon from '@mui/icons-material/Star';
import { ProviderContext } from '../../context/ProviderContext';

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ProviderMetrics = ({ onRefresh }) => {
  const { t } = useTranslation();
  const { 
    getProviderMetrics, 
    metrics, 
    loading, 
    error 
  } = useContext(ProviderContext);
  
  const [timeRange, setTimeRange] = useState('month');
  
  // Load metrics data
  useEffect(() => {
    loadMetrics();
  }, [timeRange]);
  
  const loadMetrics = async () => {
    try {
      await getProviderMetrics(timeRange);
    } catch (err) {
      console.error('Error loading metrics:', err);
    }
  };
  
  // Handle time range change
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Generate data for booking status pie chart
  const getBookingStatusData = () => {
    if (!metrics || !metrics.bookingsByStatus) return [];
    
    return Object.entries(metrics.bookingsByStatus).map(([status, count]) => ({
      name: t(`provider.status.${status}`),
      value: count
    }));
  };
  
  // Loading state
  if (loading && !metrics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          {t('provider.performanceMetrics')}
        </Typography>
        
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel id="time-range-label">{t('provider.timeRange')}</InputLabel>
          <Select
            labelId="time-range-label"
            value={timeRange}
            label={t('provider.timeRange')}
            onChange={handleTimeRangeChange}
          >
            <MenuItem value="week">{t('provider.lastWeek')}</MenuItem>
            <MenuItem value="month">{t('provider.lastMonth')}</MenuItem>
            <MenuItem value="quarter">{t('provider.lastQuarter')}</MenuItem>
            <MenuItem value="year">{t('provider.lastYear')}</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button onClick={onRefresh} sx={{ ml: 2 }}>
            {t('common.retry')}
          </Button>
        </Alert>
      )}
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h5" component="div">
                {formatCurrency(metrics?.totalRevenue || 0)}
              </Typography>
              <Typography color="text.secondary">
                {t('provider.totalRevenue')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h5" component="div">
                {metrics?.growthRate !== undefined 
                  ? `${(metrics.growthRate * 100).toFixed(1)}%` 
                  : '-'}
              </Typography>
              <Typography color="text.secondary">
                {t('provider.growthRate')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <EventIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h5" component="div">
                {metrics?.totalBookings || 0}
              </Typography>
              <Typography color="text.secondary">
                {t('provider.totalBookings')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <StarIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h5" component="div">
                {metrics?.averageRating?.toFixed(1) || '-'}
              </Typography>
              <Typography color="text.secondary">
                {t('provider.averageRating')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Revenue Over Time */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {t('provider.revenueOverTime')}
            </Typography>
            
            {metrics?.revenueByMonth?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={metrics.revenueByMonth}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8884d8" 
                    name={t('provider.revenue')} 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('provider.noRevenueData')}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {t('provider.bookingsByStatus')}
            </Typography>
            
            {getBookingStatusData().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getBookingStatusData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {getBookingStatusData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('provider.noBookingData')}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('provider.topServices')}
            </Typography>
            
            {metrics?.topServices?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={metrics.topServices}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="bookingCount" 
                    name={t('provider.bookings')} 
                    fill="#8884d8" 
                  />
                  <Bar 
                    dataKey="revenue" 
                    name={t('provider.revenue')} 
                    fill="#82ca9d" 
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('provider.noServiceData')}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('provider.bookingsByDayOfWeek')}
            </Typography>
            
            {metrics?.bookingsByDay?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={metrics.bookingsByDay}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    name={t('provider.bookings')} 
                    fill="#FF8042" 
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('provider.noBookingDayData')}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Customer Demographics */}
      <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('provider.customerInsights')}
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardHeader title={t('provider.repeatCustomers')} />
              <CardContent>
                <Typography variant="h4" align="center">
                  {metrics?.repeatCustomersPercentage !== undefined
                    ? `${Math.round(metrics.repeatCustomersPercentage * 100)}%`
                    : '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {t('provider.repeatCustomersDescription')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardHeader title={t('provider.customerRetention')} />
              <CardContent>
                <Typography variant="h4" align="center">
                  {metrics?.retentionRate !== undefined
                    ? `${Math.round(metrics.retentionRate * 100)}%`
                    : '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {t('provider.customerRetentionDescription')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardHeader title={t('provider.averageCustomerValue')} />
              <CardContent>
                <Typography variant="h4" align="center">
                  {metrics?.averageCustomerValue
                    ? formatCurrency(metrics.averageCustomerValue)
                    : '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {t('provider.averageCustomerValueDescription')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProviderMetrics;
