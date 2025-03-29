// routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin, checkSessionTimeout } = require('../middleware/auth');
const { verifyProviderValidation } = require('../middleware/validation');

// Apply middleware to all routes
router.use(isAuthenticated);
router.use(isAdmin);
router.use(checkSessionTimeout);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get('/dashboard', adminController.getDashboardStats);

/**
 * @route   GET /api/admin/providers
 * @desc    Get all healthcare providers
 * @access  Private (Admin)
 */
router.get('/providers', adminController.getAllProviders);

/**
 * @route   GET /api/admin/patients
 * @desc    Get all patients
 * @access  Private (Admin)
 */
router.get('/patients', adminController.getAllPatients);

/**
 * @route   GET /api/admin/verification-requests
 * @desc    Get healthcare provider verification requests
 * @access  Private (Admin)
 */
router.get('/verification-requests', adminController.getProviderVerificationRequests);

/**
 * @route   PUT /api/admin/providers/:providerId/verify
 * @desc    Verify or reject healthcare provider
 * @access  Private (Admin)
 */
router.put('/providers/:providerId/verify', verifyProviderValidation, adminController.verifyProvider);

/**
 * @route   GET /api/admin/providers/:providerId
 * @desc    Get healthcare provider details
 * @access  Private (Admin)
 */
router.get('/providers/:providerId', adminController.getProviderDetails);

/**
 * @route   GET /api/admin/patients/:patientId
 * @desc    Get patient details
 * @access  Private (Admin)
 */
router.get('/patients/:patientId', adminController.getPatientDetails);

module.exports = router;