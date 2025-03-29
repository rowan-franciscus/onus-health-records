// src/components/admin/ProviderDetailsModal.js
import React from 'react';
import { FaTimes, FaUserMd, FaHospital, FaPhone, FaEnvelope, FaCalendarAlt } from 'react-icons/fa';

import { Button } from '../common/FormComponents';
import styles from '../../styles/global.module.css';

const ProviderDetailsModal = ({ isOpen, onClose, provider, onApprove, onReject }) => {
  if (!isOpen || !provider) return null;
  
  return (
    <div className={styles.modalBackdrop}>
      <div className={`${styles.modal} ${styles.modalLarge}`}>
        <div className={styles.modalHeader}>
          <h2>Provider Details</h2>
          <button
            className={styles.modalClose}
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.providerProfileHeader}>
            <div className={styles.providerAvatar}>
              <FaUserMd size={50} />
            </div>
            <div className={styles.providerInfo}>
              <h3>{provider.name}</h3>
              <p className={styles.providerTitle}>{provider.title} {provider.specialty}</p>
              <p className={styles.providerDetails}>
                <FaCalendarAlt className={styles.mr1} /> Joined on {new Date(provider.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className={styles.divider}></div>
          
          <div className={styles.detailSections}>
            {/* Professional Information */}
            <div className={styles.detailSection}>
              <h4>Professional Information</h4>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Full Name:</span>
                  <span className={styles.detailValue}>{provider.name}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Title:</span>
                  <span className={styles.detailValue}>{provider.title || 'Not specified'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Specialty:</span>
                  <span className={styles.detailValue}>{provider.specialty || 'Not specified'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Years of Experience:</span>
                  <span className={styles.detailValue}>{provider.yearsOfExperience || 'Not specified'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Email:</span>
                  <span className={styles.detailValue}>
                    <FaEnvelope className={styles.mr1} /> {provider.email}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Practice Information */}
            <div className={styles.detailSection}>
              <h4>Practice Information</h4>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Practice/Clinic:</span>
                  <span className={styles.detailValue}>
                    <FaHospital className={styles.mr1} /> {provider.practice?.name || 'Not specified'}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Location:</span>
                  <span className={styles.detailValue}>
                    {provider.practice?.location?.address ? (
                      <>
                        {provider.practice.location.address}, 
                        {provider.practice.location.city && ` ${provider.practice.location.city},`}
                        {provider.practice.location.state && ` ${provider.practice.location.state},`}
                        {provider.practice.location.country && ` ${provider.practice.location.country}`}
                      </>
                    ) : (
                      'Not specified'
                    )}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Phone:</span>
                  <span className={styles.detailValue}>
                    <FaPhone className={styles.mr1} /> {provider.practice?.phone || 'Not specified'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Patient Management */}
            <div className={styles.detailSection}>
              <h4>Patient Management</h4>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Average Patients per Week:</span>
                  <span className={styles.detailValue}>
                    {provider.patientManagement?.averagePatientsPerWeek || 'Not specified'}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Collaborates with Specialists:</span>
                  <span className={styles.detailValue}>
                    {provider.patientManagement?.collaboratesWithSpecialists ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.divider}></div>
          
          <div className={styles.termsAgreement}>
            <h4>Terms & Privacy Agreement</h4>
            <div className={styles.agreementStatus}>
              <span className={styles.agreementLabel}>Agreed to Terms of Service:</span>
              <span className={`${styles.agreementValue} ${provider.termsAgreement?.termsAccepted ? styles.textSuccess : styles.textDanger}`}>
                {provider.termsAgreement?.termsAccepted ? 'Yes' : 'No'}
              </span>
            </div>
            <div className={styles.agreementStatus}>
              <span className={styles.agreementLabel}>Acknowledged Patient Confidentiality:</span>
              <span className={`${styles.agreementValue} ${provider.termsAgreement?.confidentialityAcknowledged ? styles.textSuccess : styles.textDanger}`}>
                {provider.termsAgreement?.confidentialityAcknowledged ? 'Yes' : 'No'}
              </span>
            </div>
            {provider.termsAgreement?.dateAccepted && (
              <div className={styles.agreementStatus}>
                <span className={styles.agreementLabel}>Date Accepted:</span>
                <span className={styles.agreementValue}>
                  {new Date(provider.termsAgreement.dateAccepted).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Close
          </Button>
          <div className={styles.actionButtons}>
            <Button
              type="button"
              variant="danger"
              onClick={onReject}
            >
              Reject
            </Button>
            <Button
              type="button"
              variant="success"
              onClick={onApprove}
            >
              Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetailsModal;