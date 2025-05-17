import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render the protected component
  return children;
};

export default ProtectedRoute;
