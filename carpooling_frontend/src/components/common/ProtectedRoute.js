import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, currentUser } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && (!currentUser?.role || currentUser.role !== requiredRole)) {
    // Redirect based on actual role
    if (currentUser?.role === 'DRIVER') {
      return <Navigate to="/driver/dashboard" replace />;
    } else if (currentUser?.role === 'RIDER') {
      return <Navigate to="/rider/dashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;