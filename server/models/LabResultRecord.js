// models/LabResultRecord.js
const mongoose = require('mongoose');
const MedicalRecord = require('./MedicalRecord');

const labResultRecordSchema = new mongoose.Schema({
  testName: {
    type: String,
    required: true
  },
  dateOfTest: {
    type: Date,
    required: true
  },
  results: {
    type: String,
    required: true
  },
  unitsOfMeasurement: String,
  referenceRange: String,
  interpretation: String,
  comments: String,
  diagnosisRelatedToResults: String,
  laboratory: String,
  labTechnician: String,
  specimenType: String,
  specimenCollectionDate: Date,
  isAbnormal: Boolean
});

const LabResultRecord = MedicalRecord.discriminator('labResult', labResultRecordSchema);

module.exports = LabResultRecord;