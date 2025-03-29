// models/HealthProvider.js
const mongoose = require('mongoose');
const User = require('./User');

const healthProviderSchema = new mongoose.Schema({
  providerId: {
    type: String,
    unique: true,
    sparse: true
  },
  title: String,
  specialty: String,
  practiceLicense: String,
  yearsOfExperience: Number,
  practice: {
    name: String,
    location: {
      address: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    phone: String,
    email: String
  },
  patientManagement: {
    averagePatientsPerWeek: Number,
    collaboratesWithSpecialists: Boolean
  },
  dataAccessPreferences: {
    criticalInformation: [String],
    requiresHistoricalData: Boolean
  },
  dataPrivacy: {
    practiceRequirements: String
  },
  technicalPreferences: {
    supportPreference: String,
    requiresTraining: Boolean
  },
  communicationPreferences: String,
  termsAgreement: {
    termsAccepted: Boolean,
    confidentialityAcknowledged: Boolean,
    dateAccepted: Date
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  verificationRequest: {
    dateRequested: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dateApproved: Date,
    rejectionReason: String
  },
  profileCompleted: {
    type: Boolean,
    default: false
  }
});

// Generate a unique provider ID before saving
healthProviderSchema.pre('save', async function(next) {
  if (!this.providerId) {
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString().slice(-2);
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    
    // Find the last provider ID with the same year and month
    const lastProvider = await this.constructor.findOne({
      providerId: { $regex: `^HP${year}${month}` }
    }).sort({ providerId: -1 });
    
    let sequenceNumber = 1;
    if (lastProvider && lastProvider.providerId) {
      const lastSequence = parseInt(lastProvider.providerId.slice(-4));
      if (!isNaN(lastSequence)) {
        sequenceNumber = lastSequence + 1;
      }
    }
    
    this.providerId = `HP${year}${month}${sequenceNumber.toString().padStart(4, '0')}`;
  }
  next();
});

const HealthProvider = User.discriminator('provider', healthProviderSchema);

module.exports = HealthProvider;