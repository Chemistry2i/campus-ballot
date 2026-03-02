import { useEffect, useState, useRef } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import axios from "../utils/axiosInstance";
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
import Help from "../components/admin/Help";
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/admin/ThemeToggle';
import '../styles/darkmode.css';

// Responsive sidebar state managed here and passed to Sidebar
const SIDEBAR_WIDTH = 240;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', title: 'System Update Available', message: 'New security patches ready', time: '2 hours ago', read: false },
    { id: 2, type: 'warning', title: 'High CPU Usage', message: 'CPU usage at 78%', time: '5 minutes ago', read: false },
    { id: 3, type: 'success', title: 'Backup Completed', message: 'Daily backup successful', time: '1 day ago', read: true },
  ]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.profilePicture || user?.avatarUrl || '/logo.png');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const profileMenuRef = useRef(null);
  const { colors, isDarkMode } = useTheme();

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
        "https://laughing-memory-wrjgjx7g5qqq3g559-5000.app.github.dev/api/admin/dashboard-stats",
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

  // Close profile menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Cmd/Ctrl + ? to show shortcuts
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '?') {
        e.preventDefault();
        setShowShortcuts(!showShortcuts);
      }
      // Cmd/Ctrl + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('.search-input')?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showShortcuts]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Add fetchStats function to component scope
  const refreshStats = async () => {
    try {
      const res = await axios.get(
        "https://laughing-memory-wrjgjx7g5qqq3g559-5000.app.github.dev/api/admin/dashboard-stats",
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
          "https://laughing-memory-wrjgjx7g5qqq3g559-5000.app.github.dev/api/admin/notifications",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (err) {
        res = await axios.get(
          "https://laughing-memory-wrjgjx7g5qqq3g559-5000.app.github.dev/api/notifications",
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
        `https://laughing-memory-wrjgjx7g5qqq3g559-5000.app.github.dev/api/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      // try admin path
      try {
        await axios.put(
          `https://laughing-memory-wrjgjx7g5qqq3g559-5000.app.github.dev/api/admin/notifications/${id}/read`,
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
        `https://laughing-memory-wrjgjx7g5qqq3g559-5000.app.github.dev/api/notifications/${id}`,
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
          `https://laughing-memory-wrjgjx7g5qqq3g559-5000.app.github.dev/api/admin/notifications/${id}`,
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
          "https://laughing-memory-wrjgjx7g5qqq3g559-5000.app.github.dev/api/notifications/mark-all-read",
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
              `https://laughing-memory-wrjgjx7g5qqq3g559-5000.app.github.dev/api/notifications/${
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
            padding: "0.75rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 52,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, }}>
            <span
              style={{
                background: '#2563eb',
                color: '#fff',
                borderRadius: '6px',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 14,
                boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
              }}
            >
              <i className="fa fa-user-shield" style={{ fontSize: 14, color: '#fff' }}></i>
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: isDarkMode ? '#fff' : '#222' }}>Admin Dashboard</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>Manage elections, candidates, and users</div>
            </div>
          </div>
          {/* Right: Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Time */}
            <div style={{
              background: colors.primary, // Updated to use primary color
              color: '#fff',
              borderRadius: 10,
              padding: '3px 12px',
              fontWeight: 500,
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              minWidth: 70,
              justifyContent: 'center',
            }}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>
            {/* Search */}
            {isSearchExpanded ? (
              <div style={{ position: 'relative', width: '250px' }}>
                <span
                  className="fa fa-search"
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: 15,
                    color: isDarkMode ? '#94a3b8' : '#64748b',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  className="form-control search-input search-animate"
                  placeholder="Search users, logs..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    paddingLeft: '34px',
                    borderRadius: '14px',
                    border: `1.5px solid ${colors.border}`,
                    boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                    background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#fff',
                    color: colors.text,
                    height: '36px',
                    fontSize: '1rem',
                    width: '100%',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                  }}
                  aria-label="Search input"
                  onFocus={e => e.target.style.boxShadow = '0 4px 16px rgba(37,99,235,0.18)'}
                  onBlur={e => e.target.style.boxShadow = '0 2px 8px rgba(37,99,235,0.08)'}
                />
              </div>
            ) : (
              <button
                aria-label="Search"
                style={{
                  background: 'none',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => setIsSearchExpanded(true)}
              >
                <span className="fa fa-search" style={{ fontSize: 14, color: isDarkMode ? '#fff' : '#222' }} />
              </button>
            )}
            {/* Notification icon with border */}
            <button
              aria-label="Notifications"
              style={{
                background: 'none',
                border: isDarkMode ? '1.5px solid #334155' : '1.5px solid #e5e7eb',
                borderRadius: '8px',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: 'pointer',
              }}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span className="fa fa-bell" style={{ fontSize: 14, color: isDarkMode ? '#fff' : '#222' }} />
              {/* Notification dot */}
              {notifications.some(n => !n.read) && (
                <span style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 8,
                  height: 8,
                  background: '#22c55e',
                  borderRadius: '8px',
                  border: '2px solid #fff',
                  boxShadow: '0 0 0 2px #22c55e44',
                }} />
              )}
            </button>
            {/* Toggle button (moon/sun icon only, no text) */}
            <ThemeToggle showLabel={false} />
            {/* Profile dropdown */}
            <div style={{ position: 'relative' }} ref={profileMenuRef}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  background: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.18s, transform 0.18s',
                }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                aria-label="Open user menu"
                title="User menu"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') setShowProfileMenu(!showProfileMenu); }}
              >
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Admin Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'A'
                )}
              </div>
              {showProfileMenu && (
                <div
                  className="position-absolute shadow-lg rounded"
                  style={{
                    top: '50px',
                    right: 0,
                    minWidth: '180px',
                    zIndex: 100,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    border: `1px solid ${colors.border}`,
                    padding: '0.5rem 0',
                    background: isDarkMode ? colors.surface : '#fff',
                    color: colors.text,
                    transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  <button className="dropdown-item w-100 text-start px-3 py-2 d-flex align-items-center gap-2 profile-menu-item"
                    style={{ background: 'none', border: 'none', color: colors.text, fontSize: '0.95rem', cursor: 'pointer' }}>
                    <i className="fa-solid fa-user" style={{ color: isDarkMode ? '#60a5fa' : '#2563eb', fontSize: '1rem', transition: 'color 0.25s' }}></i>
                    Profile
                  </button>
                  <button className="dropdown-item w-100 text-start px-3 py-2 d-flex align-items-center gap-2 profile-menu-item"
                    style={{ background: 'none', border: 'none', color: colors.text, fontSize: '0.95rem', cursor: 'pointer' }}>
                    <i className="fa-solid fa-gear" style={{ color: isDarkMode ? '#fbbf24' : '#2563eb', fontSize: '1rem', transition: 'color 0.25s' }}></i>
                    Settings
                  </button>
                  <hr style={{ margin: '0.5rem 0', borderColor: colors.border }} />
                  <button className="dropdown-item w-100 text-start px-3 py-2 d-flex align-items-center gap-2 profile-menu-item"
                    style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.95rem', cursor: 'pointer' }} onClick={handleLogout}>
                    <i className="fa-solid fa-right-from-bracket" style={{ color: '#dc2626', fontSize: '1rem', transition: 'color 0.25s' }}></i>
                    Logout
                  </button>
                </div>
              )}
            </div>
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
                    className="mb-4 rounded-3 position-relative overflow-hidden"
                    style={{
                      background: isDarkMode 
                        ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' 
                        : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                      color: '#fff',
                      boxShadow: '0 8px 24px rgba(37, 99, 235, 0.15)',
                      padding: '2.5rem 2rem'
                    }}
                  >
                    <div className="position-relative" style={{ zIndex: 1 }}>
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div 
                          className="d-flex align-items-center justify-content-center"
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)'
                          }}
                        >
                          <i className="fa-solid fa-crown text-warning" style={{ fontSize: '1.8rem' }}></i>
                        </div>
                        <div>
                          <h2 className="mb-1 fw-bold">Welcome, Admin!</h2>
                          <p className="mb-0 opacity-90">Manage your campus voting system with full control and oversight</p>
                        </div>
                      </div>
                      <div className="d-flex gap-4 mt-3">
                        <div className="d-flex align-items-center gap-2">
                          <i className="fa-solid fa-shield-halved"></i>
                          <span className="small">Full Control</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <i className="fa-solid fa-chart-line"></i>
                          <span className="small">Real-time Analytics</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <i className="fa-solid fa-users-gear"></i>
                          <span className="small">User Management</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Decorative elements */}
                    <div 
                      className="position-absolute"
                      style={{
                        top: '-40px',
                        right: '-40px',
                        width: '200px',
                        height: '200px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        filter: 'blur(40px)'
                      }}
                    />
                    <div 
                      className="position-absolute"
                      style={{
                        bottom: '-20px',
                        right: '100px',
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.08)',
                        filter: 'blur(30px)'
                      }}
                    />
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
            <Route path="help" element={<Help />} />
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
