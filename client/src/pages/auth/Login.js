// src/pages/auth/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaGoogle, FaFacebook } from 'react-icons/fa';

import { useAuth } from '../../context/AuthContext';
import AuthService from '../../services/auth.service';
import { Form, FormInput, Button } from '../../components/common/FormComponents';
import styles from '../../styles/global.module.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('patient'); // Default to patient
  
  // Form validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
  });
  
  // Initialize formik
  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        
        // Add user type to values
        const loginData = {
          ...values,
          role: userType
        };
        
        // Call login function from auth context
        await login(loginData);
        toast.success('Login successful');
      } catch (error) {
        console.error('Login error:', error);
        toast.error(error.response?.data?.message || 'Login failed');
      } finally {
        setLoading(false);
      }
    }
  });
  
  // Handle OAuth login
  const handleOAuthLogin = async (provider) => {
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
      console.error(`${provider} login error:`, error);
      toast.error(`${provider} login failed`);
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
          <h2 className={styles.mb3}>Sign in to your Account</h2>
          
          {/* User type selection */}
          <div className={styles.userTypeSelector}>
            <p>Sign in as Patient or Health Provider:</p>
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
              onClick={() => handleOAuthLogin('google')}
            >
              <FaGoogle className={styles.mr2} />
              Google
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnFacebook}`}
              onClick={() => handleOAuthLogin('facebook')}
            >
              <FaFacebook className={styles.mr2} />
              Facebook
            </button>
          </div>
          
          <div className={styles.authDivider}>
            <span>or continue with email</span>
          </div>
          
          {/* Login form */}
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
            
            <div className={`${styles.flexContainer} ${styles.spaceBetween} ${styles.mt3}`}>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              className={`${styles.mt4} ${styles.fullWidth}`}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <div className={`${styles.flexContainer} ${styles.center} ${styles.mt3}`}>
              <p>
                Don't have an account?{' '}
                <Link to="/register">Create an account</Link>
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

export default Login;