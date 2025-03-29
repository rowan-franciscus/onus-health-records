// controllers/userController.js
const { User, Patient, HealthProvider } = require('../models');
const { validationResult } = require('express-validator');

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with user data
 */
const getCurrentUser = async (req, res) => {
  try {
    // User is attached to request by auth middleware
    const userId = req.user._id;
    
    // Find user with role-specific data
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove sensitive data
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      profileCompleted: user.profileCompleted || false,
      createdAt: user.createdAt
    };
    
    // Add role-specific fields
    if (user.role === 'patient') {
      const patient = await Patient.findById(userId);
      if (patient) {
        userResponse.patientId = patient.patientId;
        userResponse.dateOfBirth = patient.dateOfBirth;
        userResponse.gender = patient.gender;
        userResponse.healthInsurance = patient.healthInsurance;
      }
    } else if (user.role === 'provider') {
      const provider = await HealthProvider.findById(userId);
      if (provider) {
        userResponse.providerId = provider.providerId;
        userResponse.title = provider.title;
        userResponse.specialty = provider.specialty;
        userResponse.practice = provider.practice;
        userResponse.verificationStatus = provider.verificationStatus;
      }
    }
    
    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
};

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with updated user data
 */
const updateUserProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user._id;
    const role = req.user.role;
    
    // Check what fields can be updated based on role
    const updateData = {};
    
    // Common fields
    if (req.body.name) updateData.name = req.body.name;
    
    // Role-specific updates
    if (role === 'patient') {
      const patient = await Patient.findById(userId);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      // Patient-specific fields
      if (req.body.dateOfBirth) patient.dateOfBirth = new Date(req.body.dateOfBirth);
      if (req.body.gender) patient.gender = req.body.gender;
      if (req.body.phoneNumber) patient.phoneNumber = req.body.phoneNumber;
      
      // Address
      if (req.body.address) {
        patient.address = {
          ...patient.address,
          ...req.body.address
        };
      }
      
      // Emergency contact
      if (req.body.emergencyContact) {
        patient.emergencyContact = {
          ...patient.emergencyContact,
          ...req.body.emergencyContact
        };
      }
      
      // Health insurance
      if (req.body.healthInsurance) {
        patient.healthInsurance = {
          ...patient.healthInsurance,
          ...req.body.healthInsurance
        };
      }
      
      // Medical history
      if (req.body.medicalHistory) {
        patient.medicalHistory = {
          ...patient.medicalHistory,
          ...req.body.medicalHistory
        };
      }
      
      // Family history
      if (req.body.familyHistory) {
        patient.familyHistory = {
          ...patient.familyHistory,
          ...req.body.familyHistory
        };
      }
      
      // Medications
      if (req.body.medications) patient.medications = req.body.medications;
      
      // Allergies
      if (req.body.allergies) patient.allergies = req.body.allergies;
      
      // Lifestyle
      if (req.body.lifestyle) {
        patient.lifestyle = {
          ...patient.lifestyle,
          ...req.body.lifestyle
        };
      }
      
      // Immunization status
      if (req.body.immunizationStatus) patient.immunizationStatus = req.body.immunizationStatus;
      
      // Consent
      if (req.body.consentToShareData !== undefined) {
        patient.consentToShareData = req.body.consentToShareData;
      }
      
      // Profile completion status
      if (req.body.profileCompleted !== undefined) {
        patient.profileCompleted = req.body.profileCompleted;
      }
      
      await patient.save();
      
      // Return updated data
      return res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          id: patient._id,
          name: patient.name,
          email: patient.email,
          role: patient.role,
          profileImage: patient.profileImage,
          patientId: patient.patientId,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          healthInsurance: patient.healthInsurance,
          profileCompleted: patient.profileCompleted
        }
      });
      
    } else if (role === 'provider') {
      const provider = await HealthProvider.findById(userId);
      
      if (!provider) {
        return res.status(404).json({ message: 'Provider not found' });
      }
      
      // Provider-specific fields
      if (req.body.title) provider.title = req.body.title;
      if (req.body.specialty) provider.specialty = req.body.specialty;
      if (req.body.yearsOfExperience) provider.yearsOfExperience = req.body.yearsOfExperience;
      
      // Practice information
      if (req.body.practice) {
        provider.practice = {
          ...provider.practice,
          ...req.body.practice
        };
      }
      
      // Patient management
      if (req.body.patientManagement) {
        provider.patientManagement = {
          ...provider.patientManagement,
          ...req.body.patientManagement
        };
      }
      
      // Data access preferences
      if (req.body.dataAccessPreferences) {
        provider.dataAccessPreferences = {
          ...provider.dataAccessPreferences,
          ...req.body.dataAccessPreferences
        };
      }
      
      // Data privacy
      if (req.body.dataPrivacy) {
        provider.dataPrivacy = {
          ...provider.dataPrivacy,
          ...req.body.dataPrivacy
        };
      }
      
      // Technical preferences
      if (req.body.technicalPreferences) {
        provider.technicalPreferences = {
          ...provider.technicalPreferences,
          ...req.body.technicalPreferences
        };
      }
      
      // Communication preferences
      if (req.body.communicationPreferences) {
        provider.communicationPreferences = req.body.communicationPreferences;
      }
      
      // Terms agreement
      if (req.body.termsAgreement) {
        provider.termsAgreement = {
          ...provider.termsAgreement,
          ...req.body.termsAgreement,
          dateAccepted: Date.now()
        };
      }
      
      // Profile completion status
      if (req.body.profileCompleted !== undefined) {
        provider.profileCompleted = req.body.profileCompleted;
      }
      
      await provider.save();
      
      // Return updated data
      return res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          id: provider._id,
          name: provider.name,
          email: provider.email,
          role: provider.role,
          profileImage: provider.profileImage,
          providerId: provider.providerId,
          title: provider.title,
          specialty: provider.specialty,
          practice: provider.practice,
          verificationStatus: provider.verificationStatus,
          profileCompleted: provider.profileCompleted
        }
      });
    } else if (role === 'admin') {
      // Admin updates
      const admin = await User.findById(userId);
      
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
      
      if (req.body.name) admin.name = req.body.name;
      
      await admin.save();
      
      return res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          profileImage: admin.profileImage
        }
      });
    }
    
    // This code should not be reached if user has a valid role
    res.status(400).json({ message: 'Invalid user role' });
    
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error updating user profile' });
  }
};

/**
 * Change user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with password change status
 */
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;
    
    // Get user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
};

/**
 * Delete user account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with account deletion status
 */
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Check for required password verification
    if (req.body.password) {
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Verify password
      const isMatch = await user.comparePassword(req.body.password);
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Password is incorrect' });
      }
      
      // Delete the user
      // Note: In a production app, consider soft delete or archiving data
      // instead of permanent deletion
      await User.findByIdAndDelete(userId);
      
      res.status(200).json({ message: 'Account deleted successfully' });
    } else {
      res.status(400).json({ message: 'Password is required to delete account' });
    }
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error deleting account' });
  }
};

/**
 * Upload profile image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with upload status
 */
const uploadProfileImage = async (req, res) => {
  try {
    // File should be available on req.file from multer middleware
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const userId = req.user._id;
    
    // Update user profile image field with path to saved image
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Save file path to user profile
    user.profileImage = `/uploads/profile/${req.file.filename}`;
    await user.save();
    
    res.status(200).json({
      message: 'Profile image uploaded successfully',
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ message: 'Server error uploading profile image' });
  }
};

module.exports = {
  getCurrentUser,
  updateUserProfile,
  changePassword,
  deleteAccount,
  uploadProfileImage
};