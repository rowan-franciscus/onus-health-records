// src/components/common/ConfirmActionModal.js
import React from 'react';
import { FaTimes } from 'react-icons/fa';

import { Button, FormTextarea } from './FormComponents';
import styles from '../../styles/global.module.css';

const ConfirmActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  confirmButtonVariant = 'primary',
  showReasonInput = false,
  reasonLabel = 'Reason',
  reasonValue = '',
  onReasonChange,
  reasonPlaceholder = 'Please provide a reason...',
  reasonRequired = false
}) => {
  if (!isOpen) return null;
  
  const handleConfirm = () => {
    if (showReasonInput && reasonRequired && !reasonValue.trim()) {
      // If reason is required but not provided, don't proceed
      return;
    }
    
    onConfirm();
  };
  
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button
            className={styles.modalClose}
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <p className={styles.mb3}>{message}</p>
          
          {showReasonInput && (
            <FormTextarea
              label={reasonLabel}
              name="reason"
              value={reasonValue}
              onChange={onReasonChange}
              placeholder={reasonPlaceholder}
              rows={4}
              required={reasonRequired}
            />
          )}
        </div>
        
        <div className={styles.modalFooter}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            {cancelButtonText}
          </Button>
          <Button
            type="button"
            variant={confirmButtonVariant}
            onClick={handleConfirm}
            disabled={showReasonInput && reasonRequired && !reasonValue.trim()}
          >
            {confirmButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;