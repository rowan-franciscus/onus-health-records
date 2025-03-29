// controllers/providerController.js
const { User, Patient, Connection, MedicalRecord, Consultation } = require('../models');
const { sendConnectionRequest, sendNewPatientInvitation } = require('../utils/emailService');

/**
 * Get provider patients
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with list of patients
 */
const getMyPatients = async (req, res) => {
  try {
    const providerId = req.user._id;
    const { search, sort, page = 1, limit = 10 } = req.query;
    
    // Get approved connections
    const connections = await Connection.find({
      provider: providerId,
      status: 'approved'
    }).select('patient');
    
    const patientIds = connections.map(conn => conn.patient);
    
    // Build query
    const query = { 
      _id: { $in: patientIds },
      isActive: true
    };
    
    // Search by name, email, or patient ID
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination values
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Determine sort field and order
    let sortOption = { name: 1 }; // Default sort by name
    if (sort) {
      const [field, order] = sort.split(':');
      sortOption = { [field]: order === 'asc' ? 1 : -1 };
    }
    
    // Get patients
    const patients = await Patient.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password -__v');
    
    // Get total count for pagination
    const total = await Patient.countDocuments(query);
    
    // For each patient, get latest record date
    const patientsWithMeta = await Promise.all(patients.map(async (patient) => {
      const latestRecord = await MedicalRecord.findOne({ 
        patient: patient._id,
        provider: providerId,
        isDeleted: false
      })
        .sort({ date: -1 })
        .select('date');
      
      return {
        ...patient.toObject(),
        lastRecordDate: latestRecord ? latestRecord.date : null
      };
    }));
    
    res.status(200).json({
      patients: patientsWithMeta,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get provider patients error:', error);
    res.status(500).json({ message: 'Server error fetching patients' });
  }
};

/**
 * Get pending connection requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with pending connection requests
 */
const getPendingRequests = async (req, res) => {
  try {
    const providerId = req.user._id;
    
    // Get pending connections
    const connections = await Connection.find({
      provider: providerId,
      status: 'pending'
    })
      .populate('patient', 'name email patientId')
      .sort({ requestDate: -1 });
    
    res.status(200).json({ pendingRequests: connections });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ message: 'Server error fetching pending requests' });
  }
};

/**
 * Add new patient
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with connection status
 */
const addNewPatient = async (req, res) => {
  try {
    const providerId = req.user._id;
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if patient exists
    const existingPatient = await Patient.findOne({ 
      email: email.toLowerCase(),
      role: 'patient'
    });
    
    if (existingPatient) {
      // Check if connection already exists
      const existingConnection = await Connection.findOne({
        patient: existingPatient._id,
        provider: providerId
      });
      
      if (existingConnection) {
        if (existingConnection.status === 'approved') {
          return res.status(400).json({ message: 'Patient is already connected' });
        } else if (existingConnection.status === 'pending') {
          return res.status(400).json({ message: 'Connection request is already pending' });
        } else if (existingConnection.status === 'rejected') {
          // Update existing rejected connection to pending
          existingConnection.status = 'pending';
          existingConnection.requestDate = Date.now();
          await existingConnection.save();
          
          // Send email notification
          await sendConnectionRequest(existingPatient, req.user);
          
          return res.status(200).json({ 
            message: 'Connection request sent',
            status: 'pending',
            patientExists: true
          });
        }
      }
      
      // Create new connection
      const newConnection = new Connection({
        patient: existingPatient._id,
        provider: providerId,
        status: 'pending',
        requestDate: Date.now()
      });
      
      await newConnection.save();
      
      // Send email notification
      await sendConnectionRequest(existingPatient, req.user);
      
      return res.status(200).json({ 
        message: 'Connection request sent',
        status: 'pending',
        patientExists: true
      });
    } else {
      // Patient doesn't exist, send invitation
      await sendNewPatientInvitation(email, req.user);
      
      return res.status(200).json({ 
        message: 'Invitation sent to patient email',
        patientExists: false
      });
    }
  } catch (error) {
    console.error('Add new patient error:', error);
    res.status(500).json({ message: 'Server error adding new patient' });
  }
};

/**
 * Get patient details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with patient details
 */
const getPatientDetails = async (req, res) => {
  try {
    const providerId = req.user._id;
    const { patientId } = req.params;
    
    // Check if provider has access to patient
    const connection = await Connection.findOne({
      provider: providerId,
      patient: patientId,
      status: 'approved'
    });
    
    if (!connection) {
      return res.status(403).json({ message: 'You do not have access to this patient' });
    }
    
    // Get patient details
    const patient = await Patient.findById(patientId)
      .select('-password -__v');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Get patient consultations (most recent first)
    const consultations = await Consultation.find({
      patient: patientId,
      isDeleted: false
    })
      .sort({ date: -1 })
      .populate('provider', 'name specialty')
      .limit(10);
    
    // Get record counts by type
    const recordCounts = await MedicalRecord.aggregate([
      { 
        $match: { 
          patient: patient._id,
          isDeleted: false
        } 
      },
      {
        $group: {
          _id: '$recordType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Transform the record counts into a more usable format
    const recordSummary = {};
    recordCounts.forEach(record => {
      recordSummary[record._id] = record.count;
    });
    
    res.status(200).json({
      patient: patient.toObject(),
      consultations,
      recordSummary
    });
  } catch (error) {
    console.error('Get patient details error:', error);
    res.status(500).json({ message: 'Server error fetching patient details' });
  }
};

/**
 * Get patient records by type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with patient records
 */
const getPatientRecordsByType = async (req, res) => {
  try {
    const providerId = req.user._id;
    const { patientId, recordType } = req.params;
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
    
    // Validate record type
    const validRecordTypes = ['vitals', 'medication', 'immunization', 'labResult', 'radiologyReport', 'hospital', 'surgery'];
    if (!validRecordTypes.includes(recordType)) {
      return res.status(400).json({ message: 'Invalid record type' });
    }
    
    // Calculate pagination values
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get patient records of specified type
    const records = await MedicalRecord.find({
      patient: patientId,
      recordType: recordType,
      isDeleted: false
    })
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('provider', 'name specialty');
    
    // Get total count for pagination
    const total = await MedicalRecord.countDocuments({
      patient: patientId,
      recordType: recordType,
      isDeleted: false
    });
    
    res.status(200).json({
      records,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get patient records by type error:', error);
    res.status(500).json({ message: 'Server error fetching patient records' });
  }
};

module.exports = {
  getMyPatients,
  getPendingRequests,
  addNewPatient,
  getPatientDetails,
  getPatientRecordsByType
};