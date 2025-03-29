// controllers/authController.js
const { User, Patient, HealthProvider } = require('../models');
const passport = require('passport');
const { generateToken, generateRefreshToken, generateVerificationToken, generateResetToken, verifyToken } = require('../utils/jwt');
const { 
  sendVerificationEmail, 
  sendPasswordResetEmail, 
  sendLoginNotification,
  sendProviderVerificationRequestToAdmin
} = require('../utils/emailService');
const { validationResult } = require('express-validator');

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with user data and token
 */
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create appropriate user based on role
    let user;
    if (role === 'patient') {
      user = new Patient({
        name,
        email: email.toLowerCase(),
        password,
        role: 'patient'
      });
    } else if (role === 'provider') {
      user = new HealthProvider({
        name,
        email: email.toLowerCase(),
        password,
        role: 'provider',
        verificationStatus: 'pending'
      });
    } else if (role === 'admin') {
      // Only allow admin creation in development or with special key
      if (process.env.NODE_ENV !== 'development' && req.body.adminKey !== process.env.ADMIN_CREATION_KEY) {
        return res.status(403).json({ message: 'Unauthorized to create admin account' });
      }
      user = new User({
        name,
        email: email.toLowerCase(),
        password,
        role: 'admin',
        isVerified: true // Auto-verify admin
      });
    } else {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken(user);
    user.verificationToken = verificationToken;

    // Save user
    await user.save();

    // Send verification email
    await sendVerificationEmail(user, verificationToken);

    // If provider, send verification request to admin
    if (role === 'provider') {
      await sendProviderVerificationRequestToAdmin(user);
    }

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      userId: user._id
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * Verify email with token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with verification status
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.type !== 'verification') {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }
    
    // Find user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }
    
    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
};

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with user data and tokens
 */
const login = (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user, info) => {
    try {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info.message || 'Authentication failed' });
      }
      
      // Check if email is verified
      if (!user.isVerified) {
        return res.status(401).json({ message: 'Please verify your email before logging in' });
      }
      
      // Generate tokens
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);
      
      // Send login notification email
      await sendLoginNotification(user);
      
      // Return user info and tokens
      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          profileCompleted: user.profileCompleted || false
        },
        token,
        refreshToken
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  })(req, res, next);
};

/**
 * Refresh token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with new token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    // Verify refresh token
    const decoded = verifyToken(refreshToken);
    
    if (!decoded || decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
    
    // Find user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate new access token
    const newToken = generateToken(user);
    
    res.status(200).json({
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Server error during token refresh' });
  }
};

/**
 * Forgot password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with password reset status
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Don't reveal that user doesn't exist for security
      return res.status(200).json({ message: 'If your email exists in our system, you will receive a password reset link' });
    }
    
    // Generate reset token
    const resetToken = generateResetToken(user);
    
    // Update user with reset token info
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    
    // Send password reset email
    await sendPasswordResetEmail(user, resetToken);
    
    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

/**
 * Reset password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with password reset status
 */
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.type !== 'reset') {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    // Find user
    const user = await User.findOne({ 
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

/**
 * Handle Google OAuth callback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user) => {
    try {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
      }
      
      // Generate tokens
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);
      
      // Redirect to frontend with tokens
      res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${token}&refreshToken=${refreshToken}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
    }
  })(req, res, next);
};

/**
 * Handle Facebook OAuth callback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const facebookCallback = (req, res, next) => {
  passport.authenticate('facebook', { session: false }, async (err, user) => {
    try {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
      }
      
      // Generate tokens
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);
      
      // Redirect to frontend with tokens
      res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${token}&refreshToken=${refreshToken}`);
    } catch (error) {
      console.error('Facebook OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
    }
  })(req, res, next);
};

/**
 * Set registration type for OAuth
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const setRegistrationType = (req, res) => {
  const { type } = req.params;
  
  if (type !== 'patient' && type !== 'provider') {
    return res.status(400).json({ message: 'Invalid registration type' });
  }
  
  // Store in session for OAuth flow
  req.session.registrationType = type;
  
  res.status(200).json({ message: `Registration type set to ${type}` });
};

module.exports = {
  register,
  verifyEmail,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  googleCallback,
  facebookCallback,
  setRegistrationType
};