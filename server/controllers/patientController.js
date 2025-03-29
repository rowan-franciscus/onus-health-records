// controllers/patientController.js
const { User, HealthProvider, Connection, MedicalRecord, Consultation, Document } = require('../models');

/**
 * Get patient dashboard data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with dashboard data
 */
const getDashboardData = async (req, res) => {
  try {
    const patientId = req.user._id;
    
    // Get latest consultations (limit to 5)
    const consultations = await Consultation.find({
      patient: patientId,
      isDeleted: false
    })
      .sort({ date: -1 })
      .limit(5)
      .populate('provider', 'name specialty');
    
    // Get latest documents (limit to 5)
    const documents = await Document.find({
      patient: patientId,
      isDeleted: false
    })
      .sort({ uploadDate: -1 })
      .limit(5);
    
    // Get latest medications (limit to 5)
    const medications = await MedicalRecord.find({
      patient: patientId,
      recordType: 'medication',
      isDeleted: false
    })
      .sort({ date: -1 })
      .limit(5)
      .populate('provider', 'name specialty');
    
    // Get provider connection count
    const connectionCount = await Connection.countDocuments({
      patient: patientId,
      status: 'approved'
    });
    
    // Get record counts
    const recordCounts = await MedicalRecord.aggregate([
      { 
        $match: { 
          patient: patientId,
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
    
    // Transform record counts
    const records = {};
    recordCounts.forEach(item => {
      records[item._id] = item.count;
    });
    
    res.status(200).json({
      consultations,
      documents,
      medications,
      connectionCount,
      records
    });
  } catch (error) {
    console.error('Get patient dashboard data error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
};

/**
 * Get all patient consultations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with consultations list
 */
const getConsultations = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { search, sort, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {
      patient: patientId,
      isDeleted: false
    };
    
    // Search functionality
    if (search) {
      query.$or = [
        { type: { $regex: search, $options: 'i' } },
        { reasonForVisit: { $regex: search, $options: 'i' } },
        { specialist: { $regex: search, $options: 'i' } },
        { clinic: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Set sorting
    let sortOption = { date: -1 }; // Default: newest first
    if (sort) {
      const [field, order] = sort.split(':');
      sortOption = { [field]: order === 'asc' ? 1 : -1 };
    }
    
    // Get consultations
    const consultations = await Consultation.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('provider', 'name specialty');
    
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
    console.error('Get patient consultations error:', error);
    res.status(500).json({ message: 'Server error fetching consultations' });
  }
};

/**
 * Get consultation details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with consultation details
 */
const getConsultationDetails = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { consultationId } = req.params;
    
    // Get consultation
    const consultation = await Consultation.findOne({
      _id: consultationId,
      patient: patientId,
      isDeleted: false
    }).populate('provider', 'name specialty title practice');
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    
    // Get associated records
    const records = await MedicalRecord.find({
      consultation: consultationId,
      isDeleted: false
    }).populate('provider', 'name specialty');
    
    // Get documents
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
    console.error('Get consultation details error:', error);
    res.status(500).json({ message: 'Server error fetching consultation details' });
  }
};

/**
 * Get all patient medical records
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with records summary
 */
const getMedicalRecordsSummary = async (req, res) => {
  try {
    const patientId = req.user._id;
    
    // Get record counts by type
    const recordCounts = await MedicalRecord.aggregate([
      { 
        $match: { 
          patient: patientId,
          isDeleted: false
        } 
      },
      {
        $group: {
          _id: '$recordType',
          count: { $sum: 1 },
          latestDate: { $max: '$date' }
        }
      }
    ]);
    
    // Transform record counts to a more usable format
    const recordSummary = {};
    recordCounts.forEach(record => {
      recordSummary[record._id] = {
        count: record.count,
        latestDate: record.latestDate
      };
    });
    
    res.status(200).json({ recordSummary });
  } catch (error) {
    console.error('Get medical records summary error:', error);
    res.status(500).json({ message: 'Server error fetching medical records summary' });
  }
};

/**
 * Get patient records by type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with records
 */
const getRecordsByType = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { recordType } = req.params;
    const { search, sort, page = 1, limit = 10 } = req.query;
    
    // Validate record type
    const validRecordTypes = ['vitals', 'medication', 'immunization', 'labResult', 'radiologyReport', 'hospital', 'surgery'];
    if (!validRecordTypes.includes(recordType)) {
      return res.status(400).json({ message: 'Invalid record type' });
    }
    
    // Build query
    const query = {
      patient: patientId,
      recordType,
      isDeleted: false
    };
    
    // Add search functionality based on record type
    if (search) {
      if (recordType === 'medication') {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { reasonForPrescription: { $regex: search, $options: 'i' } }
        ];
      } else if (recordType === 'labResult') {
        query.$or = [
          { testName: { $regex: search, $options: 'i' } },
          { results: { $regex: search, $options: 'i' } }
        ];
      }
      // Add more search conditions for other record types as needed
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Set sorting
    let sortOption = { date: -1 }; // Default: newest first
    if (sort) {
      const [field, order] = sort.split(':');
      sortOption = { [field]: order === 'asc' ? 1 : -1 };
    }
    
    // Get records
    const records = await MedicalRecord.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('provider', 'name specialty');
    
    // Get total count for pagination
    const total = await MedicalRecord.countDocuments(query);
    
    res.status(200).json({
      records,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get records by type error:', error);
    res.status(500).json({ message: 'Server error fetching records' });
  }
};

/**
 * Get record details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with record details
 */
const getRecordDetails = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { recordId } = req.params;
    
    // Get record
    const record = await MedicalRecord.findOne({
      _id: recordId,
      patient: patientId,
      isDeleted: false
    }).populate('provider', 'name specialty title practice');
    
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    
    // Get associated consultation if any
    let consultation = null;
    if (record.consultation) {
      consultation = await Consultation.findById(record.consultation)
        .populate('provider', 'name specialty');
    }
    
    // Get documents
    const documents = await Document.find({
      'relatedTo.model': 'MedicalRecord',
      'relatedTo.id': recordId,
      isDeleted: false
    });
    
    res.status(200).json({
      record,
      consultation,
      documents
    });
  } catch (error) {
    console.error('Get record details error:', error);
    res.status(500).json({ message: 'Server error fetching record details' });
  }
};

/**
 * Get patient connections
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with connections
 */
const getConnections = async (req, res) => {
  try {
    const patientId = req.user._id;
    
    // Get approved connections
    const approvedConnections = await Connection.find({
      patient: patientId,
      status: 'approved'
    })
      .populate('provider', 'name specialty title practice profileImage');
    
    // Get pending connections
    const pendingConnections = await Connection.find({
      patient: patientId,
      status: 'pending'
    })
      .populate('provider', 'name specialty title practice profileImage');
    
    res.status(200).json({
      approved: approvedConnections,
      pending: pendingConnections
    });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ message: 'Server error fetching connections' });
  }
};

/**
 * Update connection status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with updated connection
 */
const updateConnectionStatus = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { connectionId } = req.params;
    const { action } = req.body;
    
    if (!['approve', 'reject', 'remove'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be "approve", "reject", or "remove"' });
    }
    
    // Get connection
    const connection = await Connection.findOne({
      _id: connectionId,
      patient: patientId
    }).populate('provider', 'name email');
    
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }
    
    // Update connection status based on action
    if (action === 'approve') {
      if (connection.status !== 'pending') {
        return res.status(400).json({ message: 'Connection is not pending approval' });
      }
      connection.status = 'approved';
    } else if (action === 'reject') {
      if (connection.status !== 'pending') {
        return res.status(400).json({ message: 'Connection is not pending approval' });
      }
      connection.status = 'rejected';
    } else if (action === 'remove') {
      if (connection.status !== 'approved') {
        return res.status(400).json({ message: 'Connection is not currently approved' });
      }
      connection.status = 'removed';
    }
    
    connection.responseDate = Date.now();
    await connection.save();
    
    res.status(200).json({
      message: `Connection ${action}ed successfully`,
      connection
    });
  } catch (error) {
    console.error('Update connection status error:', error);
    res.status(500).json({ message: 'Server error updating connection status' });
  }
};

/**
 * Update record visibility
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with updated record visibility
 */
const updateRecordVisibility = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { recordId } = req.params;
    const { isHidden, hiddenFrom } = req.body;
    
    // Get record
    const record = await MedicalRecord.findOne({
      _id: recordId,
      patient: patientId,
      isDeleted: false
    });
    
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    
    // Update visibility
    if (isHidden !== undefined) {
      record.visibility.isHidden = isHidden;
    }
    
    if (hiddenFrom) {
      // Validate that all provider IDs exist
      for (const providerId of hiddenFrom) {
        const providerExists = await HealthProvider.exists({ _id: providerId });
        if (!providerExists) {
          return res.status(400).json({ message: `Provider with ID ${providerId} not found` });
        }
      }
      
      record.visibility.hiddenFrom = hiddenFrom;
    }
    
    await record.save();
    
    res.status(200).json({
      message: 'Record visibility updated successfully',
      visibility: record.visibility
    });
  } catch (error) {
    console.error('Update record visibility error:', error);
    res.status(500).json({ message: 'Server error updating record visibility' });
  }
};

module.exports = {
  getDashboardData,
  getConsultations,
  getConsultationDetails,
  getMedicalRecordsSummary,
  getRecordsByType,
  getRecordDetails,
  getConnections,
  updateConnectionStatus,
  updateRecordVisibility
};