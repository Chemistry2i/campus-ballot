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
  faCheck
} from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../components/admin/Slidebar";
import OverviewCards from "../components/admin/OverviewCards";
import DashboardCharts from "../components/admin/DashboardCharts";
import useRealtimeDashboard from '../hooks/useRealtimeDashboard';
import useSocket from '../hooks/useSocket';
import CreateElection from "../components/admin/CreateElection";
import Candidates from "../pages/Candidates"; // Importing your Candidates page
import Users from "../pages/Users"; // Importing the Users page
import Elections from "../pages/Elections"; // Importing the Elections page
import Logs from "../pages/Logs"; // Importing the Logs page
import Notifications from "../components/admin/Notifications"; // Importing Notifications component  
import AdminSettings from "../components/admin/AdminSettings";
import Reports from "../components/admin/Reports";
import Results from "../components/admin/Results";

function AdminDashboard({ user: initialUser, onLogout }) { // Adding onLogout prop here
  const navigate = useNavigate();
  const [user, setUser] = useState(initialUser);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateElection, setShowCreateElection] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMessagesDropdown, setShowMessagesDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [messages] = useState([
    {
      id: 1,
      sender: "Omolo Paskali",
      subject: "Election Results Query",
      time: "2 hours ago",
      unread: true
    },
    {
      id: 2,
      sender: "Nsubuga Edgar",
      subject: "Candidate Registration Issue",
      time: "4 hours ago",
      unread: true
    },
    {
      id: 3,
      sender: "Nakuya Patricia",
      subject: "Voting System Feedback",
      time: "1 day ago",
      unread: false
    }
  ]);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    // initial fetch remains as fallback; realtime updates handled by socket
    async function fetchStats() {
      try {
        const res = await axios.get(
          "https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/api/admin/dashboard-stats",
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

    if (user?.role === "admin") {
      fetchStats();

      if (!localStorage.getItem("adminWelcomeShown")) {
        Swal.fire({
          title: 'Welcome, Admin!',
          text: 'You have successfully logged in to the Admin Dashboard.',
          icon: 'success',
          timer: 5000,
          showConfirmButton: false,
          customClass: {
            popup: 'swal2-top swal2-center',
          },
          timerProgressBar: true
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
      setStats(prev => ({ ...prev, ...rtStateRaw.dashboard }));
    }

    // If candidate updates arrive, re-fetch candidates or apply lightweight update
    if (rtStateRaw.candidateUpdated || rtStateRaw.candidateCreated || rtStateRaw.candidateDeleted) {
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
      stats.elections.forEach(e => {
        if (e && e.id) joinRoom(`election_${e.id}`);
      });
    } catch (err) {
      console.error('Error joining election rooms:', err);
    }
    return () => {
      try {
        stats.elections.forEach(e => {
          if (e && e.id) leaveRoom(`election_${e.id}`);
        });
      } catch (err) {
        // ignore
      }
    };
  }, [stats, joinRoom, leaveRoom]);

  // Handle logout confirmation
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
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
        "https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/api/admin/dashboard-stats",
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
    const token = user?.token || localStorage.getItem('token');
    if (!token) {
      setLoadingNotifications(false);
      console.warn('Not authenticated - no token available to fetch notifications');
      Swal.fire('Unauthorized', 'You must be logged in to view notifications', 'warning');
      return;
    }

    try {
      // Try admin notifications endpoint first, fallback to general
      let res;
      try {
        res = await axios.get("https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/api/admin/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        res = await axios.get("https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setNotifications(Array.isArray(res.data) ? res.data : res.data.notifications || []);
    } catch (err) {
      // better debug info
      console.error("Failed to load notifications", err?.response?.status, err?.response?.data || err.message || err);
      if (err?.response?.status === 401) {
        Swal.fire('Unauthorized', 'Your session may have expired — please log in again.', 'warning');
      } else if (err?.response?.status === 404) {
        Swal.fire('Not found', 'Notifications endpoint not found on the server.', 'error');
      } else {
        Swal.fire('Error', 'Failed to load notifications', 'error');
      }
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markNotificationAsRead = async (id) => {
    // optimistic UI update
    const token = user?.token || localStorage.getItem('token');
    if (!token) return Swal.fire('Unauthorized', 'You must be logged in to mark notifications as read', 'warning');

    setNotifications(prev => (prev || []).map(n => (n._id === id || n.id === id) ? { ...n, read: true } : n));
    try {
      await axios.put(`https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      // try admin path
      try {
        await axios.put(`https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/api/admin/notifications/${id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.error("Failed to mark notification read", e);
        // revert optimistic update
        setNotifications(prev => (prev || []).map(n => (n._id === id || n.id === id) ? { ...n, read: false } : n));
        if (e?.response?.status === 401) Swal.fire('Unauthorized', 'Your session may have expired — please log in again.', 'warning');
        else Swal.fire('Error', 'Failed to mark notification as read', 'error');
      }
    }
  };

  const deleteNotification = async (id) => {
    const confirm = await Swal.fire({
      title: 'Delete notification?',
      text: 'This will permanently remove the notification.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });
    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setNotifications((prev) => prev.filter(n => !(n._id === id || n.id === id)));
      Swal.fire('Deleted', 'Notification removed', 'success');
    } catch (err) {
      // try admin path
      try {
        await axios.delete(`https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/api/admin/notifications/${id}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setNotifications((prev) => prev.filter(n => !(n._id === id || n.id === id)));
        Swal.fire('Deleted', 'Notification removed', 'success');
      } catch (e) {
        console.error('Failed to delete notification', e);
        Swal.fire('Error', 'Failed to delete notification', 'error');
      }
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read && !(n.read === true));
    if (unread.length === 0) return Swal.fire('Info', 'No unread notifications', 'info');
    setLoadingNotifications(true);
    try {
      // If backend supports bulk endpoint, call it. Otherwise mark one-by-one.
      try {
        await axios.put('https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/api/notifications/mark-all-read', {}, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
      } catch (_) {
        // fallback: mark each
        await Promise.all(unread.map(n => axios.put(`https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/api/notifications/${n._id || n.id}/read`, {}, {
          headers: { Authorization: `Bearer ${user?.token}` },
        })));
      }
      setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
      Swal.fire('Success', 'All notifications marked as read', 'success');
    } catch (err) {
      console.error('Failed to mark all read', err);
      Swal.fire('Error', 'Failed to mark all notifications as read', 'error');
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
      className="container-fluid min-vh-100"
      style={{ width: "100vw", backgroundColor: "#f8f9fa" }}
      onClick={closeDropdowns}
    >
      <div className="row">
        <Sidebar
          user={user}
          navigate={navigate}
          onOpenCreateElection={() => setShowCreateElection(true)}
          onLogout={onLogout} // This should now work
          onProfileUpdated={(updated) => setUser(updated)}
        />
        <div className="col-md-10 p-0">
          {/* Top Navigation Bar */}
          <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4 py-3">
            <div className="navbar-nav ms-auto d-flex flex-row align-items-center">
              {/* Messages Dropdown */}
              <div className="nav-item dropdown me-3">
                <button
                  className="btn btn-link nav-link position-relative p-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMessagesDropdown(!showMessagesDropdown);
                    setShowNotificationsDropdown(false);
                  }}
                  style={{ border: 'none', background: 'none' }}
                >
                  <FontAwesomeIcon icon={faEnvelope} size="lg" className="text-muted" />
                  {messages.filter(m => m.unread).length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {messages.filter(m => m.unread).length}
                    </span>
                  )}
                </button>
                {showMessagesDropdown && (
                  <div className="dropdown-menu dropdown-menu-end show" style={{ minWidth: '300px', maxHeight: '400px', overflowY: 'auto' }}>
                    <div className="dropdown-header d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Messages</span>
                      <span className="badge bg-primary">{messages.filter(m => m.unread).length} new</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    {messages.map(message => (
                      <div key={message.id} className={`dropdown-item p-3 ${message.unread ? 'bg-light' : ''}`}>
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0">
                            <FontAwesomeIcon icon={faUser} className="text-muted me-2" />
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between">
                              <span className="fw-bold small">{message.sender}</span>
                              {message.unread && <FontAwesomeIcon icon={faCircle} className="text-primary" size="xs" />}
                            </div>
                            <div className="text-muted small">{message.subject}</div>
                            <div className="text-muted small">{message.time}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item text-center">
                      <small><a href="#" className="text-decoration-none">View all messages</a></small>
                    </div>
                  </div>
                )}
              </div>

              {/* Notifications Dropdown */}
              <div className="nav-item dropdown me-3">
                <button
                  className="btn btn-link nav-link position-relative p-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    const opening = !showNotificationsDropdown;
                    setShowNotificationsDropdown(opening);
                    setShowMessagesDropdown(false);
                    if (opening) fetchNotifications();
                  }}
                  style={{ border: 'none', background: 'none' }}
                >
                  <FontAwesomeIcon icon={faBell} size="lg" className="text-primary" />
                  {notifications && notifications.filter(n => !n.read).length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                {showNotificationsDropdown && (
                  <div
                    className="dropdown-menu dropdown-menu-end show"
                    style={{
                      minWidth: '360px',
                      maxHeight: '420px',
                      overflowY: 'auto',
                      position: 'absolute',
                      top: '56px',
                      right: '1rem',
                      zIndex: 2000
                    }}
                  >
                    <div className="dropdown-header d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold">Notifications</span>
                        {loadingNotifications && <small className="text-muted">Loading...</small>}
                      </div>
                      <div>
                        <button className="btn btn-sm btn-link" onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}>
                          Mark all read
                        </button>
                        <span className="badge bg-warning ms-2">{notifications.length}</span>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    {loadingNotifications ? (
                      <div className="px-3 py-4 text-center text-muted">Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                      <div className="px-3 py-4 text-center text-muted">No notifications</div>
                    ) : (
                      notifications.map(notification => (
                        <div key={notification._id || notification.id} className={`dropdown-item p-2 ${!notification.read ? 'bg-light' : ''}`}>
                          <div className="d-flex align-items-start">
                            <div className="flex-shrink-0 me-2">
                              <span className={`badge bg-${notification.type === 'success' ? 'success' : notification.type === 'warning' ? 'warning' : 'info'} d-inline-flex align-items-center justify-content-center`} style={{ width: 34, height: 34 }}>
                                <FontAwesomeIcon icon={faBell} />
                              </span>
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <div className="fw-bold small">{notification.title}</div>
                                  <div className="text-muted small">{notification.message}</div>
                                  <div className="text-muted small mt-1">{notification.time}</div>
                                </div>
                                <div className="ms-2 text-end">
                                  <div className="btn-group" role="group">
                                    <button className="btn btn-sm btn-outline-secondary" onClick={(e) => { e.stopPropagation(); setShowNotificationsDropdown(false); navigate('/admin/notifications'); if (!notification.read) markNotificationAsRead(notification._id || notification.id); }}>
                                      View
                                    </button>
                                    {!notification.read && (
                                      <button className="btn btn-sm btn-primary ms-1" onClick={(e) => { e.stopPropagation(); markNotificationAsRead(notification._id || notification.id); }}>
                                        <FontAwesomeIcon icon={faCheck} className="me-1" /> Mark as read
                                      </button>
                                    )}
                                    <button className="btn btn-sm btn-light text-danger" onClick={(e) => { e.stopPropagation(); deleteNotification(notification._id || notification.id); }}>
                                      <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item text-center">
                      <small><a href="#" className="text-decoration-none">View all notifications</a></small>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile & Logout */}
              <div className="nav-item dropdown">
                <div className="d-flex align-items-center">
                  <span className="me-3 small">
                    <span className="text-muted">Welcome,</span>
                    <span className="fw-bold ms-1">{user?.firstName || 'Admin'}</span>
                  </span>
                  <button
                    className="btn btn-outline-danger btn-sm d-flex align-items-center"
                    onClick={handleLogout}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <div className="p-4">
            <Routes>
              <Route
                path="/"
                element={
                  <>
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
              <Route path="notifications" element={<Notifications user={user} />} />
              <Route path="settings" element={<AdminSettings user={user} />} />
              <Route path="reports" element={<Reports user={user} />} />
              <Route path="results" element={<Results user={user} />} />
              {/* Add more admin routes here */}
            </Routes>
          </div>
        </div>
      </div>

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
                  <FontAwesomeIcon icon={faSignOutAlt} className="text-danger me-2" />
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
                <p className="text-muted small">You will be redirected to the login page.</p>
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

export default AdminDashboard;