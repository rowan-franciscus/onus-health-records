// src/pages/auth/ResetPassword.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

import AuthService from '../../services/auth.service';
import { Form, FormInput, Button } from '../../components/common/FormComponents';
import styles from '../../styles/global.module.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [token, setToken] = useState('');
  
  // Extract token from URL query params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast.error('Invalid or missing reset token');
      navigate('/forgot-password');
    }
  }, [location, navigate]);
  
  // Form validation schema
  const validationSchema = Yup.object({
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: Yup.string()
      .required('Please confirm your password')
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
  });
  
  // Initialize formik
  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        
        // Prepare reset data
        const resetData = {
          token,
          password: values.password
        };
        
        // Call reset password API
        await AuthService.resetPassword(resetData);
        
        // Set success state
        setResetSuccess(true);
        toast.success('Password reset successful');
      } catch (error) {
        console.error('Reset password error:', error);
        toast.error(error.response?.data?.message || 'Failed to reset password');
      } finally {
        setLoading(false);
      }
    }
  });
  
  // Render success message if password reset successful
  if (resetSuccess) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authFormContainer}>
          <div className={styles.authForm}>
            <div className={styles.logo}>
              <img src="/logo.png" alt="Onus Health" />
              <h2>Onus</h2>
            </div>
            <h2 className={styles.mb3}>Password Reset Successful</h2>
            
            <div className={styles.successMessage}>
              <p>
                Your password has been reset successfully.
              </p>
              <p className={styles.mt3}>
                You can now sign in with your new password.
              </p>
            </div>
            
            <div className={`${styles.flexContainer} ${styles.center} ${styles.mt4}`}>
              <Link
                to="/login"
                className={`${styles.btn} ${styles.btnPrimary}`}
              >
                Sign In
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
          <h2 className={styles.mb3}>Create New Password</h2>
          <p className={styles.mb4}>
            Enter your new password below.
          </p>
          
          {/* Reset password form */}
          <Form onSubmit={formik.handleSubmit}>
            <FormInput
              label="New Password"
              name="password"
              type="password"
              placeholder="Enter your new password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.password}
              touched={formik.touched.password}
              required
            />
            
            <FormInput
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.confirmPassword}
              touched={formik.touched.confirmPassword}
              required
            />
            
            <Button
              type="submit"
              variant="primary"
              className={`${styles.mt4} ${styles.fullWidth}`}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;