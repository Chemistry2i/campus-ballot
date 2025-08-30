import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

// Set axios base URL
axios.defaults.baseURL = "http://localhost:5000";
import {
  FaSignOutAlt,
  FaUserCircle,
  FaVoteYea,
  FaCheckCircle,
  FaUserGraduate,
  FaEnvelope,
  FaIdBadge,
  FaPoll,
  FaUsers,
  FaChartBar,
  FaClock,
  FaCalendarAlt,
  FaEye,
  FaInfoCircle,
  FaHistory,
  FaTrophy,
  FaSearch,
  FaFilter,
  FaBell,
  FaNewspaper,
  FaUserEdit,
  FaLock,
  FaUnlock,
  FaStar,
  FaThumbsUp,
  FaShareAlt,
  FaDownload,
  FaExclamationTriangle,
  FaPlay,
  FaStop,
  FaEdit,
  FaSave,
  FaCog,
  FaFileAlt,
  FaBars,
  FaTimes,
  FaHome,
  FaArrowUp,
  FaUser
} from "react-icons/fa";

function StudentDashboard({ user }) {
  const [elections, setElections] = useState([]);
  const [myVotes, setMyVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState(null);
  const [showElectionDetails, setShowElectionDetails] = useState(false);
  const [showElectionModal, setShowElectionModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [electionStats, setElectionStats] = useState({
    total: 0,
    participated: 0,
    upcoming: 0,
    completed: 0
  });
  
  // Auto-refresh functionality
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds default
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchElections();
    fetchMyVotes();
    fetchNotifications();
    // eslint-disable-next-line
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    let interval;
    if (isAutoRefresh) {
      interval = setInterval(() => {
        fetchElections();
        fetchMyVotes();
        fetchNotifications();
        setLastRefresh(new Date());
      }, refreshInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh, refreshInterval]);

  const refreshData = () => {
    fetchElections();
    fetchMyVotes();
    fetchNotifications();
    setLastRefresh(new Date());
  };

  const fetchElections = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/elections", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setElections(res.data);
      calculateElectionStats(res.data);
    } catch (err) {
      Swal.fire("Error", "Failed to load elections", "error");
    } finally {
      setLoading(false);
    }
  };

  const calculateElectionStats = (electionsData) => {
    const now = new Date();
    const stats = {
      total: electionsData.length,
      participated: myVotes.length,
      upcoming: electionsData.filter(e => new Date(e.startDate) > now).length,
      completed: electionsData.filter(e => new Date(e.endDate) < now).length
    };
    setElectionStats(stats);
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const fetchMyVotes = async () => {
    try {
      const res = await axios.get("/api/votes/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyVotes(res.data);
    } catch (err) {
      console.error("Failed to fetch votes:", err);
    }
  };

  const filteredElections = elections.filter((election) => {
    const matchesSearch = election.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         election.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || getElectionStatus(election).status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getElectionStatus = (election) => {
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);

    if (now < startDate) {
      return { status: "upcoming", color: "warning", icon: FaClock };
    } else if (now >= startDate && now <= endDate) {
      return { status: "active", color: "success", icon: FaPlay };
    } else {
      return { status: "completed", color: "secondary", icon: FaStop };
    }
  };

  const formatTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff < 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return "Ending soon";
  };

  const openElectionDetails = (election) => {
    setSelectedElection(election);
    setShowElectionModal(true);
  };

  const openProfileEdit = () => {
    setShowProfile(true);
  };

  const handleVote = async (electionId, candidateId) => {
    const result = await Swal.fire({
      title: 'Confirm Your Vote',
      text: 'Are you sure you want to cast this vote? This action cannot be undone.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Cast Vote',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      await axios.post(
        `/api/votes`,
        { electionId: electionId, candidateId: candidateId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Swal.fire({
        title: 'Vote Cast Successfully!',
        text: 'Thank you for participating in the democratic process.',
        icon: 'success',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      
      fetchMyVotes();
      fetchElections();
      calculateElectionStats(elections);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to vote", "error");
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartBar, badge: null },
    { id: 'elections', label: 'Elections', icon: FaPoll, badge: electionStats.total },
    { id: 'my-votes', label: 'My Votes', icon: FaVoteYea, badge: myVotes.length },
    { id: 'notifications', label: 'Notifications', icon: FaBell, badge: notifications.filter(n => !n.read).length },
    { id: 'profile', label: 'Profile', icon: FaUserCircle, badge: null },
    { id: 'history', label: 'History', icon: FaHistory, badge: null },
  ];

  const renderActiveView = () => {
    switch(activeView) {
      case 'dashboard':
        return renderDashboardView();
      case 'elections':
        return renderElectionsView();
      case 'my-votes':
        return renderMyVotesView();
      case 'notifications':
        return renderNotificationsView();
      case 'profile':
        return renderProfileView();
      case 'history':
        return renderHistoryView();
      default:
        return renderDashboardView();
    }
  };

  const renderDashboardView = () => (
    <div style={{ width: "100%", maxWidth: "100%", overflowX: "hidden", margin: 0, padding: 0 }}>
      {/* Statistics Cards - 8 cards in single row */}
      <div className="row g-2 g-md-3 mb-4">
        <div className="col-6 col-md-3 col-lg-3 col-xl-1-5">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '5px' }}>
            <div className="card-body d-flex align-items-center flex-column justify-content-center p-2 p-md-3">
              <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                <FaPoll className="text-primary" size={16} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h5 className="fw-bold mb-0 fs-6">{electionStats.total}</h5>
                <p className="text-muted mb-0 small text-truncate">Elections</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg-3 col-xl-1-5">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '5px' }}>
            <div className="card-body d-flex align-items-center p-2 p-md-3">
              <div className="bg-success bg-opacity-10 rounded-circle p-2 me-2">
                <FaCheckCircle className="text-success" size={16} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h5 className="fw-bold mb-0 fs-6">{electionStats.participated}</h5>
                <p className="text-muted mb-0 small text-truncate">Voted</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg-3 col-xl-1-5">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '5px' }}>
            <div className="card-body d-flex align-items-center p-2 p-md-3">
              <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-2">
                <FaClock className="text-warning" size={16} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h5 className="fw-bold mb-0 fs-6">{electionStats.upcoming}</h5>
                <p className="text-muted mb-0 small text-truncate">Upcoming</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg-3 col-xl-1-5">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '5px' }}>
            <div className="card-body d-flex align-items-center p-2 p-md-3">
              <div className="bg-secondary bg-opacity-10 rounded-circle p-2 me-2">
                <FaTrophy className="text-secondary" size={16} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h5 className="fw-bold mb-0 fs-6">{electionStats.completed}</h5>
                <p className="text-muted mb-0 small text-truncate">Complete</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg-3 col-xl-1-5">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '5px' }}>
            <div className="card-body d-flex align-items-center p-2 p-md-3">
              <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                <FaVoteYea className="text-primary" size={16} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h5 className="fw-bold mb-0 fs-6">{myVotes.length}</h5>
                <p className="text-muted mb-0 small text-truncate">My Votes</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg-3 col-xl-1-5">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '5px' }}>
            <div className="card-body d-flex align-items-center p-2 p-md-3">
              <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                <FaBell className="text-primary" size={16} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h5 className="fw-bold mb-0 fs-6">{notifications.length}</h5>
                <p className="text-muted mb-0 small text-truncate">Notifications</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg-3 col-xl-1-5">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '5px' }}>
            <div className="card-body d-flex align-items-center p-2 p-md-3">
              <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-2">
                <FaBell className="text-warning" size={16} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h5 className="fw-bold mb-0 fs-6">{notifications.filter(n => !n.read).length}</h5>
                <p className="text-muted mb-0 small text-truncate">Unread</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg-3 col-xl-1-5">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '5px' }}>
            <div className="card-body d-flex align-items-center p-2 p-md-3">
              <div className="bg-success bg-opacity-10 rounded-circle p-2 me-2">
                <FaTrophy className="text-success" size={16} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h5 className="fw-bold mb-0 fs-6">
                  {Math.min(100, Math.round((electionStats.participated / Math.max(electionStats.total, 1)) * 100))}%
                </h5>
                <p className="text-muted mb-0 small text-truncate">Engagement</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Elections Quick View */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '5px', maxWidth: "100%", overflowX: "hidden" }}>
        <div className="card-header bg-white border-0 py-3">
          <h3 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <FaPoll className="text-primary" /> Recent Elections
          </h3>
        </div>
        <div className="card-body p-3">
          <div className="table-responsive">
            {filteredElections.slice(0, 3).map((election) => {
              const { status, color, icon: StatusIcon } = getElectionStatus(election);
              const voted = myVotes.some((v) => v.election === (election._id || election.id));
              
              return (
                <div key={election._id} className="d-flex align-items-center justify-content-between py-3 border-bottom flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: 0 }}>
                    <div className={`bg-${color} bg-opacity-10 rounded-circle p-2 flex-shrink-0`}>
                      <StatusIcon className={`text-${color}`} size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="fw-semibold text-truncate" style={{ maxWidth: "200px" }} title={election.title}>
                        {election.title}
                      </div>
                      <small className="text-muted">{formatTimeRemaining(election.endDate)}</small>
                    </div>
                  </div>
                  <div className="d-flex gap-2 flex-shrink-0">
                    {voted && <span className="badge bg-success">Voted</span>}
                    <span className={`badge bg-${color}`}>{status}</span>
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => openElectionDetails(election)}
                    >
                      <FaEye />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-3">
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={() => setActiveView('elections')}
            >
              View All Elections
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderElectionsView = () => (
    <div className="card shadow-sm border-0" style={{ borderRadius: '5px', width: "100%", maxWidth: "100%", overflowX: "hidden", margin: 0 }}>
      <div className="card-header bg-white border-0 py-3" 
           style={{ borderTopLeftRadius: '5px', borderTopRightRadius: '5px' }}>
        <div className="row align-items-center g-2">
          <div className="col-12 col-md-6 mb-2 mb-md-0">
            <h3 className="fw-bold mb-0 d-flex align-items-center gap-2">
              <FaPoll className="text-primary" /> All Elections
            </h3>
          </div>
          
          <div className="col-12 col-md-6">
            <div className="d-flex flex-column flex-md-row gap-2 justify-content-md-end">
              {/* Auto-refresh controls - Simplified for mobile */}
              <div className="d-flex align-items-center gap-1 mb-2 mb-md-0">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="autoRefresh"
                    checked={isAutoRefresh}
                    onChange={(e) => setIsAutoRefresh(e.target.checked)}
                  />
                  <label className="form-check-label small" htmlFor="autoRefresh">
                    Auto
                  </label>
                </div>
                <select
                  className="form-select form-select-sm"
                  style={{ width: '60px' }}
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                  disabled={!isAutoRefresh}
                >
                  <option value={10000}>10s</option>
                  <option value={30000}>30s</option>
                  <option value={60000}>1m</option>
                </select>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={refreshData}
                  title="Refresh now"
                >
                  <FaCog className={loading ? 'fa-spin' : ''} />
                </button>
              </div>
              
              {/* Search and Filter - Responsive */}
              <div className="d-flex gap-1">
                <div className="input-group" style={{ width: '120px' }}>
                  <span className="input-group-text bg-light border-end-0">
                    <FaSearch className="text-muted" size={12} />
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-sm border-start-0"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select 
                  className="form-select form-select-sm" 
                  style={{ width: '80px' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="upcoming">Soon</option>
                  <option value="active">Active</option>
                  <option value="completed">Done</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card-body p-3 p-md-4" style={{ minHeight: '400px' }}>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <p className="text-muted">Loading elections...</p>
          </div>
        ) : filteredElections.length === 0 ? (
          <div className="text-center py-5">
            <FaNewspaper size={48} className="text-muted mb-3" />
            <h3 className="text-muted">No elections found</h3>
            <p className="text-muted">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'No elections available at the moment'}
            </p>
          </div>
        ) : (
          <div className="row g-3">
            {filteredElections.map((election) => {
              const approvedCandidates = (election.candidates || []).filter(
                (c) => c.status === "approved"
              );
              const voted = myVotes.some((v) => v.election === (election._id || election.id));
              const { status, color, icon: StatusIcon } = getElectionStatus(election);

              return (
                <div key={election._id || election.id} className="col-12">
                  <div className="card border-0 shadow-sm mb-3" 
                       style={{ borderRadius: '5px' }}>
                    <div className="card-body p-3 p-md-4">
                      {/* Election Header */}
                      <div className="row mb-3">
                        <div className="col-12 col-md-8">
                          <div className="d-flex flex-column flex-sm-row align-items-start gap-2 mb-2">
                            <h3 className="fw-bold mb-0 flex-grow-1">{election.title || election.name}</h3>
                            <div className="d-flex gap-2 flex-wrap">
                              <span className={`badge bg-${color} d-flex align-items-center gap-1`}>
                                <StatusIcon size={12} />
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </span>
                              {voted && (
                                <span className="badge bg-success d-flex align-items-center gap-1">
                                  <FaCheckCircle size={12} />
                                  Voted
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-muted mb-2 small">{election.description}</p>
                          
                          {/* Election Dates */}
                          <div className="row g-2 mb-3">
                            <div className="col-sm-6">
                              <small className="text-muted d-flex align-items-center gap-1">
                                <FaCalendarAlt /> Start: {new Date(election.startDate).toLocaleDateString()}
                              </small>
                            </div>
                            <div className="col-sm-6">
                              <small className="text-muted d-flex align-items-center gap-1">
                                <FaClock /> {formatTimeRemaining(election.endDate)}
                              </small>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-12 col-md-4 d-flex justify-content-end">
                          <button 
                            className="btn btn-outline-primary btn-sm w-100 w-md-auto"
                            onClick={() => openElectionDetails(election)}
                          >
                            <FaEye className="me-1" /> Details
                          </button>
                        </div>
                      </div>

                      {/* Candidates Section */}
                      <div>
                        <div className="d-flex flex-column flex-sm-row align-items-start align-sm-center justify-content-between mb-3 gap-2">
                          <h6 className="fw-bold mb-0 d-flex align-items-center gap-1">
                            <FaUsers /> Candidates ({approvedCandidates.length})
                          </h6>
                          {status === 'active' && !voted && (
                            <small className="text-success d-flex align-items-center gap-1">
                              <FaUnlock />
                              Voting is open!
                            </small>
                          )}
                        </div>
                        
                        {approvedCandidates.length > 0 ? (
                          <div className="row g-2">
                            {approvedCandidates.map((candidate) => (
                              <div className="col-sm-6 col-lg-4" key={candidate._id || candidate.id}>
                                <div className="card border shadow-sm h-100" 
                                     style={{ borderRadius: '5px', background: voted ? '#f8f9fa' : 'white' }}>
                                  <div className="card-body p-2 p-md-3">
                                    <div className="d-flex align-items-center mb-2">
                                      <img
                                        src={candidate.photo || "/default-avatar.png"}
                                        alt={candidate.name}
                                        style={{
                                          width: 35,
                                          height: 35,
                                          objectFit: "cover",
                                          borderRadius: "50%",
                                          border: "2px solid #e5e7eb",
                                        }}
                                        className="me-2 flex-shrink-0"
                                      />
                                      <div style={{ minWidth: 0, flex: 1 }}>
                                        <div className="fw-semibold text-truncate" title={candidate.name}>
                                          {candidate.name}
                                        </div>
                                        <div className="small text-muted text-truncate">
                                          {candidate.party || "Independent"}
                                        </div>
                                        {typeof candidate.votes === "number" && (
                                          <div className="small text-primary">
                                            <FaStar className="me-1" />
                                            {candidate.votes} votes
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {voted ? (
                                      <button className="btn btn-success btn-sm w-100 disabled">
                                        <FaCheckCircle className="me-1" /> Voted
                                      </button>
                                    ) : status === 'active' ? (
                                      <button
                                        className="btn btn-primary btn-sm w-100"
                                        onClick={() => handleVote(
                                          election._id || election.id,
                                          candidate._id || candidate.id
                                        )}
                                      >
                                        <FaVoteYea className="me-1" /> Vote
                                      </button>
                                    ) : (
                                      <button className="btn btn-secondary btn-sm w-100 disabled">
                                        <FaLock className="me-1" /> 
                                        {status === 'upcoming' ? 'Not Started' : 'Ended'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-3 border rounded" style={{ background: '#f8f9fa' }}>
                            <FaUsers className="text-muted mb-2" size={24} />
                            <div className="text-muted">No approved candidates yet</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderMyVotesView = () => (
    <div className="card shadow-sm border-0" style={{ borderRadius: '5px' }}>
      <div className="card-header bg-success text-white d-flex align-items-center justify-content-between"
           style={{ borderTopLeftRadius: '5px', borderTopRightRadius: '5px' }}>
        <span className="d-flex align-items-center gap-2">
          <FaVoteYea /> My Voting History
        </span>
        <span className="badge bg-white text-success">{myVotes.length}</span>
      </div>
      <div className="card-body p-4">
        {myVotes.length === 0 ? (
          <div className="text-center py-5">
            <FaExclamationTriangle className="mb-3 text-muted" size={48} />
            <h3 className="text-muted">No votes cast yet</h3>
            <p className="text-muted">Start participating in elections to see your voting history here.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setActiveView('elections')}
            >
              <FaPoll className="me-2" />
              Browse Elections
            </button>
          </div>
        ) : (
          <div className="row g-3">
            {myVotes.map((vote, index) => (
              <div className="col-md-6 col-lg-4" key={vote._id || index}>
                <div className="card border shadow-sm h-100" style={{ borderRadius: '5px' }}>
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                        <FaCheckCircle className="text-success" size={20} />
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-bold">{vote.electionTitle || vote.election}</div>
                        <small className="text-muted">
                          {vote.createdAt ? new Date(vote.createdAt).toLocaleDateString() : 'Recently voted'}
                        </small>
                      </div>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted">Voted for:</small>
                      <div className="fw-semibold text-primary">{vote.candidateName || vote.candidate}</div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="badge bg-success">Completed</span>
                      <small className="text-muted">
                        <FaClock className="me-1" />
                        {vote.createdAt ? new Date(vote.createdAt).toLocaleTimeString() : 'N/A'}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderNotificationsView = () => (
    <div className="card shadow-sm border-0" style={{ borderRadius: '5px' }}>
      <div className="card-header bg-primary text-white d-flex align-items-center justify-content-between"
           style={{ borderTopLeftRadius: '5px', borderTopRightRadius: '5px' }}>
        <span className="d-flex align-items-center gap-2">
          <FaBell /> Notifications
        </span>
        <span className="badge bg-white text-primary">{notifications.length}</span>
      </div>
              <div className="card-body p-4">
        {notifications.length === 0 ? (
          <div className="text-center py-5">
            <FaBell className="mb-3 text-muted" size={48} />
            <h3 className="text-muted">No notifications</h3>
            <p className="text-muted">You'll see important updates and announcements here.</p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {notifications.map((notification, index) => (
              <div className={`list-group-item border-0 py-3 ${!notification.read ? 'bg-light' : ''}`} 
                   key={notification._id || index}>
                <div className="d-flex align-items-start gap-3">
                  <div className={`bg-${notification.type === 'success' ? 'success' : 'info'} bg-opacity-10 rounded-circle p-2`}>
                    <FaInfoCircle className={`text-${notification.type === 'success' ? 'success' : 'info'}`} size={16} />
                  </div>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="fw-semibold">{notification.title || 'Notification'}</div>
                    <p className="text-muted mb-1 small text-truncate" style={{ maxWidth: "300px" }}>
                      {notification.message || notification.content}
                    </p>
                    <small className="text-muted">
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : 'Recently'}
                    </small>
                  </div>
                  <div className="d-flex flex-column gap-1">
                    {!notification.read && (
                      <span className="badge bg-primary">New</span>
                    )}
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => {
                        setSelectedNotification(notification);
                        setShowNotificationModal(true);
                      }}
                    >
                      <FaEye />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderProfileView = () => (
    <div className="row g-4" style={{ width: "100%", maxWidth: "100%", overflowX: "hidden", margin: 0 }}>
      {/* Profile Information Section */}
      <div className="col-lg-4 col-md-5">
        <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '5px' }}>
          <div className="card-header bg-primary text-white text-center py-4"
               style={{ borderTopLeftRadius: '5px', borderTopRightRadius: '5px' }}>
            {/* Profile Picture Section */}
            <div className="mb-3">
              <img
                src={user?.profilePicture || "/default-avatar.png"}
                alt={user?.name}
                style={{
                  width: 100,
                  height: 100,
                  objectFit: "cover",
                  borderRadius: "50%",
                  border: "3px solid white"
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <FaUserCircle 
                size={100} 
                className="text-white" 
                style={{ display: 'none' }}
              />
            </div>

            {/* Basic Info */}
            <h4 className="fw-bold mb-1 text-white">{user?.name}</h4>
            <p className="mb-2 text-white-50">{user?.email}</p>
            
            {/* Role Badge */}
            <span className="badge bg-white text-secondary px-3 py-2">
              <FaUserGraduate className="me-2" /> {user?.role}
            </span>
          </div>
          
          <div className="card-body p-4">
            {/* Quick Stats */}
            <div className="row g-2 mb-4">
              <div className="col-4 text-center">
                <div className="bg-light rounded p-3">
                  <div className="fw-bold h5 mb-0">{myVotes.length}</div>
                  <small className="text-muted">Votes</small>
                </div>
              </div>
              <div className="col-4 text-center">
                <div className="bg-light rounded p-3">
                  <div className="fw-bold h5 mb-0">{electionStats.participated}</div>
                  <small className="text-muted">Elections</small>
                </div>
              </div>
              <div className="col-4 text-center">
                <div className="bg-light rounded p-3">
                  <div className="fw-bold h5 mb-0">{notifications.length}</div>
                  <small className="text-muted">Alerts</small>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-grid gap-2">
              <button 
                className="btn btn-primary btn-lg fw-semibold"
                onClick={() => setShowProfile(true)}
                style={{ borderRadius: "10px" }}
              >
                <FaUserEdit className="me-2" /> Edit Profile
              </button>
              <div className="row g-2">
                <div className="col-6">
                  <button 
                    className="btn btn-outline-primary w-100"
                    style={{ borderRadius: "8px" }}
                  >
                    <FaLock className="me-1" /> Security
                  </button>
                </div>
                <div className="col-6">
                  <button 
                    className="btn btn-outline-primary w-100"
                    style={{ borderRadius: "8px" }}
                    onClick={() => setActiveView('history')}
                  >
                    <FaHistory className="me-1" /> Activity
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information Section */}
      <div className="col-lg-8 col-md-7">
        <div className="row g-4">
          {/* Personal Information Card */}
          <div className="col-12">
            <div className="card shadow-sm border-0" style={{ borderRadius: '5px' }}>
              <div className="card-header border-0 py-3 bg-primary text-white"
                   style={{ 
                     borderTopLeftRadius: '5px', 
                     borderTopRightRadius: '5px'
                   }}>
                <h3 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <FaUser /> Personal Information
                </h3>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted">
                      <FaUser className="me-2" />Full Name
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={user?.name || ''} 
                      readOnly 
                      style={{ backgroundColor: "#f8f9fa" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted">
                      <FaEnvelope className="me-2" />Email Address
                    </label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={user?.email || ''} 
                      readOnly 
                      style={{ backgroundColor: "#f8f9fa" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted">
                      <FaIdBadge className="me-2" />Student ID
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={user?.studentId || 'N/A'} 
                      readOnly 
                      style={{ backgroundColor: "#f8f9fa" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted">
                      <FaUsers className="me-2" />Department
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={user?.department || 'N/A'} 
                      readOnly 
                      style={{ backgroundColor: "#f8f9fa" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted">
                      <FaBell className="me-2" />Phone Number
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={user?.phone || 'Not provided'} 
                      readOnly 
                      style={{ backgroundColor: "#f8f9fa" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted">
                      <FaCalendarAlt className="me-2" />Member Since
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'} 
                      readOnly 
                      style={{ backgroundColor: "#f8f9fa" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="col-12">
            <div className="card shadow-sm border-0" style={{ borderRadius: '5px' }}>
              <div className="card-header border-0 py-3 bg-primary text-white"
                   style={{ 
                     borderTopLeftRadius: '5px', 
                     borderTopRightRadius: '5px'
                   }}>
                <h3 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <FaHistory /> Recent Activity
                </h3>
              </div>
              <div className="card-body p-4">
                {myVotes.length > 0 ? (
                  <div className="timeline">
                    {myVotes.slice(0, 5).map((vote, index) => (
                      <div className="d-flex gap-3 mb-4" key={vote._id || index}>
                        <div className="bg-success rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                             style={{ width: '40px', height: '40px' }}>
                          <FaCheckCircle className="text-white" size={16} />
                        </div>
                        <div className="flex-grow-1">
                          <div className="bg-light rounded p-3 border">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <span className="fw-bold text-primary">Election Vote</span>
                                <span className="badge bg-success ms-2">Completed</span>
                              </div>
                              <small className="text-muted fw-semibold">
                                {vote.createdAt ? new Date(vote.createdAt).toLocaleDateString() : 'Recently'}
                              </small>
                            </div>
                            <h6 className="mb-2 text-dark">{vote.electionTitle || vote.election}</h6>
                            <p className="mb-0 text-muted">
                              <strong>Voted for:</strong> {vote.candidateName || vote.candidate}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <FaHistory className="text-muted mb-3" size={48} />
                    <h3 className="text-muted mb-2">No Activity Yet</h3>
                    <p className="text-muted mb-4">Start participating in elections to see your voting history here!</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setActiveView('elections')}
                    >
                      <FaPoll className="me-2" />
                      Browse Elections
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );  const renderHistoryView = () => (
    <div className="card shadow-sm border-0" style={{ borderRadius: '5px' }}>
      <div className="card-header bg-primary text-white d-flex align-items-center justify-content-between"
           style={{ borderTopLeftRadius: '5px', borderTopRightRadius: '5px' }}>
        <span className="d-flex align-items-center gap-2">
          <FaHistory /> Activity History
        </span>
      </div>
      <div className="card-body p-4">
        <div className="timeline">
          {myVotes.map((vote, index) => (
            <div className="timeline-item d-flex gap-3 mb-4" key={vote._id || index}>
              <div className="timeline-marker bg-success rounded-circle d-flex align-items-center justify-content-center"
                   style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                <FaVoteYea className="text-white" size={16} />
              </div>
              <div className="timeline-content flex-grow-1">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold mb-0">Vote Cast</h6>
                      <small className="text-muted">
                        {vote.createdAt ? new Date(vote.createdAt).toLocaleDateString() : 'Recently'}
                      </small>
                    </div>
                    <p className="mb-1">Voted in: <strong>{vote.electionTitle || vote.election}</strong></p>
                    <p className="mb-0 text-muted">Candidate: {vote.candidateName || vote.candidate}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {myVotes.length === 0 && (
            <div className="text-center py-5">
              <FaHistory className="mb-3 text-muted" size={48} />
              <h3 className="text-muted">No activity yet</h3>
              <p className="text-muted">Your voting activity will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>
        {`
          @media (min-width: 1200px) {
            .col-xl-1-5 {
              flex: 0 0 auto;
              width: 12.5%;
            }
          }
        `}
      </style>
      <div
        className="min-vh-100"
        style={{
          background: "#f8f9fa",
          width: "100vw",
          height: "100vh",
          maxWidth: "100vw",
        overflowX: "hidden",
        margin: 0,
        padding: 0
      }}
    >
      {/* Top Navigation */}
      <nav
        className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm"
        style={{
          width: "100vw",
          margin: 0,
          padding: 0
        }}
      >
        <div className="container-fluid" style={{ maxWidth: "100%", padding: "0 1rem", margin: 0 }}>
          <span className="navbar-brand d-flex align-items-center gap-2">
            <button 
              className="btn btn-outline-light btn-sm me-2 d-lg-none"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <FaCog />
            </button>
            <FaUserGraduate size={28} />
            <span className="fw-bold fs-4 d-none d-md-inline">Student Portal</span>
            <span className="fw-bold fs-5 d-md-none">Portal</span>
          </span>
          
          {/* User Actions */}
          <div className="d-flex align-items-center gap-2">
            {/* Notifications */}
            <div className="dropdown">
              <button className="btn btn-outline-light position-relative" data-bs-toggle="dropdown">
                <FaBell />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li className="dropdown-header">Recent Notifications</li>
                {notifications.slice(0, 3).map((notif, index) => (
                  <li key={index}>
                    <a className="dropdown-item small" href="#" 
                       onClick={() => setActiveView('notifications')}>
                      {notif.title || 'Notification'}
                    </a>
                  </li>
                ))}
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <a className="dropdown-item text-center" href="#"
                     onClick={() => setActiveView('notifications')}>
                    View All
                  </a>
                </li>
              </ul>
            </div>

            {/* Profile Dropdown */}
            <div className="dropdown">
              <button className="btn btn-outline-light d-flex align-items-center gap-2" data-bs-toggle="dropdown">
                <FaUserCircle /> 
                <span className="d-none d-md-inline">{user?.name?.split(' ')[0]}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <button className="dropdown-item" onClick={() => setActiveView('profile')}>
                    <FaUserEdit className="me-2" /> View Profile
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => setShowProfile(true)}>
                    <FaUserEdit className="me-2" /> Edit Profile
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item text-danger"
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.href = "/login";
                    }}
                  >
                    <FaSignOutAlt className="me-2" /> Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="d-flex" style={{ width: "100vw", maxWidth: "100vw", margin: 0, padding: 0, height: "calc(100vh - 70px)" }}>
        {/* Sidebar */}
        <div className={`bg-white shadow-sm border-end ${sidebarCollapsed ? 'd-none' : ''} d-lg-block`}
             style={{ 
               width: sidebarCollapsed ? '0' : '250px', 
               minWidth: sidebarCollapsed ? '0' : '250px',
               maxWidth: '250px',
               height: '100%',
               transition: 'width 0.3s ease',
               flexShrink: 0,
               overflowX: 'hidden',
               margin: 0,
               padding: 0
             }}>
          <div className="p-3">
            <h6 className="text-muted text-uppercase small fw-bold mb-3">Navigation</h6>
            <nav className="nav flex-column">
              {sidebarItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`nav-link btn btn-link text-start border-0 rounded mb-1 d-flex align-items-center justify-content-between p-2 ${
                      activeView === item.id ? 'bg-primary text-white' : 'text-dark'
                    }`}
                    onClick={() => setActiveView(item.id)}
                    style={{ textDecoration: 'none' }}
                  >
                    <span className="d-flex align-items-center gap-2">
                      <IconComponent size={16} />
                      {item.label}
                    </span>
                    {item.badge !== null && item.badge > 0 && (
                      <span className={`badge ${
                        activeView === item.id ? 'bg-white text-primary' : 'bg-primary text-white'
                      } rounded-pill`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="mt-auto p-3 border-top">
            <div className="d-flex align-items-center gap-2 mb-3">
              <FaUserCircle className="text-primary" size={32} />
              <div>
                <div className="fw-semibold small">{user?.name}</div>
                <div className="text-muted small">{user?.role}</div>
              </div>
            </div>
            <div className="small text-muted mb-3">
              Last refresh: {lastRefresh.toLocaleTimeString()}
            </div>
            <button 
              className="btn btn-outline-danger btn-sm w-100"
              onClick={async () => {
                const result = await Swal.fire({
                  title: 'Are you sure?',
                  text: 'You will be logged out of your account.',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#dc3545',
                  cancelButtonColor: '#6c757d',
                  confirmButtonText: 'Yes, logout',
                  cancelButtonText: 'Cancel'
                });
                
                if (result.isConfirmed) {
                  localStorage.removeItem('token');
                  Swal.fire({
                    title: 'Logged out!',
                    text: 'You have been successfully logged out.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                  }).then(() => {
                    window.location.href = '/login';
                  });
                }
              }}
            >
              <FaSignOutAlt className="me-2" size={14} />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 p-2 p-md-3" style={{ 
          width: sidebarCollapsed ? "100vw" : "calc(100vw - 250px)",
          maxWidth: "100%",
          overflowX: "hidden",
          minWidth: 0,
          height: "100%",
          margin: 0
        }}>
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <button 
                  className="btn btn-link p-0 text-decoration-none"
                  onClick={() => setActiveView('dashboard')}
                >
                  Dashboard
                </button>
              </li>
              {activeView !== 'dashboard' && (
                <li className="breadcrumb-item active" aria-current="page">
                  {sidebarItems.find(item => item.id === activeView)?.label}
                </li>
              )}
            </ol>
          </nav>

          {/* Page Header */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-md-center mb-4">
            <div>
              <h2 className="fw-bold mb-1">
                {sidebarItems.find(item => item.id === activeView)?.label || 'Dashboard'}
              </h2>
              <p className="text-muted mb-0">
                {activeView === 'dashboard' && 'Welcome to your student portal dashboard'}
                {activeView === 'elections' && 'Browse and participate in elections'}
                {activeView === 'my-votes' && 'View your voting history'}
                {activeView === 'notifications' && 'Stay updated with important announcements'}
                {activeView === 'profile' && 'Manage your profile information'}
                {activeView === 'history' && 'Track your activity timeline'}
              </p>
            </div>
            {activeView === 'dashboard' && (
              <div className="d-flex gap-2 mt-2 mt-md-0">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={refreshData}
                  disabled={loading}
                >
                  <FaCog className={loading ? 'fa-spin me-1' : 'me-1'} />
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setActiveView('elections')}
                >
                  <FaPoll className="me-1" />
                  View Elections
                </button>
              </div>
            )}
          </div>

          {/* Dynamic Content */}
          {renderActiveView()}
        </div>
      </div>

      {/* Election Details Modal */}
      {selectedElection && showElectionModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <FaPoll className="text-primary" />
                  Election Details
                </h5>
                <button 
                  className="btn-close" 
                  onClick={() => {
                    setShowElectionModal(false);
                    setSelectedElection(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {(() => {
                  const { status, color, icon: StatusIcon } = getElectionStatus(selectedElection);
                  const voted = myVotes.some((v) => v.election === selectedElection._id);
                  const approvedCandidates = (selectedElection.candidates || []).filter(
                    (c) => c.status === "approved"
                  );

                  return (
                    <div>
                      {/* Election Header */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h4 className="fw-bold mb-0">{selectedElection.title}</h4>
                          <div className="d-flex gap-2">
                            <span className={`badge bg-${color} d-flex align-items-center gap-1`}>
                              <StatusIcon size={12} />
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                            {voted && (
                              <span className="badge bg-success d-flex align-items-center gap-1">
                                <FaCheckCircle size={12} />
                                Voted
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-muted mb-3">{selectedElection.description}</p>
                        
                        {/* Election Timeline */}
                        <div className="row g-3 mb-4">
                          <div className="col-md-6">
                            <div className="card border-0 bg-light">
                              <div className="card-body p-3">
                                <div className="d-flex align-items-center gap-2">
                                  <FaCalendarAlt className="text-primary" />
                                  <div>
                                    <small className="text-muted d-block">Start Date</small>
                                    <strong>{new Date(selectedElection.startDate).toLocaleDateString()}</strong>
                                    <small className="text-muted d-block">
                                      {new Date(selectedElection.startDate).toLocaleTimeString()}
                                    </small>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="card border-0 bg-light">
                              <div className="card-body p-3">
                                <div className="d-flex align-items-center gap-2">
                                  <FaClock className="text-warning" />
                                  <div>
                                    <small className="text-muted d-block">End Date</small>
                                    <strong>{new Date(selectedElection.endDate).toLocaleDateString()}</strong>
                                    <small className="text-muted d-block">
                                      {formatTimeRemaining(selectedElection.endDate)}
                                    </small>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Candidates Section */}
                      <div>
                        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                          <FaUsers className="text-primary" />
                          Candidates ({approvedCandidates.length})
                        </h5>
                        
                        {approvedCandidates.length > 0 ? (
                          <div className="row g-3">
                            {approvedCandidates.map((candidate) => (
                              <div className="col-md-6" key={candidate._id || candidate.id}>
                                <div className="card border h-100" 
                                     style={{ borderRadius: '10px', background: voted ? '#f8f9fa' : 'white' }}>
                                  <div className="card-body p-3">
                                    <div className="d-flex align-items-center mb-3">
                                      <img
                                        src={candidate.photo || "/default-avatar.png"}
                                        alt={candidate.name}
                                        style={{
                                          width: 60,
                                          height: 60,
                                          objectFit: "cover",
                                          borderRadius: "50%",
                                          border: "3px solid #e5e7eb",
                                        }}
                                        className="me-3"
                                      />
                                      <div className="flex-grow-1">
                                        <h6 className="fw-bold mb-1">{candidate.name}</h6>
                                        <p className="text-muted mb-1">{candidate.party || "Independent"}</p>
                                        {candidate.manifesto && (
                                          <small className="text-muted">{candidate.manifesto}</small>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {typeof candidate.votes === "number" && (
                                      <div className="mb-3">
                                        <small className="text-muted">Current Votes:</small>
                                        <div className="d-flex align-items-center gap-2">
                                          <div className="progress flex-grow-1" style={{ height: '8px' }}>
                                            <div 
                                              className="progress-bar bg-primary"
                                              style={{ 
                                                width: `${Math.min((candidate.votes / Math.max(...approvedCandidates.map(c => c.votes || 0))) * 100, 100)}%` 
                                              }}
                                            ></div>
                                          </div>
                                          <strong className="text-primary">{candidate.votes}</strong>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {voted ? (
                                      <button className="btn btn-success w-100 disabled">
                                        <FaCheckCircle className="me-2" /> Voted
                                      </button>
                                    ) : status === 'active' ? (
                                      <button
                                        className="btn btn-primary w-100"
                                        onClick={() => {
                                          setShowElectionModal(false);
                                          handleVote(selectedElection._id, candidate._id);
                                        }}
                                      >
                                        <FaVoteYea className="me-2" /> Vote for {candidate.name}
                                      </button>
                                    ) : (
                                      <button className="btn btn-secondary w-100 disabled">
                                        <FaLock className="me-2" /> 
                                        {status === 'upcoming' ? 'Election Not Started' : 'Election Ended'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <FaUsers className="text-muted mb-3" size={48} />
                            <h6 className="text-muted">No candidates available</h6>
                            <p className="text-muted">Candidates will appear here once approved.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowElectionModal(false);
                    setSelectedElection(null);
                  }}
                >
                  Close
                </button>
                {selectedElection && getElectionStatus(selectedElection).status === 'active' && 
                 !myVotes.some((v) => v.election === selectedElection._id) && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveView('elections')}
                  >
                    <FaVoteYea className="me-2" />
                    Go to Voting
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Details Modal */}
      {selectedNotification && showNotificationModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <FaBell className="text-info" />
                  Notification Details
                </h5>
                <button 
                  className="btn-close" 
                  onClick={() => {
                    setShowNotificationModal(false);
                    setSelectedNotification(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="d-flex align-items-start gap-3 mb-3">
                  <div className={`bg-${selectedNotification.type === 'success' ? 'success' : 'info'} bg-opacity-10 rounded-circle p-3`}>
                    <FaInfoCircle className={`text-${selectedNotification.type === 'success' ? 'success' : 'info'}`} size={24} />
                  </div>
                  <div className="flex-grow-1">
                    <h5 className="fw-bold mb-2">{selectedNotification.title || 'Notification'}</h5>
                    <div className="d-flex gap-2 mb-3">
                      <span className={`badge bg-${selectedNotification.type === 'success' ? 'success' : 'info'}`}>
                        {selectedNotification.type === 'success' ? 'Success' : 'Info'}
                      </span>
                      {!selectedNotification.read && (
                        <span className="badge bg-primary">New</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h6 className="fw-semibold">Message:</h6>
                  <p className="text-muted">{selectedNotification.message || selectedNotification.content || 'No message content available.'}</p>
                </div>
                
                <div className="row g-3">
                  <div className="col-6">
                    <small className="text-muted">Date:</small>
                    <div className="fw-semibold">
                      {selectedNotification.createdAt ? 
                        new Date(selectedNotification.createdAt).toLocaleDateString() : 
                        'Recently'
                      }
                    </div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted">Time:</small>
                    <div className="fw-semibold">
                      {selectedNotification.createdAt ? 
                        new Date(selectedNotification.createdAt).toLocaleTimeString() : 
                        'N/A'
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowNotificationModal(false);
                    setSelectedNotification(null);
                  }}
                >
                  Close
                </button>
                {!selectedNotification.read && (
                  <button className="btn btn-primary">
                    <FaCheckCircle className="me-2" />
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Profile Edit Modal */}
      {showProfile && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <FaUserEdit className="text-primary" />
                  Edit Profile
                </h5>
                <button className="btn-close" onClick={() => setShowProfile(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-4">
                  <div className="col-md-4 text-center">
                    <div className="position-relative d-inline-block mb-3">
                      <FaUserCircle size={100} className="text-primary" />
                      <button className="btn btn-sm btn-primary rounded-circle position-absolute bottom-0 end-0">
                        <FaEdit size={12} />
                      </button>
                    </div>
                    <h5 className="fw-bold">{user?.name}</h5>
                    <p className="text-muted">{user?.role}</p>
                  </div>
                  <div className="col-md-8">
                    <form>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Full Name <span className="text-danger">*</span></label>
                          <input 
                            type="text" 
                            className="form-control" 
                            defaultValue={user?.name}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Email Address <span className="text-danger">*</span></label>
                          <input 
                            type="email" 
                            className="form-control" 
                            defaultValue={user?.email}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Student ID</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            defaultValue={user?.studentId}
                            readOnly
                          />
                          <small className="text-muted">Student ID cannot be changed</small>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Department</label>
                          <select className="form-select" defaultValue={user?.department}>
                            <option value="">Select Department</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Business">Business</option>
                            <option value="Arts">Arts</option>
                            <option value="Science">Science</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Phone Number</label>
                          <input 
                            type="tel" 
                            className="form-control" 
                            defaultValue={user?.phone}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Year of Study</label>
                          <select className="form-select" defaultValue={user?.yearOfStudy}>
                            <option value="">Select Year</option>
                            <option value="1">First Year</option>
                            <option value="2">Second Year</option>
                            <option value="3">Third Year</option>
                            <option value="4">Fourth Year</option>
                            <option value="5+">Graduate/PhD</option>
                          </select>
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-semibold">Bio</label>
                          <textarea 
                            className="form-control" 
                            rows="3"
                            defaultValue={user?.bio}
                            placeholder="Tell us about yourself..."
                          ></textarea>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowProfile(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary">
                  <FaSave className="me-2" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

export default StudentDashboard;