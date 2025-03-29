// src/pages/admin/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaUserMd, 
  FaUser, 
  FaCheckCircle, 
  FaClipboardList, 
  FaFileAlt,
  FaChartBar,
  FaUsers
} from 'react-icons/fa';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

import Layout from '../../components/common/Layout';
import api from '../../services/api';
import styles from '../../styles/global.module.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalProviders: 0,
    pendingProviderVerifications: 0,
    totalRecords: 0,
    totalConsultations: 0,
    activeUsers: 0,
    newUsers: 0,
    recordTypes: [],
    userGrowth: []
  });
  
  // Fetch dashboard statistics on component mount
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, []);
  
  // Prepare chart data for user growth
  const userGrowthData = {
    labels: stats.userGrowth?.map(item => `${item.month}/${item.year}`) || [],
    datasets: [
      {
        label: 'New Users',
        data: stats.userGrowth?.map(item => item.count) || [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };
  
  // Prepare chart data for record types
  const recordTypesData = {
    labels: stats.recordTypes?.map(item => {
      // Format label to be more readable
      const label = item.type.replace(/([A-Z])/g, ' $1');
      return label.charAt(0).toUpperCase() + label.slice(1);
    }) || [],
    datasets: [
      {
        label: 'Record Types',
        data: stats.recordTypes?.map(item => item.count) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 255, 0.6)',
          'rgba(54, 162, 64, 0.6)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Render loading state
  if (loading) {
    return (
      <Layout>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading dashboard statistics...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className={styles.pageHeader}>
        <h1>Admin Dashboard</h1>
        <div>
          <span className={styles.dateRange}>
            Data as of {new Date().toLocaleDateString()}
          </span>
          <button className={`${styles.btn} ${styles.btnOutlinePrimary} ${styles.ml2}`}>
            Refresh
          </button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className={`${styles.statsGrid} ${styles.mb4}`}>
        <div className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statsValue}>{stats.totalPatients}</div>
            <div className={styles.statsLabel}>Total Patients</div>
          </div>
          <div className={`${styles.statsIcon} ${styles.bgPrimaryLight}`}>
            <FaUser className={styles.textPrimary} />
          </div>
        </div>
        
        <div className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statsValue}>{stats.totalProviders}</div>
            <div className={styles.statsLabel}>Total Providers</div>
          </div>
          <div className={`${styles.statsIcon} ${styles.bgSuccessLight}`}>
            <FaUserMd className={styles.textSuccess} />
          </div>
        </div>
        
        <div className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statsValue}>{stats.pendingProviderVerifications}</div>
            <div className={styles.statsLabel}>Pending Verifications</div>
          </div>
          <div className={`${styles.statsIcon} ${styles.bgWarningLight}`}>
            <FaCheckCircle className={styles.textWarning} />
          </div>
        </div>
        
        <div className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statsValue}>{stats.activeUsers}</div>
            <div className={styles.statsLabel}>Active Users</div>
          </div>
          <div className={`${styles.statsIcon} ${styles.bgInfoLight}`}>
            <FaUsers className={styles.textInfo} />
          </div>
        </div>
        
        <div className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statsValue}>{stats.totalRecords}</div>
            <div className={styles.statsLabel}>Health Records</div>
          </div>
          <div className={`${styles.statsIcon} ${styles.bgDangerLight}`}>
            <FaFileAlt className={styles.textDanger} />
          </div>
        </div>
        
        <div className={styles.statsCard}>
          <div className={styles.statsContent}>
            <div className={styles.statsValue}>{stats.totalConsultations}</div>
            <div className={styles.statsLabel}>Consultations</div>
          </div>
          <div className={`${styles.statsIcon} ${styles.bgPurpleLight}`}>
            <FaClipboardList className={styles.textPurple} />
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className={styles.chartRow}>
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h2>User Growth</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
              <Line 
                data={userGrowthData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'New User Registrations (Last 6 Months)'
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
        
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h2>Record Types Distribution</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
              <Pie 
                data={recordTypesData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                    title: {
                      display: true,
                      text: 'Record Types Distribution'
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Links */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Quick Actions</h2>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.quickLinks}>
            <Link to="/admin/verification-requests" className={styles.quickLink}>
              <FaCheckCircle className={styles.quickLinkIcon} />
              <span>Verify Providers</span>
              {stats.pendingProviderVerifications > 0 && (
                <span className={styles.badge}>{stats.pendingProviderVerifications}</span>
              )}
            </Link>
            
            <Link to="/admin/providers" className={styles.quickLink}>
              <FaUserMd className={styles.quickLinkIcon} />
              <span>Manage Providers</span>
            </Link>
            
            <Link to="/admin/patients" className={styles.quickLink}>
              <FaUser className={styles.quickLinkIcon} />
              <span>Manage Patients</span>
            </Link>
            
            <Link to="/admin/reports" className={styles.quickLink}>
              <FaChartBar className={styles.quickLinkIcon} />
              <span>Analytics</span>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;