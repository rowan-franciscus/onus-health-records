// src/components/common/PrivateRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Private route component that requires authentication
 */
export const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading indicator while checking auth status
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Render child routes
  return <Outlet />;
};

/**
 * Admin route component that requires admin role
 */
export const AdminRoute = () => {
  const { isAuthenticated, loading, isAdmin } = useAuth();
  
  // Show loading indicator while checking auth status
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to unauthorized page if not admin
  if (!isAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Render child routes
  return <Outlet />;
};

/**
 * Provider route component that requires provider role
 */
export const ProviderRoute = () => {
  const { isAuthenticated, loading, isProvider, user } = useAuth();
  
  // Show loading indicator while checking auth status
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to unauthorized page if not provider
  if (!isProvider()) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Redirect to complete profile page if profile not completed
  if (!user.profileCompleted) {
    return <Navigate to="/provider/complete-profile" replace />;
  }
  
  // Check if provider is verified
  if (user.verificationStatus === 'pending') {
    return <Navigate to="/provider/verification-pending" replace />;
  }
  
  if (user.verificationStatus === 'rejected') {
    return <Navigate to="/provider/verification-rejected" replace />;
  }
  
  // Render child routes
  return <Outlet />;
};

/**
 * Patient route component that requires patient role
 */
export const PatientRoute = () => {
  const { isAuthenticated, loading, isPatient, user } = useAuth();
  
  // Show loading indicator while checking auth status
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to unauthorized page if not patient
  if (!isPatient()) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Redirect to complete profile page if profile not completed
  if (!user.profileCompleted) {
    return <Navigate to="/patient/complete-profile" replace />;
  }
  
  // Render child routes
  return <Outlet />;
};

/**
 * Public route component for non-authenticated routes
 */
export const PublicRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();
  
  // Show loading indicator while checking auth status
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Redirect to appropriate dashboard if already authenticated
  if (isAuthenticated) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'provider') {
      return <Navigate to="/provider/patients" replace />;
    } else if (user.role === 'patient') {
      return <Navigate to="/patient/dashboard" replace />;
    }
  }
  
  // Render child routes
  return <Outlet />;
};