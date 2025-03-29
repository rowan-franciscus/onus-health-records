// src/pages/auth/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaGoogle, FaFacebook } from 'react-icons/fa';

import { useAuth } from '../../context/AuthContext';
import AuthService from '../../services/auth.service';
import { Form, FormInput, Button, FormCheckbox } from '../../components/common/FormComponents';
import styles from '../../styles/global.module.css';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('patient'); // Default to patient
  
  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .min(2, 'Name is too short')
      .max(50, 'Name is too long'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: Yup.string()
      .required('Please confirm your password')
      .oneOf([Yup.ref('password'), null], 'Passwords must match'),
    termsAccepted: Yup.boolean()
      .required('You must accept the terms and conditions')
      .oneOf([true], 'You must accept the terms and conditions')
  });
  
  // Initialize formik
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        
        // Prepare registration data
        const userData = {
          name: values.name,
          email: values.email,
          password: values.password,
          role: userType
        };
        
        // Call register function from auth context
        await register(userData);
        navigate('/verification-sent', { state: { email: values.email } });
        toast.success('Registration successful. Please check your email to verify your account.');
      } catch (error) {
        console.error('Registration error:', error);
        toast.error(error.response?.data?.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    }
  });
  
  // Handle OAuth registration
  const handleOAuthRegister = async (provider) => {
    try {
      // Set registration type in session
      await AuthService.setRegistrationType(userType);
      
      // Redirect to OAuth provider
      if (provider === 'google') {
        window.location.href = AuthService.getGoogleAuthUrl(userType);
      } else if (provider === 'facebook') {
        window.location.href = AuthService.getFacebookAuthUrl(userType);
      }
    } catch (error) {
      console.error(`${provider} registration error:`, error);
      toast.error(`${provider} registration failed`);
    }
  };
  
  return (
    <div className={styles.authContainer}>
      <div className={styles.authFormContainer}>
        <div className={styles.authForm}>
          <div className={styles.logo}>
            <img src="/logo.png" alt="Onus Health" />
            <h2>Onus</h2>
          </div>
          <h2 className={styles.mb3}>Create an Account</h2>
          
          {/* User type selection */}
          <div className={styles.userTypeSelector}>
            <p>Sign up as Patient or Health Provider:</p>
            <div className={`${styles.flexContainer} ${styles.mt2}`}>
              <button
                type="button"
                className={`${styles.btn} ${userType === 'patient' ? styles.btnPrimary : styles.btnSecondary}`}
                onClick={() => setUserType('patient')}
              >
                Patient
              </button>
              <button
                type="button"
                className={`${styles.btn} ${userType === 'provider' ? styles.btnPrimary : styles.btnSecondary}`}
                onClick={() => setUserType('provider')}
              >
                Health Provider
              </button>
            </div>
          </div>
          
          {/* OAuth buttons */}
          <div className={`${styles.flexContainer} ${styles.mt4}`}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGoogle}`}
              onClick={() => handleOAuthRegister('google')}
            >
              <FaGoogle className={styles.mr2} />
              Google
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnFacebook}`}
              onClick={() => handleOAuthRegister('facebook')}
            >
              <FaFacebook className={styles.mr2} />
              Facebook
            </button>
          </div>
          
          <div className={styles.authDivider}>
            <span>or continue with email</span>
          </div>
          
          {/* Registration form */}
          <Form onSubmit={formik.handleSubmit}>
            <FormInput
              label="Full Name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.name}
              touched={formik.touched.name}
              required
            />
            
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
            
            <FormInput
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.password}
              touched={formik.touched.password}
              required
            />
            
            <FormInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.confirmPassword}
              touched={formik.touched.confirmPassword}
              required
            />
            
            <FormCheckbox
              name="termsAccepted"
              label={
                <span>
                  I agree to the{' '}
                  <Link to="/terms" target="_blank">Terms of Service</Link>{' '}
                  and{' '}
                  <Link to="/privacy" target="_blank">Privacy Policy</Link>
                </span>
              }
              checked={formik.values.termsAccepted}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.termsAccepted}
              touched={formik.touched.termsAccepted}
            />
            
            <Button
              type="submit"
              variant="primary"
              className={`${styles.mt4} ${styles.fullWidth}`}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
            
            <div className={`${styles.flexContainer} ${styles.center} ${styles.mt3}`}>
              <p>
                Already have an account?{' '}
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

export default Register;