// controllers/documentController.js
const { Document, MedicalRecord, Consultation, Connection } = require('../models');
const fs = require('fs');
const path = require('path');

/**
 * Upload document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with uploaded document
 */
const uploadDocument = async (req, res) => {
  try {
    // File should be available on req.file from multer middleware
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const providerId = req.user._id;
    const { patientId, relatedModel, relatedId, description, tags } = req.body;
    
    // Check if provider has access to patient
    const connection = await Connection.findOne({
      provider: providerId,
      patient: patientId,
      status: 'approved'
    });
    
    if (!connection) {
      return res.status(403).json({ message: 'You do not have access to this patient' });
    }
    
    // Validate that the related model and ID exist
    if (relatedModel === 'MedicalRecord') {
      const record = await MedicalRecord.findOne({
        _id: relatedId,
        patient: patientId,
        isDeleted: false
      });
      
      if (!record) {
        // Delete the uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Related medical record not found' });
      }
    } else if (relatedModel === 'Consultation') {
      const consultation = await Consultation.findOne({
        _id: relatedId,
        patient: patientId,
        isDeleted: false
      });
      
      if (!consultation) {
        // Delete the uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Related consultation not found' });
      }
    } else {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Invalid related model. Must be MedicalRecord or Consultation' });
    }
    
    // Create document record
    const document = new Document({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedBy: providerId,
      patient: patientId,
      relatedTo: {
        model: relatedModel,
        id: relatedId
      },
      description: description || '',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      uploadDate: new Date()
    });
    
    await document.save();
    
    // If the document is related to a medical record or consultation, update its documents array
    if (relatedModel === 'MedicalRecord') {
      await MedicalRecord.findByIdAndUpdate(relatedId, {
        $push: { documents: document._id }
      });
    } else if (relatedModel === 'Consultation') {
      await Consultation.findByIdAndUpdate(relatedId, {
        $push: { documents: document._id }
      });
    }
    
    res.status(201).json({
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    console.error('Upload document error:', error);
    
    // If file was uploaded but error occurred in database operation, delete the file
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file after failed upload:', unlinkError);
      }
    }
    
    res.status(500).json({ message: 'Server error uploading document' });
  }
};

/**
 * Get document by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with document data or file stream
 */
const getDocument = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { documentId } = req.params;
    const { metadata } = req.query; // If metadata=true, return document metadata instead of file
    
    // Get document
    const document = await Document.findOne({
      _id: documentId,
      isDeleted: false
    });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check permissions
    if (userRole === 'patient') {
      // If patient, check that document belongs to them
      if (document.patient.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'You do not have access to this document' });
      }
    } else if (userRole === 'provider') {
      // If provider, check if they uploaded document or have connection to patient
      if (document.uploadedBy.toString() !== userId.toString()) {
        const connection = await Connection.findOne({
          provider: userId,
          patient: document.patient,
          status: 'approved'
        });
        
        if (!connection) {
          return res.status(403).json({ message: 'You do not have access to this patient' });
        }
      }
    }
    
    // If metadata=true, return document metadata
    if (metadata === 'true') {
      return res.status(200).json({ document });
    }
    
    // Check if file exists
    if (!fs.existsSync(document.path)) {
      return res.status(404).json({ message: 'Document file not found' });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Type', document.mimetype);
    
    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(document.path);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Server error fetching document' });
  }
};

/**
 * Delete document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with deletion status
 */
const deleteDocument = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { documentId } = req.params;
    
    // Get document
    const document = await Document.findOne({
      _id: documentId,
      isDeleted: false
    });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check permissions
    if (userRole === 'provider') {
      // If provider, check if they uploaded the document
      if (document.uploadedBy.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'You can only delete documents you uploaded' });
      }
    } else if (userRole === 'patient') {
      // Patients cannot delete documents
      return res.status(403).json({ message: 'Patients cannot delete documents' });
    }
    
    // Soft delete document
    document.isDeleted = true;
    await document.save();
    
    // Remove document reference from related model
    if (document.relatedTo.model === 'MedicalRecord') {
      await MedicalRecord.findByIdAndUpdate(document.relatedTo.id, {
        $pull: { documents: documentId }
      });
    } else if (document.relatedTo.model === 'Consultation') {
      await Consultation.findByIdAndUpdate(document.relatedTo.id, {
        $pull: { documents: documentId }
      });
    }
    
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error deleting document' });
  }
};

/**
 * Get patient documents
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with patient documents
 */
const getPatientDocuments = async (req, res) => {
  try {
    const providerId = req.user._id;
    const { patientId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Check if provider has access to patient
    const connection = await Connection.findOne({
      provider: providerId,
      patient: patientId,
      status: 'approved'
    });
    
    if (!connection) {
      return res.status(403).json({ message: 'You do not have access to this patient' });
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get documents
    const documents = await Document.find({
      patient: patientId,
      isDeleted: false
    })
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Document.countDocuments({
      patient: patientId,
      isDeleted: false
    });
    
    res.status(200).json({
      documents,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get patient documents error:', error);
    res.status(500).json({ message: 'Server error fetching patient documents' });
  }
};

module.exports = {
  uploadDocument,
  getDocument,
  deleteDocument,
  getPatientDocuments
};