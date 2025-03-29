// src/services/auth.service.js
import api from './api';
import jwt_decode from 'jwt-decode';

const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  VERIFY_EMAIL: '/auth/verify-email',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  GOOGLE_AUTH: '/auth/google',
  FACEBOOK_AUTH: '/auth/facebook',
  SET_REGISTRATION_TYPE: '/auth/set-registration-type'
};

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} Promise with registration result
   */
  async register(userData) {
    const response = await api.post(AUTH_ENDPOINTS.REGISTER, userData);
    return response.data;
  }
  
  /**
   * Log in user and get token
   * @param {Object} credentials - User login credentials
   * @returns {Promise} Promise with login result
   */
  async login(credentials) {
    const response = await api.post(AUTH_ENDPOINTS.LOGIN, credentials);
    
    if (response.data.token) {
      // Save tokens and user data to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }
  
  /**
   * Log out user
   */
  logout() {
    // Remove tokens and user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
  
  /**
   * Get currently logged in user
   * @returns {Object|null} User object or null if not logged in
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  
  /**
   * Check if user is logged in
   * @returns {Boolean} True if user is logged in
   */
  isLoggedIn() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      // Check if token is expired
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      
      return decoded.exp > currentTime;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Get user role
   * @returns {String|null} User role or null if not logged in
   */
  getUserRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }
  
  /**
   * Check if user is admin
   * @returns {Boolean} True if user is admin
   */
  isAdmin() {
    return this.getUserRole() === 'admin';
  }
  
  /**
   * Check if user is provider
   * @returns {Boolean} True if user is provider
   */
  isProvider() {
    return this.getUserRole() === 'provider';
  }
  
  /**
   * Check if user is patient
   * @returns {Boolean} True if user is patient
   */
  isPatient() {
    return this.getUserRole() === 'patient';
  }
  
  /**
   * Verify email with token
   * @param {String} token - Verification token
   * @returns {Promise} Promise with verification result
   */
  async verifyEmail(token) {
    const response = await api.get(`${AUTH_ENDPOINTS.VERIFY_EMAIL}/${token}`);
    return response.data;
  }
  
  /**
   * Request password reset email
   * @param {String} email - User email
   * @returns {Promise} Promise with request result
   */
  async forgotPassword(email) {
    const response = await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
    return response.data;
  }
  
  /**
   * Reset password with token
   * @param {Object} resetData - Password reset data
   * @returns {Promise} Promise with reset result
   */
  async resetPassword(resetData) {
    const response = await api.post(AUTH_ENDPOINTS.RESET_PASSWORD, resetData);
    return response.data;
  }
  
  /**
   * Set registration type for OAuth flow
   * @param {String} type - Registration type ('patient' or 'provider')
   * @returns {Promise} Promise with result
   */
  async setRegistrationType(type) {
    const response = await api.get(`${AUTH_ENDPOINTS.SET_REGISTRATION_TYPE}/${type}`);
    return response.data;
  }
  
  /**
   * Get Google auth URL
   * @param {String} type - Registration type ('patient' or 'provider')
   * @returns {String} Google auth URL
   */
  getGoogleAuthUrl(type) {
    return `${process.env.REACT_APP_API_URL || ''}${AUTH_ENDPOINTS.GOOGLE_AUTH}?type=${type}`;
  }
  
  /**
   * Get Facebook auth URL
   * @param {String} type - Registration type ('patient' or 'provider')
   * @returns {String} Facebook auth URL
   */
  getFacebookAuthUrl(type) {
    return `${process.env.REACT_APP_API_URL || ''}${AUTH_ENDPOINTS.FACEBOOK_AUTH}?type=${type}`;
  }
}

export default new AuthService();