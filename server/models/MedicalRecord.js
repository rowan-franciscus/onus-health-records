// models/MedicalRecord.js
const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
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
  consultation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation'
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  recordType: {
    type: String,
    enum: ['vitals', 'medication', 'immunization', 'labResult', 'radiologyReport', 'dental', 'hospital', 'surgery'],
    required: true
  },
  notes: String,
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  visibility: {
    isHidden: {
      type: Boolean,
      default: false
    },
    hiddenFrom: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  discriminatorKey: 'recordType'
});

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = MedicalRecord;