// utils/jwt.js
const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for a user
 * @param {Object} user - The user object
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '30m' } // Token expires in 30 minutes
  );
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object|null} Decoded token or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Generate refresh token for a user
 * @param {Object} user - The user object
 * @returns {String} Refresh token
 */
const generateRefreshToken = (user) => {
  const payload = {
    id: user._id,
    type: 'refresh'
  };
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Refresh token expires in 7 days
  );
};

/**
 * Generate verification token for email verification
 * @param {Object} user - The user object
 * @returns {String} Verification token
 */
const generateVerificationToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    type: 'verification'
  };
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '24h' } // Verification token expires in 24 hours
  );
};

/**
 * Generate password reset token
 * @param {Object} user - The user object
 * @returns {String} Reset token
 */
const generateResetToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    type: 'reset'
  };
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '1h' } // Reset token expires in 1 hour
  );
};

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken,
  generateVerificationToken,
  generateResetToken
};