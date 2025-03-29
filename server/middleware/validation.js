// middleware/validation.js
const { body, param, query } = require('express-validator');

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be valid')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
  
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['patient', 'provider', 'admin']).withMessage('Role must be patient, provider, or admin')
];

/**
 * Validation rules for login
 */
const loginValidation = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be valid')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

/**
 * Validation rules for password reset request
 */
const forgotPasswordValidation = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be valid')
    .normalizeEmail()
];

/**
 * Validation rules for password reset
 */
const resetPasswordValidation = [
  body('token')
    .notEmpty().withMessage('Token is required'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character')
];

/**
 * Validation rules for password change
 */
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character')
];

/**
 * Validation rules for provider verification
 */
const verifyProviderValidation = [
  param('providerId')
    .notEmpty().withMessage('Provider ID is required')
    .isMongoId().withMessage('Invalid provider ID'),
  
  body('action')
    .notEmpty().withMessage('Action is required')
    .isIn(['approve', 'reject']).withMessage('Action must be approve or reject')
];

/**
 * Validation rules for creating medical record
 */
const createMedicalRecordValidation = [
  body('patientId')
    .notEmpty().withMessage('Patient ID is required')
    .isMongoId().withMessage('Invalid patient ID'),
  
  body('recordType')
    .notEmpty().withMessage('Record type is required')
    .isIn(['vitals', 'medication', 'immunization', 'labResult', 'radiologyReport', 'hospital', 'surgery'])
    .withMessage('Invalid record type')
];

/**
 * Validation rules for creating consultation
 */
const createConsultationValidation = [
  body('patientId')
    .notEmpty().withMessage('Patient ID is required')
    .isMongoId().withMessage('Invalid patient ID'),
  
  body('type')
    .notEmpty().withMessage('Consultation type is required'),
  
  body('reasonForVisit')
    .notEmpty().withMessage('Reason for visit is required')
];

/**
 * Validation rules for updating connection status
 */
const updateConnectionValidation = [
  param('connectionId')
    .notEmpty().withMessage('Connection ID is required')
    .isMongoId().withMessage('Invalid connection ID'),
  
  body('action')
    .notEmpty().withMessage('Action is required')
    .isIn(['approve', 'reject', 'remove']).withMessage('Action must be approve, reject, or remove')
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
  verifyProviderValidation,
  createMedicalRecordValidation,
  createConsultationValidation,
  updateConnectionValidation
};