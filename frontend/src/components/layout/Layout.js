import React from 'react';
import { Box, Container } from '@mui/material';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {children}
      </Container>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) => theme.palette.grey[200],
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center' }}>
            © {new Date().getFullYear()} Care Booking Platform
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
