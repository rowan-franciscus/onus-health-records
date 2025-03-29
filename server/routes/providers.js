// routes/providers.js
const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const consultationController = require('../controllers/consultationController');
const medicalRecordController = require('../controllers/medicalRecordController');
const documentController = require('../controllers/documentController');
const { isAuthenticated, isProvider, checkSessionTimeout } = require('../middleware/auth');
const { 
  createMedicalRecordValidation, 
  createConsultationValidation 
} = require('../middleware/validation');
const { documentUploadMiddleware } = require('../middleware/upload');

// Apply middleware to all routes
router.use(isAuthenticated);
router.use(isProvider);
router.use(checkSessionTimeout);

/**
 * @route   GET /api/providers/patients
 * @desc    Get provider's patients
 * @access  Private (Provider)
 */
router.get('/patients', providerController.getMyPatients);

/**
 * @route   GET /api/providers/pending-requests
 * @desc    Get pending connection requests
 * @access  Private (Provider)
 */
router.get('/pending-requests', providerController.getPendingRequests);

/**
 * @route   POST /api/providers/patients
 * @desc    Add new patient
 * @access  Private (Provider)
 */
router.post('/patients', providerController.addNewPatient);

/**
 * @route   GET /api/providers/patients/:patientId
 * @desc    Get patient details
 * @access  Private (Provider)
 */
router.get('/patients/:patientId', providerController.getPatientDetails);

/**
 * @route   GET /api/providers/patients/:patientId/records/:recordType
 * @desc    Get patient records by type
 * @access  Private (Provider)
 */
router.get('/patients/:patientId/records/:recordType', providerController.getPatientRecordsByType);

/**
 * @route   GET /api/providers/consultations
 * @desc    Get provider consultations
 * @access  Private (Provider)
 */
router.get('/consultations', consultationController.getProviderConsultations);

/**
 * @route   POST /api/providers/consultations
 * @desc    Create consultation
 * @access  Private (Provider)
 */
router.post('/consultations', createConsultationValidation, consultationController.createConsultation);

/**
 * @route   GET /api/providers/consultations/:consultationId
 * @desc    Get consultation details
 * @access  Private (Provider)
 */
router.get('/consultations/:consultationId', consultationController.getConsultation);

/**
 * @route   PUT /api/providers/consultations/:consultationId
 * @desc    Update consultation
 * @access  Private (Provider)
 */
router.put('/consultations/:consultationId', consultationController.updateConsultation);

/**
 * @route   DELETE /api/providers/consultations/:consultationId
 * @desc    Delete consultation
 * @access  Private (Provider)
 */
router.delete('/consultations/:consultationId', consultationController.deleteConsultation);

/**
 * @route   POST /api/providers/medical-records
 * @desc    Create medical record
 * @access  Private (Provider)
 */
router.post('/medical-records', createMedicalRecordValidation, medicalRecordController.createMedicalRecord);

/**
 * @route   POST /api/providers/medical-records/bulk
 * @desc    Create multiple medical records for a consultation
 * @access  Private (Provider)
 */
router.post('/medical-records/bulk', medicalRecordController.createBulkRecords);

/**
 * @route   GET /api/providers/medical-records/:recordId
 * @desc    Get medical record details
 * @access  Private (Provider)
 */
router.get('/medical-records/:recordId', medicalRecordController.getMedicalRecord);

/**
 * @route   PUT /api/providers/medical-records/:recordId
 * @desc    Update medical record
 * @access  Private (Provider)
 */
router.put('/medical-records/:recordId', medicalRecordController.updateMedicalRecord);

/**
 * @route   DELETE /api/providers/medical-records/:recordId
 * @desc    Delete medical record
 * @access  Private (Provider)
 */
router.delete('/medical-records/:recordId', medicalRecordController.deleteMedicalRecord);

/**
 * @route   POST /api/providers/documents
 * @desc    Upload document
 * @access  Private (Provider)
 */
router.post('/documents', documentUploadMiddleware, documentController.uploadDocument);

/**
 * @route   GET /api/providers/documents/:documentId
 * @desc    Get document
 * @access  Private (Provider)
 */
router.get('/documents/:documentId', documentController.getDocument);

/**
 * @route   DELETE /api/providers/documents/:documentId
 * @desc    Delete document
 * @access  Private (Provider)
 */
router.delete('/documents/:documentId', documentController.deleteDocument);

/**
 * @route   GET /api/providers/patients/:patientId/documents
 * @desc    Get patient documents
 * @access  Private (Provider)
 */
router.get('/patients/:patientId/documents', documentController.getPatientDocuments);

module.exports = router;