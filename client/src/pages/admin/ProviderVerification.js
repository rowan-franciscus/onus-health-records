// src/pages/admin/ProviderVerification.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaUserMd, 
  FaCheck, 
  FaTimes, 
  FaEye, 
  FaSearch,
  FaExclamationTriangle
} from 'react-icons/fa';

import Layout from '../../components/common/Layout';
import api from '../../services/api';
import { Button, FormInput } from '../../components/common/FormComponents';
import ProviderDetailsModal from '../../components/admin/ProviderDetailsModal';
import ConfirmActionModal from '../../components/common/ConfirmActionModal';
import styles from '../../styles/global.module.css';

const ProviderVerification = () => {
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ type: '', providerId: '' });
  const [rejectionReason, setRejectionReason] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  
  // Fetch provider verification requests on component mount and when pagination changes
  useEffect(() => {
    const fetchVerificationRequests = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/verification-requests', {
          params: {
            page: pagination.page,
            limit: pagination.limit
          }
        });
        
        setProviders(response.data.providers);
        setPagination({
          ...pagination,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        });
      } catch (error) {
        console.error('Error fetching verification requests:', error);
        toast.error('Failed to load verification requests');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVerificationRequests();
  }, [pagination.page, pagination.limit]);
  
  // Handle provider verification
  const handleVerify = async (providerId, approved) => {
    try {
      setLoading(true);
      
      const data = {
        action: approved ? 'approve' : 'reject',
        reason: approved ? '' : rejectionReason
      };
      
      await api.put(`/admin/providers/${providerId}/verify`, data);
      
      // Show success message
      toast.success(`Provider ${approved ? 'approved' : 'rejected'} successfully`);
      
      // Close confirm modal if open
      setShowConfirmModal(false);
      
      // Refresh the provider list
      const response = await api.get('/admin/verification-requests', {
        params: {
          page: pagination.page,
          limit: pagination.limit
        }
      });
      
      setProviders(response.data.providers);
      setPagination({
        ...pagination,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages
      });
    } catch (error) {
      console.error('Error verifying provider:', error);
      toast.error(error.response?.data?.message || 'Failed to verify provider');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle view provider details
  const handleViewDetails = (provider) => {
    setSelectedProvider(provider);
    setShowDetailsModal(true);
  };
  
  // Handle initiating approve/reject actions
  const handleInitiateAction = (type, providerId) => {
    setConfirmAction({ type, providerId });
    setShowConfirmModal(true);
  };
  
  // Handle confirm action
  const handleConfirmAction = () => {
    if (confirmAction.type === 'approve') {
      handleVerify(confirmAction.providerId, true);
    } else if (confirmAction.type === 'reject') {
      handleVerify(confirmAction.providerId, false);
    }
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Would implement search functionality here
    toast.info('Search functionality would be implemented here');
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
  if (loading && providers.length === 0) {
    return (
      <Layout>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading verification requests...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className={styles.pageHeader}>
        <h1>Provider Verification Requests</h1>
      </div>
      
      {/* Search */}
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.inputGroup}>
              <FormInput
                type="text"
                placeholder="Search by name, email, or specialty..."
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
        </div>
      </div>
      
      {/* Verification requests list */}
      <div className={styles.card}>
        <div className={styles.cardBody}>
          {providers.length > 0 ? (
            <>
              <div className={styles.tableResponsive}>
                <table className={`${styles.table} ${styles.tableHover}`}>
                  <thead>
                    <tr>
                      <th>Date Requested</th>
                      <th>Name</th>
                      <th>Specialty</th>
                      <th>Practice / Clinic</th>
                      <th>Location</th>
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers.map((provider) => (
                      <tr key={provider._id}>
                        <td>{new Date(provider.verificationRequest?.dateRequested || provider.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className={styles.userInfo}>
                            <div className={styles.userAvatar}>
                              <FaUserMd />
                            </div>
                            <span>{provider.name}</span>
                          </div>
                        </td>
                        <td>{provider.specialty || 'Not specified'}</td>
                        <td>{provider.practice?.name || 'Not specified'}</td>
                        <td>{provider.practice?.location?.city || 'Not specified'}</td>
                        <td>{provider.email}</td>
                        <td>
                          <div className={styles.actionsContainer}>
                            <Button
                              variant="secondary"
                              className={styles.actionButton}
                              onClick={() => handleViewDetails(provider)}
                            >
                              <FaEye />
                            </Button>
                            <Button
                              variant="success"
                              className={styles.actionButton}
                              onClick={() => handleInitiateAction('approve', provider._id)}
                            >
                              <FaCheck />
                            </Button>
                            <Button
                              variant="danger"
                              className={styles.actionButton}
                              onClick={() => handleInitiateAction('reject', provider._id)}
                            >
                              <FaTimes />
                            </Button>
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
              <FaExclamationTriangle size={48} className={styles.textWarning} />
              <h3>No pending verification requests</h3>
              <p>There are no healthcare providers waiting for verification.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Provider Details Modal */}
      {showDetailsModal && selectedProvider && (
        <ProviderDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          provider={selectedProvider}
          onApprove={() => {
            setShowDetailsModal(false);
            handleInitiateAction('approve', selectedProvider._id);
          }}
          onReject={() => {
            setShowDetailsModal(false);
            handleInitiateAction('reject', selectedProvider._id);
          }}
        />
      )}
      
      {/* Confirm Action Modal */}
      {showConfirmModal && (
        <ConfirmActionModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmAction}
          title={confirmAction.type === 'approve' ? 'Approve Provider' : 'Reject Provider'}
          message={
            confirmAction.type === 'approve'
              ? 'Are you sure you want to approve this healthcare provider? They will be able to access the platform and connect with patients.'
              : 'Are you sure you want to reject this healthcare provider? Please provide a reason for rejection.'
          }
          confirmButtonText={confirmAction.type === 'approve' ? 'Approve' : 'Reject'}
          confirmButtonVariant={confirmAction.type === 'approve' ? 'success' : 'danger'}
          showReasonInput={confirmAction.type === 'reject'}
          reasonValue={rejectionReason}
          onReasonChange={(e) => setRejectionReason(e.target.value)}
        />
      )}
    </Layout>
  );
};

export default ProviderVerification;