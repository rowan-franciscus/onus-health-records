// models/HospitalRecord.js
const mongoose = require('mongoose');
const MedicalRecord = require('./MedicalRecord');

const hospitalRecordSchema = new mongoose.Schema({
  admissionDate: {
    type: Date,
    required: true
  },
  dischargeDate: Date,
  reasonForHospitalization: {
    type: String,
    required: true
  },
  treatmentsReceived: [String],
  hospitalName: {
    type: String,
    required: true
  },
  attendingDoctorName: {
    type: String,
    required: true
  },
  dischargeSummary: String,
  investigationsDone: [String],
  hospitalDepartment: String,
  roomNumber: String,
  admissionType: {
    type: String,
    enum: ['emergency', 'planned', 'transfer'],
    default: 'planned'
  },
  dischargeStatus: String,
  followUpInstructions: String
});

const HospitalRecord = MedicalRecord.discriminator('hospital', hospitalRecordSchema);

module.exports = HospitalRecord;