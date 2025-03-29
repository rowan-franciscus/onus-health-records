// models/ImmunizationRecord.js
const mongoose = require('mongoose');
const MedicalRecord = require('./MedicalRecord');

const immunizationRecordSchema = new mongoose.Schema({
  vaccineName: {
    type: String,
    required: true
  },
  dateAdministered: {
    type: Date,
    required: true
  },
  vaccineSerialNumber: String,
  manufacturer: String,
  lotNumber: String,
  expirationDate: Date,
  administeredBy: String,
  administrationSite: String,
  routeOfAdministration: String,
  dosage: String,
  doseNumber: Number,
  isSeries: Boolean,
  sideEffects: [String],
  nextDoseDate: Date
});

const ImmunizationRecord = MedicalRecord.discriminator('immunization', immunizationRecordSchema);

module.exports = ImmunizationRecord;