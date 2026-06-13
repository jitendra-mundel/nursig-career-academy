import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Private Route Component
 * Protects routes that require authentication
 */
const PrivateRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, initializing } = useAuth();

  if (initializing) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;
