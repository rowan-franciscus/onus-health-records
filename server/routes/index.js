// routes/index.js
const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const userRoutes = require('./users');
const adminRoutes = require('./admin');
const providerRoutes = require('./providers');
const patientRoutes = require('./patients');
const { isAuthenticated } = require('../middleware/auth');

// Auth routes (public)
router.use('/auth', authRoutes);

// User routes (authenticated)
router.use('/users', userRoutes);

// Admin routes (admin role required)
router.use('/admin', adminRoutes);

// Provider routes (provider role required)
router.use('/providers', providerRoutes);

// Patient routes (patient role required)
router.use('/patients', patientRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ message: 'API is healthy', timestamp: new Date() });
});

// Protected test route
router.get('/protected', isAuthenticated, (req, res) => {
  res.status(200).json({ 
    message: 'You have accessed a protected route',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;