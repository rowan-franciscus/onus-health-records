// middleware/auth.js
const passport = require('passport');
const { User } = require('../models');
const { verifyToken } = require('../utils/jwt');

/**
 * Middleware to authenticate user with JWT
 */
const authenticateJWT = passport.authenticate('jwt', { session: false });

/**
 * Middleware to check if user is authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isAuthenticated = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided, authentication required' });
  }
  
  // Verify token
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  
  // Find user
  User.findById(decoded.id)
    .then(user => {
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Check if user is verified
      if (!user.isVerified) {
        return res.status(401).json({ message: 'Please verify your email before accessing this resource' });
      }
      
      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ message: 'Your account has been deactivated' });
      }
      
      // Set user on request
      req.user = user;
      next();
    })
    .catch(err => {
      console.error('Authentication error:', err);
      res.status(500).json({ message: 'Server error during authentication' });
    });
};

/**
 * Middleware to check if user is admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

/**
 * Middleware to check if user is a health provider
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isProvider = (req, res, next) => {
  if (req.user.role !== 'provider') {
    return res.status(403).json({ message: 'Health provider access required' });
  }
  
  // Check if provider is verified
  if (req.user.verificationStatus !== 'approved') {
    return res.status(403).json({ 
      message: 'Your provider account is not verified yet',
      verificationStatus: req.user.verificationStatus
    });
  }
  
  next();
};

/**
 * Middleware to check if user is a patient
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isPatient = (req, res, next) => {
  if (req.user.role !== 'patient') {
    return res.status(403).json({ message: 'Patient access required' });
  }
  next();
};

/**
 * Middleware to check session idle timeout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const checkSessionTimeout = (req, res, next) => {
  // If no user (not authenticated), skip this middleware
  if (!req.user) {
    return next();
  }
  
  // Calculate idle time
  const lastActivity = req.session.lastActivity || 0;
  const currentTime = Date.now();
  const idleTime = currentTime - lastActivity;
  
  // If idle for more than 30 minutes (1800000 ms)
  if (idleTime > 1800000) {
    // Clear session
    req.session.destroy(err => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      return res.status(440).json({ message: 'Session expired due to inactivity' });
    });
  } else {
    // Update last activity
    req.session.lastActivity = currentTime;
    next();
  }
};

module.exports = {
  authenticateJWT,
  isAuthenticated,
  isAdmin,
  isProvider,
  isPatient,
  checkSessionTimeout
};