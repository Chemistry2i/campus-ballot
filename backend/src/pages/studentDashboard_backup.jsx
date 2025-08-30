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
  FaFileAlt
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

  return (
    <div
      className="min-vh-100"
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)",
        paddingTop: "20px",
        paddingBottom: "40px"
      }}
    >
      {/* Responsive Navigation */}
      <nav
        className="navbar navbar-expand-lg navbar-dark shadow-sm mb-4"
        style={{
          background: "linear-gradient(90deg, #2563eb 0%, #1e293b 100%)",
        }}
      >
        <div className="container-fluid">
          <span className="navbar-brand d-flex align-items-center gap-2">
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
            </div>

            {/* Profile Dropdown */}
            <div className="dropdown">
              <button className="btn btn-outline-light d-flex align-items-center gap-2" data-bs-toggle="dropdown">
                <FaUserCircle /> 
                <span className="d-none d-md-inline">{user?.name?.split(' ')[0]}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
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

      <div className="container-fluid px-2 px-md-4">
        {/* Statistics Cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
              <div className="card-body d-flex align-items-center p-3">
                <div className="bg-primary bg-opacity-10 rounded-circle p-2 p-md-3 me-2 me-md-3">
                  <FaPoll className="text-primary" size={window.innerWidth < 768 ? 16 : 24} />
                </div>
                <div>
                  <h5 className="fw-bold mb-0 fs-6 fs-md-4">{electionStats.total}</h5>
                  <p className="text-muted mb-0 small">Elections</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
              <div className="card-body d-flex align-items-center p-3">
                <div className="bg-success bg-opacity-10 rounded-circle p-2 p-md-3 me-2 me-md-3">
                  <FaCheckCircle className="text-success" size={window.innerWidth < 768 ? 16 : 24} />
                </div>
                <div>
                  <h5 className="fw-bold mb-0 fs-6 fs-md-4">{electionStats.participated}</h5>
                  <p className="text-muted mb-0 small">Voted</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
              <div className="card-body d-flex align-items-center p-3">
                <div className="bg-warning bg-opacity-10 rounded-circle p-2 p-md-3 me-2 me-md-3">
                  <FaClock className="text-warning" size={window.innerWidth < 768 ? 16 : 24} />
                </div>
                <div>
                  <h5 className="fw-bold mb-0 fs-6 fs-md-4">{electionStats.upcoming}</h5>
                  <p className="text-muted mb-0 small">Upcoming</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
              <div className="card-body d-flex align-items-center p-3">
                <div className="bg-secondary bg-opacity-10 rounded-circle p-2 p-md-3 me-2 me-md-3">
                  <FaTrophy className="text-secondary" size={window.innerWidth < 768 ? 16 : 24} />
                </div>
                <div>
                  <h5 className="fw-bold mb-0 fs-6 fs-md-4">{electionStats.completed}</h5>
                  <p className="text-muted mb-0 small">Complete</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3 g-md-4">
          {/* Profile Sidebar - Responsive */}
          <div className="col-lg-3 col-md-4">
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '15px' }}>
              <div className="card-body text-center p-3 p-md-4">
                <div className="position-relative d-inline-block mb-3">
                  <FaUserCircle size={60} className="text-primary d-md-none" />
                  <FaUserCircle size={70} className="text-primary d-none d-md-block" />
                  <span className="position-absolute bottom-0 end-0 bg-success rounded-circle" 
                        style={{ width: '16px', height: '16px', border: '2px solid white' }}></span>
                </div>
                <h5 className="fw-bold mb-1 fs-6 fs-md-5">{user?.name}</h5>
                <div className="text-muted mb-2 d-flex align-items-center justify-content-center">
                  <FaEnvelope className="me-1" size={12} /> 
                  <span className="small">{user?.email}</span>
                </div>
                <div className="mb-3">
                  <span className="badge bg-primary px-2 px-md-3 py-1 py-md-2">
                    <FaUserGraduate className="me-1" size={12} /> {user?.role}
                  </span>
                </div>
                <button 
                  className="btn btn-outline-primary btn-sm w-100"
                  onClick={() => setShowProfile(true)}
                >
                  <FaUserEdit className="me-1" /> Edit Profile
                </button>
              </div>
            </div>

            {/* My Votes - Mobile optimized */}
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
              <div className="card-header bg-success text-white d-flex align-items-center justify-content-between"
                   style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                <span className="d-flex align-items-center gap-2">
                  <FaVoteYea /> 
                  <span className="d-none d-md-inline">My Votes</span>
                  <span className="d-md-none">Votes</span>
                </span>
                <span className="badge bg-white text-success">{myVotes.length}</span>
              </div>
              <div className="card-body p-3" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {myVotes.length === 0 ? (
                  <div className="text-center text-muted py-2">
                    <FaExclamationTriangle className="mb-2" size={20} />
                    <div className="small">No votes yet</div>
                    <small className="text-muted">Start participating!</small>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {myVotes.slice(0, 5).map((vote, index) => (
                      <div className="list-group-item border-0 px-0 py-2" key={vote._id || index}>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 rounded-circle p-1 me-2">
                            <FaPoll className="text-primary" size={12} />
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-semibold small">{vote.electionTitle || vote.election}</div>
                            <div className="small text-muted">{vote.candidateName || vote.candidate}</div>
                          </div>
                          <FaCheckCircle className="text-success" size={14} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Elections Dashboard */}
          <div className="col-lg-9 col-md-8">
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
              <div className="card-header bg-white border-0 py-3" 
                   style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                <div className="row align-items-center">
                  <div className="col-12 col-md-6 mb-2 mb-md-0">
                    <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                      <FaPoll className="text-primary" /> Elections
                    </h5>
                  </div>
                  
                  <div className="col-12 col-md-6">
                    <div className="d-flex flex-column flex-md-row gap-2 justify-content-md-end">
                      {/* Auto-refresh controls */}
                      <div className="d-flex align-items-center gap-2 mb-2 mb-md-0">
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
                          style={{ width: '70px' }}
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
                      
                      {/* Search and Filter */}
                      <div className="d-flex gap-2">
                        <div className="input-group" style={{ width: '150px' }}>
                          <span className="input-group-text bg-light border-end-0">
                            <FaSearch className="text-muted" size={12} />
                          </span>
                          <input
                            type="text"
                            className="form-control border-start-0"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <select 
                          className="form-select" 
                          style={{ width: '100px' }}
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
                    <h5 className="text-muted">No elections found</h5>
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
                               style={{ borderRadius: '12px' }}>
                            <div className="card-body p-3 p-md-4">
                              {/* Election Header */}
                              <div className="row mb-3">
                                <div className="col-12 col-md-8">
                                  <div className="d-flex flex-column flex-sm-row align-items-start gap-2 mb-2">
                                    <h5 className="fw-bold mb-0 flex-grow-1">{election.title || election.name}</h5>
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
                                      <div className="col-md-6 col-lg-4" key={candidate._id || candidate.id}>
                                        <div className="card border shadow-sm h-100" 
                                             style={{ borderRadius: '10px', background: voted ? '#f8f9fa' : 'white' }}>
                                          <div className="card-body p-3">
                                            <div className="d-flex align-items-center mb-3">
                                              <img
                                                src={candidate.photo || "/default-avatar.png"}
                                                alt={candidate.name}
                                                style={{
                                                  width: 45,
                                                  height: 45,
                                                  objectFit: "cover",
                                                  borderRadius: "50%",
                                                  border: "2px solid #e5e7eb",
                                                }}
                                                className="me-3"
                                              />
                                              <div className="flex-grow-1">
                                                <div className="fw-semibold">{candidate.name}</div>
                                                <div className="small text-muted">{candidate.party || "Independent"}</div>
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
          </div>
        </div>
      </div>

      {/* Profile Modal Placeholder */}
      {showProfile && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Profile</h5>
                <button className="btn-close" onClick={() => setShowProfile(false)}></button>
              </div>
              <div className="modal-body">
                <p>Profile editing functionality would go here.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
