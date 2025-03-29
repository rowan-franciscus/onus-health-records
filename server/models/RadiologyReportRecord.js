// models/RadiologyReportRecord.js
const mongoose = require('mongoose');
const MedicalRecord = require('./MedicalRecord');

const radiologyReportRecordSchema = new mongoose.Schema({
  typeOfScan: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  bodyPartExamined: {
    type: String,
    required: true
  },
  findings: {
    type: String,
    required: true
  },
  recommendations: String,
  contrastUsed: Boolean,
  radiologist: String,
  facility: String,
  technicalParameters: String,
  clinicalIndication: String,
  comparisonStudies: [String],
  impression: String
});

const RadiologyReportRecord = MedicalRecord.discriminator('radiologyReport', radiologyReportRecordSchema);

module.exports = RadiologyReportRecord;