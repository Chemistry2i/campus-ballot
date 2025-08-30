import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHistory,
  faSearch,
  faFilter,
  faEye,
  faTrash,
  faPlus,
  faDownload,
  faRefresh,
  faCalendarAlt,
  faUser,
  faCog,
  faExclamationTriangle,
  faInfoCircle,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faSort,
  faSortUp,
  faSortDown,
  faClock,
  faServer,
  faShieldAlt,
  faUserTie
} from "@fortawesome/free-solid-svg-icons";

// Set axios base URL
axios.defaults.baseURL = "http://localhost:5000";

function Logs({ user }) {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [sortField, setSortField] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(10);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [stats, setStats] = useState({
    total: 0,
    info: 0,
    warning: 0,
    error: 0,
    success: 0
  });

  // Form state for creating new log
  const [formData, setFormData] = useState({
    action: "create",
    entityType: "Log",
    entityId: "",
    details: "",
    status: "success",
    ipAddress: "",
    userAgent: ""
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterAndSortLogs();
  }, [logs, searchTerm, levelFilter, actionFilter, dateFilter, sortField, sortOrder]);

  // Auto-refresh functionality
  useEffect(() => {
    let intervalId;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchLogs();
      }, refreshInterval * 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh, refreshInterval]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get("/api/logs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setLogs(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
      Swal.fire("Error", "Failed to load logs", "error");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (logsData) => {
    const stats = {
      total: logsData.length,
      info: logsData.filter(log => log.status === 'success' && !log.errorMessage).length,
      warning: logsData.filter(log => log.status === 'success' && log.errorMessage).length,
      error: logsData.filter(log => log.status === 'failure').length,
      success: logsData.filter(log => log.status === 'success').length
    };
    setStats(stats);
  };

  const filterAndSortLogs = () => {
    let filtered = [...logs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress?.includes(searchTerm)
      );
    }

    // Level filter (using status field)
    if (levelFilter !== "all") {
      if (levelFilter === "error") {
        filtered = filtered.filter(log => log.status === 'failure');
      } else if (levelFilter === "success") {
        filtered = filtered.filter(log => log.status === 'success' && !log.errorMessage);
      } else if (levelFilter === "warning") {
        filtered = filtered.filter(log => log.status === 'success' && log.errorMessage);
      }
    }

    // Action filter
    if (actionFilter !== "all") {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(log => {
        const logDate = new Date(log.createdAt || log.timestamp);
        return logDate.toDateString() === filterDate.toDateString();
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'timestamp' || sortField === 'createdAt') {
        aValue = new Date(aValue || a.createdAt);
        bValue = new Date(bValue || b.createdAt);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    // Map frontend field names to backend field names
    let actualField = field;
    if (field === 'timestamp') {
      actualField = 'createdAt';
    }
    
    if (sortField === actualField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(actualField);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return faSort;
    return sortOrder === 'asc' ? faSortUp : faSortDown;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post("/api/logs", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire("Success", "Log entry created successfully!", "success");
      setShowCreateModal(false);
      resetForm();
      fetchLogs();
    } catch (error) {
      console.error("Error creating log:", error);
      Swal.fire("Error", "Failed to create log entry", "error");
    }
  };

  const handleDelete = async (logId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete this log entry",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/logs/${logId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        Swal.fire("Deleted!", "Log entry has been deleted.", "success");
        fetchLogs();
      } catch (error) {
        console.error("Error deleting log:", error);
        Swal.fire("Error", "Failed to delete log entry", "error");
      }
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchLogs();
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/logs/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setLogs(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error("Error searching logs:", error);
      Swal.fire("Error", "Failed to search logs", "error");
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Timestamp,Status,Action,Entity Type,Details,User,IP Address\n"
      + filteredLogs.map(log => 
          `"${formatDateTime(log.createdAt || log.timestamp)}","${log.status}","${log.action}","${log.entityType}","${log.details || ''}","${log.user?.name || ''}","${log.ipAddress || ''}"`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openDetailsModal = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({
      action: "create",
      entityType: "Log",
      entityId: "",
      details: "",
      status: "success",
      ipAddress: "",
      userAgent: ""
    });
  };

  const getLevelBadge = (log) => {
    // Determine level based on status and errorMessage
    let level = 'info';
    let config;
    
    if (log.status === 'failure') {
      level = 'error';
      config = { class: "bg-danger", icon: faTimesCircle, text: "Error" };
    } else if (log.status === 'success' && log.errorMessage) {
      level = 'warning';
      config = { class: "bg-warning text-dark", icon: faExclamationTriangle, text: "Warning" };
    } else if (log.status === 'success') {
      level = 'success';
      config = { class: "bg-success", icon: faCheckCircle, text: "Success" };
    } else {
      config = { class: "bg-info", icon: faInfoCircle, text: "Info" };
    }
    
    return (
      <span className={`badge ${config.class} d-flex align-items-center`}>
        <FontAwesomeIcon icon={config.icon} className="me-1" size="xs" />
        {config.text}
      </span>
    );
  };

  const getActionIcon = (action) => {
    const actionIcons = {
      'login': faUser,
      'logout': faUser,
      'create': faPlus,
      'update': faCog,
      'delete': faTrash,
      'vote': faCheckCircle,
      'admin': faShieldAlt,
      'system': faServer,
      'maintenance': faCog,
      'backup': faDownload,
      'security': faShieldAlt,
      'configuration': faCog,
      'view': faEye
    };
    
    return actionIcons[action.toLowerCase()] || faInfoCircle;
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const logTime = new Date(dateString);
    const diffInMinutes = Math.floor((now - logTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-primary mb-3" />
          <p>Loading logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-2 px-md-4">
      {/* Enhanced Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: '15px' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="fw-bold text-primary mb-1 d-flex align-items-center">
                    <FontAwesomeIcon icon={faHistory} className="me-2" />
                    System Logs
                    <span className="badge bg-primary ms-2 d-none d-md-inline">{stats.total}</span>
                  </h4>
                  <p className="text-muted mb-0 small">Monitor and manage system activities and events</p>
                  {autoRefresh && (
                    <small className="text-success d-flex align-items-center mt-1">
                      <FontAwesomeIcon icon={faSpinner} spin className="me-1" />
                      Auto-refreshing every {refreshInterval}s
                    </small>
                  )}
                </div>
                <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-lg-auto">
                  {/* Auto-refresh Controls */}
                  <div className="d-flex align-items-center gap-2">
                    <label className="form-check-label small text-nowrap" htmlFor="autoRefresh">
                      Auto-refresh:
                    </label>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="autoRefresh"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                      />
                    </div>
                    {autoRefresh && (
                      <select 
                        className="form-select form-select-sm" 
                        style={{ width: 'auto' }}
                        value={refreshInterval}
                        onChange={(e) => setRefreshInterval(Number(e.target.value))}
                      >
                        <option value={10}>10s</option>
                        <option value={30}>30s</option>
                        <option value={60}>1m</option>
                        <option value={300}>5m</option>
                      </select>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className="btn btn-outline-success btn-sm d-flex align-items-center"
                      onClick={exportLogs}
                      title="Export to CSV"
                    >
                      <FontAwesomeIcon icon={faDownload} className="me-1 d-none d-sm-inline" />
                      <span className="d-none d-sm-inline">Export</span>
                      <FontAwesomeIcon icon={faDownload} className="d-sm-none" />
                    </button>
                    <button
                      className="btn btn-outline-primary btn-sm d-flex align-items-center"
                      onClick={fetchLogs}
                      disabled={loading}
                      title="Refresh logs"
                    >
                      <FontAwesomeIcon 
                        icon={faRefresh} 
                        className={`me-1 d-none d-sm-inline ${loading ? 'fa-spin' : ''}`} 
                      />
                      <span className="d-none d-sm-inline">Refresh</span>
                      <FontAwesomeIcon 
                        icon={faRefresh} 
                        className={`d-sm-none ${loading ? 'fa-spin' : ''}`} 
                      />
                    </button>
                    <button
                      className="btn btn-primary btn-sm d-flex align-items-center"
                      onClick={() => setShowCreateModal(true)}
                      title="Add admin log"
                    >
                      <FontAwesomeIcon icon={faPlus} className="me-1 d-none d-sm-inline" />
                      <span className="d-none d-sm-inline">Add Log</span>
                      <FontAwesomeIcon icon={faPlus} className="d-sm-none" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="alert alert-info border-0 shadow-sm">
            <div className="d-flex align-items-start">
              <FontAwesomeIcon icon={faInfoCircle} className="text-info me-3 mt-1" />
              <div>
                <h6 className="fw-bold mb-2">About System Logs</h6>
                <p className="mb-2 small">
                  <strong>Automatic Logs:</strong> Most actions (logins, votes, data changes) are logged automatically by the system.
                </p>
                <p className="mb-0 small">
                  <strong>Manual Admin Logs:</strong> Use "Add Admin Log" only for administrative actions like system maintenance, 
                  manual data corrections, security incidents, or configuration changes that need documentation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                  <FontAwesomeIcon icon={faHistory} className="text-primary" size="lg" />
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h4 className="fw-bold mb-0">{stats.total}</h4>
                <p className="text-muted mb-0 small">Total Logs</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="bg-danger bg-opacity-10 rounded-circle p-3">
                  <FontAwesomeIcon icon={faTimesCircle} className="text-danger" size="lg" />
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h4 className="fw-bold mb-0">{stats.error}</h4>
                <p className="text-muted mb-0 small">Errors</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning" size="lg" />
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h4 className="fw-bold mb-0">{stats.warning}</h4>
                <p className="text-muted mb-0 small">Warnings</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="bg-success bg-opacity-10 rounded-circle p-3">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-success" size="lg" />
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h4 className="fw-bold mb-0">{stats.success}</h4>
                <p className="text-muted mb-0 small">Success</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {/* Enhanced Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-header bg-light border-0 py-3" style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
              <h6 className="fw-bold mb-0 d-flex align-items-center">
                <FontAwesomeIcon icon={faFilter} className="me-2 text-primary" />
                Filters & Search
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12 col-md-6 col-lg-4">
                  <label className="form-label small fw-semibold">Search</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <FontAwesomeIcon icon={faSearch} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search logs by action, message, user ID, or IP..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                </div>
                <div className="col-6 col-md-3 col-lg-2">
                  <label className="form-label small fw-semibold">Level</label>
                  <select
                    className="form-select"
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                  >
                    <option value="all">All Levels</option>
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div className="col-6 col-md-3 col-lg-2">
                  <label className="form-label small fw-semibold">Action</label>
                  <select
                    className="form-select"
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                  >
                    <option value="all">All Actions</option>
                    <option value="login">Login</option>
                    <option value="logout">Logout</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="delete">Delete</option>
                    <option value="vote">Vote</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="backup">Backup</option>
                    <option value="security">Security</option>
                    <option value="configuration">Configuration</option>
                  </select>
                </div>
                <div className="col-12 col-md-6 col-lg-2">
                  <label className="form-label small fw-semibold">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-2">
                  <label className="form-label small fw-semibold">&nbsp;</label>
                  <div className="d-grid">
                    <button 
                      className="btn btn-primary"
                      onClick={handleSearch}
                      disabled={loading}
                    >
                      <FontAwesomeIcon 
                        icon={loading ? faSpinner : faSearch} 
                        className={`me-2 ${loading ? 'fa-spin' : ''}`} 
                      />
                      {loading ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Quick Filter Pills */}
              <div className="mt-3 pt-3 border-top">
                <small className="text-muted fw-semibold mb-2 d-block">Quick Filters:</small>
                <div className="d-flex flex-wrap gap-2">
                  <button 
                    className={`btn btn-sm ${levelFilter === 'error' ? 'btn-danger' : 'btn-outline-danger'}`}
                    onClick={() => setLevelFilter(levelFilter === 'error' ? 'all' : 'error')}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
                    Errors ({stats.error})
                  </button>
                  <button 
                    className={`btn btn-sm ${levelFilter === 'warning' ? 'btn-warning' : 'btn-outline-warning'}`}
                    onClick={() => setLevelFilter(levelFilter === 'warning' ? 'all' : 'warning')}
                  >
                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
                    Warnings ({stats.warning})
                  </button>
                  <button 
                    className={`btn btn-sm ${actionFilter === 'vote' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setActionFilter(actionFilter === 'vote' ? 'all' : 'vote')}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                    Votes
                  </button>
                  <button 
                    className={`btn btn-sm ${actionFilter === 'login' ? 'btn-info' : 'btn-outline-info'}`}
                    onClick={() => setActionFilter(actionFilter === 'login' ? 'all' : 'login')}
                  >
                    <FontAwesomeIcon icon={faUser} className="me-1" />
                    Logins
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Logs Table */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-header bg-white border-0 py-3" style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
                <h5 className="mb-0 fw-bold d-flex align-items-center">
                  <FontAwesomeIcon icon={faHistory} className="me-2 text-primary" />
                  Activity Logs
                </h5>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary fs-6">{filteredLogs.length} entries</span>
                  {filteredLogs.length > 0 && (
                    <small className="text-muted">
                      Page {currentPage} of {totalPages}
                    </small>
                  )}
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              {currentLogs.length === 0 ? (
                <div className="text-center py-5">
                  <FontAwesomeIcon icon={faHistory} size="3x" className="text-muted mb-3" />
                  <h5 className="text-muted">No logs found</h5>
                  <p className="text-muted">
                    {searchTerm || levelFilter !== 'all' || actionFilter !== 'all' || dateFilter 
                      ? 'No log entries match your current filters' 
                      : 'No log entries available at the moment'}
                  </p>
                  {(searchTerm || levelFilter !== 'all' || actionFilter !== 'all' || dateFilter) && (
                    <button 
                      className="btn btn-outline-primary btn-sm mt-2"
                      onClick={() => {
                        setSearchTerm('');
                        setLevelFilter('all');
                        setActionFilter('all');
                        setDateFilter('');
                      }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="d-none d-lg-block">
                    <div className="table-responsive">
                      <table className="table table-hover table-bordered mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th className="fw-bold border-end" 
                                style={{ cursor: 'pointer', minWidth: '180px' }}
                                onClick={() => handleSort('createdAt')}>
                              <FontAwesomeIcon icon={getSortIcon('createdAt')} className="me-2" />
                              Timestamp
                            </th>
                            <th className="fw-bold border-end"
                                style={{ cursor: 'pointer', minWidth: '100px' }}
                                onClick={() => handleSort('status')}>
                              <FontAwesomeIcon icon={getSortIcon('status')} className="me-2" />
                              Status
                            </th>
                            <th className="fw-bold border-end"
                                style={{ cursor: 'pointer', minWidth: '120px' }}
                                onClick={() => handleSort('action')}>
                              <FontAwesomeIcon icon={getSortIcon('action')} className="me-2" />
                              Action
                            </th>
                            <th className="fw-bold border-end" style={{ minWidth: '100px' }}>Entity Type</th>
                            <th className="fw-bold border-end" style={{ minWidth: '200px' }}>Details</th>
                            <th className="fw-bold border-end" style={{ minWidth: '100px' }}>User</th>
                            <th className="fw-bold border-end" style={{ minWidth: '120px' }}>IP Address</th>
                            <th className="fw-bold text-center" style={{ minWidth: '100px' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentLogs.map((log) => (
                            <tr key={log._id}>
                              <td className="border-end">
                                <div>
                                  <small className="fw-bold">{formatDateTime(log.createdAt || log.timestamp)}</small>
                                  <br />
                                  <small className="text-muted">
                                    <FontAwesomeIcon icon={faClock} className="me-1" />
                                    {formatTimeAgo(log.createdAt || log.timestamp)}
                                  </small>
                                </div>
                              </td>
                              <td className="border-end">{getLevelBadge(log)}</td>
                              <td className="border-end">
                                <div className="d-flex align-items-center">
                                  <FontAwesomeIcon 
                                    icon={getActionIcon(log.action)} 
                                    className="me-2 text-muted" 
                                  />
                                  <span className="fw-bold">{log.action}</span>
                                </div>
                              </td>
                              <td className="border-end">
                                <span className="badge bg-secondary">
                                  {log.entityType}
                                </span>
                              </td>
                              <td className="border-end">
                                <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                                  {log.details || 'No details'}
                                </span>
                              </td>
                              <td className="border-end">
                                {log.user ? (
                                  <span className="badge bg-info">
                                    <FontAwesomeIcon icon={faUserTie} className="me-1" />
                                    {log.user.name}
                                  </span>
                                ) : (
                                  <span className="text-muted">System</span>
                                )}
                              </td>
                              <td className="border-end">
                                <small className="text-muted font-monospace">
                                  {log.ipAddress || 'N/A'}
                                </small>
                              </td>
                              <td>
                                <div className="d-flex justify-content-center gap-1">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => openDetailsModal(log)}
                                    title="View Details"
                                  >
                                    <FontAwesomeIcon icon={faEye} />
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDelete(log._id)}
                                    title="Delete Log"
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Card View */}
                  <div className="d-lg-none">
                    {currentLogs.map((log) => (
                      <div key={log._id} className="card border-0 border-bottom rounded-0 shadow-sm mb-2">
                        <div className="card-body py-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="d-flex align-items-center gap-2">
                              <FontAwesomeIcon 
                                icon={getActionIcon(log.action)} 
                                className="text-muted" 
                              />
                              <span className="fw-bold">{log.action}</span>
                              <span className="badge bg-secondary small">{log.entityType}</span>
                            </div>
                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => openDetailsModal(log)}
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(log._id)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </div>
                          <div className="mb-2">
                            {getLevelBadge(log)}
                          </div>
                          <div className="small text-muted mb-2">
                            <div className="d-flex justify-content-between">
                              <span>
                                <FontAwesomeIcon icon={faClock} className="me-1" />
                                {formatTimeAgo(log.createdAt || log.timestamp)}
                              </span>
                              {log.user && (
                                <span>
                                  <FontAwesomeIcon icon={faUserTie} className="me-1" />
                                  {log.user.name}
                                </span>
                              )}
                            </div>
                          </div>
                          {log.details && (
                            <div className="small text-muted">
                              <strong>Details:</strong> {log.details}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center p-3 border-top">
                  <div>
                    <small className="text-muted">
                      Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} entries
                    </small>
                  </div>
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                      </li>
                      {[...Array(totalPages)].map((_, index) => (
                        <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => paginate(index + 1)}
                          >
                            {index + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Log Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Create Administrative Log Entry
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Action *</label>
                      <select
                        className="form-select"
                        value={formData.action}
                        onChange={(e) => setFormData({...formData, action: e.target.value})}
                        required
                      >
                        <option value="create">Create</option>
                        <option value="update">Update</option>
                        <option value="delete">Delete</option>
                        <option value="view">View</option>
                        <option value="login">Login</option>
                        <option value="logout">Logout</option>
                        <option value="maintenance">System Maintenance</option>
                        <option value="backup">Data Backup</option>
                        <option value="security">Security Event</option>
                        <option value="configuration">Configuration Change</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Entity Type *</label>
                      <select
                        className="form-select"
                        value={formData.entityType}
                        onChange={(e) => setFormData({...formData, entityType: e.target.value})}
                        required
                      >
                        <option value="User">User</option>
                        <option value="Election">Election</option>
                        <option value="Candidate">Candidate</option>
                        <option value="Vote">Vote</option>
                        <option value="Notification">Notification</option>
                        <option value="Log">Log</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Status *</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        required
                      >
                        <option value="success">Success</option>
                        <option value="failure">Failure</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Entity ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.entityId}
                        onChange={(e) => setFormData({...formData, entityId: e.target.value})}
                        placeholder="Entity ID (optional)"
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label fw-bold">Details *</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.details}
                        onChange={(e) => setFormData({...formData, details: e.target.value})}
                        required
                        placeholder="Describe what administrative action was performed and why..."
                      ></textarea>
                      <small className="text-muted">
                        Example: "Performed system maintenance to update election security protocols" or "Manually corrected vote count after system error"
                      </small>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">IP Address</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.ipAddress}
                        onChange={(e) => setFormData({...formData, ipAddress: e.target.value})}
                        placeholder="IP Address"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">User Agent</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.userAgent}
                        onChange={(e) => setFormData({...formData, userAgent: e.target.value})}
                        placeholder="User Agent"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Create Admin Log
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {showDetailsModal && selectedLog && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <FontAwesomeIcon icon={faEye} className="me-2" />
                  Log Details
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="fw-bold">Timestamp</h6>
                        <p className="mb-0">{formatDateTime(selectedLog.createdAt || selectedLog.timestamp)}</p>
                        <small className="text-muted">{formatTimeAgo(selectedLog.createdAt || selectedLog.timestamp)}</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="fw-bold">Status</h6>
                        {getLevelBadge(selectedLog)}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="fw-bold">Action</h6>
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon 
                            icon={getActionIcon(selectedLog.action)} 
                            className="me-2" 
                          />
                          {selectedLog.action}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="fw-bold">Entity Type</h6>
                        <span className="badge bg-secondary">{selectedLog.entityType}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="fw-bold">User</h6>
                        <p className="mb-0">{selectedLog.user?.name || 'System'}</p>
                        {selectedLog.user?.email && (
                          <small className="text-muted">{selectedLog.user.email}</small>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="fw-bold">Entity ID</h6>
                        <p className="mb-0 font-monospace">{selectedLog.entityId || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="fw-bold">Details</h6>
                        <p className="mb-0">{selectedLog.details || 'No additional details'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="fw-bold">IP Address</h6>
                        <p className="mb-0 font-monospace">{selectedLog.ipAddress || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="fw-bold">User Agent</h6>
                        <p className="mb-0 small">{selectedLog.userAgent || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  {selectedLog.errorMessage && (
                    <div className="col-12 mb-3">
                      <div className="card bg-danger bg-opacity-10 border-danger">
                        <div className="card-body">
                          <h6 className="fw-bold text-danger">Error Message</h6>
                          <p className="mb-0 text-danger">{selectedLog.errorMessage}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleDelete(selectedLog._id);
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  Delete Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Logs;
