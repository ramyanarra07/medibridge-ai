import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/PatientDashboard';
import HealthDataEntryPage from './pages/HealthDataEntryPage';
import DiseasePredictionPage from './pages/DiseasePredictionPage';
import HealthHistoryPage from './pages/HealthHistoryPage';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorPatientDetail from './pages/DoctorPatientDetail';
import CaregiverDashboard from './pages/CaregiverDashboard';
import NotificationCenter from './pages/NotificationCenter';
import PatientReportsPage from './pages/PatientReportsPage';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on actual role
    if (user.role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
    if (user.role === 'caregiver') return <Navigate to="/caregiver/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/patient/dashboard" replace />;
  }

  return children;
};

// Main Layout with Navbar & Sidebar
const AppLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {user && <Sidebar />}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Standalone ML Playground (Public & Protected accessible) */}
          <Route
            path="/predictions"
            element={
              <AppLayout>
                <DiseasePredictionPage />
              </AppLayout>
            }
          />

          {/* Patient Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <AppLayout>
                  <PatientDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/entry"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <AppLayout>
                  <HealthDataEntryPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/history"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <AppLayout>
                  <HealthHistoryPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/reports"
            element={
              <ProtectedRoute allowedRoles={['patient', 'doctor']}>
                <AppLayout>
                  <PatientReportsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Doctor Routes */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                <AppLayout>
                  <DoctorDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patient/:id"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                <AppLayout>
                  <DoctorPatientDetail />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Caregiver Routes */}
          <Route
            path="/caregiver/dashboard"
            element={
              <ProtectedRoute allowedRoles={['caregiver', 'admin']}>
                <AppLayout>
                  <CaregiverDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <AdminDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Notifications Route */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <NotificationCenter />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
