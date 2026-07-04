import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

/**
 * Route guard that redirects requests if the user lacks the allowed RBAC role parameters.
 * @param {Array<string>} allowedRoles - The roles permitted to view the child element.
 */
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Show a fullscreen loader during JWT verification check
  if (loading) {
    return <Loader fullScreen />;
  }

  // Redirect to login if unauthenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to unauthorized landing page if user lacks access rights
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleRoute;
