// src/pages/provider/ConsultationCreate.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { 
  FaSave,
  FaArrowLeft,
  FaFileMedical
} from 'react-icons/fa';

import Layout from '../../components/common/Layout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Form, 
  FormInput, 
  FormSelect, 
  FormTextarea, 
  FormDate,
  FormFile,
  Button
} from '../../components/common/FormComponents';
import ConsultationTabs from '../../components/provider/ConsultationTabs';
import styles from '../../styles/global.module.css';

const ConsultationCreate = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('consultation');
  
  // Fetch patient details on component mount
  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/providers/patients/${patientId}`);
        setPatient(response.data.patient);
      } catch (error) {
        console.error('Error fetching patient details:', error);
        toast.error('Failed to load patient details');
        navigate('/provider/patients');
      } finally {
        setLoading(false);
      }
    };
    
    if (patientId) {
      fetchPatientDetails();
    }
  }, [patientId, navigate]);
  
  // Consultation type options
  const consultationTypeOptions = [
    { value: 'General', label: 'General Checkup' },
    { value: 'Specialist', label: 'Specialist Consultation' },
    { value: 'Follow-up', label: 'Follow-up Visit' },
    { value: 'Emergency', label: 'Emergency Visit' },
    { value: 'Telehealth', label: 'Telehealth Consultation' }
  ];
  
  // Form validation schema for consultation
  const consultationValidationSchema = Yup.object({
    type: Yup.string().required('Consultation type is required'),
    date: Yup.date().required('Consultation date is required'),
    reasonForVisit: Yup.string().required('Reason for visit is required'),
    specialist: Yup.string(),
    clinic: Yup.string(),
    notes: Yup.string()
  });
  
  // Initialize formik for consultation
  const consultationFormik = useFormik({
    initialValues: {
      type: '',
      date: new Date().toISOString().split('T')[0],
      reasonForVisit: '',
      specialist: user?.name || '',
      clinic: user?.practice?.name || '',
      notes: ''
    },
    validationSchema: consultationValidationSchema,
    onSubmit: handleSaveConsultation
  });
  
  // Function to save consultation
  async function handleSaveConsultation(values) {
    try {
      setSaving(true);
      
      // If active tab is not consultation, switch to it
      if (activeTab !== 'consultation') {
        setActiveTab('consultation');
      }
      
      // Prepare consultation data
      const consultationData = {
        patientId,
        ...values
      };
      
      // Call API to create consultation
      const response = await api.post('/providers/consultations', consultationData);
      
      toast.success('Consultation created successfully');
      
      // Navigate to patient details page
      navigate(`/provider/patients/${patientId}`);
    } catch (error) {
      console.error('Error saving consultation:', error);
      toast.error(error.response?.data?.message || 'Failed to save consultation');
    } finally {
      setSaving(false);
    }
  }
  
  // Function to save consultation with medical records
  const handleSaveWithRecords = async (recordsData) => {
    try {
      setSaving(true);
      
      // Prepare bulk data
      const bulkData = {
        patientId,
        consultationData: consultationFormik.values,
        records: recordsData
      };
      
      // Call API to create consultation with medical records
      const response = await api.post('/providers/medical-records/bulk', bulkData);
      
      toast.success('Consultation and medical records created successfully');
      
      // Navigate to patient details page
      navigate(`/provider/patients/${patientId}`);
    } catch (error) {
      console.error('Error saving consultation with records:', error);
      toast.error(error.response?.data?.message || 'Failed to save consultation with records');
    } finally {
      setSaving(false);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <Layout>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading patient details...</p>
        </div>
      </Layout>
    );
  }
  
  // If patient not found
  if (!patient) {
    return (
      <Layout>
        <div className={styles.errorContainer}>
          <h2>Patient Not Found</h2>
          <p>The patient you are looking for does not exist or you don't have access.</p>
          <Button
            variant="primary"
            onClick={() => navigate('/provider/patients')}
          >
            <FaArrowLeft className={styles.mr2} /> Back to Patients
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className={styles.pageHeader}>
        <div className={styles.breadcrumbs}>
          <button
            className={styles.backButton}
            onClick={() => navigate(`/provider/patients/${patientId}`)}
          >
            <FaArrowLeft className={styles.mr1} /> Back to Patient
          </button>
        </div>
        <h1>New Consultation</h1>
      </div>
      
      {/* Patient Info */}
      <div className={styles.patientInfoCard}>
        <div className={styles.patientAvatar}>
          <img
            src={patient.profileImage || '/images/defaults/patient-default.png'}
            alt={patient.name}
          />
        </div>
        <div className={styles.patientDetails}>
          <h2>{patient.name}</h2>
          <div className={styles.patientMeta}>
            <span className={styles.patientMetaItem}>
              <strong>ID:</strong> {patient.patientId || 'N/A'}
            </span>
            <span className={styles.patientMetaItem}>
              <strong>Gender:</strong> {patient.gender || 'N/A'}
            </span>
            <span className={styles.patientMetaItem}>
              <strong>Age:</strong> {patient.dateOfBirth ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} y/o` : 'N/A'}
            </span>
            <span className={styles.patientMetaItem}>
              <strong>Insurance:</strong> {patient.healthInsurance?.provider || 'N/A'}
            </span>
          </div>
        </div>
        <div className={styles.patientActions}>
          <Button
            variant="primary"
            onClick={() => consultationFormik.handleSubmit()}
            disabled={saving}
          >
            <FaSave className={styles.mr2} /> {saving ? 'Saving...' : 'Save Consultation'}
          </Button>
        </div>
      </div>
      
      {/* Consultation Form */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Consultation Details</h2>
        </div>
        <div className={styles.cardBody}>
          <ConsultationTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            consultationFormik={consultationFormik}
            patientId={patientId}
            onSaveWithRecords={handleSaveWithRecords}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ConsultationCreate;