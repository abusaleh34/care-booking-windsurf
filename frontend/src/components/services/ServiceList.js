import React, { useContext, useEffect, useState } from 'react';
import { ServiceContext } from '../../context/ServiceContext';
import ServiceItem from './ServiceItem';
import ServiceFilter from './ServiceFilter';
import { useTranslation } from 'react-i18next';
import { 
  Grid, 
  Box, 
  Typography, 
  CircularProgress, 
  Alert,
  Pagination,
  Container
} from '@mui/material';

const ServiceList = () => {
  const { t } = useTranslation();
  const { 
    services, 
    loading, 
    error, 
    pagination, 
    fetchServices 
  } = useContext(ServiceContext);

  useEffect(() => {
    // Fetch services on component mount
    fetchServices(1);
  }, []);

  const handlePageChange = (event, page) => {
    fetchServices(page);
  };

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('services.title')}
        </Typography>
        <ServiceFilter />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      ) : services.length === 0 ? (
        <Alert severity="info" sx={{ my: 2 }}>
          {t('services.noServicesFound')}
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {services.map((service) => (
              <Grid item key={service._id} xs={12} sm={6} md={4}>
                <ServiceItem service={service} />
              </Grid>
            ))}
          </Grid>

          {pagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.pages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default ServiceList;
