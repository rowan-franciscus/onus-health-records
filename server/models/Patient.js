// models/Patient.js
const mongoose = require('mongoose');
const User = require('./User');

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    unique: true,
    sparse: true
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer not to say']
  },
  phoneNumber: String,
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String
  },
  healthInsurance: {
    provider: String,
    policyNumber: String,
    planName: String
  },
  medicalHistory: {
    chronicConditions: [String],
    surgeries: [String],
    hospitalizations: [String],
    mentalHealthConditions: [String]
  },
  familyHistory: {
    chronicIllnesses: [String],
    hereditaryConditions: [String]
  },
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date
  }],
  allergies: [String],
  lifestyle: {
    smoking: {
      status: Boolean,
      frequency: String
    },
    alcohol: {
      status: Boolean,
      frequency: String
    },
    exercise: {
      type: String,
      frequency: String
    },
    dietaryPreferences: String
  },
  immunizationStatus: [{
    name: String,
    date: Date
  }],
  consentToShareData: {
    type: Boolean,
    default: false
  },
  profileCompleted: {
    type: Boolean,
    default: false
  }
});

// Generate a unique patient ID before saving
patientSchema.pre('save', async function(next) {
  if (!this.patientId) {
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString().slice(-2);
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    
    // Find the last patient ID with the same year and month
    const lastPatient = await this.constructor.findOne({
      patientId: { $regex: `^P${year}${month}` }
    }).sort({ patientId: -1 });
    
    let sequenceNumber = 1;
    if (lastPatient && lastPatient.patientId) {
      const lastSequence = parseInt(lastPatient.patientId.slice(-4));
      if (!isNaN(lastSequence)) {
        sequenceNumber = lastSequence + 1;
      }
    }
    
    this.patientId = `P${year}${month}${sequenceNumber.toString().padStart(4, '0')}`;
  }
  next();
});

const Patient = User.discriminator('patient', patientSchema);

module.exports = Patient;