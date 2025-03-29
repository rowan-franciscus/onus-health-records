// src/components/provider/AddPatientModal.js
import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaTimes } from 'react-icons/fa';

import { Form, FormInput, Button } from '../common/FormComponents';
import styles from '../../styles/global.module.css';

const AddPatientModal = ({ isOpen, onClose, onAddPatient }) => {
  const [loading, setLoading] = useState(false);
  
  // Form validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required')
  });
  
  // Initialize formik
  const formik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        await onAddPatient(values.email);
      } catch (error) {
        console.error('Error adding patient:', error);
      } finally {
        setLoading(false);
      }
    }
  });
  
  if (!isOpen) return null;
  
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Add New Patient</h2>
          <button
            className={styles.modalClose}
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <p className={styles.mb3}>
            Enter the patient's email address to send them an invitation to connect.
          </p>
          
          <Form onSubmit={formik.handleSubmit}>
            <FormInput
              label="Patient Email"
              name="email"
              type="email"
              placeholder="Enter patient's email address"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.email}
              touched={formik.touched.email}
              required
            />
            
            <div className={styles.modalFooter}>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddPatientModal;