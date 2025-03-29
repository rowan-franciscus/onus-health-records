// controllers/adminController.js
const { User, Patient, HealthProvider, MedicalRecord, Consultation, Connection } = require('../models');
const { sendProviderVerificationStatus } = require('../utils/emailService');

/**
 * Get dashboard statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get total counts
    const totalPatients = await Patient.countDocuments({ isActive: true });
    const totalProviders = await HealthProvider.countDocuments({ isActive: true });
    const pendingProviderVerifications = await HealthProvider.countDocuments({ 
      verificationStatus: 'pending',
      isActive: true
    });
    const totalRecords = await MedicalRecord.countDocuments({ isDeleted: false });
    const totalConsultations = await Consultation.countDocuments({ isDeleted: false });
    
    // Get active users (users who logged in within the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo },
      isActive: true
    });
    
    // Get new user signups (last 30 days)
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      isActive: true
    });
    
    // Get record type distribution
    const recordTypes = await MedicalRecord.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$recordType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Monthly user growth (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyGrowth = await User.aggregate([
      { 
        $match: { 
          createdAt: { $gte: sixMonthsAgo },
          isActive: true
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' }, 
            month: { $month: '$createdAt' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Transform the monthly data into a more usable format
    const userGrowth = monthlyGrowth.map(item => ({
      year: item._id.year,
      month: item._id.month,
      count: item.count
    }));
    
    res.status(200).json({
      totalPatients,
      totalProviders,
      pendingProviderVerifications,
      totalRecords,
      totalConsultations,
      activeUsers,
      newUsers,
      recordTypes: recordTypes.map(type => ({
        type: type._id,
        count: type.count
      })),
      userGrowth
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard statistics' });
  }
};

/**
 * Get all health providers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with list of providers
 */
const getAllProviders = async (req, res) => {
  try {
    const { status, search, sort, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { role: 'provider', isActive: true };
    
    // Filter by verification status if provided
    if (status) {
      query.verificationStatus = status;
    }
    
    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'practice.name': { $regex: search, $options: 'i' } },
        { specialty: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination values
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Determine sort field and order
    let sortOption = { createdAt: -1 }; // Default sort by newest
    if (sort) {
      const [field, order] = sort.split(':');
      sortOption = { [field]: order === 'asc' ? 1 : -1 };
    }
    
    // Get providers
    const providers = await HealthProvider.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password -__v');
    
    // Get total count for pagination
    const total = await HealthProvider.countDocuments(query);
    
    res.status(200).json({
      providers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all providers error:', error);
    res.status(500).json({ message: 'Server error fetching providers' });
  }
};

/**
 * Get all patients
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with list of patients
 */
const getAllPatients = async (req, res) => {
  try {
    const { search, sort, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { role: 'patient', isActive: true };
    
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
    let sortOption = { createdAt: -1 }; // Default sort by newest
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
      const latestRecord = await MedicalRecord.findOne({ patient: patient._id, isDeleted: false })
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
    console.error('Get all patients error:', error);
    res.status(500).json({ message: 'Server error fetching patients' });
  }
};

/**
 * Get provider verification requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with verification requests
 */
const getProviderVerificationRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Calculate pagination values
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get providers with pending verification
    const pendingProviders = await HealthProvider.find({ 
      verificationStatus: 'pending',
      isActive: true
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password -__v');
    
    // Get total count for pagination
    const total = await HealthProvider.countDocuments({
      verificationStatus: 'pending',
      isActive: true
    });
    
    res.status(200).json({
      providers: pendingProviders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get provider verification requests error:', error);
    res.status(500).json({ message: 'Server error fetching verification requests' });
  }
};

/**
 * Verify or reject provider
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with verification status
 */
const verifyProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { action, reason } = req.body;
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be "approve" or "reject"' });
    }
    
    // Get provider
    const provider = await HealthProvider.findById(providerId);
    
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    
    if (provider.verificationStatus !== 'pending') {
      return res.status(400).json({ message: 'Provider is not pending verification' });
    }
    
    // Update verification status
    provider.verificationStatus = action === 'approve' ? 'approved' : 'rejected';
    
    // Add verification request details
    provider.verificationRequest.dateApproved = Date.now();
    provider.verificationRequest.approvedBy = req.user._id;
    
    if (action === 'reject' && reason) {
      provider.verificationRequest.rejectionReason = reason;
    }
    
    await provider.save();
    
    // Send notification email to provider
    await sendProviderVerificationStatus(
      provider, 
      action === 'approve' ? 'approved' : 'rejected',
      reason
    );
    
    res.status(200).json({
      message: `Provider ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      provider: {
        id: provider._id,
        name: provider.name,
        email: provider.email,
        verificationStatus: provider.verificationStatus
      }
    });
  } catch (error) {
    console.error('Verify provider error:', error);
    res.status(500).json({ message: 'Server error verifying provider' });
  }
};

/**
 * Get provider details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with provider details
 */
const getProviderDetails = async (req, res) => {
  try {
    const { providerId } = req.params;
    
    // Get provider
    const provider = await HealthProvider.findById(providerId)
      .select('-password -__v');
    
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    
    // Get patient count for this provider
    const patientCount = await Connection.countDocuments({
      provider: provider._id,
      status: 'approved'
    });
    
    // Get record count for this provider
    const recordCount = await MedicalRecord.countDocuments({
      provider: provider._id,
      isDeleted: false
    });
    
    res.status(200).json({
      provider: {
        ...provider.toObject(),
        patientCount,
        recordCount
      }
    });
  } catch (error) {
    console.error('Get provider details error:', error);
    res.status(500).json({ message: 'Server error fetching provider details' });
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
    const { patientId } = req.params;
    
    // Get patient
    const patient = await Patient.findById(patientId)
      .select('-password -__v');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Get provider count for this patient
    const providerCount = await Connection.countDocuments({
      patient: patient._id,
      status: 'approved'
    });
    
    // Get record count for this patient
    const recordCount = await MedicalRecord.countDocuments({
      patient: patient._id,
      isDeleted: false
    });
    
    // Get consultation count for this patient
    const consultationCount = await Consultation.countDocuments({
      patient: patient._id,
      isDeleted: false
    });
    
    res.status(200).json({
      patient: {
        ...patient.toObject(),
        providerCount,
        recordCount,
        consultationCount
      }
    });
  } catch (error) {
    console.error('Get patient details error:', error);
    res.status(500).json({ message: 'Server error fetching patient details' });
  }
};

module.exports = {
  getDashboardStats,
  getAllProviders,
  getAllPatients,
  getProviderVerificationRequests,
  verifyProvider,
  getProviderDetails,
  getPatientDetails
};