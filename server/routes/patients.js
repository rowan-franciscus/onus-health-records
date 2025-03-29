// routes/patients.js
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { isAuthenticated, isPatient, checkSessionTimeout } = require('../middleware/auth');
const { updateConnectionValidation } = require('../middleware/validation');

// Apply middleware to all routes
router.use(isAuthenticated);
router.use(isPatient);
router.use(checkSessionTimeout);

/**
 * @route   GET /api/patients/dashboard
 * @desc    Get patient dashboard data
 * @access  Private (Patient)
 */
router.get('/dashboard', patientController.getDashboardData);

/**
 * @route   GET /api/patients/consultations
 * @desc    Get all patient consultations
 * @access  Private (Patient)
 */
router.get('/consultations', patientController.getConsultations);

/**
 * @route   GET /api/patients/consultations/:consultationId
 * @desc    Get consultation details
 * @access  Private (Patient)
 */
router.get('/consultations/:consultationId', patientController.getConsultationDetails);

/**
 * @route   GET /api/patients/medical-records
 * @desc    Get medical records summary
 * @access  Private (Patient)
 */
router.get('/medical-records', patientController.getMedicalRecordsSummary);

/**
 * @route   GET /api/patients/medical-records/:recordType
 * @desc    Get records by type
 * @access  Private (Patient)
 */
router.get('/medical-records/:recordType', patientController.getRecordsByType);

/**
 * @route   GET /api/patients/medical-records/record/:recordId
 * @desc    Get record details
 * @access  Private (Patient)
 */
router.get('/medical-records/record/:recordId', patientController.getRecordDetails);

/**
 * @route   GET /api/patients/connections
 * @desc    Get patient connections
 * @access  Private (Patient)
 */
router.get('/connections', patientController.getConnections);

/**
 * @route   PUT /api/patients/connections/:connectionId
 * @desc    Update connection status
 * @access  Private (Patient)
 */
router.put('/connections/:connectionId', updateConnectionValidation, patientController.updateConnectionStatus);

/**
 * @route   PUT /api/patients/medical-records/:recordId/visibility
 * @desc    Update record visibility
 * @access  Private (Patient)
 */
router.put('/medical-records/:recordId/visibility', patientController.updateRecordVisibility);

module.exports = router;