// src/pages/provider/PatientList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaSearch, 
  FaFilter, 
  FaPlus, 
  FaEllipsisV, 
  FaEye,
  FaNotesMedical
} from 'react-icons/fa';

import Layout from '../../components/common/Layout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button, FormInput } from '../../components/common/FormComponents';
import AddPatientModal from '../../components/provider/AddPatientModal';
import styles from '../../styles/global.module.css';

const PatientList = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  
  // Fetch patients on component mount and when pagination changes
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await api.get('/providers/patients', {
          params: {
            page: pagination.page,
            limit: pagination.limit,
            search: searchTerm
          }
        });
        
        setPatients(response.data.patients);
        setPagination({
          ...pagination,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        });
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatients();
  }, [pagination.page, pagination.limit, searchTerm]);
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Reset to first page when searching
    setPagination({
      ...pagination,
      page: 1
    });
  };
  
  // Handle add patient
  const handleAddPatient = async (email) => {
    try {
      await api.post('/providers/patients', { email });
      toast.success('Patient invitation sent successfully');
      setShowAddPatientModal(false);
      
      // Refresh patient list
      const response = await api.get('/providers/patients', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm
        }
      });
      
      setPatients(response.data.patients);
      setPagination({
        ...pagination,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages
      });
    } catch (error) {
      console.error('Error adding patient:', error);
      toast.error(error.response?.data?.message || 'Failed to add patient');
    }
  };
  
  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination({
        ...pagination,
        page: newPage
      });
    }
  };
  
  // Render loading state
  if (loading && patients.length === 0) {
    return (
      <Layout>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading patients...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className={styles.pageHeader}>
        <h1>My Patients</h1>
        <Button
          variant="primary"
          onClick={() => setShowAddPatientModal(true)}
        >
          <FaPlus className={styles.mr2} /> Add New Patient
        </Button>
      </div>
      
      {/* Search and filter */}
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.searchFilterContainer}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <div className={styles.inputGroup}>
                <FormInput
                  type="text"
                  placeholder="Search by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                <Button
                  type="submit"
                  variant="primary"
                  className={styles.searchButton}
                >
                  <FaSearch />
                </Button>
              </div>
            </form>
            
            <div className={styles.filterDropdown}>
              <Button
                variant="secondary"
                className={styles.filterButton}
              >
                <FaFilter className={styles.mr2} /> Filter
              </Button>
              {/* Filter dropdown content would go here */}
            </div>
          </div>
        </div>
      </div>
      
      {/* Patients list */}
      <div className={styles.card}>
        <div className={styles.cardBody}>
          {patients.length > 0 ? (
            <>
              <div className={styles.tableResponsive}>
                <table className={`${styles.table} ${styles.tableHover}`}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Patient ID</th>
                      <th>Age</th>
                      <th>Last Record</th>
                      <th>Phone Number</th>
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient._id}>
                        <td>{patient.name}</td>
                        <td>{patient.patientId || 'N/A'}</td>
                        <td>
                          {patient.dateOfBirth
                            ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} y/o`
                            : 'N/A'}
                        </td>
                        <td>
                          {patient.lastRecordDate
                            ? new Date(patient.lastRecordDate).toLocaleDateString()
                            : 'No records'}
                        </td>
                        <td>{patient.phoneNumber || 'N/A'}</td>
                        <td>{patient.email}</td>
                        <td>
                          <div className={styles.dropdown}>
                            <button className={styles.dropdownToggle}>
                              <FaEllipsisV />
                            </button>
                            <div className={styles.dropdownMenu}>
                              <Link 
                                to={`/provider/patients/${patient._id}`}
                                className={styles.dropdownItem}
                              >
                                <FaEye className={styles.mr2} /> View Patient
                              </Link>
                              <Link 
                                to={`/provider/patients/${patient._id}/consultation/new`}
                                className={styles.dropdownItem}
                              >
                                <FaNotesMedical className={styles.mr2} /> Add Consultation
                              </Link>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className={styles.pagination}>
                <button
                  className={styles.paginationButton}
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page === 1}
                >
                  First
                </button>
                <button
                  className={styles.paginationButton}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </button>
                <span className={styles.paginationInfo}>
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  className={styles.paginationButton}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </button>
                <button
                  className={styles.paginationButton}
                  onClick={() => handlePageChange(pagination.pages)}
                  disabled={pagination.page === pagination.pages}
                >
                  Last
                </button>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <h3>No patients found</h3>
              <p>You haven't added any patients yet or none match your search criteria.</p>
              <Button
                variant="primary"
                onClick={() => setShowAddPatientModal(true)}
                className={styles.mt3}
              >
                <FaPlus className={styles.mr2} /> Add Your First Patient
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <AddPatientModal
          isOpen={showAddPatientModal}
          onClose={() => setShowAddPatientModal(false)}
          onAddPatient={handleAddPatient}
        />
      )}
    </Layout>
  );
};

export default PatientList;