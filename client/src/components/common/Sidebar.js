// src/components/common/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/global.module.css';
import { 
  FaHome, 
  FaUserMd, 
  FaUser, 
  FaClipboardList, 
  FaFileMedical, 
  FaHeartbeat, 
  FaPills, 
  FaSyringe, 
  FaFlask, 
  FaXRay, 
  FaHospital, 
  FaCut, 
  FaLink, 
  FaCog, 
  FaQuestion,
  FaUsersCog,
  FaTachometerAlt
} from 'react-icons/fa';

const Sidebar = () => {
  const { user } = useAuth();
  
  // Sidebar links based on user role
  const renderLinks = () => {
    if (!user) return null;
    
    switch (user.role) {
      case 'admin':
        return (
          <ul className={styles.menu}>
            <li className={styles.menuItem}>
              <NavLink 
                to="/admin/dashboard" 
                className={({isActive}) => isActive ? `${styles.menuLink} ${styles.active}` : styles.menuLink}
              >
                <FaTachometerAlt className={styles.menuIcon} />
                Dashboard
              </NavLink>
            </li>
            <li className={styles.menuItem}>
              <NavLink 
                to="/admin/providers" 
                className={({isActive}) => isActive ? `${styles.menuLink} ${styles.active}` : styles.menuLink}
              >
                <FaUserMd className={styles.menuIcon} />
                Health Care Providers
              </NavLink>
            </li>
            <li className={styles.menuItem}>
              <NavLink 
                to="/admin/patients" 
                className={({isActive}) => isActive ? `${styles.menuLink} ${styles.active}` : styles.menuLink}
              >
                <FaUser className={styles.menuIcon} />
                Patients
              </NavLink>
            </li>
            <li className={styles.menuItem}>
              <NavLink 
                to="/admin/settings" 
                className={({isActive}) => isActive ? `${styles.menuLink} ${styles.active}` : styles.menuLink}
              >
                <FaCog className={styles.menuIcon} />
                Settings
              </NavLink>
            </li>
            <li className={styles.menuItem}>
              <NavLink 
                to="/admin/help" 
                className={({isActive}) => isActive ? `${styles.menuLink} ${styles.active}` : styles.menuLink}
              >
                <FaQuestion className={styles.menuIcon} />
                Help
              </NavLink>
            </li>
          </ul>
        );
        
      case 'provider':
        return (
          <ul className={styles.menu}>
            <li className={styles.menuItem}>
              <NavLink 
                to="/provider/patients" 
                className={({isActive}) => isActive ? `${styles.menuLink} ${styles.active}` : styles.menuLink}
              >
                <FaUsersCog className={styles.menuIcon} />
                Patients
              </NavLink>
            </li>
            <li className={styles.menuItem}>
              <NavLink 
                to="/provider/medical-records" 
                className={({isActive}) => isActive ? `${styles.menuLink} ${styles.active}` : styles.menuLink}
              >
                <FaFileMedical className={styles.menuIcon} />
                Medical Records
              </NavLink>
            </li>
            <li className={styles.menuItem}>
              <NavLink 
                to="/provider/settings" 
                className={({isActive}) => isActive ? `${styles.menuLink} ${styles.active}` : styles.menuLink}
              >
                <FaCog className={styles.menuIcon} />
                Settings
              </NavLink>
            </li>
            <li className={styles.menuItem}>
              <NavLink 
                to="/provider/help" 
                className={({isActive}) => isActive ? `${styles.menuLink} ${styles.active}` : styles.menuLink}
              >
                <FaQuestion className={styles.menuIcon} />
                Help
              </NavLink>
            </li>
          </ul>
        );
        
      case 'patient':
        return (
          <ul className={styles.menu}>
            <li className={styles.menuItem}>
              <NavLink 
                to="/patient/dashboard" 
                className={({isActive}) => isActive ? `${styles.menuLink} ${styles.active}` : styles.menuLink}
              >
                <FaHome className={styles.menuIcon} />
                Dashboard
              </NavLink>
            </li>
            <li className={styles.menuItem}>
              <NavLink 
                to="/patient/consultations" 
                className={({isActive}) => isActive ? `${styles.menuLink} ${styles.active}` : styles.menuLink}
              >
                <FaClipboardList className={styles.menuIcon} />
                Consultations
              </NavLink>
            </li>
            <li className={styles.menuItem}>
              <NavLink 
                to="/patient/medical-records" 
                className={({isActive}) => isActive ? `${styles.menuLink} ${styles.active}` : styles.menuLink}
              >
                <FaFileMedical className={styles.menuIcon} />
                Medical Records
              </NavLink>
            </li>
            <li className={styles.menuItem}>
              <NavLink 
                to="/patient/medical-records/vitals" 
                className={({isActive}) => isActive ? `${styles.menuLink} ${styles.active}` : styles.menuLink}
              >
                <FaHeartbeat className={styles.menuIcon} />
                Vitals
              </NavLink>
            </li>
            <li className={styles.menuItem}>
              <NavLink 
                to="/patient/medical-records/medication" 
                className={({isActive}) => isActive ? `${styles.menuLink} ${styles.active}` : styles.menuLink}
              >
                <FaPills className={styles.menuIcon} />
                Medications
              </NavLink>
            </li>
            <li className={styles.menuItem}>
              <NavLink 
                to="/patient/medical-records/immunization" 
                className={({isActive}) => isActive ? `${styles.menuLink} ${styles.active}` : styles.menuLink}
              >
                <FaSyringe className={styles.menuIcon} />
                Immunizations
              </NavLink>
            </li>
            <li className={styles.menuItem}>
              <NavLink 
                to="/patient/medical-records/labResult" 
                className={({isActive}) => isActive ? `${styles.menuLink} ${styles.active}` : styles.menuLink}
              >
                <FaFlask className={styles.menuIcon} />
                Lab Results
              </NavLink>
            </li>
            <li className={styles.menuItem}>
              <NavLink 
                to="/patient/medical-records/radiologyReport" 
                className={({isActive}) => isActive ? `${styles.menuLink} ${styles.active}` : styles.menuLink}
              >
                <FaXRay className={styles.menuIcon} />
                Radiology Reports
              </NavLink>
            </li>
            <li className={styles.menuItem}>
              <NavLink 
                to="/patient/medical-records/hospital" 
                className={({isActive}) => isActive ? `${styles.menuLink} ${styles.active}` : styles.menuLink}
              >
                <FaHospital className={styles.menuIcon} />
                Hospital
              </NavLink>
            </li>
            <li className={styles.menuItem}>
              <NavLink 
                to="/patient/medical-records/surgery" 
                className={({isActive}) => isActive ? `${styles.menuLink} ${styles.active}` : styles.menuLink}
              >
                <FaCut className={styles.menuIcon} />
                Surgery
              </NavLink>
            </li>
            <li className={styles.menuItem}>
              <NavLink 
                to="/patient/connections" 
                className={({isActive}) => isActive ? `${styles.menuLink} ${styles.active}` : styles.menuLink}
              >
                <FaLink className={styles.menuIcon} />
                Connections
              </NavLink>
            </li>
            <li className={styles.menuItem}>
              <NavLink 
                to="/patient/settings" 
                className={({isActive}) => isActive ? `${styles.menuLink} ${styles.active}` : styles.menuLink}
              >
                <FaCog className={styles.menuIcon} />
                Settings
              </NavLink>
            </li>
            <li className={styles.menuItem}>
              <NavLink 
                to="/patient/help" 
                className={({isActive}) => isActive ? `${styles.menuLink} ${styles.active}` : styles.menuLink}
              >
                <FaQuestion className={styles.menuIcon} />
                Help
              </NavLink>
            </li>
          </ul>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <img src="/logo.png" alt="Onus Health" />
        <h2>Onus</h2>
      </div>
      {renderLinks()}
    </div>
  );
};

export default Sidebar;