// controllers/consultationController.js
const { Consultation, Connection, MedicalRecord, Document, Patient } = require('../models');
const { sendNewMedicalRecordNotification } = require('../utils/emailService');
const { validationResult } = require('express-validator');

/**
 * Create consultation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with created consultation
 */
const createConsultation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const providerId = req.user._id;
    const { 
      patientId, 
      date, 
      type, 
      specialist, 
      clinic, 
      reasonForVisit, 
      symptoms,
      diagnosis,
      recommendations,
      followUp,
      notes,
      status 
    } = req.body;
    
    // Check if provider has access to patient
    const connection = await Connection.findOne({
      provider: providerId,
      patient: patientId,
      status: 'approved'
    });
    
    if (!connection) {
      return res.status(403).json({ message: 'You do not have access to this patient' });
    }
    
    // Create consultation
    const consultation = new Consultation({
      patient: patientId,
      provider: providerId,
      date: date ? new Date(date) : new Date(),
      type,
      specialist: specialist || req.user.name,
      clinic,
      reasonForVisit,
      symptoms: symptoms || [],
      diagnosis,
      recommendations,
      followUp: followUp || { recommended: false },
      notes,
      status: status || 'completed'
    });
    
    await consultation.save();
    
    // Notify patient about new consultation
    const patient = await Patient.findById(patientId);
    if (patient) {
      await sendNewMedicalRecordNotification(patient, req.user, 'consultation');
    }
    
    res.status(201).json({
      message: 'Consultation created successfully',
      consultation
    });
  } catch (error) {
    console.error('Create consultation error:', error);
    res.status(500).json({ message: 'Server error creating consultation' });
  }
};

/**
 * Get provider consultations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with consultations
 */
const getProviderConsultations = async (req, res) => {
  try {
    const providerId = req.user._id;
    const { page = 1, limit = 10, search, dateFrom, dateTo, status } = req.query;
    
    // Build query
    const query = {
      provider: providerId,
      isDeleted: false
    };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Add date range filter if provided
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) {
        query.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.date.$lte = new Date(dateTo);
      }
    }
    
    // Add search filter if provided
    if (search) {
      query.$or = [
        { type: { $regex: search, $options: 'i' } },
        { reasonForVisit: { $regex: search, $options: 'i' } },
        { diagnosis: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get consultations
    const consultations = await Consultation.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('patient', 'name email patientId');
    
    // Get total count for pagination
    const total = await Consultation.countDocuments(query);
    
    res.status(200).json({
      consultations,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get provider consultations error:', error);
    res.status(500).json({ message: 'Server error fetching consultations' });
  }
};

/**
 * Get consultation by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with consultation details
 */
const getConsultation = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { consultationId } = req.params;
    
    // Get consultation
    const consultation = await Consultation.findOne({
      _id: consultationId,
      isDeleted: false
    })
      .populate('provider', 'name specialty title practice')
      .populate('patient', 'name patientId dateOfBirth gender healthInsurance');
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    
    // Check permissions
    if (userRole === 'patient') {
      // If patient, check that consultation belongs to them
      if (consultation.patient._id.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'You do not have access to this consultation' });
      }
    } else if (userRole === 'provider') {
      // If provider, check if they created the consultation or have connection to patient
      if (consultation.provider._id.toString() !== userId.toString()) {
        const connection = await Connection.findOne({
          provider: userId,
          patient: consultation.patient._id,
          status: 'approved'
        });
        
        if (!connection) {
          return res.status(403).json({ message: 'You do not have access to this patient' });
        }
      }
    }
    
    // Get medical records associated with this consultation
    const records = await MedicalRecord.find({
      consultation: consultationId,
      isDeleted: false
    }).populate('provider', 'name specialty');
    
    // Get documents associated with this consultation
    const documents = await Document.find({
      'relatedTo.model': 'Consultation',
      'relatedTo.id': consultationId,
      isDeleted: false
    });
    
    res.status(200).json({
      consultation,
      records,
      documents
    });
  } catch (error) {
    console.error('Get consultation error:', error);
    res.status(500).json({ message: 'Server error fetching consultation' });
  }
};

/**
 * Update consultation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with updated consultation
 */
const updateConsultation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const providerId = req.user._id;
    const { consultationId } = req.params;
    const updateData = req.body;
    
    // Get consultation
    const consultation = await Consultation.findOne({
      _id: consultationId,
      isDeleted: false
    });
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    
    // Check if provider created the consultation
    if (consultation.provider.toString() !== providerId.toString()) {
      return res.status(403).json({ message: 'You can only update consultations you created' });
    }
    
    // Update allowed fields
    const allowedFields = [
      'date', 'type', 'specialist', 'clinic', 'reasonForVisit', 'symptoms', 
      'diagnosis', 'recommendations', 'followUp', 'notes', 'status'
    ];
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        // Handle date field specifically
        if (field === 'date' && updateData[field]) {
          consultation[field] = new Date(updateData[field]);
        } else {
          consultation[field] = updateData[field];
        }
      }
    });
    
    await consultation.save();
    
    res.status(200).json({
      message: 'Consultation updated successfully',
      consultation
    });
  } catch (error) {
    console.error('Update consultation error:', error);
    res.status(500).json({ message: 'Server error updating consultation' });
  }
};

/**
 * Delete consultation (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with deletion status
 */
const deleteConsultation = async (req, res) => {
  try {
    const providerId = req.user._id;
    const { consultationId } = req.params;
    
    // Get consultation
    const consultation = await Consultation.findOne({
      _id: consultationId,
      isDeleted: false
    });
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    
    // Check if provider created the consultation
    if (consultation.provider.toString() !== providerId.toString()) {
      return res.status(403).json({ message: 'You can only delete consultations you created' });
    }
    
    // Soft delete consultation
    consultation.isDeleted = true;
    await consultation.save();
    
    // Soft delete associated medical records
    await MedicalRecord.updateMany(
      { consultation: consultationId },
      { isDeleted: true }
    );
    
    // Soft delete associated documents
    await Document.updateMany(
      { 'relatedTo.model': 'Consultation', 'relatedTo.id': consultationId },
      { isDeleted: true }
    );
    
    res.status(200).json({ message: 'Consultation and associated records deleted successfully' });
  } catch (error) {
    console.error('Delete consultation error:', error);
    res.status(500).json({ message: 'Server error deleting consultation' });
  }
};

module.exports = {
  createConsultation,
  getProviderConsultations,
  getConsultation,
  updateConsultation,
  deleteConsultation
};