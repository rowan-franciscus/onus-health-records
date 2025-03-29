// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated, checkSessionTimeout } = require('../middleware/auth');
const { changePasswordValidation } = require('../middleware/validation');
const { profileImageUploadMiddleware } = require('../middleware/upload');

// Apply authentication middleware to all routes
router.use(isAuthenticated);
router.use(checkSessionTimeout);

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', userController.getCurrentUser);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', userController.updateUserProfile);

/**
 * @route   PUT /api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', changePasswordValidation, userController.changePassword);

/**
 * @route   DELETE /api/users/delete-account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/delete-account', userController.deleteAccount);

/**
 * @route   POST /api/users/upload-profile-image
 * @desc    Upload profile image
 * @access  Private
 */
router.post('/upload-profile-image', profileImageUploadMiddleware, userController.uploadProfileImage);

module.exports = router;