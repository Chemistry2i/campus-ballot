import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import useSocket from './hooks/useSocket';
import { ThemeProvider } from './contexts/ThemeContext';
import './styles/darkmode.css';

// --- Lazy Load Pages ---
// This prevents the browser from downloading every dashboard at once.
// Students don't need to download the Admin/Super-Admin code, and vice versa.
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const StudentDashboard = lazy(() => import("./pages/studentDashboard"));
const CandidateDashboard = lazy(() => import("./pages/CandidateDashboard"));
const AgentDashboard = lazy(() => import("./pages/AgentDashboard"));
const VotingPage = lazy(() => import("./pages/VotingPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const PublicCandidates = lazy(() => import("./pages/PublicCandidates"));
const CandidateApplication = lazy(() => import("./pages/CandidateApplication"));

// Legal Pages
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const EULA = lazy(() => import('./pages/EULA'));
const SecurityPolicy = lazy(() => import('./pages/SecurityPolicy'));
const Documentation = lazy(() => import('./pages/Documentation'));
const ContactSupport = lazy(() => import('./pages/ContactSupport'));
const TechnicalSupport = lazy(() => import('./pages/TechnicalSupport'));

// Lazy load complex components
const SuperAdmin = lazy(() => import('./components/superAdmin/SuperAdmin'));
const TestingRoutes = lazy(() => import('./components/TestingRoutes'));

// Observer components (lazy load the bundle)
const ObserverBundle = lazy(() => import('./components/observer').then(module => ({
  default: (props) => {
    const { ObserverLayout } = module;
    return <ObserverLayout {...props} />;
  }
})));

// Individual observer sub-pages (if exported separately) or just lazy load the layout
import {
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

// Loading Fallback Component
const PageLoader = () => (
  <div style={{ 
    height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', 
    justifyContent: 'center', background: '#0f172a', color: '#38bdf8' 
  }}>
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
  </div>
);

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
      <Suspense fallback={<PageLoader />}>
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
                  <ObserverBundle />
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
      </Suspense>
    </Router>
  );
}

export default App;
