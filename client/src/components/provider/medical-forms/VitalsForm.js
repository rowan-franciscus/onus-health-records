// src/components/provider/medical-forms/VitalsForm.js
import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaSave, FaUpload } from 'react-icons/fa';

import { 
  Form, 
  FormInput, 
  FormTextarea, 
  FormFile,
  Button
} from '../../common/FormComponents';
import styles from '../../../styles/global.module.css';

const VitalsForm = ({ patientId, onSubmit }) => {
  const [saving, setSaving] = useState(false);
  
  // Form validation schema
  const validationSchema = Yup.object({
    heartRate: Yup.object({
      value: Yup.number().min(0, 'Heart rate must be positive')
    }),
    bloodPressure: Yup.object({
      systolic: Yup.number().min(0, 'Systolic pressure must be positive'),
      diastolic: Yup.number().min(0, 'Diastolic pressure must be positive')
    }),
    bodyTemperature: Yup.object({
      value: Yup.number().min(0, 'Temperature must be positive')
    }),
    bloodGlucose: Yup.object({
      value: Yup.number().min(0, 'Blood glucose must be positive')
    }),
    bloodOxygenSaturation: Yup.object({
      value: Yup.number().min(0, 'Blood oxygen saturation must be positive').max(100, 'Blood oxygen saturation cannot exceed 100%')
    }),
    respiratoryRate: Yup.object({
      value: Yup.number().min(0, 'Respiratory rate must be positive')
    }),
    weight: Yup.object({
      value: Yup.number().min(0, 'Weight must be positive')
    }),
    height: Yup.object({
      value: Yup.number().min(0, 'Height must be positive')
    }),
    notes: Yup.string()
  });
  
  // Initialize formik
  const formik = useFormik({
    initialValues: {
      heartRate: {
        value: '',
        unit: 'bpm'
      },
      bloodPressure: {
        systolic: '',
        diastolic: '',
        unit: 'mmHg'
      },
      bodyTemperature: {
        value: '',
        unit: '°C'
      },
      bloodGlucose: {
        value: '',
        unit: 'mg/dL',
        measurementType: 'random'
      },
      bloodOxygenSaturation: {
        value: '',
        unit: '%'
      },
      respiratoryRate: {
        value: '',
        unit: 'breaths/min'
      },
      weight: {
        value: '',
        unit: 'kg'
      },
      height: {
        value: '',
        unit: 'cm'
      },
      bmi: '',
      bodyFatPercentage: '',
      notes: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSaving(true);
        
        // Calculate BMI if height and weight are provided
        if (values.height.value && values.weight.value) {
          const heightInMeters = values.height.unit === 'cm' 
            ? values.height.value / 100 
            : values.height.value * 0.0254; // Convert inches to meters
            
          const weightInKg = values.weight.unit === 'kg' 
            ? values.weight.value 
            : values.weight.value * 0.453592; // Convert pounds to kg
            
          const bmi = weightInKg / (heightInMeters * heightInMeters);
          values.bmi = parseFloat(bmi.toFixed(2));
        }
        
        // Call the onSubmit callback with the form values
        onSubmit(values);
      } catch (error) {
        console.error('Error saving vitals:', error);
      } finally {
        setSaving(false);
      }
    }
  });
  
  // Handle bloodPressure change
  const handleBloodPressureChange = (e) => {
    const { name, value } = e.target;
    formik.setValues({
      ...formik.values,
      bloodPressure: {
        ...formik.values.bloodPressure,
        [name === 'bloodPressure.systolic' ? 'systolic' : 'diastolic']: value
      }
    });
  };
  
  // Handle nested field change
  const handleNestedChange = (field, subfield, value) => {
    formik.setValues({
      ...formik.values,
      [field]: {
        ...formik.values[field],
        [subfield]: value
      }
    });
  };
  
  return (
    <Form onSubmit={formik.handleSubmit}>
      <h3>Vitals</h3>
      
      <div className={styles.formGrid}>
        {/* Heart Rate */}
        <div className={styles.formGroupComposite}>
          <label className={styles.formLabel}>Heart Rate</label>
          <div className={styles.inputGroup}>
            <FormInput
              name="heartRate.value"
              type="number"
              value={formik.values.heartRate.value}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.heartRate?.value}
              touched={formik.touched.heartRate?.value}
              placeholder="Value"
              className={styles.inputGroupField}
            />
            <span className={styles.inputGroupText}>
              {formik.values.heartRate.unit}
            </span>
          </div>
        </div>
        
        {/* Blood Pressure */}
        <div className={styles.formGroupComposite}>
          <label className={styles.formLabel}>Blood Pressure</label>
          <div className={styles.bloodPressureInputs}>
            <FormInput
              name="bloodPressure.systolic"
              type="number"
              value={formik.values.bloodPressure.systolic}
              onChange={(e) => handleNestedChange('bloodPressure', 'systolic', e.target.value)}
              onBlur={formik.handleBlur}
              error={formik.errors.bloodPressure?.systolic}
              touched={formik.touched.bloodPressure?.systolic}
              placeholder="Systolic"
              className={styles.bpInput}
            />
            <span className={styles.bpSeparator}>/</span>
            <FormInput
              name="bloodPressure.diastolic"
              type="number"
              value={formik.values.bloodPressure.diastolic}
              onChange={(e) => handleNestedChange('bloodPressure', 'diastolic', e.target.value)}
              onBlur={formik.handleBlur}
              error={formik.errors.bloodPressure?.diastolic}
              touched={formik.touched.bloodPressure?.diastolic}
              placeholder="Diastolic"
              className={styles.bpInput}
            />
            <span className={styles.inputGroupText}>
              {formik.values.bloodPressure.unit}
            </span>
          </div>
        </div>
        
        {/* Body Temperature */}
        <div className={styles.formGroupComposite}>
          <label className={styles.formLabel}>Body Temperature</label>
          <div className={styles.inputGroup}>
            <FormInput
              name="bodyTemperature.value"
              type="number"
              step="0.1"
              value={formik.values.bodyTemperature.value}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.bodyTemperature?.value}
              touched={formik.touched.bodyTemperature?.value}
              placeholder="Value"
              className={styles.inputGroupField}
            />
            <select
              name="bodyTemperature.unit"
              value={formik.values.bodyTemperature.unit}
              onChange={(e) => handleNestedChange('bodyTemperature', 'unit', e.target.value)}
              className={styles.inputGroupSelect}
            >
              <option value="°C">°C</option>
              <option value="°F">°F</option>
            </select>
          </div>
        </div>
        
        {/* Blood Glucose */}
        <div className={styles.formGroupComposite}>
          <label className={styles.formLabel}>Blood Glucose</label>
          <div className={styles.inputGroup}>
            <FormInput
              name="bloodGlucose.value"
              type="number"
              value={formik.values.bloodGlucose.value}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.bloodGlucose?.value}
              touched={formik.touched.bloodGlucose?.value}
              placeholder="Value"
              className={styles.inputGroupField}
            />
            <span className={styles.inputGroupText}>
              {formik.values.bloodGlucose.unit}
            </span>
          </div>
          <select
            name="bloodGlucose.measurementType"
            value={formik.values.bloodGlucose.measurementType}
            onChange={(e) => handleNestedChange('bloodGlucose', 'measurementType', e.target.value)}
            className={styles.formControl}
          >
            <option value="random">Random</option>
            <option value="fasting">Fasting</option>
            <option value="postprandial">Postprandial</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        {/* Blood Oxygen Saturation */}
        <div className={styles.formGroupComposite}>
          <label className={styles.formLabel}>Blood Oxygen Saturation</label>
          <div className={styles.inputGroup}>
            <FormInput
              name="bloodOxygenSaturation.value"
              type="number"
              min="0"
              max="100"
              value={formik.values.bloodOxygenSaturation.value}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.bloodOxygenSaturation?.value}
              touched={formik.touched.bloodOxygenSaturation?.value}
              placeholder="Value"
              className={styles.inputGroupField}
            />
            <span className={styles.inputGroupText}>
              {formik.values.bloodOxygenSaturation.unit}
            </span>
          </div>
        </div>
        
        {/* Respiratory Rate */}
        <div className={styles.formGroupComposite}>
          <label className={styles.formLabel}>Respiratory Rate</label>
          <div className={styles.inputGroup}>
            <FormInput
              name="respiratoryRate.value"
              type="number"
              value={formik.values.respiratoryRate.value}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.respiratoryRate?.value}
              touched={formik.touched.respiratoryRate?.value}
              placeholder="Value"
              className={styles.inputGroupField}
            />
            <span className={styles.inputGroupText}>
              {formik.values.respiratoryRate.unit}
            </span>
          </div>
        </div>
        
        {/* Weight */}
        <div className={styles.formGroupComposite}>
          <label className={styles.formLabel}>Weight</label>
          <div className={styles.inputGroup}>
            <FormInput
              name="weight.value"
              type="number"
              step="0.1"
              value={formik.values.weight.value}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.weight?.value}
              touched={formik.touched.weight?.value}
              placeholder="Value"
              className={styles.inputGroupField}
            />
            <select
              name="weight.unit"
              value={formik.values.weight.unit}
              onChange={(e) => handleNestedChange('weight', 'unit', e.target.value)}
              className={styles.inputGroupSelect}
            >
              <option value="kg">kg</option>
              <option value="lb">lb</option>
            </select>
          </div>
        </div>
        
        {/* Height */}
        <div className={styles.formGroupComposite}>
          <label className={styles.formLabel}>Height</label>
          <div className={styles.inputGroup}>
            <FormInput
              name="height.value"
              type="number"
              step="0.1"
              value={formik.values.height.value}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.height?.value}
              touched={formik.touched.height?.value}
              placeholder="Value"
              className={styles.inputGroupField}
            />
            <select
              name="height.unit"
              value={formik.values.height.unit}
              onChange={(e) => handleNestedChange('height', 'unit', e.target.value)}
              className={styles.inputGroupSelect}
            >
              <option value="cm">cm</option>
              <option value="in">in</option>
            </select>
          </div>
        </div>
        
        {/* Body Fat Percentage */}
        <div className={styles.formGroupComposite}>
          <label className={styles.formLabel}>Body Fat Percentage</label>
          <div className={styles.inputGroup}>
            <FormInput
              name="bodyFatPercentage"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formik.values.bodyFatPercentage}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.bodyFatPercentage}
              touched={formik.touched.bodyFatPercentage}
              placeholder="Value"
              className={styles.inputGroupField}
            />
            <span className={styles.inputGroupText}>%</span>
          </div>
        </div>
      </div>
      
      {/* Notes */}
      <FormTextarea
        label="Notes / Observations"
        name="notes"
        rows={4}
        value={formik.values.notes}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.errors.notes}
        touched={formik.touched.notes}
        placeholder="Enter any additional notes or observations"
      />
      
      {/* File Upload */}
      <FormFile
        label="Upload Documents (Optional)"
        name="documents"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={(e) => {
          // Handle file upload
          console.log('File selected:', e.target.files);
        }}
      />
      
      {/* Form Actions */}
      <div className={`${styles.formActions} ${styles.mt4}`}>
        <Button
          type="submit"
          variant="primary"
          disabled={saving}
        >
          <FaSave className={styles.mr2} /> {saving ? 'Saving...' : 'Save Vitals'}
        </Button>
      </div>
    </Form>
  );
};

export default VitalsForm;