// src/pages/patient/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaFileMedical, 
  FaCalendarAlt, 
  FaPills, 
  FaEllipsisV, 
  FaDownload, 
  FaEye
} from 'react-icons/fa';

import Layout from '../../components/common/Layout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/global.module.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    consultations: [],
    documents: [],
    medications: [],
    connectionCount: 0,
    records: {}
  });
  
  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/patients/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Handle document download
  const handleDocumentDownload = async (documentId) => {
    try {
      const response = await api.get(`/documents/${documentId}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'document.pdf'); // Default name
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <Layout>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading dashboard data...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className={styles.pageHeader}>
        <h1>Welcome, {user?.name || 'Patient'}</h1>
      </div>
      
      {/* Stats Overview */}
      <div className={`${styles.flexContainer} ${styles.mb4}`}>
        <div className={styles.statsCard}>
          <div className={`${styles.statsIcon} ${styles.bgPrimaryLight}`}>
            <FaFileMedical className={styles.textPrimary} />
          </div>
          <div className={styles.statsValue}>
            {Object.values(dashboardData.records).reduce((a, b) => a + b, 0) || 0}
          </div>
          <div className={styles.statsLabel}>Medical Records</div>
        </div>
        
        <div className={styles.statsCard}>
          <div className={`${styles.statsIcon} ${styles.bgInfoLight}`}>
            <FaCalendarAlt className={styles.textInfo} />
          </div>
          <div className={styles.statsValue}>
            {dashboardData.consultations.length || 0}
          </div>
          <div className={styles.statsLabel}>Recent Consultations</div>
        </div>
        
        <div className={styles.statsCard}>
          <div className={`${styles.statsIcon} ${styles.bgWarningLight}`}>
            <FaPills className={styles.textWarning} />
          </div>
          <div className={styles.statsValue}>
            {dashboardData.medications.length || 0}
          </div>
          <div className={styles.statsLabel}>Active Medications</div>
        </div>
      </div>
      
      {/* Recent Consultations */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Recent Consultations</h2>
          <Link to="/patient/consultations" className={styles.btn}>
            View All
          </Link>
        </div>
        <div className={styles.cardBody}>
          {dashboardData.consultations.length > 0 ? (
            <div className={styles.tableResponsive}>
              <table className={`${styles.table} ${styles.tableHover}`}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Specialist</th>
                    <th>Reason for Visit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.consultations.map((consultation) => (
                    <tr key={consultation._id}>
                      <td>{new Date(consultation.date).toLocaleDateString()}</td>
                      <td>{consultation.type}</td>
                      <td>{consultation.specialist}</td>
                      <td>{consultation.reasonForVisit}</td>
                      <td>
                        <div className={styles.dropdown}>
                          <button className={styles.dropdownToggle}>
                            <FaEllipsisV />
                          </button>
                          <div className={styles.dropdownMenu}>
                            <Link 
                              to={`/patient/consultations/${consultation._id}`}
                              className={styles.dropdownItem}
                            >
                              <FaEye className={styles.mr2} /> View
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No recent consultations found.</p>
          )}
        </div>
      </div>
      
      {/* Documents */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Documents</h2>
        </div>
        <div className={styles.cardBody}>
          {dashboardData.documents.length > 0 ? (
            <div className={styles.tableResponsive}>
              <table className={`${styles.table} ${styles.tableHover}`}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Upload Date</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.documents.map((document) => (
                    <tr key={document._id}>
                      <td>{document.originalName}</td>
                      <td>{new Date(document.uploadDate).toLocaleDateString()}</td>
                      <td>{document.mimetype.split('/')[1].toUpperCase()}</td>
                      <td>{Math.round(document.size / 1024)} KB</td>
                      <td>
                        <div className={styles.dropdown}>
                          <button className={styles.dropdownToggle}>
                            <FaEllipsisV />
                          </button>
                          <div className={styles.dropdownMenu}>
                            <button
                              className={styles.dropdownItem}
                              onClick={() => handleDocumentDownload(document._id)}
                            >
                              <FaDownload className={styles.mr2} /> Download
                            </button>
                            <Link 
                              to={`/patient/documents/${document._id}`}
                              className={styles.dropdownItem}
                            >
                              <FaEye className={styles.mr2} /> View
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No documents found.</p>
          )}
        </div>
      </div>
      
      {/* Medications */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Current Medications</h2>
          <Link to="/patient/medical-records/medication" className={styles.btn}>
            View All
          </Link>
        </div>
        <div className={styles.cardBody}>
          {dashboardData.medications.length > 0 ? (
            <div className={styles.tableResponsive}>
              <table className={`${styles.table} ${styles.tableHover}`}>
                <thead>
                  <tr>
                    <th>Medication</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.medications.map((medication) => (
                    <tr key={medication._id}>
                      <td>{medication.name}</td>
                      <td>{medication.dosage?.value} {medication.dosage?.unit}</td>
                      <td>{medication.frequency}</td>
                      <td>{medication.startDate ? new Date(medication.startDate).toLocaleDateString() : 'N/A'}</td>
                      <td>{medication.endDate ? new Date(medication.endDate).toLocaleDateString() : 'Ongoing'}</td>
                      <td>
                        <div className={styles.dropdown}>
                          <button className={styles.dropdownToggle}>
                            <FaEllipsisV />
                          </button>
                          <div className={styles.dropdownMenu}>
                            <Link 
                              to={`/patient/medical-records/medication/${medication._id}`}
                              className={styles.dropdownItem}
                            >
                              <FaEye className={styles.mr2} /> View
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No current medications found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;