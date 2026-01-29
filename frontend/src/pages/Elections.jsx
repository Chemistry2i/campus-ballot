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
  faBullhorn,
  faChevronDown,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "../contexts/ThemeContext";

// Set axios base URL
axios.defaults.baseURL = "https://symmetrical-space-halibut-x56vpp9j9pxgf67vg-5000.app.github.dev";

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
  const [facultiesExpanded, setFacultiesExpanded] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    ongoing: 0,
    upcoming: 0,
    completed: 0
  });

  // Form state for create/edit
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startAmPm: 'AM',
    endDate: "",
    endAmPm: 'AM',
    status: "upcoming",
    positions: ["President", "Vice President", "Secretary"],
    allowedFaculties: []
  });

  // List of all faculties
  const allFaculties = [
    "Computing and Information Science",
    "Engineering",
    "Science",
    "Management & Entrepreneurship",
    "Arts and Humanities",
    "Social Sciences",
    "Built Environment",
    "Agriculture",
    "Art and Industrial Design",
    "Education",
    "Special Needs & Rehabilitation",
    "Vocational Studies"
  ];

  const { isDarkMode, colors } = useTheme();

  // Helper: convert ISO date -> datetime-local (local timezone) string 'YYYY-MM-DDTHH:MM'
  const toDateTimeLocal = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const getAmPmFromIso = (iso) => {
    if (!iso) return 'AM';
    const hr = new Date(iso).getHours();
    return hr >= 12 ? 'PM' : 'AM';
  };

  // Helper: convert datetime-local + AM/PM -> ISO string
  const toIsoWithAmPm = (dtLocal, ampm) => {
    if (!dtLocal) return null;
    const [datePart, timePartRaw] = dtLocal.split('T');
    if (!datePart || !timePartRaw) return null;
    const [hourStr, minuteStr] = timePartRaw.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10) || 0;
    if (isNaN(hour)) hour = 0;
    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    const dateObj = new Date(`${datePart}T${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:00`);
    return dateObj.toISOString();
  };

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
  (electionsResponse.data.elections || []).map(async (election) => {
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
                actualStatus = 'ongoing';
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
      ongoing: electionsData.filter(e => e.status === 'ongoing').length,
      upcoming: electionsData.filter(e => e.status === 'upcoming').length,
      completed: electionsData.filter(e => e.status === 'completed').length
    };
    setStats(stats);
  };

  const filterElections = () => {
    let filtered = elections;

    // Search filter - use searchTerm instead of search
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

  const handleCreate = async (e)=> {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      // Prepare payload: convert datetime-local + AM/PM to ISO
      const payload = {
        ...formData,
        startDate: toIsoWithAmPm(formData.startDate, formData.startAmPm),
        endDate: toIsoWithAmPm(formData.endDate, formData.endAmPm),
      };
      // Do not send status from the client; let server compute based on dates
      delete payload.status;

      await axios.post("/api/elections", payload, {
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
      if (!token) {
        Swal.fire("Error", "You must be logged in to edit elections", "error");
        return;
      }
      // Prepare payload: convert datetime-local + AM/PM to ISO
      const payload = {
        ...formData,
        startDate: toIsoWithAmPm(formData.startDate, formData.startAmPm),
        endDate: toIsoWithAmPm(formData.endDate, formData.endAmPm),
      };
      // Do not send status from the client; let server compute based on dates
      delete payload.status;

      console.log('Updating election:', selectedElection._id, 'Payload:', payload);

      await axios.put(`/api/elections/${selectedElection._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire("Success", "Election updated successfully!", "success");
      setShowEditModal(false);
      resetForm();
      fetchElections();
    } catch (error) {
      console.error("Error updating election:", error);
      console.error("Error details:", error.response?.data);
      Swal.fire("Error", error.response?.data?.message || "Failed to update election", "error");
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
        if (!token) {
          Swal.fire("Error", "You must be logged in to delete elections", "error");
          return;
        }

        console.log('Deleting election:', election._id);

        const response = await axios.delete(`/api/elections/${election._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Delete response:', response);

        // Immediately remove from state for instant UI update
        setElections(prev => prev.filter(e => (e._id || e.id) !== (election._id || election.id)));
        setFilteredElections(prev => prev.filter(e => (e._id || e.id) !== (election._id || election.id)));

        Swal.fire("Deleted!", "Election has been deleted.", "success");
        
        // Refresh to ensure data consistency
        await fetchElections();
      } catch (error) {
        console.error("Error deleting election:", error);
        console.error("Error details:", error.response?.data);
        Swal.fire("Error", error.response?.data?.message || "Failed to delete election", "error");
      }
    }
  };

  const handleStatusChange = async (election, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      // Map legacy values defensively and only send minimal payload
      let mapped = newStatus;
      if (newStatus === 'active') mapped = 'ongoing';
      if (newStatus === 'ended') mapped = 'completed';
      await axios.put(`/api/elections/${election._id}`, 
        { status: mapped }, 
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
      // Use datetime-local format
      startDate: election.startDate ? toDateTimeLocal(election.startDate) : "",
      startAmPm: election.startDate ? getAmPmFromIso(election.startDate) : 'AM',
      endDate: election.endDate ? toDateTimeLocal(election.endDate) : "",
      endAmPm: election.endDate ? getAmPmFromIso(election.endDate) : 'AM',
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
      startAmPm: 'AM',
      endDate: "",
      endAmPm: 'AM',
      status: "upcoming",
      positions: ["President", "Vice President", "Secretary"],
      allowedFaculties: []
    });
    setSelectedElection(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      ongoing: { class: "bg-success", icon: faPlay, text: "Ongoing" },
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

  // Add missing exportToCSV function
  const exportToCSV = () => {
    try {
      const headers = ['Title', 'Status', 'Start Date', 'End Date', 'Candidates', 'Votes'];
      const rows = [headers];
      
      filteredElections.forEach(election => {
        rows.push([
          election.title || '',
          election.status || '',
          election.startDate ? new Date(election.startDate).toLocaleDateString() : '',
          election.endDate ? new Date(election.endDate).toLocaleDateString() : '',
          election.candidatesCount || 0,
          election.votesCount || 0
        ]);
      });
      
      const csvContent = rows.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `elections_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      Swal.fire('Error', 'Failed to export elections', 'error');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary mb-3" />
          <p>Loading elections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: colors.background }}>
      {/* Banner */}
      <div
        className="mb-4 rounded shadow-sm"
        style={{
          background: 'linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 90,
          padding: '2.5rem 2rem',
        }}
      >
        <div>
          <h2 className="fw-bold mb-1" style={{ fontSize: '2rem' }}>
            <i className="fa-solid fa-vote-yea me-2 text-warning"></i>
            Elections Management
          </h2>
          <div style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            Manage all elections in the system.
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <h3 className="fw-bold" style={{ color: colors.text }}>
          <i className="fa-solid fa-vote-yea me-2"></i>
          All Elections
        </h3>
        <div className="d-flex align-items-center flex-wrap">
          <button className="btn btn-success me-2" onClick={() => setShowCreateModal(true)} disabled>
            <i className="fa fa-plus me-2"></i> Create Election
          </button>
          <button className="btn btn-outline-primary me-2" onClick={exportToCSV}>
            <i className="fa fa-download me-2"></i> Export CSV
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="row mb-3">
        <div className="col-md-4 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search elections..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              backgroundColor: colors.inputBg,
              borderColor: colors.inputBorder,
              color: colors.text
            }}
          />
        </div>
        <div className="col-md-3 mb-2">
          <select
            className="form-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              backgroundColor: colors.inputBg,
              borderColor: colors.inputBorder,
              color: colors.text
            }}
          >
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
          <div className="spinner-border text-primary" role="status" />
          <span className="ms-3" style={{ color: colors.text }}>Loading elections...</span>
        </div>
      ) : (
        <div style={{
          borderRadius: '0.75rem',
          overflow: 'hidden',
          boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}>
          <table className="table table-hover table-striped mb-0" style={{
            ...(isDarkMode && {
              '--bs-table-bg': colors.surface,
              '--bs-table-striped-bg': '#2d3748',
              '--bs-table-hover-bg': '#3b4a5c',
              '--bs-table-border-color': colors.border,
            })
          }}>
            <thead style={{ 
              backgroundColor: isDarkMode ? '#334155' : '#f8f9fa',
              borderBottom: `2px solid ${colors.border}`
            }}>
              <tr>
                <th style={{ color: colors.text, padding: '1rem 0.75rem', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                  Election Title
                </th>
                <th style={{ color: colors.text, padding: '1rem 0.75rem', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                  Status
                </th>
                <th style={{ color: colors.text, padding: '1rem 0.75rem', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                  Start Date
                </th>
                <th style={{ color: colors.text, padding: '1rem 0.75rem', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                  End Date
                </th>
                <th style={{ color: colors.text, padding: '1rem 0.75rem', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                  Candidates
                </th>
                <th style={{ color: colors.text, padding: '1rem 0.75rem', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                  Votes
                </th>
                <th style={{ color: colors.text, padding: '1rem 0.75rem', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.025em', width: '200px' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredElections.length === 0 ? (
                <tr>
                  <td 
                    colSpan={7} 
                    className="text-center"
                    style={{ 
                      padding: '3rem',
                      color: colors.textMuted,
                      fontStyle: 'italic'
                    }}
                  >
                    <i className="fa-solid fa-vote-yea fa-2x mb-3 d-block" style={{ opacity: 0.3 }}></i>
                    No elections found
                  </td>
                </tr>
              ) : (
                filteredElections.map(election => (
                  <tr 
                    key={election._id || election.id}
                    style={{
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    <td style={{ padding: '0.75rem' }}>
                      <div>
                        <div style={{ color: colors.text, fontWeight: 500 }}>{election.title}</div>
                        <small style={{ color: colors.textMuted }}>{election.description || 'No description'}</small>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge ${
                        election.status === 'completed' ? 'bg-success' : 
                        election.status === 'ongoing' ? 'bg-primary' : 
                        'bg-secondary'
                      }`} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <span
                          style={{
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: election.status === 'completed' ? '#10b981' : 
                                           election.status === 'ongoing' ? '#3b82f6' : '#6c757d'
                          }}
                        ></span>
                        {election.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: colors.textSecondary }}>
                      <div style={{ fontSize: '0.875rem' }}>
                        <i className="fa fa-calendar me-1"></i>
                        {election.startDate ? new Date(election.startDate).toLocaleDateString() : '-'}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', color: colors.textSecondary }}>
                      <div style={{ fontSize: '0.875rem' }}>
                        <i className="fa fa-calendar me-1"></i>
                        {election.endDate ? new Date(election.endDate).toLocaleDateString() : '-'}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className="badge bg-info" style={{ fontSize: '0.8rem' }}>
                        {election.candidatesCount || 0}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className="badge bg-primary" style={{ fontSize: '0.8rem' }}>
                        {election.votesCount || 0}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-info"
                          onClick={() => openDetailsModal(election)}
                          title="View"
                        >
                          <i className="fa fa-eye"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => openEditModal(election)}
                          title="Edit"
                        >
                          <i className="fa fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(election)}
                          title="Delete"
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

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
                      <div className="d-flex gap-2">
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={formData.startDate}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                          required
                        />
                        <select className="form-select" style={{maxWidth: '110px'}} value={formData.startAmPm} onChange={e => setFormData({...formData, startAmPm: e.target.value})}>
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">End Date *</label>
                      <div className="d-flex gap-2">
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={formData.endDate}
                          onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                          required
                        />
                        <select className="form-select" style={{maxWidth: '110px'}} value={formData.endAmPm} onChange={e => setFormData({...formData, endAmPm: e.target.value})}>
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label fw-bold">Allowed Faculties</label>
                      <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="selectAllFaculties"
                            checked={(formData.allowedFaculties || []).length === allFaculties.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({...formData, allowedFaculties: [...allFaculties]});
                              } else {
                                setFormData({...formData, allowedFaculties: []});
                              }
                            }}
                          />
                          <label className="form-check-label fw-bold" htmlFor="selectAllFaculties">
                            All Faculties
                          </label>
                        </div>
                        <hr />
                        {allFaculties.map((faculty, index) => (
                          <div className="form-check" key={index}>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`faculty-${index}`}
                              checked={(formData.allowedFaculties || []).includes(faculty)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({...formData, allowedFaculties: [...formData.allowedFaculties, faculty]});
                                } else {
                                  setFormData({...formData, allowedFaculties: formData.allowedFaculties.filter(f => f !== faculty)});
                                }
                              }}
                            />
                            <label className="form-check-label" htmlFor={`faculty-${index}`}>
                              {faculty}
                            </label>
                          </div>
                        ))}
                      </div>
                      <small className="text-muted">Select which faculties can participate in this election. Leave empty for all faculties.</small>
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
                      <div className="d-flex gap-2">
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={formData.startDate}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                          required
                        />
                        <select className="form-select" style={{maxWidth: '110px'}} value={formData.startAmPm} onChange={e => setFormData({...formData, startAmPm: e.target.value})}>
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">End Date *</label>
                      <div className="d-flex gap-2">
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={formData.endDate}
                          onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                          required
                        />
                        <select className="form-select" style={{maxWidth: '110px'}} value={formData.endAmPm} onChange={e => setFormData({...formData, endAmPm: e.target.value})}>
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label fw-bold">Allowed Faculties</label>
                      <div className="border rounded">
                        {/* Accordion Header */}
                        <div 
                          className="d-flex justify-content-between align-items-center p-3"
                          style={{ 
                            cursor: 'pointer',
                            backgroundColor: colors.surface,
                            borderBottom: facultiesExpanded ? `1px solid ${colors.border}` : 'none'
                          }}
                          onClick={() => setFacultiesExpanded(!facultiesExpanded)}
                        >
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon 
                              icon={facultiesExpanded ? faChevronDown : faChevronRight} 
                              className="me-2"
                              style={{ color: colors.primary }}
                            />
                            <span style={{ fontWeight: 500, color: colors.text }}>
                              {(formData.allowedFaculties || []).length === 0 
                                ? 'All Faculties' 
                                : `${(formData.allowedFaculties || []).length} Selected`}
                            </span>
                          </div>
                          <span className="badge bg-primary">
                            {(formData.allowedFaculties || []).length} / {allFaculties.length}
                          </span>
                        </div>
                        
                        {/* Accordion Body */}
                        {facultiesExpanded && (
                          <div className="p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            <div className="form-check mb-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="editSelectAllFaculties"
                                checked={(formData.allowedFaculties || []).length === allFaculties.length}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({...formData, allowedFaculties: [...allFaculties]});
                                  } else {
                                    setFormData({...formData, allowedFaculties: []});
                                  }
                                }}
                              />
                              <label className="form-check-label fw-bold" htmlFor="editSelectAllFaculties">
                                All Faculties
                              </label>
                            </div>
                            <hr />
                            {allFaculties.map((faculty, index) => (
                              <div className="form-check" key={index}>
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`edit-faculty-${index}`}
                                  checked={(formData.allowedFaculties || []).includes(faculty)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData({...formData, allowedFaculties: [...formData.allowedFaculties, faculty]});
                                    } else {
                                      setFormData({...formData, allowedFaculties: formData.allowedFaculties.filter(f => f !== faculty)});
                                    }
                                  }}
                                />
                                <label className="form-check-label" htmlFor={`edit-faculty-${index}`}>
                                  {faculty}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <small className="text-muted">Select which faculties can participate in this election. Leave empty for all faculties.</small>
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label fw-bold">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="ended">Ended</option>
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
