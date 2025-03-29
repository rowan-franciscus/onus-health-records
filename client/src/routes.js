// src/routes.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Route protection components
import { PrivateRoute, AdminRoute, ProviderRoute, PatientRoute, PublicRoute } from './components/common/PrivateRoute';

// Public pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import EmailVerification from './pages/auth/EmailVerification';
import VerificationSent from './pages/auth/VerificationSent';
import OAuthCallback from './pages/auth/OAuthCallback';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import ProviderVerification from './pages/admin/ProviderVerification';
import AdminProviderList from './pages/admin/ProviderList';
import AdminPatientList from './pages/admin/PatientList';
import AdminProviderDetails from './pages/admin/ProviderDetails';
import AdminPatientDetails from './pages/admin/PatientDetails';
import AdminSettings from './pages/admin/Settings';

// Provider pages
import ProviderPatientList from './pages/provider/PatientList';
import ProviderPatientDetails from './pages/provider/PatientDetails';
import ProviderConsultationCreate from './pages/provider/ConsultationCreate';
import ProviderMedicalRecords from './pages/provider/MedicalRecords';
import ProviderCompleteProfile from './pages/provider/CompleteProfile';
import ProviderProfile from './pages/provider/Profile';
import ProviderSettings from './pages/provider/Settings';
import ProviderVerificationPending from './pages/provider/VerificationPending';
import ProviderVerificationRejected from './pages/provider/VerificationRejected';

// Patient pages
import PatientDashboard from './pages/patient/Dashboard';
import PatientConsultations from './pages/patient/Consultations';
import PatientMedicalRecords from './pages/patient/MedicalRecords';
import PatientRecordList from './pages/patient/RecordList';
import PatientRecordDetails from './pages/patient/RecordDetails';
import PatientConnections from './pages/patient/Connections';
import PatientCompleteProfile from './pages/patient/CompleteProfile';
import PatientProfile from './pages/patient/Profile';
import PatientSettings from './pages/patient/Settings';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<EmailVerification />} />
        <Route path="/verification-sent" element={<VerificationSent />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
      </Route>
      
      {/* Admin routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/providers" element={<AdminProviderList />} />
        <Route path="/admin/providers/:providerId" element={<AdminProviderDetails />} />
        <Route path="/admin/verification-requests" element={<ProviderVerification />} />
        <Route path="/admin/patients" element={<AdminPatientList />} />
        <Route path="/admin/patients/:patientId" element={<AdminPatientDetails />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>
      
      {/* Provider routes */}
      <Route element={<PrivateRoute />}>
        {/* Provider profile completion route - no verification required */}
        <Route path="/provider/complete-profile" element={<ProviderCompleteProfile />} />
        <Route path="/provider/verification-pending" element={<ProviderVerificationPending />} />
        <Route path="/provider/verification-rejected" element={<ProviderVerificationRejected />} />
      </Route>
      
      {/* Provider routes that require verification */}
      <Route element={<ProviderRoute />}>
        <Route path="/provider/patients" element={<ProviderPatientList />} />
        <Route path="/provider/patients/:patientId" element={<ProviderPatientDetails />} />
        <Route path="/provider/patients/:patientId/consultation/new" element={<ProviderConsultationCreate />} />
        <Route path="/provider/medical-records" element={<ProviderMedicalRecords />} />
        <Route path="/provider/profile" element={<ProviderProfile />} />
        <Route path="/provider/settings" element={<ProviderSettings />} />
      </Route>
      
      {/* Patient routes */}
      <Route element={<PrivateRoute />}>
        {/* Patient profile completion route */}
        <Route path="/patient/complete-profile" element={<PatientCompleteProfile />} />
      </Route>
      
      {/* Patient routes that require profile completion */}
      <Route element={<PatientRoute />}>
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/consultations" element={<PatientConsultations />} />
        <Route path="/patient/medical-records" element={<PatientMedicalRecords />} />
        <Route path="/patient/medical-records/:recordType" element={<PatientRecordList />} />
        <Route path="/patient/medical-records/:recordType/:recordId" element={<PatientRecordDetails />} />
        <Route path="/patient/connections" element={<PatientConnections />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
        <Route path="/patient/settings" element={<PatientSettings />} />
      </Route>
      
      {/* Other routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/not-found" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
};

export default AppRoutes;