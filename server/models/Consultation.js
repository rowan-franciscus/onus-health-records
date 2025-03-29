// models/Consultation.js
const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  specialist: String,
  clinic: String,
  reasonForVisit: {
    type: String,
    required: true
  },
  symptoms: [String],
  diagnosis: String,
  recommendations: String,
  followUp: {
    recommended: Boolean,
    date: Date,
    instructions: String
  },
  prescriptions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  }],
  medicalRecords: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  }],
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  notes: String,
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled', 'no-show'],
    default: 'completed'
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Consultation = mongoose.model('Consultation', consultationSchema);

module.exports = Consultation;