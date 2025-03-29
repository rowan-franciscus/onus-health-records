// models/SurgeryRecord.js
const mongoose = require('mongoose');
const MedicalRecord = require('./MedicalRecord');

const surgeryRecordSchema = new mongoose.Schema({
  typeOfSurgery: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  complications: [String],
  recoveryNotes: String,
  surgeon: {
    type: String,
    required: true
  },
  anesthesiologist: String,
  anesthesiaType: String,
  hospitalName: String,
  operatingRoom: String,
  duration: String,
  preOperativeDiagnosis: String,
  postOperativeDiagnosis: String,
  procedureDetails: String,
  surgicalFindings: String,
  implantDetails: String,
  postOperativePlan: String
});

const SurgeryRecord = MedicalRecord.discriminator('surgery', surgeryRecordSchema);

module.exports = SurgeryRecord;