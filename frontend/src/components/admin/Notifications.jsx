import { useEffect, useState } from "react";
import useSocket from '../../hooks/useSocket';
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faTrash,
  faCheckCircle,
  faSpinner,
  faInfoCircle,
  faPlus,
  faEnvelopeOpenText,
  faTimes
} from "@fortawesome/free-solid-svg-icons";

axios.defaults.baseURL = "https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev";

function Notifications({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  // UI: search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterAudience, setFilterAudience] = useState("all");
  const [filterRead, setFilterRead] = useState("all"); // all | read | unread
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    targetAudience: "all"
  });

  // Fetch all notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Mark as read if current user is in readBy
      const userId = user?._id;
      const mapped = res.data.map(n => ({
        ...n,
        read: n.readBy && userId ? n.readBy.includes(userId) : false
      }));
      setNotifications(mapped);
    } catch (err) {
      Swal.fire("Error", "Failed to load notifications", "error");
    } finally {
      setLoading(false);
    }
  };

  // Get a single notification (details)
  const openDetailsModal = (notification) => {
    setSelectedNotification(notification);
    setShowDetailsModal(true);
  };

  // Mark as read
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      Swal.fire("Error", "Failed to mark as read", "error");
    }
  };

  // Delete notification (admin only)
  const deleteNotification = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the notification.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/api/notifications/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchNotifications();
        Swal.fire("Deleted!", "Notification deleted.", "success");
      } catch (err) {
        Swal.fire("Error", "Failed to delete notification", "error");
      }
    }
  };

  // Create notification (admin only)
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/notifications", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCreateModal(false);
      setFormData({ title: "", message: "", type: "info", targetAudience: "all" });
      fetchNotifications();
      Swal.fire("Success", "Notification created!", "success");
    } catch (err) {
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error || err.message;
      const details = err?.response?.data?.details ? `<br/><pre>${JSON.stringify(err.response.data.details, null, 2)}</pre>` : '';
      Swal.fire({ icon: 'error', title: 'Failed to create notification', html: `${serverMsg}${details}` });
    }
  };

  useEffect(() => {
    fetchNotifications();
    // join admin room for real-time updates
    const s = socketRef?.current;
    // eslint-disable-next-line
  }, []);

  // socket setup for real-time updates (admin)
  const { socketRef } = useSocket();

  useEffect(() => {
    let mounted = true;

    const setupSocket = (s) => {
      if (!mounted || !s) return;

      // join admins room so server can target admin notifications
      s.emit('join', 'admins');

      const onNew = (notification) => {
        setNotifications(prev => [notification, ...(prev || [])]);
      };
      const onDeleted = ({ notificationId }) => {
        setNotifications(prev => (prev || []).filter(n => n._id !== notificationId));
      };
      const onRead = ({ notificationId, userId }) => {
        setNotifications(prev => (prev || []).map(n => n._id === notificationId ? { ...n, readBy: [...(n.readBy||[]), userId] } : n));
      };

      s.on('notification:new', onNew);
      s.on('notification:deleted', onDeleted);
      s.on('notification:read', onRead);

      // cleanup helper
      const cleanup = () => {
        s.off('notification:new', onNew);
        s.off('notification:deleted', onDeleted);
        s.off('notification:read', onRead);
        try { s.emit('leave', 'admins'); } catch (e) { /* ignore */ }
      };

      return cleanup;
    };

    // If socket is ready, attach immediately. Otherwise poll briefly until it appears.
    if (socketRef.current) {
      const cleanup = setupSocket(socketRef.current);
      return () => {
        mounted = false;
        if (cleanup) cleanup();
      };
    }

    const interval = setInterval(() => {
      if (socketRef.current) {
        clearInterval(interval);
        const cleanup = setupSocket(socketRef.current);
        // ensure we clean up if the component unmounts later
        return () => {
          mounted = false;
          if (cleanup) cleanup();
        };
      }
    }, 200);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketRef]);

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-4">
        <FontAwesomeIcon icon={faBell} className="text-primary me-2" size="lg" />
        <h4 className="fw-bold mb-0">Notifications</h4>
        <span className="badge bg-primary ms-2">{notifications.length}</span>
        {user?.role === "admin" && (
          <button
            className="btn btn-primary btn-sm ms-auto d-flex align-items-center"
            onClick={() => setShowCreateModal(true)}
          >
            <FontAwesomeIcon icon={faPlus} className="me-1" />
            New Notification
          </button>
        )}
      </div>
      {/* Search & Filters toolbar */}
      <div className="d-flex gap-2 align-items-center mb-3">
        <div className="input-group" style={{ maxWidth: 360 }}>
          <span className="input-group-text">Search</span>
          <input
            type="search"
            className="form-control"
            placeholder="Search by title or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn btn-outline-secondary" onClick={() => setSearchQuery("")}>Clear</button>
        </div>

        <select className="form-select" style={{ maxWidth: 160 }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All types</option>
          <option value="info">Info</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>

        <select className="form-select" style={{ maxWidth: 160 }} value={filterAudience} onChange={(e) => setFilterAudience(e.target.value)}>
          <option value="all">All audiences</option>
          <option value="allUsers">All</option>
          <option value="admins">Admins</option>
          <option value="students">Students</option>
        </select>

        <select className="form-select" style={{ maxWidth: 140 }} value={filterRead} onChange={(e) => setFilterRead(e.target.value)}>
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>

        <div className="ms-auto d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={() => fetchNotifications()} disabled={loading}>
            Refresh
          </button>
          <button className="btn btn-secondary" onClick={() => { setSearchQuery(""); setFilterType("all"); setFilterAudience("all"); setFilterRead("all"); }}>
            Reset
          </button>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-5">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-primary mb-3" />
          <p>Loading notifications...</p>
        </div>
      ) : (
        (() => {
          const q = (searchQuery || "").trim().toLowerCase();
          const filtered = (notifications || []).filter(n => {
            if (q) {
              const hay = `${n.title || ''} ${n.message || ''}`.toLowerCase();
              if (!hay.includes(q)) return false;
            }
            if (filterType !== 'all' && (n.type || '').toLowerCase() !== filterType) return false;
            if (filterAudience !== 'all' && filterAudience !== 'allUsers') {
              if ((n.targetAudience || '').toLowerCase() !== filterAudience) return false;
            }
            if (filterRead === 'read' && !n.read) return false;
            if (filterRead === 'unread' && n.read) return false;
            return true;
          });

          if (!filtered || filtered.length === 0) {
            return (
              <div className="alert alert-info d-flex align-items-center">
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                No notifications found.
              </div>
            );
          }

          return (
            <div>
              <div className="small text-muted mb-2">Showing {filtered.length} of {notifications.length} notifications</div>
              <div className="list-group shadow-sm">
                {filtered.map((n) => (
                  <div
                    key={n._id}
                    className={`list-group-item d-flex justify-content-between align-items-start ${n.read ? "" : "bg-light"}`}
                  >
                    <div className="d-flex align-items-center" style={{ cursor: "pointer" }} onClick={() => openDetailsModal(n)}>
                      <FontAwesomeIcon
                        icon={faBell}
                        className={`me-3 ${n.read ? "text-secondary" : "text-primary"}`}
                        size="lg"
                      />
                      <div>
                        <div className="fw-bold">{n.title || "Notification"}</div>
                        <div className="text-muted small">{n.message}</div>
                        <div className="text-muted small">{new Date(n.createdAt).toLocaleString()}</div>
                        <div>
                          <span className={`badge bg-${n.type === "success"
                            ? "success"
                            : n.type === "warning"
                            ? "warning"
                            : n.type === "error"
                            ? "danger"
                            : "info"
                          } me-2`}>
                            {n.type}
                          </span>
                          <span className="badge bg-secondary">{n.targetAudience}</span>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      {!n.read && (
                        <button
                          className="btn btn-outline-success btn-sm"
                          onClick={() => markAsRead(n._id)}
                        >
                          <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                          Mark as Read
                        </button>
                      )}
                      {user?.role === "admin" && (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => deleteNotification(n._id)}
                        >
                          <FontAwesomeIcon icon={faTrash} className="me-1" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()
      )}

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleCreate}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Create Notification
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Message</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      required
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Type</label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Target Audience</label>
                    <select
                      className="form-select"
                      value={formData.targetAudience}
                      onChange={e => setFormData({ ...formData, targetAudience: e.target.value })}
                    >
                      <option value="all">All</option>
                      <option value="admins">Admins</option>
                      <option value="students">Students</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <FontAwesomeIcon icon={faPlus} className="me-1" />
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Notification Details Modal */}
      {showDetailsModal && selectedNotification && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <FontAwesomeIcon icon={faEnvelopeOpenText} className="me-2 text-primary" />
                  Notification Details
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
              </div>
              <div className="modal-body">
                <h6 className="fw-bold">{selectedNotification.title}</h6>
                <p>{selectedNotification.message}</p>
                <div className="mb-2">
                  <span className={`badge bg-${selectedNotification.type === "success"
                    ? "success"
                    : selectedNotification.type === "warning"
                    ? "warning"
                    : selectedNotification.type === "error"
                    ? "danger"
                    : "info"
                  } me-2`}>
                    {selectedNotification.type}
                  </span>
                  <span className="badge bg-secondary">{selectedNotification.targetAudience}</span>
                </div>
                <div className="text-muted small">
                  Sent: {new Date(selectedNotification.createdAt).toLocaleString()}
                </div>
                <div className="text-muted small">
                  Status: {selectedNotification.read ? "Read" : "Unread"}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
                  <FontAwesomeIcon icon={faTimes} className="me-1" />
                  Close
                </button>
                {!selectedNotification.read && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => {
                      markAsRead(selectedNotification._id);
                      setShowDetailsModal(false);
                    }}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                    Mark as Read
                  </button>
                )}
                {user?.role === "admin" && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      setShowDetailsModal(false);
                      deleteNotification(selectedNotification._id);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} className="me-1" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;