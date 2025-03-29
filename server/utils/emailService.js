// utils/emailService.js
const nodemailer = require('nodemailer');

// Configure transporter (using SendGrid or other email service)
let transporter;

if (process.env.NODE_ENV === 'production') {
  // Production email service (SendGrid)
  transporter = nodemailer.createTransport({
    service: 'SendGrid',
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY
    }
  });
} else {
  // Development email service (Ethereal for testing)
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_EMAIL || 'ethereal.user@ethereal.email',
      pass: process.env.ETHEREAL_PASSWORD || 'ethereal_password'
    }
  });
}

/**
 * Send verification email to user
 * @param {Object} user - User object
 * @param {String} token - Verification token
 * @returns {Promise} Email send result
 */
const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Verify Your Onus Account',
    html: `
      <h1>Welcome to Onus Health Records!</h1>
      <p>Thank you for signing up. Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationUrl}" style="padding: 10px 20px; background-color: #6c47ff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not create an account, please ignore this email.</p>
    `
  };
  
  return transporter.sendMail(mailOptions);
};

/**
 * Send password reset email to user
 * @param {Object} user - User object
 * @param {String} token - Reset token
 * @returns {Promise} Email send result
 */
const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Reset Your Onus Password',
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <p><a href="${resetUrl}" style="padding: 10px 20px; background-color: #6c47ff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
    `
  };
  
  return transporter.sendMail(mailOptions);
};

/**
 * Send login notification email
 * @param {Object} user - User object
 * @returns {Promise} Email send result
 */
const sendLoginNotification = async (user) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'New Login to Your Onus Account',
    html: `
      <h1>New Login Detected</h1>
      <p>We detected a new login to your Onus account on ${new Date().toLocaleString()}.</p>
      <p>If this was you, no action is needed.</p>
      <p>If you did not log in, please secure your account by changing your password immediately.</p>
    `
  };
  
  return transporter.sendMail(mailOptions);
};

/**
 * Send provider verification request email to admin
 * @param {Object} provider - Provider user object
 * @returns {Promise} Email send result
 */
const sendProviderVerificationRequestToAdmin = async (provider) => {
  // Find admin emails
  const adminEmails = process.env.ADMIN_EMAILS || 'rowan.franciscus.2@gmail.com';
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: adminEmails,
    subject: 'New Health Provider Verification Request',
    html: `
      <h1>New Health Provider Verification Request</h1>
      <p>A new health provider has requested verification on the Onus platform:</p>
      <ul>
        <li><strong>Name:</strong> ${provider.name}</li>
        <li><strong>Email:</strong> ${provider.email}</li>
        <li><strong>Specialty:</strong> ${provider.specialty || 'Not specified'}</li>
        <li><strong>Practice:</strong> ${provider.practice?.name || 'Not specified'}</li>
      </ul>
      <p>Please log in to the admin dashboard to review and approve or reject this request.</p>
    `
  };
  
  return transporter.sendMail(mailOptions);
};

/**
 * Send provider verification status email
 * @param {Object} provider - Provider user object
 * @param {String} status - Verification status (approved/rejected)
 * @param {String} reason - Rejection reason (optional)
 * @returns {Promise} Email send result
 */
const sendProviderVerificationStatus = async (provider, status, reason = '') => {
  const subject = status === 'approved' 
    ? 'Your Health Provider Account is Approved!' 
    : 'Your Health Provider Verification Request';
  
  const content = status === 'approved'
    ? `
      <h1>Your Health Provider Account is Approved!</h1>
      <p>Congratulations! Your health provider account on the Onus platform has been verified and approved.</p>
      <p>You can now access all provider features and start managing patient records.</p>
      <p><a href="${process.env.CLIENT_URL}/login" style="padding: 10px 20px; background-color: #6c47ff; color: white; text-decoration: none; border-radius: 5px;">Log In Now</a></p>
    `
    : `
      <h1>Your Health Provider Verification Request</h1>
      <p>We regret to inform you that your health provider verification request has been rejected.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>If you believe this is an error or would like to provide additional information, please contact our support team.</p>
    `;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: provider.email,
    subject,
    html: content
  };
  
  return transporter.sendMail(mailOptions);
};

/**
 * Send connection request email to patient
 * @param {Object} patient - Patient user object
 * @param {Object} provider - Provider user object
 * @returns {Promise} Email send result
 */
const sendConnectionRequest = async (patient, provider) => {
  const actionUrl = `${process.env.CLIENT_URL}/patient/connections`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: patient.email,
    subject: 'New Health Provider Connection Request',
    html: `
      <h1>New Health Provider Connection Request</h1>
      <p>Health provider <strong>${provider.name}</strong> has requested to connect with you on the Onus platform.</p>
      <p>This will allow them to view your health records and add new medical records to your profile.</p>
      <p><a href="${actionUrl}" style="padding: 10px 20px; background-color: #6c47ff; color: white; text-decoration: none; border-radius: 5px;">Review Request</a></p>
      <p>You can approve or deny this request in your Connections section.</p>
    `
  };
  
  return transporter.sendMail(mailOptions);
};

/**
 * Send new medical record notification to patient
 * @param {Object} patient - Patient user object
 * @param {Object} provider - Provider user object
 * @param {Object} recordType - Type of medical record added
 * @returns {Promise} Email send result
 */
const sendNewMedicalRecordNotification = async (patient, provider, recordType) => {
  const recordUrl = `${process.env.CLIENT_URL}/patient/medical-records/${recordType.toLowerCase()}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: patient.email,
    subject: 'New Medical Record Added to Your Profile',
    html: `
      <h1>New Medical Record Added</h1>
      <p>Health provider <strong>${provider.name}</strong> has added a new ${recordType} record to your health profile.</p>
      <p><a href="${recordUrl}" style="padding: 10px 20px; background-color: #6c47ff; color: white; text-decoration: none; border-radius: 5px;">View Record</a></p>
    `
  };
  
  return transporter.sendMail(mailOptions);
};

/**
 * Send new patient invitation email
 * @param {String} email - Patient's email address
 * @param {Object} provider - Provider user object
 * @returns {Promise} Email send result
 */
const sendNewPatientInvitation = async (email, provider) => {
  const signupUrl = `${process.env.CLIENT_URL}/signup?role=patient&provider=${provider._id}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Invitation to Join Onus Health Records',
    html: `
      <h1>Invitation to Join Onus Health Records</h1>
      <p>Health provider <strong>${provider.name}</strong> has added you as a patient on the Onus Health Records platform.</p>
      <p>Onus is a secure digital platform for managing and storing your health records.</p>
      <p>To view your health records and manage your health data, please create an account by clicking the link below:</p>
      <p><a href="${signupUrl}" style="padding: 10px 20px; background-color: #6c47ff; color: white; text-decoration: none; border-radius: 5px;">Create Your Account</a></p>
    `
  };
  
  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendLoginNotification,
  sendProviderVerificationRequestToAdmin,
  sendProviderVerificationStatus,
  sendConnectionRequest,
  sendNewMedicalRecordNotification,
  sendNewPatientInvitation
};