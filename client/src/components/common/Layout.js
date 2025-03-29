// src/components/common/Layout.js
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import styles from '../../styles/global.module.css';

const Layout = ({ children }) => {
  const [idleTime, setIdleTime] = useState(0);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const sessionTimeoutLimit = 30 * 60 * 1000; // 30 minutes
  const warningTime = 29 * 60 * 1000; // 29 minutes
  
  // Reset idle time on user activity
  const resetIdleTime = () => {
    setIdleTime(0);
    if (showTimeoutWarning) {
      setShowTimeoutWarning(false);
    }
  };
  
  // Track user activity
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetIdleTime);
    });
    
    // Increment idle time every minute
    const idleInterval = setInterval(() => {
      setIdleTime(prevIdleTime => {
        const newIdleTime = prevIdleTime + 60000; // Add 1 minute
        
        // Show warning when approaching timeout
        if (newIdleTime >= warningTime && !showTimeoutWarning) {
          setShowTimeoutWarning(true);
        }
        
        return newIdleTime;
      });
    }, 60000);
    
    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTime);
      });
      clearInterval(idleInterval);
    };
  }, [showTimeoutWarning]);
  
  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <Navbar />
        <main>
          {children}
        </main>
        
        {/* Session timeout warning */}
        {showTimeoutWarning && (
          <div className={styles.timeoutWarning}>
            <div className={styles.timeoutWarningContent}>
              <h3>Session Timeout Warning</h3>
              <p>Your session will expire soon due to inactivity.</p>
              <button 
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={resetIdleTime}
              >
                Continue Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;