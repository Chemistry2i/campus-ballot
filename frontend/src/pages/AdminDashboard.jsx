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
  faTimes
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
import Reports from "../components/admin/Reports";
import Results from "../components/admin/Results";

function AdminDashboard({ user, onLogout }) { // Adding onLogout prop here
  const navigate = useNavigate();
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
  const [notifications] = useState([
    {
      id: 1,
      title: "New Election Created",
      message: "Student Council Election 2024 has been created",
      time: "1 hour ago",
      type: "success"
    },
    {
      id: 2,
      title: "Vote Cast",
      message: "A new vote was cast in Presidential Election",
      time: "3 hours ago",
      type: "info"
    },
    {
      id: 3,
      title: "Candidate Approved",
      message: "Muchwezi Onesmus has been approved as candidate",
      time: "5 hours ago",
      type: "warning"
    }
  ]);

  useEffect(() => {
    // initial fetch remains as fallback; realtime updates handled by socket
    async function fetchStats() {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/admin/dashboard-stats",
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
        "http://localhost:5000/api/admin/dashboard-stats",
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      setStats(res.data);
    } catch (err) {
      Swal.fire("Error", "Failed to load dashboard stats", "error");
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
                    setShowNotificationsDropdown(!showNotificationsDropdown);
                    setShowMessagesDropdown(false);
                  }}
                  style={{ border: 'none', background: 'none' }}
                >
                  <FontAwesomeIcon icon={faBell} size="lg" className="text-primary" />
                  {notifications.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning">
                      {notifications.length}
                    </span>
                  )}
                </button>
                {showNotificationsDropdown && (
                  <div className="dropdown-menu dropdown-menu-end show" style={{ minWidth: '350px', maxHeight: '400px', overflowY: 'auto' }}>
                    <div className="dropdown-header d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Notifications</span>
                      <span className="badge bg-warning">{notifications.length}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    {notifications.map(notification => (
                      <div key={notification.id} className="dropdown-item p-3">
                        <div className="d-flex align-items-start">
                          <div className="flex-shrink-0">
                            <span className={`badge bg-${notification.type === 'success' ? 'success' : notification.type === 'warning' ? 'warning' : 'info'} me-2`}>
                              <FontAwesomeIcon icon={faBell} size="xs" />
                            </span>
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-bold small">{notification.title}</div>
                            <div className="text-muted small">{notification.message}</div>
                            <div className="text-muted small">{notification.time}</div>
                          </div>
                        </div>
                      </div>
                    ))}
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