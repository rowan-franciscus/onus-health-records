// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';

// Create context
export const AuthContext = createContext();

// Context provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  
  // Initialize auth state on component mount
  useEffect(() => {
    const initAuth = () => {
      try {
        // Check if user is logged in
        const isLoggedIn = AuthService.isLoggedIn();
        
        if (isLoggedIn) {
          // Get user data from localStorage
          const currentUser = AuthService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);
  
  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await AuthService.login(credentials);
      setUser(data.user);
      
      // Redirect based on user role
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.user.role === 'provider') {
        navigate('/provider/patients');
      } else if (data.user.role === 'patient') {
        navigate('/patient/dashboard');
      }
      
      return data;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await AuthService.register(userData);
      
      // Redirect to email verification page
      navigate('/verification-sent', { state: { email: userData.email } });
      
      return data;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    try {
      AuthService.logout();
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Logout failed');
    }
  };
  
  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };
  
  // Check if user has specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };
  
  // Check if user is admin
  const isAdmin = () => hasRole('admin');
  
  // Check if user is provider
  const isProvider = () => hasRole('provider');
  
  // Check if user is patient
  const isPatient = () => hasRole('patient');
  
  // Context value
  const authContextValue = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    isAdmin,
    isProvider,
    isPatient
  };
  
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};