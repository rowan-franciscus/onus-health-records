// src/components/common/Navbar.js
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/global.module.css';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Get profile link based on user role
  const getProfileLink = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'admin':
        return '/admin/settings';
      case 'provider':
        return '/provider/profile';
      case 'patient':
        return '/patient/profile';
      default:
        return '/login';
    }
  };
  
  // Get settings link based on user role
  const getSettingsLink = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'admin':
        return '/admin/settings';
      case 'provider':
        return '/provider/settings';
      case 'patient':
        return '/patient/settings';
      default:
        return '/login';
    }
  };
  
  return (
    <div className={styles.header}>
      <div>
        {/* Optional: Add page title or other content here */}
      </div>
      
      <div className={styles.userInfo} ref={dropdownRef}>
        <div 
          className={styles.userDropdown}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className={styles.userAvatar}>
            <img 
              src={user?.profileImage || '/images/defaults/patient-default.png'} 
              alt="Profile" 
              width="40" 
              height="40"
            />
          </div>
          <span>{user?.name || 'Guest'}</span>
          
          {dropdownOpen && (
            <div className={styles.dropdownMenu}>
              <Link 
                to={getProfileLink()} 
                className={styles.dropdownItem}
                onClick={() => setDropdownOpen(false)}
              >
                <FaUser className="mr-2" /> Profile
              </Link>
              <Link 
                to={getSettingsLink()} 
                className={styles.dropdownItem}
                onClick={() => setDropdownOpen(false)}
              >
                <FaCog className="mr-2" /> Settings
              </Link>
              <div className={styles.divider}></div>
              <button 
                className={styles.dropdownItem}
                onClick={() => {
                  logout();
                  setDropdownOpen(false);
                }}
              >
                <FaSignOutAlt className="mr-2" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;