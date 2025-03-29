// models/Connection.js
const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'removed'],
    default: 'pending'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  responseDate: Date,
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  accessLevel: {
    type: String,
    enum: ['full', 'limited', 'custom'],
    default: 'full'
  },
  customAccess: {
    vitals: {
      type: Boolean,
      default: true
    },
    medications: {
      type: Boolean,
      default: true
    },
    immunizations: {
      type: Boolean,
      default: true
    },
    labResults: {
      type: Boolean,
      default: true
    },
    radiologyReports: {
      type: Boolean,
      default: true
    },
    hospital: {
      type: Boolean,
      default: true
    },
    surgery: {
      type: Boolean,
      default: true
    }
  },
  notes: String
}, {
  timestamps: true
});

// Ensure uniqueness of patient-provider pairs
connectionSchema.index({ patient: 1, provider: 1 }, { unique: true });

const Connection = mongoose.model('Connection', connectionSchema);

module.exports = Connection;