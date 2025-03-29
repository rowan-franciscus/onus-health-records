// src/pages/auth/EmailVerification.js
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

import AuthService from '../../services/auth.service';
import { Button } from '../../components/common/FormComponents';
import styles from '../../styles/global.module.css';

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  
  // Verify email on component mount
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!token) {
          setError('Invalid verification link');
          setLoading(false);
          return;
        }
        
        // Call verify email API
        await AuthService.verifyEmail(token);
        
        setVerified(true);
        toast.success('Email verified successfully');
      } catch (error) {
        console.error('Email verification error:', error);
        setError(error.response?.data?.message || 'Failed to verify email');
      } finally {
        setLoading(false);
      }
    };
    
    verifyEmail();
  }, [token]);
  
  // Render loading state
  if (loading) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authFormContainer}>
          <div className={styles.authForm}>
            <div className={styles.logo}>
              <img src="/logo.png" alt="Onus Health" />
              <h2>Onus</h2>
            </div>
            <h2 className={styles.mb3}>Verifying Your Email</h2>
            
            <div className={`${styles.flexContainer} ${styles.center} ${styles.mt4} ${styles.mb4}`}>
              <FaSpinner className={`${styles.spinner} ${styles.textPrimary}`} size={50} />
            </div>
            
            <p className={styles.textCenter}>
              Please wait while we verify your email address...
            </p>
          </div>
        </div>
        
        <div className={styles.authImageContainer}>
          <img src="/images/doctor-illustration.svg" alt="Healthcare Illustration" />
        </div>
      </div>
    );
  }
  
  // Render success state
  if (verified) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authFormContainer}>
          <div className={styles.authForm}>
            <div className={styles.logo}>
              <img src="/logo.png" alt="Onus Health" />
              <h2>Onus</h2>
            </div>
            <h2 className={styles.mb3}>Email Verified Successfully</h2>
            
            <div className={`${styles.flexContainer} ${styles.center} ${styles.mt4} ${styles.mb4}`}>
              <FaCheckCircle className={styles.textSuccess} size={50} />
            </div>
            
            <p className={styles.textCenter}>
              Your email has been verified successfully. You can now sign in to your account.
            </p>
            
            <div className={`${styles.flexContainer} ${styles.center} ${styles.mt4}`}>
              <Button
                variant="primary"
                className={styles.fullWidth}
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
        
        <div className={styles.authImageContainer}>
          <img src="/images/doctor-illustration.svg" alt="Healthcare Illustration" />
        </div>
      </div>
    );
  }
  
  // Render error state
  return (
    <div className={styles.authContainer}>
      <div className={styles.authFormContainer}>
        <div className={styles.authForm}>
          <div className={styles.logo}>
            <img src="/logo.png" alt="Onus Health" />
            <h2>Onus</h2>
          </div>
          <h2 className={styles.mb3}>Email Verification Failed</h2>
          
          <div className={`${styles.flexContainer} ${styles.center} ${styles.mt4} ${styles.mb4}`}>
            <FaTimesCircle className={styles.textDanger} size={50} />
          </div>
          
          <p className={styles.textCenter}>
            {error || 'Failed to verify your email. The verification link may be invalid or expired.'}
          </p>
          
          <div className={`${styles.flexContainer} ${styles.center} ${styles.mt4}`}>
            <Link
              to="/login"
              className={`${styles.btn} ${styles.btnOutlinePrimary} ${styles.mr2}`}
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
};

export default EmailVerification;