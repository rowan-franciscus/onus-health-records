// src/components/common/FormComponents.js
import React from 'react';
import styles from '../../styles/global.module.css';

/**
 * Input field component
 */
export const FormInput = ({ 
  label, 
  name, 
  type = 'text', 
  placeholder = '', 
  value, 
  onChange, 
  onBlur, 
  error, 
  touched, 
  required = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`${styles.formGroup} ${className}`}>
      {label && (
        <label htmlFor={name} className={styles.formLabel}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`${styles.formControl} ${error && touched ? styles.isInvalid : ''}`}
        disabled={disabled}
        {...props}
      />
      {error && touched && <div className={styles.invalidFeedback}>{error}</div>}
    </div>
  );
};

/**
 * Textarea field component
 */
export const FormTextarea = ({ 
  label, 
  name, 
  placeholder = '', 
  value, 
  onChange, 
  onBlur, 
  error, 
  touched, 
  required = false,
  disabled = false,
  rows = 3,
  className = '',
  ...props 
}) => {
  return (
    <div className={`${styles.formGroup} ${className}`}>
      {label && (
        <label htmlFor={name} className={styles.formLabel}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`${styles.formControl} ${error && touched ? styles.isInvalid : ''}`}
        disabled={disabled}
        rows={rows}
        {...props}
      />
      {error && touched && <div className={styles.invalidFeedback}>{error}</div>}
    </div>
  );
};

/**
 * Select field component
 */
export const FormSelect = ({ 
  label, 
  name, 
  options, 
  value, 
  onChange, 
  onBlur, 
  error, 
  touched, 
  required = false,
  disabled = false,
  className = '',
  placeholder = 'Select an option',
  ...props 
}) => {
  return (
    <div className={`${styles.formGroup} ${className}`}>
      {label && (
        <label htmlFor={name} className={styles.formLabel}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`${styles.formControl} ${error && touched ? styles.isInvalid : ''}`}
        disabled={disabled}
        {...props}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && touched && <div className={styles.invalidFeedback}>{error}</div>}
    </div>
  );
};

/**
 * Checkbox field component
 */
export const FormCheckbox = ({ 
  label, 
  name, 
  checked, 
  onChange, 
  onBlur, 
  error, 
  touched, 
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`${styles.formCheck} ${className}`}>
      <input
        id={name}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        onBlur={onBlur}
        className={styles.formCheckInput}
        disabled={disabled}
        {...props}
      />
      <label htmlFor={name} className={styles.formCheckLabel}>
        {label}
      </label>
      {error && touched && <div className={styles.invalidFeedback}>{error}</div>}
    </div>
  );
};

/**
 * Radio button component
 */
export const FormRadio = ({ 
  label, 
  name, 
  value, 
  checked, 
  onChange, 
  onBlur, 
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`${styles.formCheck} ${className}`}>
      <input
        id={`${name}-${value}`}
        name={name}
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
        onBlur={onBlur}
        className={styles.formCheckInput}
        disabled={disabled}
        {...props}
      />
      <label htmlFor={`${name}-${value}`} className={styles.formCheckLabel}>
        {label}
      </label>
    </div>
  );
};

/**
 * Radio group component
 */
export const FormRadioGroup = ({ 
  label, 
  name, 
  options, 
  value, 
  onChange, 
  onBlur, 
  error, 
  touched, 
  required = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`${styles.formGroup} ${className}`}>
      {label && (
        <label className={styles.formLabel}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.formRadioGroup}>
        {options.map((option) => (
          <FormRadio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            checked={value === option.value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            {...props}
          />
        ))}
      </div>
      {error && touched && <div className={styles.invalidFeedback}>{error}</div>}
    </div>
  );
};

/**
 * File input component
 */
export const FormFile = ({ 
  label, 
  name, 
  onChange, 
  onBlur, 
  error, 
  touched, 
  required = false,
  disabled = false,
  accept,
  className = '',
  ...props 
}) => {
  return (
    <div className={`${styles.formGroup} ${className}`}>
      {label && (
        <label htmlFor={name} className={styles.formLabel}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type="file"
        onChange={onChange}
        onBlur={onBlur}
        className={`${styles.formControl} ${styles.formFileInput} ${error && touched ? styles.isInvalid : ''}`}
        disabled={disabled}
        accept={accept}
        {...props}
      />
      {error && touched && <div className={styles.invalidFeedback}>{error}</div>}
    </div>
  );
};

/**
 * Date input component
 */
export const FormDate = ({ 
  label, 
  name, 
  value, 
  onChange, 
  onBlur, 
  error, 
  touched, 
  required = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`${styles.formGroup} ${className}`}>
      {label && (
        <label htmlFor={name} className={styles.formLabel}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type="date"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`${styles.formControl} ${error && touched ? styles.isInvalid : ''}`}
        disabled={disabled}
        {...props}
      />
      {error && touched && <div className={styles.invalidFeedback}>{error}</div>}
    </div>
  );
};

/**
 * Button component
 */
export const Button = ({ 
  type = 'button', 
  variant = 'primary', 
  children, 
  onClick, 
  disabled = false,
  className = '',
  ...props 
}) => {
  const buttonClass = `${styles.btn} ${styles[`btn${variant.charAt(0).toUpperCase() + variant.slice(1)}`]} ${className}`;
  
  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Form component
 */
export const Form = ({ 
  onSubmit, 
  children, 
  className = '',
  ...props 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };
  
  return (
    <form 
      onSubmit={handleSubmit}
      className={className}
      {...props}
    >
      {children}
    </form>
  );
};