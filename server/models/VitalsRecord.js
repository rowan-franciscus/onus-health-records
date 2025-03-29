// models/VitalsRecord.js
const mongoose = require('mongoose');
const MedicalRecord = require('./MedicalRecord');

const vitalsRecordSchema = new mongoose.Schema({
  heartRate: {
    value: Number,
    unit: {
      type: String,
      default: 'bpm'
    }
  },
  bloodPressure: {
    systolic: Number,
    diastolic: Number,
    unit: {
      type: String,
      default: 'mmHg'
    }
  },
  bodyTemperature: {
    value: Number,
    unit: {
      type: String,
      enum: ['°C', '°F'],
      default: '°C'
    }
  },
  bloodGlucose: {
    value: Number,
    unit: {
      type: String,
      default: 'mg/dL'
    },
    measurementType: {
      type: String,
      enum: ['fasting', 'random', 'postprandial', 'other'],
      default: 'random'
    }
  },
  bloodOxygenSaturation: {
    value: Number,
    unit: {
      type: String,
      default: '%'
    }
  },
  respiratoryRate: {
    value: Number,
    unit: {
      type: String,
      default: 'breaths/min'
    }
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'lb'],
      default: 'kg'
    }
  },
  height: {
    value: Number,
    unit: {
      type: String,
      enum: ['cm', 'in'],
      default: 'cm'
    }
  },
  bmi: Number,
  bodyFatPercentage: Number
});

const VitalsRecord = MedicalRecord.discriminator('vitals', vitalsRecordSchema);

module.exports = VitalsRecord;