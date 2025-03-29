// src/services/api.js
import axios from 'axios';

// Create an instance of axios with default configuration
const api = axios.create({
  baseURL: '/api', // Using proxy in package.json
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important for cookies/sessions
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 (Unauthorized) and not already retrying
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // No refresh token available, redirect to login
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        const response = await axios.post('/api/auth/refresh-token', {
          refreshToken
        });
        
        const { token } = response.data;
        
        // Update token in localStorage
        localStorage.setItem('token', token);
        
        // Update Authorization header with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        // Retry the original request with new token
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token also fails, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Check if in browser environment
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    // If error is 440 (Session Timeout)
    if (error.response.status === 440) {
      // Clear auth data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Check if in browser environment
      if (typeof window !== 'undefined') {
        // Display session timeout message
        alert('Your session has expired. Please log in again.');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;