// src/pages/patient/MedicalRecords.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaHeartbeat,
  FaPills,
  FaSyringe,
  FaFlask,
  FaXRay,
  FaHospital,
  FaCut,
  FaClipboardCheck
} from 'react-icons/fa';

import Layout from '../../components/common/Layout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/global.module.css';

const MedicalRecords = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recordSummary, setRecordSummary] = useState({});
  
  // Fetch medical records summary on component mount
  useEffect(() => {
    const fetchRecordsSummary = async () => {
      try {
        setLoading(true);
        const response = await api.get('/patients/medical-records');
        setRecordSummary(response.data.recordSummary || {});
      } catch (error) {
        console.error('Error fetching medical records summary:', error);
        toast.error('Failed to load medical records summary');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecordsSummary();
  }, []);
  
  // Record type cards
  const recordTypeCards = [
    {
      type: 'vitals',
      name: 'Vitals',
      icon: <FaHeartbeat size={32} className={styles.textPrimary} />,
      description: 'Heart rate, blood pressure, temperature, and other vital signs',
      count: recordSummary.vitals?.count || 0,
      latestDate: recordSummary.vitals?.latestDate || null
    },
    {
      type: 'medication',
      name: 'Medications',
      icon: <FaPills size={32} className={styles.textWarning} />,
      description: 'Current and past medications',
      count: recordSummary.medication?.count || 0,
      latestDate: recordSummary.medication?.latestDate || null
    },
    {
      type: 'immunization',
      name: 'Immunizations',
      icon: <FaSyringe size={32} className={styles.textSuccess} />,
      description: 'Vaccines, immunizations, and booster shots',
      count: recordSummary.immunization?.count || 0,
      latestDate: recordSummary.immunization?.latestDate || null
    },
    {
      type: 'labResult',
      name: 'Lab Results',
      icon: <FaFlask size={32} className={styles.textDanger} />,
      description: 'Blood tests, urine tests, and other laboratory results',
      count: recordSummary.labResult?.count || 0,
      latestDate: recordSummary.labResult?.latestDate || null
    },
    {
      type: 'radiologyReport',
      name: 'Radiology Reports',
      icon: <FaXRay size={32} className={styles.textInfo} />,
      description: 'X-rays, CT scans, MRIs, and other imaging studies',
      count: recordSummary.radiologyReport?.count || 0,
      latestDate: recordSummary.radiologyReport?.latestDate || null
    },
    {
      type: 'hospital',
      name: 'Hospital Records',
      icon: <FaHospital size={32} className={styles.textPurple} />,
      description: 'Hospital stays, emergency room visits, and inpatient care',
      count: recordSummary.hospital?.count || 0,
      latestDate: recordSummary.hospital?.latestDate || null
    },
    {
      type: 'surgery',
      name: 'Surgery Records',
      icon: <FaCut size={32} className={styles.textDark} />,
      description: 'Surgical procedures and post-operative care',
      count: recordSummary.surgery?.count || 0,
      latestDate: recordSummary.surgery?.latestDate || null
    }
  ];
  
  // Render loading state
  if (loading) {
    return (
      <Layout>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading medical records...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className={styles.pageHeader}>
        <h1>Medical Records</h1>
      </div>
      
      <div className={styles.recordTypesGrid}>
        {recordTypeCards.map((card) => (
          <Link 
            to={`/patient/medical-records/${card.type}`}
            key={card.type}
            className={styles.recordTypeCard}
          >
            <div className={styles.recordTypeIconContainer}>
              {card.icon}
            </div>
            <div className={styles.recordTypeContent}>
              <h3>{card.name}</h3>
              <p>{card.description}</p>
              <div className={styles.recordTypeMeta}>
                <span className={styles.recordCount}>
                  <FaClipboardCheck className={styles.mr1} />{' '}
                  {card.count} {card.count === 1 ? 'Record' : 'Records'}
                </span>
                {card.latestDate && (
                  <span className={styles.recordDate}>
                    Latest: {new Date(card.latestDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>About Your Medical Records</h2>
        </div>
        <div className={styles.cardBody}>
          <p>
            Your medical records are organized by type to make it easier for you to find the information you need. 
            Click on any of the categories above to view your records of that type.
          </p>
          <p>
            You can view your full medical history, download documents, and manage who has access to your records.
            Your health information is secure and only accessible to you and the healthcare providers you authorize.
          </p>
          <p>
            If you have any questions about your medical records, please contact your healthcare provider or our support team.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default MedicalRecords;