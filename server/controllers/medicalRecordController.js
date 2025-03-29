// controllers/medicalRecordController.js
const { 
    Patient, 
    Connection, 
    MedicalRecord, 
    VitalsRecord,
    MedicationRecord,
    ImmunizationRecord,
    LabResultRecord,
    RadiologyReportRecord,
    HospitalRecord,
    SurgeryRecord,
    Consultation,
    Document
  } = require('../models');
  const { sendNewMedicalRecordNotification } = require('../utils/emailService');
  const { validationResult } = require('express-validator');
  
  /**
   * Create medical record
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with created record
   */
  const createMedicalRecord = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const providerId = req.user._id;
      const { 
        patientId, 
        recordType, 
        consultationId, 
        date, 
        ...recordData 
      } = req.body;
      
      // Check if provider has access to patient
      const connection = await Connection.findOne({
        provider: providerId,
        patient: patientId,
        status: 'approved'
      });
      
      if (!connection) {
        return res.status(403).json({ message: 'You do not have access to this patient' });
      }
      
      // Validate record type
      const validRecordTypes = ['vitals', 'medication', 'immunization', 'labResult', 'radiologyReport', 'hospital', 'surgery'];
      if (!validRecordTypes.includes(recordType)) {
        return res.status(400).json({ message: 'Invalid record type' });
      }
      
      // Verify consultation if provided
      if (consultationId) {
        const consultation = await Consultation.findOne({
          _id: consultationId,
          provider: providerId,
          patient: patientId,
          isDeleted: false
        });
        
        if (!consultation) {
          return res.status(404).json({ message: 'Consultation not found or you do not have access' });
        }
      }
      
      // Create the appropriate record based on type
      let record;
      
      const commonFields = {
        patient: patientId,
        provider: providerId,
        consultation: consultationId || null,
        date: date ? new Date(date) : new Date(),
        recordType
      };
      
      switch (recordType) {
        case 'vitals':
          record = new VitalsRecord({
            ...commonFields,
            heartRate: recordData.heartRate,
            bloodPressure: recordData.bloodPressure,
            bodyTemperature: recordData.bodyTemperature,
            bloodGlucose: recordData.bloodGlucose,
            bloodOxygenSaturation: recordData.bloodOxygenSaturation,
            respiratoryRate: recordData.respiratoryRate,
            weight: recordData.weight,
            height: recordData.height,
            bmi: recordData.bmi,
            bodyFatPercentage: recordData.bodyFatPercentage,
            notes: recordData.notes
          });
          break;
          
        case 'medication':
          record = new MedicationRecord({
            ...commonFields,
            name: recordData.name,
            dosage: recordData.dosage,
            frequency: recordData.frequency,
            reasonForPrescription: recordData.reasonForPrescription,
            startDate: recordData.startDate ? new Date(recordData.startDate) : null,
            endDate: recordData.endDate ? new Date(recordData.endDate) : null,
            instructions: recordData.instructions,
            sideEffects: recordData.sideEffects,
            isActive: recordData.isActive,
            notes: recordData.notes
          });
          break;
          
        case 'immunization':
          record = new ImmunizationRecord({
            ...commonFields,
            vaccineName: recordData.vaccineName,
            dateAdministered: recordData.dateAdministered ? new Date(recordData.dateAdministered) : new Date(),
            vaccineSerialNumber: recordData.vaccineSerialNumber,
            manufacturer: recordData.manufacturer,
            lotNumber: recordData.lotNumber,
            expirationDate: recordData.expirationDate ? new Date(recordData.expirationDate) : null,
            administeredBy: recordData.administeredBy,
            administrationSite: recordData.administrationSite,
            routeOfAdministration: recordData.routeOfAdministration,
            dosage: recordData.dosage,
            doseNumber: recordData.doseNumber,
            isSeries: recordData.isSeries,
            sideEffects: recordData.sideEffects,
            nextDoseDate: recordData.nextDoseDate ? new Date(recordData.nextDoseDate) : null,
            notes: recordData.notes
          });
          break;
          
        case 'labResult':
          record = new LabResultRecord({
            ...commonFields,
            testName: recordData.testName,
            dateOfTest: recordData.dateOfTest ? new Date(recordData.dateOfTest) : new Date(),
            results: recordData.results,
            unitsOfMeasurement: recordData.unitsOfMeasurement,
            referenceRange: recordData.referenceRange,
            interpretation: recordData.interpretation,
            comments: recordData.comments,
            diagnosisRelatedToResults: recordData.diagnosisRelatedToResults,
            laboratory: recordData.laboratory,
            labTechnician: recordData.labTechnician,
            specimenType: recordData.specimenType,
            specimenCollectionDate: recordData.specimenCollectionDate ? new Date(recordData.specimenCollectionDate) : null,
            isAbnormal: recordData.isAbnormal,
            notes: recordData.notes
          });
          break;
          
        case 'radiologyReport':
          record = new RadiologyReportRecord({
            ...commonFields,
            typeOfScan: recordData.typeOfScan,
            date: recordData.date ? new Date(recordData.date) : new Date(),
            bodyPartExamined: recordData.bodyPartExamined,
            findings: recordData.findings,
            recommendations: recordData.recommendations,
            contrastUsed: recordData.contrastUsed,
            radiologist: recordData.radiologist,
            facility: recordData.facility,
            technicalParameters: recordData.technicalParameters,
            clinicalIndication: recordData.clinicalIndication,
            comparisonStudies: recordData.comparisonStudies,
            impression: recordData.impression,
            notes: recordData.notes
          });
          break;
          
        case 'hospital':
          record = new HospitalRecord({
            ...commonFields,
            admissionDate: recordData.admissionDate ? new Date(recordData.admissionDate) : new Date(),
            dischargeDate: recordData.dischargeDate ? new Date(recordData.dischargeDate) : null,
            reasonForHospitalization: recordData.reasonForHospitalization,
            treatmentsReceived: recordData.treatmentsReceived,
            hospitalName: recordData.hospitalName,
            attendingDoctorName: recordData.attendingDoctorName,
            dischargeSummary: recordData.dischargeSummary,
            investigationsDone: recordData.investigationsDone,
            hospitalDepartment: recordData.hospitalDepartment,
            roomNumber: recordData.roomNumber,
            admissionType: recordData.admissionType,
            dischargeStatus: recordData.dischargeStatus,
            followUpInstructions: recordData.followUpInstructions,
            notes: recordData.notes
          });
          break;
          
        case 'surgery':
          record = new SurgeryRecord({
            ...commonFields,
            typeOfSurgery: recordData.typeOfSurgery,
            date: recordData.date ? new Date(recordData.date) : new Date(),
            reason: recordData.reason,
            complications: recordData.complications,
            recoveryNotes: recordData.recoveryNotes,
            surgeon: recordData.surgeon,
            anesthesiologist: recordData.anesthesiologist,
            anesthesiaType: recordData.anesthesiaType,
            hospitalName: recordData.hospitalName,
            operatingRoom: recordData.operatingRoom,
            duration: recordData.duration,
            preOperativeDiagnosis: recordData.preOperativeDiagnosis,
            postOperativeDiagnosis: recordData.postOperativeDiagnosis,
            procedureDetails: recordData.procedureDetails,
            surgicalFindings: recordData.surgicalFindings,
            implantDetails: recordData.implantDetails,
            postOperativePlan: recordData.postOperativePlan,
            notes: recordData.notes
          });
          break;
      }
      
      // Save the record
      await record.save();
      
      // If this is part of a consultation, update the consultation
      if (consultationId) {
        await Consultation.findByIdAndUpdate(consultationId, {
          $push: { medicalRecords: record._id }
        });
      }
      
      // Notify patient about new record
      const patient = await Patient.findById(patientId);
      if (patient) {
        await sendNewMedicalRecordNotification(patient, req.user, recordType);
      }
      
      res.status(201).json({
        message: 'Medical record created successfully',
        record
      });
    } catch (error) {
      console.error('Create medical record error:', error);
      res.status(500).json({ message: 'Server error creating medical record' });
    }
  };
  
  /**
   * Create medical records in bulk (for consultations with multiple record types)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with created records and consultation
   */
  const createBulkRecords = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const providerId = req.user._id;
      const { 
        patientId, 
        consultationData,
        records
      } = req.body;
      
      // Check if provider has access to patient
      const connection = await Connection.findOne({
        provider: providerId,
        patient: patientId,
        status: 'approved'
      });
      
      if (!connection) {
        return res.status(403).json({ message: 'You do not have access to this patient' });
      }
      
      // Check if records array is valid
      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ message: 'Records array is required and must not be empty' });
      }
      
      // Create consultation first
      const consultation = new Consultation({
        patient: patientId,
        provider: providerId,
        date: consultationData.date ? new Date(consultationData.date) : new Date(),
        type: consultationData.type,
        specialist: consultationData.specialist || req.user.name,
        clinic: consultationData.clinic,
        reasonForVisit: consultationData.reasonForVisit,
        symptoms: consultationData.symptoms,
        diagnosis: consultationData.diagnosis,
        recommendations: consultationData.recommendations,
        followUp: consultationData.followUp,
        notes: consultationData.notes,
        status: consultationData.status || 'completed'
      });
      
      await consultation.save();
      
      // Create each record
      const createdRecords = [];
      
      for (const recordData of records) {
        const { recordType, ...data } = recordData;
        
        // Validate record type
        const validRecordTypes = ['vitals', 'medication', 'immunization', 'labResult', 'radiologyReport', 'hospital', 'surgery'];
        if (!validRecordTypes.includes(recordType)) {
          continue; // Skip invalid record types
        }
        
        // Common fields for all records
        const commonFields = {
          patient: patientId,
          provider: providerId,
          consultation: consultation._id,
          date: data.date ? new Date(data.date) : consultation.date,
          recordType
        };
        
        // Create the record based on type
        let record;
        
        switch (recordType) {
          case 'vitals':
            record = new VitalsRecord({
              ...commonFields,
              ...data
            });
            break;
          case 'medication':
            record = new MedicationRecord({
              ...commonFields,
              ...data
            });
            break;
          case 'immunization':
            record = new ImmunizationRecord({
              ...commonFields,
              ...data
            });
            break;
          case 'labResult':
            record = new LabResultRecord({
              ...commonFields,
              ...data
            });
            break;
          case 'radiologyReport':
            record = new RadiologyReportRecord({
              ...commonFields,
              ...data
            });
            break;
          case 'hospital':
            record = new HospitalRecord({
              ...commonFields,
              ...data
            });
            break;
          case 'surgery':
            record = new SurgeryRecord({
              ...commonFields,
              ...data
            });
            break;
        }
        
        if (record) {
          await record.save();
          createdRecords.push(record);
          
          // Add record to consultation's medicalRecords array
          consultation.medicalRecords.push(record._id);
        }
      }
      
      // Save the updated consultation with medicalRecords
      await consultation.save();
      
      // Notify patient about new consultation with records
      const patient = await Patient.findById(patientId);
      if (patient) {
        await sendNewMedicalRecordNotification(patient, req.user, 'consultation');
      }
      
      res.status(201).json({
        message: 'Consultation and medical records created successfully',
        consultation,
        records: createdRecords
      });
    } catch (error) {
      console.error('Create bulk records error:', error);
      res.status(500).json({ message: 'Server error creating bulk records' });
    }
  };
  
  /**
   * Get medical record by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with record details
   */
  const getMedicalRecord = async (req, res) => {
    try {
      const userId = req.user._id;
      const userRole = req.user.role;
      const { recordId } = req.params;
      
      // Get the record
      const record = await MedicalRecord.findOne({
        _id: recordId,
        isDeleted: false
      }).populate('provider', 'name specialty title');
      
      if (!record) {
        return res.status(404).json({ message: 'Medical record not found' });
      }
      
      // Check permissions
      if (userRole === 'patient') {
        // If patient, check that the record belongs to them
        if (record.patient.toString() !== userId.toString()) {
          return res.status(403).json({ message: 'You do not have access to this record' });
        }
      } else if (userRole === 'provider') {
        // If provider, check connection to patient
        if (record.provider.toString() !== userId.toString()) {
          const connection = await Connection.findOne({
            provider: userId,
            patient: record.patient,
            status: 'approved'
          });
          
          if (!connection) {
            return res.status(403).json({ message: 'You do not have access to this patient' });
          }
          
          // Check if record is hidden from this provider
          if (record.visibility.isHidden && 
              record.visibility.hiddenFrom.some(id => id.toString() === userId.toString())) {
            return res.status(403).json({ message: 'This record is hidden by the patient' });
          }
        }
      }
      
      // Get related documents
      const documents = await Document.find({
        'relatedTo.model': 'MedicalRecord',
        'relatedTo.id': recordId,
        isDeleted: false
      });
      
      // Get consultation if any
      let consultation = null;
      if (record.consultation) {
        consultation = await Consultation.findById(record.consultation)
          .populate('provider', 'name specialty');
      }
      
      res.status(200).json({
        record,
        documents,
        consultation
      });
    } catch (error) {
      console.error('Get medical record error:', error);
      res.status(500).json({ message: 'Server error fetching medical record' });
    }
  };
  
  /**
   * Update medical record
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with updated record
   */
  const updateMedicalRecord = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const providerId = req.user._id;
      const { recordId } = req.params;
      const updateData = req.body;
      
      // Get the record
      const record = await MedicalRecord.findById(recordId);
      
      if (!record) {
        return res.status(404).json({ message: 'Medical record not found' });
      }
      
      // Check if provider created the record
      if (record.provider.toString() !== providerId.toString()) {
        return res.status(403).json({ message: 'You can only edit records you created' });
      }
      
      // Check if record is deleted
      if (record.isDeleted) {
        return res.status(400).json({ message: 'Cannot update a deleted record' });
      }
      
      // Update record fields based on record type
      for (const [key, value] of Object.entries(updateData)) {
        // Skip immutable fields
        if (['_id', 'patient', 'provider', 'recordType', 'isDeleted', '__v'].includes(key)) {
          continue;
        }
        
        // Handle date fields
        if (['date', 'startDate', 'endDate', 'dateAdministered', 'dateOfTest', 
             'specimenCollectionDate', 'admissionDate', 'dischargeDate'].includes(key) && value) {
          record[key] = new Date(value);
        } else {
          record[key] = value;
        }
      }
      
      await record.save();
      
      res.status(200).json({
        message: 'Medical record updated successfully',
        record
      });
    } catch (error) {
      console.error('Update medical record error:', error);
      res.status(500).json({ message: 'Server error updating medical record' });
    }
  };
  
  /**
   * Delete medical record (soft delete)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with deletion status
   */
  const deleteMedicalRecord = async (req, res) => {
    try {
      const providerId = req.user._id;
      const { recordId } = req.params;
      
      // Get the record
      const record = await MedicalRecord.findById(recordId);
      
      if (!record) {
        return res.status(404).json({ message: 'Medical record not found' });
      }
      
      // Check if provider created the record
      if (record.provider.toString() !== providerId.toString()) {
        return res.status(403).json({ message: 'You can only delete records you created' });
      }
      
      // Check if record is already deleted
      if (record.isDeleted) {
        return res.status(400).json({ message: 'Record is already deleted' });
      }
      
      // Soft delete the record
      record.isDeleted = true;
      await record.save();
      
      // If record is part of a consultation, update the consultation's medicalRecords array
      if (record.consultation) {
        await Consultation.findByIdAndUpdate(record.consultation, {
          $pull: { medicalRecords: recordId }
        });
      }
      
      res.status(200).json({ message: 'Medical record deleted successfully' });
    } catch (error) {
      console.error('Delete medical record error:', error);
      res.status(500).json({ message: 'Server error deleting medical record' });
    }
  };
  
  module.exports = {
    createMedicalRecord,
    createBulkRecords,
    getMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord
  };