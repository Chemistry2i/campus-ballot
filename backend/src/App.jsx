import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/studentDashboard";
import { useState, useEffect } from "react";

// ProtectedRoute component to guard dashboard routes
function ProtectedRoute({ user, requiredRole, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If a specific role is required, check if user has it
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/student-dashboard" replace />;
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
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
  };

  return (
    <Router>
      <Routes>
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
          path="/student-dashboard"
          element={
            <ProtectedRoute user={currentUser} requiredRole="student">
              <StudentDashboard user={currentUser} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        {/* Default redirect based on user role */}
        <Route 
          path="/" 
          element={
            currentUser ? (
              currentUser.role === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/student-dashboard" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;