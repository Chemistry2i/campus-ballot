import { useEffect, useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faBell,
  faSignOutAlt,
  faUser,
  faCircle,
  faTimes,
  faTrash,
  faEye,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/admin/Slidebar";
import OverviewCards from "../components/admin/OverviewCards";
import DashboardCharts from "../components/admin/DashboardCharts";
import useRealtimeDashboard from "../hooks/useRealtimeDashboard";
import useSocket from "../hooks/useSocket";
import CreateElection from "../components/admin/CreateElection";
import Candidates from "../pages/Candidates"; // Importing your Candidates page
import Users from "../pages/Users"; // Importing the Users page
import Elections from "../pages/Elections"; // Importing the Elections page
import Logs from "../pages/Logs"; // Importing the Logs page
import Notifications from "../components/admin/Notifications"; // Importing Notifications component
import AdminSettings from "../components/admin/AdminSettings";
import Reports from "../components/admin/Reports";
import Results from "../components/admin/Results";
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/admin/ThemeToggle';
import '../styles/darkmode.css';

// Responsive sidebar state managed here and passed to Sidebar
const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 64;

function AdminDashboardContent({ user: initialUser, onLogout }) {
  // Adding onLogout prop here
  const navigate = useNavigate();
  const [user, setUser] = useState(initialUser);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateElection, setShowCreateElection] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMessagesDropdown, setShowMessagesDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] =
    useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [messages] = useState([
    {
      id: 1,
      sender: "Omolo Paskali",
      subject: "Election Results Query",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      sender: "Nsubuga Edgar",
      subject: "Candidate Registration Issue",
      time: "4 hours ago",
      unread: true,
    },
    {
      id: 3,
      sender: "Nakuya Patricia",
      subject: "Voting System Feedback",
      time: "1 day ago",
      unread: false,
    },
  ]);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate main content margin dynamically
  const mainMarginLeft = isMobile
    ? 0
    : collapsed
    ? SIDEBAR_COLLAPSED_WIDTH
    : SIDEBAR_WIDTH;

  async function fetchStats() {
    try {
      const res = await axios.get(
        "https://campus-ballot-backend.onrender.com/api/admin/dashboard-stats",
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      setStats(res.data);
    } catch (err) {
      Swal.fire("Error", "Failed to load dashboard stats", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === "admin") {
      fetchStats();

      if (!localStorage.getItem("adminWelcomeShown")) {
        Swal.fire({
          title: "Welcome, Admin!",
          text: "You have successfully logged in to the Admin Dashboard.",
          icon: "success",
          timer: 5000,
          showConfirmButton: false,
          customClass: {
            popup: "swal2-top swal2-center",
          },
          timerProgressBar: true,
        });
        localStorage.setItem("adminWelcomeShown", "true");
      }
    } else {
      navigate("/login");
    }
    return () => {};
  }, [user, navigate]);

  // Realtime integration: use central hook
  const [rtStateRaw] = useRealtimeDashboard();
  const { joinRoom, leaveRoom } = useSocket();

  // Apply realtime updates to stats object when events arrive
  useEffect(() => {
    if (!rtStateRaw || Object.keys(rtStateRaw).length === 0) return;

    // Example: if dashboard payload arrives, merge into stats
    if (rtStateRaw.dashboard) {
      setStats((prev) => ({ ...prev, ...rtStateRaw.dashboard }));
    }

    // If candidate updates arrive, re-fetch candidates or apply lightweight update
    if (
      rtStateRaw.candidateUpdated ||
      rtStateRaw.candidateCreated ||
      rtStateRaw.candidateDeleted
    ) {
      // lightweight: refresh the stats object from API
      refreshStats();
    }

    if (rtStateRaw.electionUpdated || rtStateRaw.electionCreated) {
      refreshStats();
    }

    if (rtStateRaw.userUpdated || rtStateRaw.userDeleted) {
      refreshStats();
    }
  }, [rtStateRaw]);

  // Auto-join election rooms after fetching stats
  useEffect(() => {
    if (!stats || !Array.isArray(stats.elections)) return;
    try {
      stats.elections.forEach((e) => {
        if (e && e.id) joinRoom(`election_${e.id}`);
      });
    } catch (err) {
      console.error("Error joining election rooms:", err);
    }
    return () => {
      try {
        stats.elections.forEach((e) => {
          if (e && e.id) leaveRoom(`election_${e.id}`);
        });
      } catch (err) {
        // ignore
      }
    };
  }, [stats, joinRoom, leaveRoom]);

  // Handle logout confirmation with SweetAlert
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Confirm Logout",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Logout",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      onLogout();
    }
  };

  // Close dropdowns when clicking outside
  const closeDropdowns = () => {
    setShowMessagesDropdown(false);
    setShowNotificationsDropdown(false);
  };

  // Add fetchStats function to component scope
  const refreshStats = async () => {
    try {
      const res = await axios.get(
        "https://campus-ballot-backend.onrender.com/api/admin/dashboard-stats",
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      setStats(res.data);
    } catch (err) {
      Swal.fire("Error", "Failed to load dashboard stats", "error");
    }
  };

  // Notifications: fetch, mark read, delete
  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    // ensure we have a token
    const token = user?.token || localStorage.getItem("token");
    if (!token) {
      setLoadingNotifications(false);
      console.warn(
        "Not authenticated - no token available to fetch notifications"
      );
      Swal.fire(
        "Unauthorized",
        "You must be logged in to view notifications",
        "warning"
      );
      return;
    }

    try {
      // Try admin notifications endpoint first, fallback to general
      let res;
      try {
        res = await axios.get(
          "https://campus-ballot-backend.onrender.com/api/admin/notifications",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (err) {
        res = await axios.get(
          "https://campus-ballot-backend.onrender.com/api/notifications",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      setNotifications(
        Array.isArray(res.data) ? res.data : res.data.notifications || []
      );
    } catch (err) {
      // better debug info
      console.error(
        "Failed to load notifications",
        err?.response?.status,
        err?.response?.data || err.message || err
      );
      if (err?.response?.status === 401) {
        Swal.fire(
          "Unauthorized",
          "Your session may have expired — please log in again.",
          "warning"
        );
      } else if (err?.response?.status === 404) {
        Swal.fire(
          "Not found",
          "Notifications endpoint not found on the server.",
          "error"
        );
      } else {
        Swal.fire("Error", "Failed to load notifications", "error");
      }
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markNotificationAsRead = async (id) => {
    // optimistic UI update
    const token = user?.token || localStorage.getItem("token");
    if (!token)
      return Swal.fire(
        "Unauthorized",
        "You must be logged in to mark notifications as read",
        "warning"
      );

    setNotifications((prev) =>
      (prev || []).map((n) =>
        n._id === id || n.id === id ? { ...n, read: true } : n
      )
    );
    try {
      await axios.put(
        `https://campus-ballot-backend.onrender.com/api/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      // try admin path
      try {
        await axios.put(
          `https://campus-ballot-backend.onrender.com/api/admin/notifications/${id}/read`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (e) {
        console.error("Failed to mark notification read", e);
        // revert optimistic update
        setNotifications((prev) =>
          (prev || []).map((n) =>
            n._id === id || n.id === id ? { ...n, read: false } : n
          )
        );
        if (e?.response?.status === 401)
          Swal.fire(
            "Unauthorized",
            "Your session may have expired — please log in again.",
            "warning"
          );
        else Swal.fire("Error", "Failed to mark notification as read", "error");
      }
    }
  };

  const deleteNotification = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete notification?",
      text: "This will permanently remove the notification.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });
    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(
        `https://campus-ballot-backend.onrender.com/api/notifications/${id}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      setNotifications((prev) =>
        prev.filter((n) => !(n._id === id || n.id === id))
      );
      Swal.fire("Deleted", "Notification removed", "success");
    } catch (err) {
      // try admin path
      try {
        await axios.delete(
          `https://campus-ballot-backend.onrender.com/api/admin/notifications/${id}`,
          {
            headers: { Authorization: `Bearer ${user?.token}` },
          }
        );
        setNotifications((prev) =>
          prev.filter((n) => !(n._id === id || n.id === id))
        );
        Swal.fire("Deleted", "Notification removed", "success");
      } catch (e) {
        console.error("Failed to delete notification", e);
        Swal.fire("Error", "Failed to delete notification", "error");
      }
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read && !(n.read === true));
    if (unread.length === 0)
      return Swal.fire("Info", "No unread notifications", "info");
    setLoadingNotifications(true);
    try {
      // If backend supports bulk endpoint, call it. Otherwise mark one-by-one.
      try {
        await axios.put(
          "https://campus-ballot-backend.onrender.com/api/notifications/mark-all-read",
          {},
          {
            headers: { Authorization: `Bearer ${user?.token}` },
          }
        );
      } catch (_) {
        // fallback: mark each
        await Promise.all(
          unread.map((n) =>
            axios.put(
              `https://campus-ballot-backend.onrender.com/api/notifications/${
                n._id || n.id
              }/read`,
              {},
              {
                headers: { Authorization: `Bearer ${user?.token}` },
              }
            )
          )
        );
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      Swal.fire("Success", "All notifications marked as read", "success");
    } catch (err) {
      console.error("Failed to mark all read", err);
      Swal.fire("Error", "Failed to mark all notifications as read", "error");
    } finally {
      setLoadingNotifications(false);
    }
  };

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh", width: "100vw", background: "#f3f4f6" }}
      >
        <div className="text-center">Loading dashboard...</div>
      </div>
    );

  return (
    <div
      className="container-fluid d-flex"
      style={{
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: colors.background,
        overflow: "hidden",
      }}
      onClick={closeDropdowns}
    >
      <Sidebar
        user={user}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobile={isMobile}
        onOpenCreateElection={() => setShowCreateElection(true)}
        onLogout={handleLogout}
        onProfileUpdated={(updated) => setUser(updated)}
      />
      
      <main
        style={{
          marginLeft: mainMarginLeft,
          width: isMobile ? "100vw" : `calc(100vw - ${collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH}px)`,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: colors.background,
          transition: "margin-left 0.2s, width 0.2s",
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            background: colors.surface,
            borderBottom: `1px solid ${colors.border}`,
            padding: "1rem 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 64,
          }}
        >
          <div>
            <span
              className="fw-bold"
              style={{ fontSize: "1.2rem", color: colors.primary }}
            >
              Admin Panel
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ThemeToggle showLabel />
            <span className="me-3" style={{ color: colors.textMuted }}>
              Welcome, <strong style={{ color: colors.text }}>{user?.name}</strong>
            </span>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={handleLogout}
            >
              <i className="fa-solid fa-right-from-bracket me-1"></i> Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div
          className="container-fluid"
          style={{
            flex: 1,
            padding: "2rem",
            overflowY: "auto",
            height: "100%",
            background: colors.background,
          }}
        >
          <Routes>
            <Route
              path="/"
              element={
                <>
                  {/* Banner */}
                  <div
                    className="mb-4 rounded shadow-sm"
                    style={{
                      background:
                        "linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      minHeight: 90,
                      padding: "2.5rem 2rem", // Increased padding
                    }}
                  >
                    <div>
                      <h2 className="fw-bold mb-1" style={{ fontSize: "2rem" }}>
                        <i className="fa-solid fa-crown me-2 text-warning"></i>
                        Welcome, Admin!
                      </h2>
                      <div style={{ fontSize: "1.1rem", opacity: 0.95 }}>
                        Manage your campus voting system with full control and
                        oversight.
                      </div>
                    </div>
                    <div>
                      <img
                        src="/superadmin-banner.svg"
                        alt="Super Admin"
                        style={{ height: 64, marginLeft: 24 }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  </div>
                  <h4 className="mb-4 fw-bold text-primary">System Overview</h4>
                  <OverviewCards stats={stats} />
                  <DashboardCharts stats={stats} />
                </>
              }
            />
            <Route path="elections" element={<Elections user={user} />} />
            <Route path="candidates" element={<Candidates user={user} />} />
            <Route path="users" element={<Users user={user} />} />
            <Route path="logs" element={<Logs user={user} />} />
            <Route
              path="notifications"
              element={<Notifications user={user} />}
            />
            <Route path="settings" element={<AdminSettings user={user} />} />
            <Route path="reports" element={<Reports user={user} />} />
            <Route path="results" element={<Results user={user} />} />
            {/* Add more admin routes here */}
          </Routes>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0">
                <h5 className="modal-title d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faSignOutAlt}
                    className="text-danger me-2"
                  />
                  Confirm Logout
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowLogoutModal(false)}
                ></button>
              </div>
              <div className="modal-body text-center py-4">
                <p className="mb-3">Are you sure you want to logout?</p>
                <p className="text-muted small">
                  You will be redirected to the login page.
                </p>
              </div>
              <div className="modal-footer border-0 justify-content-center">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={() => setShowLogoutModal(false)}
                >
                  <FontAwesomeIcon icon={faTimes} className="me-2" />
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmLogout}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Create Election */}
      {showCreateElection && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Election</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateElection(false)}
                ></button>
              </div>
              <div className="modal-body">
                <CreateElection
                  onCreated={() => {
                    setShowCreateElection(false);
                    refreshStats(); // Use the new function
                  }}
                  user={user}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap with ThemeProvider
function AdminDashboard(props) {
  return (
    <ThemeProvider>
      <AdminDashboardContent {...props} />
    </ThemeProvider>
  );
}

export default AdminDashboard;
