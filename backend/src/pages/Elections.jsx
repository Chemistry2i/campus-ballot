import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faSearch,
  faFilter,
  faCalendarAlt,
  faUsers,
  faVoteYea,
  faPlay,
  faPlayCircle,
  faStop,
  faPause,
  faChartBar,
  faSpinner,
  faClock,
  faCheckCircle,
  faCheck,
  faTimesCircle,
  faBan,
  faPoll,
  faExclamationTriangle,
  faBullhorn
} from "@fortawesome/free-solid-svg-icons";

function Elections({ user }) {
  const [elections, setElections] = useState([]);
  const [filteredElections, setFilteredElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    upcoming: 0,
    completed: 0
  });

  // Form state for create/edit
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "upcoming",
    positions: ["President", "Vice President", "Secretary"]
  });

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    filterElections();
  }, [elections, searchTerm, statusFilter]);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch all elections
      const electionsResponse = await axios.get("/api/elections", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // For each election, fetch candidates count and votes count
      const electionsWithCounts = await Promise.all(
        electionsResponse.data.map(async (election) => {
          try {
            // Fetch candidates for this election
            const candidatesResponse = await axios.get(`/api/elections/${election._id}/candidates`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            // Fetch votes for this election using the correct endpoint
            const votesResponse = await axios.get(`/api/votes/election/${election._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log(`Election ${election.title}:`, {
              status: election.status,
              startDate: election.startDate,
              endDate: election.endDate,
              candidates: candidatesResponse.data?.length || 0,
              votes: votesResponse.data?.length || 0,
              currentDate: new Date().toISOString()
            });

            // Determine actual status based on dates
            const now = new Date();
            const startDate = new Date(election.startDate);
            const endDate = new Date(election.endDate);
            
            let actualStatus = election.status;
            
            // Auto-determine status based on dates if dates are valid
            if (election.startDate && election.endDate) {
              if (now < startDate) {
                actualStatus = 'upcoming';
              } else if (now >= startDate && now <= endDate) {
                actualStatus = 'active';
              } else if (now > endDate) {
                actualStatus = 'completed';
              }
            }
            
            // Log if there's a mismatch
            if (actualStatus !== election.status) {
              console.warn(`Status mismatch for ${election.title}: DB says "${election.status}" but dates suggest "${actualStatus}"`);
            }
            
            return {
              ...election,
              status: actualStatus, // Use the calculated status
              candidatesCount: candidatesResponse.data?.length || 0,
              votesCount: votesResponse.data?.length || 0
            };
          } catch (error) {
            console.error(`Error fetching data for election ${election.title}:`, error);
            // Return election with default counts if fetch fails
            return {
              ...election,
              candidatesCount: 0,
              votesCount: 0
            };
          }
        })
      );
      
      console.log('Elections with counts and updated statuses:', electionsWithCounts);
      setElections(electionsWithCounts);
      calculateStats(electionsWithCounts);
    } catch (error) {
      console.error("Error fetching elections:", error);
      Swal.fire("Error", "Failed to load elections", "error");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (electionsData) => {
    const stats = {
      total: electionsData.length,
      active: electionsData.filter(e => e.status === 'active').length,
      upcoming: electionsData.filter(e => e.status === 'upcoming').length,
      completed: electionsData.filter(e => e.status === 'completed').length
    };
    setStats(stats);
  };

  const filterElections = () => {
    let filtered = elections;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(election =>
        election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        election.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(election => election.status === statusFilter);
    }

    setFilteredElections(filtered);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post("/api/elections", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire("Success", "Election created successfully!", "success");
      setShowCreateModal(false);
      resetForm();
      fetchElections();
    } catch (error) {
      console.error("Error creating election:", error);
      Swal.fire("Error", "Failed to create election", "error");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/elections/${selectedElection._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire("Success", "Election updated successfully!", "success");
      setShowEditModal(false);
      resetForm();
      fetchElections();
    } catch (error) {
      console.error("Error updating election:", error);
      Swal.fire("Error", "Failed to update election", "error");
    }
  };

  const handleDelete = async (election) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `This will permanently delete "${election.title}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/elections/${election._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        Swal.fire("Deleted!", "Election has been deleted.", "success");
        fetchElections();
      } catch (error) {
        console.error("Error deleting election:", error);
        Swal.fire("Error", "Failed to delete election", "error");
      }
    }
  };

  const handleStatusChange = async (election, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/elections/${election._id}`, 
        { ...election, status: newStatus }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Success", `Election ${newStatus} successfully!`, "success");
      fetchElections();
    } catch (error) {
      console.error("Error updating election status:", error);
      Swal.fire("Error", "Failed to update election status", "error");
    }
  };

  const openEditModal = (election) => {
    setSelectedElection(election);
    setFormData({
      title: election.title,
      description: election.description,
      startDate: election.startDate ? new Date(election.startDate).toISOString().split('T')[0] : "",
      endDate: election.endDate ? new Date(election.endDate).toISOString().split('T')[0] : "",
      status: election.status,
      positions: election.positions || ["President", "Vice President", "Secretary"]
    });
    setShowEditModal(true);
  };

  const openDetailsModal = (election) => {
    setSelectedElection(election);
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "upcoming",
      positions: ["President", "Vice President", "Secretary"]
    });
    setSelectedElection(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: "bg-success", icon: faPlay, text: "Active" },
      upcoming: { class: "bg-success", icon: faClock, text: "Upcoming" },
      completed: { class: "bg-secondary", icon: faCheckCircle, text: "Completed" },
      cancelled: { class: "bg-danger", icon: faTimesCircle, text: "Cancelled" }
    };

    const config = statusConfig[status] || statusConfig.upcoming;
    
    return (
      <span className={`badge ${config.class} d-flex align-items-center`}>
        <FontAwesomeIcon icon={config.icon} className="me-1" size="xs" />
        {config.text}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-primary mb-3" />
          <p>Loading elections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="fw-bold text-primary mb-1">
                <FontAwesomeIcon icon={faBullhorn} className="me-2" />
                Elections Management
              </h4>
              <p className="text-muted mb-0">Manage all university elections and voting processes</p>
            </div>
            <button
              className="btn btn-primary d-flex align-items-center"
              onClick={() => setShowCreateModal(true)}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Create Election
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
<div className="row mb-1 tight-row">
  {/* Total Elections */}
  <div className="col-8th mb-1 tight">
    <div className="card border-0 shadow-sm h-100 stat-card">
      <div className="d-flex justify-content-center mt-3">
        <div className="bg-primary bg-opacity-10 rounded-circle p-2">
          <FontAwesomeIcon icon={faChartBar} className="text-primary" size="lg" />
        </div>
      </div>
      <div className="card-body text-center">
        <h5 className="fw-bold mb-0 fs-6">{stats.total}</h5>
        <p className="text-muted mb-0 small fw-bold" id="font">Total Elections</p>
      </div>
    </div>
  </div>
  {/* Active Elections */}
  <div className="col-8th mb-1 tight">
    <div className="card border-0 shadow-sm h-100 stat-card">
      <div className="d-flex justify-content-center mt-3">
        <div className="bg-success bg-opacity-10 rounded-circle p-2">
          <FontAwesomeIcon icon={faPlayCircle} className="text-success" size="lg" />
        </div>
      </div>
      <div className="card-body text-center">
        <h5 className="fw-bold mb-0 fs-6">{stats.active}</h5>
        <p className="text-muted mb-0 small fw-bold" id="font">Active Elections</p>
      </div>
    </div>
  </div>
  {/* Upcoming Elections */}
  <div className="col-8th mb-1 tight">
    <div className="card border-0 shadow-sm h-100 stat-card">
      <div className="d-flex justify-content-center mt-3">
        <div className="bg-warning bg-opacity-10 rounded-circle p-2">
          <FontAwesomeIcon icon={faCalendarAlt} className="text-warning" size="lg" />
        </div>
      </div>
      <div className="card-body text-center">
        <h5 className="fw-bold mb-0 fs-6">{stats.upcoming}</h5>
        <p className="text-muted mb-0 small fw-bold" id="font">Upcoming Elections</p>
      </div>
    </div>
  </div>
  {/* Completed Elections */}
  <div className="col-8th mb-1 tight">
    <div className="card border-0 shadow-sm h-100 stat-card">
      <div className="d-flex justify-content-center mt-3">
        <div className="bg-secondary bg-opacity-10 rounded-circle p-2">
          <FontAwesomeIcon icon={faCheck} className="text-secondary" size="lg" />
        </div>
      </div>
      <div className="card-body text-center">
        <h5 className="fw-bold mb-0 fs-6">{stats.completed}</h5>
        <p className="text-muted mb-0 small fw-bold" id="font">Complete Elections</p>
      </div>
    </div>
  </div>
  {/* Cancelled Elections */}
  <div className="col-8th mb-1 tight">
    <div className="card border-0 shadow-sm h-100 stat-card">
      <div className="d-flex justify-content-center mt-3">
        <div className="bg-danger bg-opacity-10 rounded-circle p-2">
          <FontAwesomeIcon icon={faBan} className="text-danger" size="lg" />
        </div>
      </div>
      <div className="card-body text-center">
        <h5 className="fw-bold mb-0 fs-6">{stats.cancelled || 0}</h5>
        <p className="text-muted mb-0 small fw-bold" id="font">Cancelled Elections</p>
      </div>
    </div>
  </div>
  {/* Total Votes Cast */}
  <div className="col-8th mb-1 tight">
    <div className="card border-0 shadow-sm h-100 stat-card">
      <div className="d-flex justify-content-center mt-3">
        <div className="bg-info bg-opacity-10 rounded-circle p-2">
          <FontAwesomeIcon icon={faPoll} className="text-info" size="lg" />
        </div>
      </div>
      <div className="card-body text-center">
        <h5 className="fw-bold mb-0 fs-6">
          {elections.reduce((sum, e) => sum + (e.votesCount || 0), 0)}
        </h5>
        <p className="text-muted mb-0 small fw-bold" id="font">Total Votes Cast</p>
      </div>
    </div>
  </div>
  {/* Ongoing Elections */}
  <div className="col-8th mb-1 tight">
    <div className="card border-0 shadow-sm h-100 stat-card">
      <div className="d-flex justify-content-center mt-3">
        <div className="bg-info bg-opacity-10 rounded-circle p-2">
          <FontAwesomeIcon icon={faPlay} className="text-info" size="lg" />
        </div>
      </div>
      <div className="card-body text-center">
        <h5 className="fw-bold mb-0 fs-6">
          {elections.filter(e => e.status === "active").length}
        </h5>
        <p className="text-muted mb-0 small fw-bold" id="font">Ongoing Elections</p>
      </div>
    </div>
  </div>
  {/* Total Candidates */}
  <div className="col-8th mb-1 tight">
    <div className="card border-0 shadow-sm h-100 stat-card">
      <div className="d-flex justify-content-center mt-3">
        <div className="bg-primary bg-opacity-10 rounded-circle p-2">
          <FontAwesomeIcon icon={faUsers} className="text-primary" size="lg" />
        </div>
      </div>
      <div className="card-body text-center">
        <h5 className="fw-bold mb-0 fs-6">
          {elections.reduce((sum, e) => sum + (e.candidatesCount || 0), 0)}
        </h5>
        <p className="text-muted mb-0 small fs-6 fw-bold" id="font">Total Candidates</p>
      </div>
    </div>
  </div>
</div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text">
                      <FontAwesomeIcon icon={faSearch} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search elections by title or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <button className="btn btn-outline-secondary w-100">
                    <FontAwesomeIcon icon={faFilter} className="me-2" />
                    Filter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Elections Table */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 fw-bold">Elections List</h5>
            </div>
            <div className="card-body p-0">
              {filteredElections.length === 0 ? (
                <div className="text-center py-5">
                  <FontAwesomeIcon icon={faBullhorn} size="3x" className="text-muted mb-3" />
                  <h5 className="text-muted">No elections found</h5>
                  <p className="text-muted">Create your first election to get started</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-bordered mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="fw-bold border-end">Election Title</th>
                        <th className="fw-bold border-end">Status</th>
                        <th className="fw-bold border-end">Start Date</th>
                        <th className="fw-bold border-end">End Date</th>
                        <th className="fw-bold border-end">Candidates</th>
                        <th className="fw-bold border-end">Votes</th>
                        <th className="fw-bold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredElections.map((election) => (
                        <tr key={election._id}>
                          <td className="border-end">
                            <div>
                              <h6 className="mb-1 fw-bold">{election.title}</h6>
                              <p className="text-muted small mb-0">
                                {election.description?.length > 50 
                                  ? `${election.description.substring(0, 50)}...` 
                                  : election.description}
                              </p>
                            </div>
                          </td>
                          <td className="border-end">{getStatusBadge(election.status)}</td>
                          <td className="border-end">
                            <small className="text-muted">
                              <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                              {election.startDate ? formatDate(election.startDate) : 'Not set'}
                            </small>
                          </td>
                          <td className="border-end">
                            <small className="text-muted">
                              <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                              {election.endDate ? formatDate(election.endDate) : 'Not set'}
                            </small>
                          </td>
                          <td className="border-end">
                            <span className="badge bg-info">
                              <FontAwesomeIcon icon={faUsers} className="me-1" />
                              {election.candidatesCount || 0}
                            </span>
                          </td>
                          <td className="border-end">
                            <span className="badge bg-primary">
                              <FontAwesomeIcon icon={faVoteYea} className="me-1" />
                              {election.votesCount || 0}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex justify-content-center gap-1">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => openDetailsModal(election)}
                                title="View Details"
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-warning"
                                onClick={() => openEditModal(election)}
                                title="Edit Election"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              {election.status === 'upcoming' && (
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => handleStatusChange(election, 'active')}
                                  title="Start Election"
                                >
                                  <FontAwesomeIcon icon={faPlay} />
                                </button>
                              )}
                              {election.status === 'active' && (
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => handleStatusChange(election, 'completed')}
                                  title="End Election"
                                >
                                  <FontAwesomeIcon icon={faStop} />
                                </button>
                              )}
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(election)}
                                title="Delete Election"
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
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Election Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Create New Election
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
                    <div className="col-12 mb-3">
                      <label className="form-label fw-bold">Election Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                        placeholder="e.g., Student Council President 2024"
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label fw-bold">Description *</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        required
                        placeholder="Describe the purpose and scope of this election..."
                      ></textarea>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Start Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">End Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label fw-bold">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                      </select>
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
                    Create Election
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Election Modal */}
      {showEditModal && selectedElection && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <FontAwesomeIcon icon={faEdit} className="me-2" />
                  Edit Election
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleEdit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-12 mb-3">
                      <label className="form-label fw-bold">Election Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label fw-bold">Description *</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        required
                      ></textarea>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Start Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">End Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label fw-bold">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning">
                    <FontAwesomeIcon icon={faEdit} className="me-2" />
                    Update Election
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Election Details Modal */}
      {showDetailsModal && selectedElection && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <FontAwesomeIcon icon={faEye} className="me-2" />
                  Election Details
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-12 mb-4">
                    <h4 className="fw-bold text-primary">{selectedElection.title}</h4>
                    <p className="text-muted">{selectedElection.description}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="fw-bold">Status</h6>
                        {getStatusBadge(selectedElection.status)}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="fw-bold">Duration</h6>
                        <p className="mb-0 small">
                          <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                          {selectedElection.startDate ? formatDate(selectedElection.startDate) : 'Not set'} - {selectedElection.endDate ? formatDate(selectedElection.endDate) : 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="fw-bold">Candidates</h6>
                        <p className="mb-0">
                          <FontAwesomeIcon icon={faUsers} className="me-2 text-info" />
                          {selectedElection.candidatesCount || 0} registered
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="fw-bold">Total Votes</h6>
                        <p className="mb-0">
                          <FontAwesomeIcon icon={faVoteYea} className="me-2 text-primary" />
                          {selectedElection.votesCount || 0} votes cast
                        </p>
                      </div>
                    </div>
                  </div>
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
                  className="btn btn-primary"
                  onClick={() => {
                    setShowDetailsModal(false);
                    openEditModal(selectedElection);
                  }}
                >
                  <FontAwesomeIcon icon={faEdit} className="me-2" />
                  Edit Election
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Elections;
