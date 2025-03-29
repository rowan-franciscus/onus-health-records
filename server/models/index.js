// models/index.js
const User = require('./User');
const Patient = require('./Patient');
const HealthProvider = require('./HealthProvider');
const MedicalRecord = require('./MedicalRecord');
const VitalsRecord = require('./VitalsRecord');
const MedicationRecord = require('./MedicationRecord');
const ImmunizationRecord = require('./ImmunizationRecord');
const LabResultRecord = require('./LabResultRecord');
const RadiologyReportRecord = require('./RadiologyReportRecord');
const HospitalRecord = require('./HospitalRecord');
const SurgeryRecord = require('./SurgeryRecord');
const Consultation = require('./Consultation');
const Connection = require('./Connection');
const Document = require('./Document');

module.exports = {
  User,
  Patient,
  HealthProvider,
  MedicalRecord,
  VitalsRecord,
  MedicationRecord,
  ImmunizationRecord,
  LabResultRecord,
  RadiologyReportRecord,
  HospitalRecord,
  SurgeryRecord,
  Consultation,
  Connection,
  Document
};