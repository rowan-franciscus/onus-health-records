// models/MedicationRecord.js
const mongoose = require('mongoose');
const MedicalRecord = require('./MedicalRecord');

const medicationRecordSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  dosage: {
    value: String,
    unit: String
  },
  frequency: String,
  reasonForPrescription: String,
  startDate: Date,
  endDate: Date,
  instructions: String,
  sideEffects: [String],
  isActive: {
    type: Boolean,
    default: true
  }
});

const MedicationRecord = MedicalRecord.discriminator('medication', medicationRecordSchema);

module.exports = MedicationRecord;