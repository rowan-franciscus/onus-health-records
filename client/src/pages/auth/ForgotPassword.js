// src/pages/auth/ForgotPassword.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

import AuthService from '../../services/auth.service';
import { Form, FormInput, Button } from '../../components/common/FormComponents';
import styles from '../../styles/global.module.css';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
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
        
        // Send password reset request
        await AuthService.forgotPassword(values.email);
        
        // Set email sent state
        setEmailSent(true);
        toast.success('Password reset instructions sent to your email');
      } catch (error) {
        console.error('Forgot password error:', error);
        toast.error(error.response?.data?.message || 'Failed to send password reset email');
      } finally {
        setLoading(false);
      }
    }
  });
  
  // Render success message if email sent
  if (emailSent) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authFormContainer}>
          <div className={styles.authForm}>
            <div className={styles.logo}>
              <img src="/logo.png" alt="Onus Health" />
              <h2>Onus</h2>
            </div>
            <h2 className={styles.mb3}>Check Your Email</h2>
            
            <div className={styles.successMessage}>
              <p>
                We've sent a password reset link to <strong>{formik.values.email}</strong>.
              </p>
              <p className={styles.mt3}>
                Please check your email and follow the instructions to reset your password.
              </p>
              <p className={styles.mt3}>
                If you don't receive the email within a few minutes, please check your spam folder.
              </p>
            </div>
            
            <div className={`${styles.flexContainer} ${styles.center} ${styles.mt4}`}>
              <Link
                to="/login"
                className={`${styles.btn} ${styles.btnOutlinePrimary}`}
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
        
        <div className={styles.authImageContainer}>
          <img src="/images/doctor-illustration.svg" alt="Healthcare Illustration" />
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.authContainer}>
      <div className={styles.authFormContainer}>
        <div className={styles.authForm}>
          <div className={styles.logo}>
            <img src="/logo.png" alt="Onus Health" />
            <h2>Onus</h2>
          </div>
          <h2 className={styles.mb3}>Reset Your Password</h2>
          <p className={styles.mb4}>
            Enter your email address and we'll send you instructions to reset your password.
          </p>
          
          {/* Forgot password form */}
          <Form onSubmit={formik.handleSubmit}>
            <FormInput
              label="Email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.email}
              touched={formik.touched.email}
              required
            />
            
            <Button
              type="submit"
              variant="primary"
              className={`${styles.mt4} ${styles.fullWidth}`}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            
            <div className={`${styles.flexContainer} ${styles.center} ${styles.mt3}`}>
              <p>
                Remember your password?{' '}
                <Link to="/login">Sign in</Link>
              </p>
            </div>
          </Form>
        </div>
      </div>
      
      <div className={styles.authImageContainer}>
        <img src="/images/doctor-illustration.svg" alt="Healthcare Illustration" />
      </div>
    </div>
  );
};

export default ForgotPassword;