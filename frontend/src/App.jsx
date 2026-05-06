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
const ReceiptVerificationPage = lazy(() => import('./pages/ReceiptVerificationPage'));
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
  // IMPORTANT: Validate both currentUser AND token exist and are valid
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const user = localStorage.getItem("currentUser");
      const token = localStorage.getItem("token");
      
      // BOTH must exist for user to be logged in
      if (!user || !token) {
        return null;
      }
      
      // Token must be valid JWT format (3 parts separated by dots)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.warn('Invalid token format detected at init, clearing storage');
        localStorage.removeItem("currentUser");
        localStorage.removeItem("token");
        return null;
      }
      
      return JSON.parse(user);
    } catch (err) {
      console.warn('Failed to initialize user from storage:', err.message);
      // Clear potentially corrupt data
      localStorage.removeItem("currentUser");
      localStorage.removeItem("token");
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

  // Function to handle logout - Clear ALL sensitive data from localStorage
  const { reconnectWithToken } = useSocket();

  const handleLogout = () => {
    // ===== Step 1: Set state to null immediately =====
    setCurrentUser(null);
    
    // ===== Step 2: Clear EVERYTHING from localStorage (not just specific keys) =====
    // This is more thorough - clears any key we might have missed
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      // Only remove app-specific keys (don't remove browser extensions data)
      if (!key.startsWith('chrome-extension') && !key.startsWith('moz-extension')) {
        localStorage.removeItem(key);
      }
    });
    
    // As backup, also remove the specific keys we know about
    const keysToRemove = [
      "currentUser",
      "token",
      "user",
      "voteReceipts",
      "votingStatus",
      "archivedNotifications",
      "notifications",
      "candidateProfile",
      "candidateApplicationDraft",
      "candidateInfo",
      "observerSettings",
      "observerDashboard",
      "selectedElection",
      "selectedCandidate",
      "comparisonCandidates",
      "adminDarkMode",
      "adminWelcomeShown",
      "theme",
      "userPreferences",
      "lastRefresh",
      "autoRefresh",
      "currentPage",
      "scrollPosition",
      "cachedElections",
      "cachedCandidates",
      "cachedResults"
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // ===== Step 3: Clear sessionStorage completely =====
    sessionStorage.clear();
    
    // ===== Step 4: Disconnect socket =====
    try {
      reconnectWithToken(null);
    } catch (err) {
      console.error('Socket disconnect error:', err);
    }
    
    // ===== Step 5: Redirect to /login with full page reload =====
    // Full page reload ensures all JS state is cleared and is a security best practice
    window.location.replace('/login');
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
          
          {/* Receipt Verification - Public Route */}
          <Route path="/verify-receipt" element={<ReceiptVerificationPage />} />
          
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
