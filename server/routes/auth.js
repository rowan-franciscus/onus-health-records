// routes/auth.js
const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/authController');
const { 
  registerValidation, 
  loginValidation, 
  forgotPasswordValidation, 
  resetPasswordValidation
} = require('../middleware/validation');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerValidation, authController.register);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify email with token
 * @access  Public
 */
router.get('/verify-email/:token', authController.verifyEmail);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post('/login', loginValidation, authController.login);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Get new access token with refresh token
 * @access  Public
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);

/**
 * @route   GET /api/auth/google
 * @desc    Auth with Google
 * @access  Public
 */
router.get('/google', 
  (req, res, next) => {
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      session: false
    })(req, res, next);
  }
);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google auth callback
 * @access  Public
 */
router.get('/google/callback', authController.googleCallback);

/**
 * @route   GET /api/auth/facebook
 * @desc    Auth with Facebook
 * @access  Public
 */
router.get('/facebook', 
  (req, res, next) => {
    passport.authenticate('facebook', { 
      scope: ['email'],
      session: false
    })(req, res, next);
  }
);

/**
 * @route   GET /api/auth/facebook/callback
 * @desc    Facebook auth callback
 * @access  Public
 */
router.get('/facebook/callback', authController.facebookCallback);

/**
 * @route   GET /api/auth/set-registration-type/:type
 * @desc    Set registration type (patient/provider) for OAuth flow
 * @access  Public
 */
router.get('/set-registration-type/:type', authController.setRegistrationType);

module.exports = router;