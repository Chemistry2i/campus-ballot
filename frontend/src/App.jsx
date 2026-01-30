import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/studentDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import { useState, useEffect } from "react";
import useSocket from './hooks/useSocket';
import VotingPage from "./pages/VotingPage";
import LandingPage from "./pages/LandingPage";
import PublicCandidates from "./pages/PublicCandidates";
import SuperAdmin from './components/superAdmin/SuperAdmin';
import GlobalSettings from './components/superAdmin/GlobalSettings';
import AuditLogs from './components/superAdmin/AuditLogs';
import ElectionOversight from './components/superAdmin/ElectionOversight';
import DataMaintenance from './components/superAdmin/DataMaintenance';
import Reporting from './components/superAdmin/Reporting';
import { ThemeProvider } from './contexts/ThemeContext';
import './styles/darkmode.css';
import SimpleCandidateTest from './components/SimpleCandidateTest';
import TestingRoutes from './components/TestingRoutes';
import CandidateApplication from './pages/CandidateApplication';
import {
  ObserverLayout,
  ObserverDashboardContent,
  ElectionMonitor,
  ObserverVotersList,
  ObserverMonitor,
  ObserverIncidents,
  ObserverElections,
  ObserverReports,
  ObserverAnalytics,
  ObserverActivityLogs,
  ObserverNotifications,
  ObserverSettings
} from './components/observer';
// Legal Pages
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import EULA from './pages/EULA';
import SecurityPolicy from './pages/SecurityPolicy';
import Documentation from './pages/Documentation';
import ContactSupport from './pages/ContactSupport';
import TechnicalSupport from './pages/TechnicalSupport';

// ProtectedRoute component to guard dashboard routes
function ProtectedRoute({ user, requiredRole, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Get all user roles (primary + additional)
  const userRoles = [user.role, ...(user.additionalRoles || [])];
  
  // Special case: Students with candidate role can access both dashboards
  // This enables the role switching functionality
  const isStudentCandidate = user.role === 'student' && user.additionalRoles?.includes('candidate');
  
  // If a specific role is required, check if user has it
  if (requiredRole && !userRoles.includes(requiredRole)) {
    // Student-candidates can access both student and candidate dashboards
    if (isStudentCandidate && (requiredRole === 'student' || requiredRole === 'candidate')) {
      return children; // Allow access
    }
    
    // Super admin can access admin routes (admin level features)
    // This allows super admin to view and manage all admin functions
    if (user.role === 'super_admin' && requiredRole === 'admin') {
      return children; // Allow super admin to access admin routes
    }
    
    // Admin can access admin routes
    if (user.role === 'admin' && requiredRole === 'admin') {
      return children; // Allow admin to access admin routes
    }
    
    // Redirect to appropriate dashboard based on user's primary role
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'super_admin') {
      return <Navigate to="/super-admin/system-health" replace />;
    } else {
      // For students, check additional roles
      if (user.additionalRoles?.includes('candidate')) {
        return <Navigate to="/candidate" replace />;
      } else if (user.additionalRoles?.includes('agent')) {
        return <Navigate to="/agent" replace />;
      } else {
        return <Navigate to="/student-dashboard" replace />;
      }
    }
  }
  
  return children;
}

function App() {
  // Get user from localStorage or set to null
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const user = localStorage.getItem("currentUser");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  });

  // Keep localStorage in sync with currentUser
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  // Function to handle logout
  const { reconnectWithToken } = useSocket();

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    try {
      reconnectWithToken(null);
    } catch {
      // ignore if socket not initialized
    }
  };


  return (
    <Router>
      <Routes>
        {/* Default redirect based on user role */}
        <Route
          path="/"
          element={
            currentUser ? (
              currentUser.role === 'candidate' ? (
                <Navigate to="/candidate" replace />
              ) : currentUser.role === 'agent' ? (
                <Navigate to="/agent" replace />
              ) : currentUser.role === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : currentUser.role === 'super_admin' ? (
                <Navigate to="/super-admin/system-health" replace />
              ) : currentUser.role === 'observer' ? (
                <Navigate to="/observer/dashboard" replace />
              ) : (
                <Navigate to="/student-dashboard" replace />
              )
            ) : (
              <LandingPage />
            )
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify/:token" element={<VerifyEmail />} />
        
        {/* Public Routes - No Authentication Required */}
        <Route path="/candidates" element={<PublicCandidates />} />
        
        {/* Legal Pages - Public Routes */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/eula" element={<EULA />} />
        <Route path="/security-policy" element={<SecurityPolicy />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/contact-support" element={<ContactSupport />} />
        <Route path="/technical-support" element={<TechnicalSupport />} />
        
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute user={currentUser} requiredRole="admin">
              <AdminDashboard user={currentUser} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-dashboard/*"
          element={
            <ProtectedRoute user={currentUser} requiredRole="student">
              <ThemeProvider>
                <StudentDashboard user={currentUser} onLogout={handleLogout} />
              </ThemeProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vote"
          element={
            <ProtectedRoute user={currentUser} requiredRole="student">
              <VotingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/*"
          element={
            <ProtectedRoute user={currentUser} requiredRole="candidate">
              <ThemeProvider>
                <CandidateDashboard user={currentUser} onLogout={handleLogout} />
              </ThemeProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/*"
          element={
            <ProtectedRoute user={currentUser} requiredRole="agent">
              <ThemeProvider>
                <AgentDashboard user={currentUser} onLogout={handleLogout} />
              </ThemeProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/*"
          element={
            <ProtectedRoute user={currentUser} requiredRole="super_admin">
              <ThemeProvider>
                <SuperAdmin user={currentUser} onLogout={handleLogout} />
              </ThemeProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/observer/*"
          element={
            <ProtectedRoute user={currentUser} requiredRole="observer">
              <ThemeProvider>
                <ObserverLayout />
              </ThemeProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ObserverDashboardContent />} />
          <Route path="elections" element={<ObserverElections />} />
          <Route path="elections/:electionId" element={<ElectionMonitor />} />
          <Route path="voters" element={<ObserverVotersList />} />
          <Route path="monitor" element={<ObserverMonitor />} />
          <Route path="incidents" element={<ObserverIncidents />} />
          <Route path="reports" element={<ObserverReports />} />
          <Route path="analytics" element={<ObserverAnalytics />} />
          <Route path="logs" element={<ObserverActivityLogs />} />
          <Route path="notifications" element={<ObserverNotifications />} />
          <Route path="settings" element={<ObserverSettings />} />
        </Route>
        <Route
          path="/test-routes"
          element={
            currentUser ? (
              <ThemeProvider>
                <TestingRoutes user={currentUser} onLogout={handleLogout} />
              </ThemeProvider>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/candidate-application"
          element={
            currentUser ? (
              <ThemeProvider>
                <CandidateApplication user={currentUser} />
              </ThemeProvider>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
