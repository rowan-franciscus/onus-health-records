// src/components/provider/ConsultationTabs.js
import React, { useState } from 'react';
import { 
  FaClipboardList, 
  FaHeartbeat, 
  FaPills, 
  FaSyringe, 
  FaFlask, 
  FaXRay, 
  FaHospital, 
  FaCut,
  FaSave
} from 'react-icons/fa';

import { 
  Form, 
  FormInput, 
  FormSelect, 
  FormTextarea, 
  FormDate,
  FormFile,
  Button
} from '../common/FormComponents';
import VitalsForm from './medical-forms/VitalsForm';
import MedicationForm from './medical-forms/MedicationForm';
import ImmunizationForm from './medical-forms/ImmunizationForm';
import LabResultForm from './medical-forms/LabResultForm';
import RadiologyForm from './medical-forms/RadiologyForm';
import HospitalForm from './medical-forms/HospitalForm';
import SurgeryForm from './medical-forms/SurgeryForm';
import styles from '../../styles/global.module.css';

const ConsultationTabs = ({ 
  activeTab, 
  onTabChange, 
  consultationFormik,
  patientId,
  onSaveWithRecords
}) => {
  const [recordsData, setRecordsData] = useState({
    vitals: null,
    medication: null,
    immunization: null,
    labResult: null,
    radiologyReport: null,
    hospital: null,
    surgery: null
  });
  
  // Handle tab change
  const handleTabChange = (tab) => {
    onTabChange(tab);
  };
  
  // Handle record form submit
  const handleRecordFormSubmit = (type, data) => {
    // Update records data
    setRecordsData({
      ...recordsData,
      [type]: data
    });
    
    // Show success message or visual indication
    const formSection = document.getElementById(`${type}-form-section`);
    if (formSection) {
      formSection.classList.add(styles.formSaved);
      setTimeout(() => {
        formSection.classList.remove(styles.formSaved);
      }, 1500);
    }
  };
  
  // Handle save all records
  const handleSaveAllRecords = () => {
    // Filter out null records
    const records = Object.entries(recordsData)
      .filter(([_, data]) => data !== null)
      .map(([type, data]) => ({
        recordType: type,
        ...data
      }));
    
    // Call save with records function
    if (records.length > 0) {
      onSaveWithRecords(records);
    } else {
      // If no records, just save the consultation
      consultationFormik.handleSubmit();
    }
  };
  
  return (
    <div className={styles.tabContainer}>
      {/* Tab Navigation */}
      <div className={styles.tabNav}>
        <button
          className={`${styles.tabButton} ${activeTab === 'consultation' ? styles.active : ''}`}
          onClick={() => handleTabChange('consultation')}
        >
          <FaClipboardList className={styles.tabIcon} />
          <span>Consultation</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'vitals' ? styles.active : ''}`}
          onClick={() => handleTabChange('vitals')}
        >
          <FaHeartbeat className={styles.tabIcon} />
          <span>Vitals</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'medication' ? styles.active : ''}`}
          onClick={() => handleTabChange('medication')}
        >
          <FaPills className={styles.tabIcon} />
          <span>Medication</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'immunization' ? styles.active : ''}`}
          onClick={() => handleTabChange('immunization')}
        >
          <FaSyringe className={styles.tabIcon} />
          <span>Immunization</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'labResult' ? styles.active : ''}`}
          onClick={() => handleTabChange('labResult')}
        >
          <FaFlask className={styles.tabIcon} />
          <span>Lab Results</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'radiologyReport' ? styles.active : ''}`}
          onClick={() => handleTabChange('radiologyReport')}
        >
          <FaXRay className={styles.tabIcon} />
          <span>Radiology</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'hospital' ? styles.active : ''}`}
          onClick={() => handleTabChange('hospital')}
        >
          <FaHospital className={styles.tabIcon} />
          <span>Hospital</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'surgery' ? styles.active : ''}`}
          onClick={() => handleTabChange('surgery')}
        >
          <FaCut className={styles.tabIcon} />
          <span>Surgery</span>
        </button>
      </div>
      
      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* Consultation Tab */}
        {activeTab === 'consultation' && (
          <div className={styles.tabPane}>
            <Form onSubmit={consultationFormik.handleSubmit}>
              <div className={styles.formGrid}>
                <FormSelect
                  label="Consultation Type"
                  name="type"
                  options={[
                    { value: 'General', label: 'General Checkup' },
                    { value: 'Specialist', label: 'Specialist Consultation' },
                    { value: 'Follow-up', label: 'Follow-up Visit' },
                    { value: 'Emergency', label: 'Emergency Visit' },
                    { value: 'Telehealth', label: 'Telehealth Consultation' }
                  ]}
                  value={consultationFormik.values.type}
                  onChange={consultationFormik.handleChange}
                  onBlur={consultationFormik.handleBlur}
                  error={consultationFormik.errors.type}
                  touched={consultationFormik.touched.type}
                  required
                />
                
                <FormDate
                  label="Consultation Date"
                  name="date"
                  value={consultationFormik.values.date}
                  onChange={consultationFormik.handleChange}
                  onBlur={consultationFormik.handleBlur}
                  error={consultationFormik.errors.date}
                  touched={consultationFormik.touched.date}
                  required
                />
                
                <FormInput
                  label="Specialist"
                  name="specialist"
                  value={consultationFormik.values.specialist}
                  onChange={consultationFormik.handleChange}
                  onBlur={consultationFormik.handleBlur}
                  error={consultationFormik.errors.specialist}
                  touched={consultationFormik.touched.specialist}
                />
                
                <FormInput
                  label="Clinic/Practice"
                  name="clinic"
                  value={consultationFormik.values.clinic}
                  onChange={consultationFormik.handleChange}
                  onBlur={consultationFormik.handleBlur}
                  error={consultationFormik.errors.clinic}
                  touched={consultationFormik.touched.clinic}
                />
              </div>
              
              <FormInput
                label="Reason for Visit"
                name="reasonForVisit"
                value={consultationFormik.values.reasonForVisit}
                onChange={consultationFormik.handleChange}
                onBlur={consultationFormik.handleBlur}
                error={consultationFormik.errors.reasonForVisit}
                touched={consultationFormik.touched.reasonForVisit}
                required
              />
              
              <FormTextarea
                label="Notes"
                name="notes"
                rows={4}
                value={consultationFormik.values.notes}
                onChange={consultationFormik.handleChange}
                onBlur={consultationFormik.handleBlur}
                error={consultationFormik.errors.notes}
                touched={consultationFormik.touched.notes}
              />
              
              <FormFile
                label="Upload Documents (Optional)"
                name="documents"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  // Handle file upload
                  console.log('File selected:', e.target.files);
                }}
              />
              
              <div className={`${styles.formActions} ${styles.mt4}`}>
                {Object.values(recordsData).some(record => record !== null) && (
                  <Button
                    type="button"
                    variant="success"
                    onClick={handleSaveAllRecords}
                  >
                    <FaSave className={styles.mr2} /> Save Consultation with Records
                  </Button>
                )}
                
                <Button
                  type="submit"
                  variant="primary"
                >
                  Save Consultation Only
                </Button>
              </div>
            </Form>
          </div>
        )}
        
        {/* Vitals Tab */}
        {activeTab === 'vitals' && (
          <div className={styles.tabPane} id="vitals-form-section">
            <VitalsForm
              patientId={patientId}
              onSubmit={(data) => handleRecordFormSubmit('vitals', data)}
            />
          </div>
        )}
        
        {/* Medication Tab */}
        {activeTab === 'medication' && (
          <div className={styles.tabPane} id="medication-form-section">
            <MedicationForm
              patientId={patientId}
              onSubmit={(data) => handleRecordFormSubmit('medication', data)}
            />
          </div>
        )}
        
        {/* Immunization Tab */}
        {activeTab === 'immunization' && (
          <div className={styles.tabPane} id="immunization-form-section">
            <ImmunizationForm
              patientId={patientId}
              onSubmit={(data) => handleRecordFormSubmit('immunization', data)}
            />
          </div>
        )}
        
        {/* Lab Results Tab */}
        {activeTab === 'labResult' && (
          <div className={styles.tabPane} id="labResult-form-section">
            <LabResultForm
              patientId={patientId}
              onSubmit={(data) => handleRecordFormSubmit('labResult', data)}
            />
          </div>
        )}
        
        {/* Radiology Tab */}
        {activeTab === 'radiologyReport' && (
          <div className={styles.tabPane} id="radiologyReport-form-section">
            <RadiologyForm
              patientId={patientId}
              onSubmit={(data) => handleRecordFormSubmit('radiologyReport', data)}
            />
          </div>
        )}
        
        {/* Hospital Tab */}
        {activeTab === 'hospital' && (
          <div className={styles.tabPane} id="hospital-form-section">
            <HospitalForm
              patientId={patientId}
              onSubmit={(data) => handleRecordFormSubmit('hospital', data)}
            />
          </div>
        )}
        
        {/* Surgery Tab */}
        {activeTab === 'surgery' && (
          <div className={styles.tabPane} id="surgery-form-section">
            <SurgeryForm
              patientId={patientId}
              onSubmit={(data) => handleRecordFormSubmit('surgery', data)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationTabs;