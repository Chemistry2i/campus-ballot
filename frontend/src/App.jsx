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
import SuperAdmin from './components/superAdmin/SuperAdmin';
import GlobalSettings from './components/superAdmin/GlobalSettings';
import AuditLogs from './components/superAdmin/AuditLogs';
import ElectionOversight from './components/superAdmin/ElectionOversight';
import DataMaintenance from './components/superAdmin/DataMaintenance';
import Reporting from './components/superAdmin/Reporting';
import { ThemeProvider } from './contexts/ThemeContext';
import './styles/darkmode.css';

// ProtectedRoute component to guard dashboard routes
function ProtectedRoute({ user, requiredRole, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Get all user roles (primary + additional)
  const userRoles = [user.role, ...(user.additionalRoles || [])];
  
  // If a specific role is required, check if user has it
  if (requiredRole && !userRoles.includes(requiredRole)) {
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
              currentUser.role === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : currentUser.role === 'super_admin' ? (
                <Navigate to="/super-admin/system-health" replace />
              ) : currentUser.additionalRoles?.includes('candidate') ? (
                <Navigate to="/candidate" replace />
              ) : currentUser.additionalRoles?.includes('agent') ? (
                <Navigate to="/agent" replace />
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
          path="/super-admin/*"
          elem
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
        <Routeent={
            <ProtectedRoute user={currentUser} requiredRole="super_admin">
              <ThemeProvider>
                <SuperAdmin user={currentUser} onLogout={handleLogout} />
              </ThemeProvider>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
