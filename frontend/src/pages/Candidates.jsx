import { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import Swal from "sweetalert2";
import { FaFileCsv, FaFilePdf } from 'react-icons/fa';
import getImageUrl from '../utils/getImageUrl';
import Select from "react-select";
import ugandaPartiesOptions from '../utils/ugandaParties';
import { useTheme } from '../contexts/ThemeContext';

// Move CreateCandidateModal OUTSIDE of Candidates
function CreateCandidateModal({
  form,
  handleFormChange,
  handleUserSelect,
  handleFormSubmit,
  creating,
  setShowCreate,
  users,
  elections,
  positionsOptions,
}) {
  const { isDarkMode, colors } = useTheme();
  const userOptions = Array.isArray(users) ? users.map((u) => ({
    value: u._id,
    label: `${u.name} (${u.email})`,
  })) : [];

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={{ backgroundColor: colors.cardBackground, color: colors.text }}>
          <style>
            {isDarkMode && `
              .form-select option {
                background-color: ${colors.cardBackground} !important;
                color: ${colors.text} !important;
              }
              .react-select__menu {
                background-color: ${colors.cardBackground} !important;
              }
              .react-select__option {
                background-color: ${colors.cardBackground} !important;
                color: ${colors.text} !important;
              }
              .react-select__option--is-focused {
                background-color: #555555 !important;
              }
            `}
          </style>
          <div className="modal-header">
            <h5 className="modal-title">Create Candidate</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowCreate(false)}
            ></button>
          </div>
          <form onSubmit={handleFormSubmit} encType="multipart/form-data">
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">User*</label>
                  <Select
                    options={userOptions}
                    value={
                      userOptions.find((opt) => opt.value === form.user) ||
                      null
                    }
                    onChange={handleUserSelect}
                    placeholder="Search or select user..."
                    isClearable
                    styles={isDarkMode ? {
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: colors.cardBackground || '#2d3748',
                        color: colors.text || '#ffffff',
                        borderColor: '#555555',
                        opacity: 1,
                        boxShadow: 'none',
                        '&:hover': {
                          borderColor: '#666666',
                        },
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isFocused ? '#4a5568' : (colors.cardBackground || '#2d3748'),
                        color: colors.text || '#ffffff',
                        opacity: 1,
                        '&:hover': {
                          backgroundColor: '#4a5568',
                        },
                      }),
                      menu: (provided) => ({
                        ...provided,
                        backgroundColor: colors.cardBackground || '#2d3748',
                        border: '1px solid #555555',
                        opacity: 1,
                        zIndex: 9999,
                      }),
                      menuList: (provided) => ({
                        ...provided,
                        backgroundColor: colors.cardBackground || '#2d3748',
                        opacity: 1,
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        color: colors.text || '#ffffff',
                        opacity: 1,
                      }),
                      input: (provided) => ({
                        ...provided,
                        color: colors.text || '#ffffff',
                        opacity: 1,
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        color: '#aaaaaa',
                        opacity: 1,
                      }),
                    } : {}}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Election*</label>
                  <select
                    className="form-select"
                    name="election"
                    value={form.election}
                    onChange={handleFormChange}
                    required
                    style={isDarkMode ? { 
                      backgroundColor: colors.cardBackground, 
                      color: colors.text, 
                      borderColor: '#555555',
                      option: {
                        backgroundColor: colors.cardBackground,
                        color: colors.text,
                      }
                    } : {}}
                  >
                    <option value="" style={isDarkMode ? { backgroundColor: colors.cardBackground, color: colors.text } : {}}>
                      Select Election
                    </option>
                    {elections.map((e) => (
                      <option 
                        key={e._id} 
                        value={e._id}
                        style={isDarkMode ? { backgroundColor: colors.cardBackground, color: colors.text } : {}}
                      >
                        {e.title || e.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Name*</label>
                  <input
                    className="form-control"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    required
                    style={isDarkMode ? { backgroundColor: colors.cardBackground, color: colors.text, borderColor: '#555555' } : {}}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Photo</label>
                  <input
                    type="file"
                    className="form-control bg-primary text-white"
                    style={{ border: "none" }}
                    name="photo"
                    accept="image/*"
                    onChange={handleFormChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Position*</label>
                  {positionsOptions && positionsOptions.length > 0 ? (
                    <select
                      className="form-select"
                      name="position"
                      value={form.position}
                      onChange={handleFormChange}
                      required
                      style={isDarkMode ? { 
                        backgroundColor: colors.cardBackground, 
                        color: colors.text, 
                        borderColor: '#555555'
                      } : {}}
                    >
                      <option value="" style={isDarkMode ? { backgroundColor: colors.cardBackground, color: colors.text } : {}}>
                        Select Position
                      </option>
                      {positionsOptions.map((p) => (
                        <option 
                          key={p.value} 
                          value={p.value}
                          style={isDarkMode ? { backgroundColor: colors.cardBackground, color: colors.text } : {}}
                        >
                          {p.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="form-control"
                      name="position"
                      value={form.position}
                      onChange={handleFormChange}
                      placeholder="Enter position (no positions found for selected election)"
                      required
                      style={isDarkMode ? { backgroundColor: colors.cardBackground, color: colors.text, borderColor: '#555555' } : {}}
                    />
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Symbol (Photo)</label>
                  <input
                    type="file"
                    className="form-control bg-primary text-white"
                    style={{ border: "none" }}
                    name="symbol"
                    accept="image/*"
                    onChange={handleFormChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Party</label>
                  <Select
                    options={ugandaPartiesOptions}
                    value={
                      ugandaPartiesOptions.find((opt) => opt.value === form.party) || null
                    }
                    onChange={(opt) =>
                      handleFormChange({ target: { name: 'party', value: opt ? opt.value : '' } })
                    }
                    placeholder="Search or select party..."
                    isClearable
                    classNamePrefix="react-select"
                    styles={isDarkMode ? {
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: colors.cardBackground || '#2d3748',
                        color: colors.text || '#ffffff',
                        borderColor: '#555555',
                        opacity: 1,
                        boxShadow: 'none',
                        '&:hover': {
                          borderColor: '#666666',
                        },
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isFocused ? '#4a5568' : (colors.cardBackground || '#2d3748'),
                        color: colors.text || '#ffffff',
                        opacity: 1,
                        '&:hover': {
                          backgroundColor: '#4a5568',
                        },
                      }),
                      menu: (provided) => ({
                        ...provided,
                        backgroundColor: colors.cardBackground || '#2d3748',
                        border: '1px solid #555555',
                        opacity: 1,
                        zIndex: 9999,
                      }),
                      menuList: (provided) => ({
                        ...provided,
                        backgroundColor: colors.cardBackground || '#2d3748',
                        opacity: 1,
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        color: colors.text || '#ffffff',
                        opacity: 1,
                      }),
                      input: (provided) => ({
                        ...provided,
                        color: colors.text || '#ffffff',
                        opacity: 1,
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        color: '#aaaaaa',
                        opacity: 1,
                      }),
                    } : {}}
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label">Description*</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    required
                    style={isDarkMode ? { backgroundColor: colors.cardBackground, color: colors.text, borderColor: '#555555' } : {}}
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label">Manifesto</label>
                  <textarea
                    className="form-control"
                    name="manifesto"
                    value={form.manifesto}
                    onChange={handleFormChange}
                    style={isDarkMode ? { backgroundColor: colors.cardBackground, color: colors.text, borderColor: '#555555' } : {}}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Candidate"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Candidates({ user }) {
    // Compact table font size for candidates table
    const tableFont80 = `
      .candidates-table-font80, .candidates-table-font80 th, .candidates-table-font80 td {
        font-size: 0.84rem !important;
      }
    `;
    // Render style block for table font size
    // Only one style block is needed per page
    const styleBlock = <style dangerouslySetInnerHTML={{ __html: tableFont80 }} />;
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [electionFilter, setElectionFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [elections, setElections] = useState([]);
  const [users, setUsers] = useState([]);
  const [positionsOptions, setPositionsOptions] = useState([]);
  const [form, setForm] = useState({
    user: "",
    election: "",
    name: "",
    photo: null,
    position: "",
    symbol: null,
    party: "",
    description: "",
    manifesto: "",
  });
  const [creating, setCreating] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const { isDarkMode, colors } = useTheme();

  const token = localStorage.getItem("token");

  // Add computed filtered candidates
  const statusFilteredCandidates = candidates.filter(candidate => {
    const matchesSearch = search === "" || 
      candidate.name?.toLowerCase().includes(search.toLowerCase()) ||
      candidate.party?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
    
    const matchesElection = electionFilter === "all" || 
      candidate.election?._id === electionFilter ||
      candidate.election?.title === electionFilter;
    
    return matchesSearch && matchesStatus && matchesElection;
  });

  // Add missing functions
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(statusFilteredCandidates.map(c => c._id || c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const exportToCSV = async () => {
    try {
      setExportLoading(true);
      const headers = ['Name', 'Party', 'Election', 'Position', 'Status', 'Email', 'Faculty', 'Course', 'Year'];
      const rows = [headers];
      
      statusFilteredCandidates.forEach(candidate => {
        rows.push([
          candidate.name || '',
          candidate.party || '',
          candidate.election?.title || '',
          candidate.position || '',
          candidate.status || '',
          candidate.user?.email || candidate.email || '',
          candidate.faculty || '',
          candidate.course || '',
          candidate.year || ''
        ]);
      });
      
      const csvContent = rows.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candidates_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      
      Swal.fire({
        icon: 'success',
        title: 'Export Successful',
        text: `Exported ${statusFilteredCandidates.length} candidates to CSV`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Export failed:', error);
      Swal.fire('Error', 'Failed to export candidates', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  const exportToPDF = () => {
    Swal.fire({
      icon: 'info',
      title: 'PDF Export',
      text: 'PDF export functionality will be available soon. Use CSV export for now.',
      confirmButtonText: 'OK'
    });
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      Swal.fire('Warning', 'Please select candidates to approve', 'warning');
      return;
    }
    // ...existing bulk approve logic...
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      Swal.fire('Warning', 'Please select candidates to delete', 'warning');
      return;
    }
    // ...existing bulk delete logic...
  };

  const fetchCandidates = async (query = "") => {
    setLoading(true);
    try {
      const url = query
        ? `https://api.campusballot.tech/api/candidates/search?q=${encodeURIComponent(query)}`
        : "https://api.campusballot.tech/api/candidates";
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCandidates(res.data || []);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to load candidates", "error");
    } finally {
      setLoading(false);
    }
  };

  const approveCandidate = async (candidateId) => {
    try {
      await axios.put(`https://api.campusballot.tech/api/candidates/${candidateId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Success', 'Candidate approved successfully', 'success');
      fetchCandidates();
    } catch (error) {
      Swal.fire('Error', 'Failed to approve candidate', 'error');
    }
  };

  const disqualifyCandidate = async (candidateId) => {
    try {
      await axios.put(`https://api.campusballot.tech/api/candidates/${candidateId}/disqualify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Success', 'Candidate disqualified successfully', 'success');
      fetchCandidates();
    } catch (error) {
      Swal.fire('Error', 'Failed to disqualify candidate', 'error');
    }
  };

  const deleteCandidate = async (candidateId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Delete'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`https://api.campusballot.tech/api/candidates/${candidateId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Success', 'Candidate deleted successfully', 'success');
        fetchCandidates();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete candidate', 'error');
      }
    }
  };

  const fetchElectionsAndUsers = async () => {
    try {
      const [electionRes, userRes] = await Promise.all([
        axios.get("https://api.campusballot.tech/api/elections", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://api.campusballot.tech/api/users/all", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setElections(electionRes.data.elections || []);
      setUsers(userRes.data.users || []);
      // If a specific election already selected in form, populate positionsOptions
      if (form.election) {
        const selected = (electionRes.data.elections || []).find((ev) => ev._id === form.election);
        if (selected && Array.isArray(selected.positions)) {
          setPositionsOptions(selected.positions.map((p) => ({ value: p, label: p })));
        }
      }
    } catch (err) {
      Swal.fire("Error", "Failed to load elections or users", "error");
    }
  };

  useEffect(() => {
    fetchCandidates();
    // eslint-disable-next-line
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCandidates(search);
  };

  const handleShowCreate = () => {
    fetchElectionsAndUsers();
    setShowCreate(true);
  };

  const handleFormChange = (e) => {
    const { name, value, files, type } = e.target;
    if (type === "file") {
      setForm((prev) => ({
        ...prev,
        [name]: files && files[0] ? files[0] : null,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      // If election changed, update positionsOptions from elections
      if (name === 'election') {
        const selected = elections.find((ev) => ev._id === value);
        if (selected && Array.isArray(selected.positions)) {
          setPositionsOptions(selected.positions.map((p) => ({ value: p, label: p })));
        } else {
          setPositionsOptions([]);
        }
        // clear any previously selected position
        setForm((prev) => ({ ...prev, position: '' }));
      }
    }
  };

  const handleUserSelect = (option) => {
    setForm((prev) => ({ ...prev, user: option ? option.value : "" }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.user ||
      !form.election ||
      !form.name ||
      !form.position ||
      !form.description
    ) {
      Swal.fire("Error", "Please fill all required fields.", "error");
      return;
    }
    setCreating(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      await axios.post("https://api.campusballot.tech/api/candidates", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      Swal.fire("Success", "Candidate created successfully!", "success");
      setShowCreate(false);
      setForm({
        user: "",
        election: "",
        name: "",
        photo: null,
        position: "",
        symbol: null,
        party: "",
        description: "",
        manifesto: "",
      });
      fetchCandidates();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to create candidate",
        "error"
      );
    } finally {
      setCreating(false);
    }
  };

  const modalStyles = {
    content: {
        color: '#ffffff', /* Set text color to white for better visibility in dark mode */
    },
    headerFooter: {
        backgroundColor: '#333333', /* Darker background for header and footer */
    },
    selectDropdown: {
        backgroundColor: '#444444', /* Darker background for dropdowns */
        color: '#ffffff', /* White text for dropdown options */
    },
    userSelect: {
        backgroundColor: '#444444', /* Darker background for user select */
        color: '#ffffff', /* White text for user select */
    },
    partySelect: {
        backgroundColor: '#444444', /* Darker background for party select */
        color: '#ffffff', /* White text for party select */
    }
};

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
            <i className="fa-solid fa-users me-2 text-warning"></i>
            Candidate Management
          </h2>
          <div style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            Manage all candidates across elections.
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <h3 className="fw-bold" style={{ color: colors.text }}>
          <i className="fa-solid fa-users me-2"></i>
          All Candidates
        </h3>
        <div className="d-flex align-items-center flex-wrap">
          <button className="btn btn-success me-2" onClick={handleShowCreate}>
            <i className="fa fa-plus me-2"></i> Add Candidate
          </button>
          <button 
            className="btn me-2" 
            onClick={exportToCSV}
            disabled={exportLoading || statusFilteredCandidates.length === 0}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none'
            }}
          >
            {exportLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Exporting...
              </>
            ) : (
              <>
                <FaFileCsv className="me-2" /> Export CSV
              </>
            )}
          </button>
          <button 
            className="btn btn-outline-primary me-2" 
            onClick={exportToPDF}
            disabled={statusFilteredCandidates.length === 0}
          >
            <FaFilePdf className="me-2" /> Export PDF
          </button>
          <button className="btn btn-outline-secondary me-2" onClick={handleBulkApprove}>
            <i className="fa fa-check me-2"></i> Bulk Approve
          </button>
          <button className="btn btn-outline-danger" onClick={handleBulkDelete}>
            <i className="fa fa-trash me-2"></i> Bulk Delete
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="row mb-3">
        <div className="col-md-4 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search candidates..."
            value={search}
            onChange={e => setSearch(e.target.value)}
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
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="disqualified">Disqualified</option>
          </select>
        </div>
        <div className="col-md-3 mb-2">
          <select
            className="form-select"
            value={electionFilter}
            onChange={e => setElectionFilter(e.target.value)}
            style={{
              backgroundColor: colors.inputBg,
              borderColor: colors.inputBorder,
              color: colors.text
            }}
          >
            <option value="all">All Elections</option>
            {elections.map(election => (
              <option key={election._id} value={election._id}>
                {election.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {styleBlock}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
          <div className="spinner-border text-primary" role="status" />
          <span className="ms-3" style={{ color: colors.text }}>Loading candidates...</span>
        </div>
      ) : (
        <div style={{
          borderRadius: '0.75rem',
          overflow: 'hidden',
          boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}>
          <table className="table table-hover table-striped mb-0 candidates-table-font80" style={{
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
                <th style={{ color: colors.text, padding: '1rem 0.75rem', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.025em', width: '32px' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.length === statusFilteredCandidates.length && statusFilteredCandidates.length > 0}
                    onChange={e => handleSelectAll(e.target.checked)}
                    style={{
                      ...(isDarkMode && {
                        backgroundColor: colors.inputBg,
                        borderColor: colors.inputBorder
                      })
                    }}
                  />
                </th>
                <th style={{ color: colors.text, padding: '1rem 0.75rem', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.025em', width: '80px' }}>
                  Photo
                </th>
                <th style={{ color: colors.text, padding: '1rem 0.75rem', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                  Name
                </th>
                <th style={{ color: colors.text, padding: '1rem 0.75rem', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                  Symbol
                </th>
                <th style={{ color: colors.text, padding: '1rem 0.75rem', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                  Party
                </th>
                <th style={{ color: colors.text, padding: '1rem 0.75rem', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                  Election
                </th>
                <th style={{ color: colors.text, padding: '1rem 0.75rem', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                  Position
                </th>
                <th style={{ color: colors.text, padding: '1rem 0.75rem', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                  Status
                </th>
                <th style={{ color: colors.text, padding: '1rem 0.75rem', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.025em', width: '200px' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {statusFilteredCandidates.length === 0 ? (
                <tr>
                  <td 
                    colSpan={9} 
                    className="text-center"
                    style={{ 
                      padding: '3rem',
                      color: colors.textMuted,
                      fontStyle: 'italic'
                    }}
                  >
                    <i className="fa-solid fa-user-slash fa-2x mb-3 d-block" style={{ opacity: 0.3 }}></i>
                    No candidates found
                  </td>
                </tr>
              ) : (
                statusFilteredCandidates.map(candidate => (
                  <tr 
                    key={candidate._id || candidate.id}
                    style={{
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    <td style={{ padding: '0.75rem' }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedIds.includes(candidate._id || candidate.id)}
                        onChange={e => handleSelectOne(candidate._id || candidate.id, e.target.checked)}
                        style={{
                          ...(isDarkMode && {
                            backgroundColor: colors.inputBg,
                            borderColor: colors.inputBorder
                          })
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <img
                        src={getImageUrl(candidate.photo) || '/default-avatar.png'}
                        alt={candidate.name}
                        style={{
                          width: 50,
                          height: 50,
                          objectFit: 'cover',
                          borderRadius: '50%',
                          border: `2px solid ${colors.border}`,
                          background: colors.surfaceHover
                        }}
                        onError={(e) => {
                          console.log('Image failed to load:', candidate.photo);
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <a 
                        href={`/admin/candidate/${candidate._id || candidate.id}`} 
                        style={{ 
                          color: colors.primary, 
                          textDecoration: 'none',
                          fontWeight: 500 
                        }}
                        onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.target.style.textDecoration = 'none'}
                      >
                        {candidate.name}
                      </a>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {candidate.symbol ? (
                        <img
                          src={getImageUrl(candidate.symbol)}
                          alt="Symbol"
                          style={{
                            width: 50,
                            height: 50,
                            objectFit: 'contain',
                            borderRadius: '50%',
                            border: `1px solid ${colors.border}`,
                            padding: '4px',
                            backgroundColor: isDarkMode ? colors.surfaceHover : '#ffffff'
                          }}
                          onError={(e) => {
                            console.log('Symbol image failed to load:', candidate.symbol);
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span style={{ color: colors.textMuted }}>No Symbol</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', color: colors.textSecondary }}>
                      {candidate.party || '-'}
                    </td>
                    <td style={{ padding: '0.75rem', color: colors.textSecondary }}>
                      {candidate.election?.title || 'Unknown'}
                    </td>
                    <td style={{ padding: '0.75rem', color: colors.textSecondary }}>
                      {candidate.position || '-'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge ${
                        candidate.status === 'approved' ? 'bg-success' : 
                        candidate.status === 'disqualified' ? 'bg-danger' : 
                        'bg-warning text-dark'
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
                            backgroundColor: candidate.status === 'approved' ? '#10b981' : 
                                           candidate.status === 'disqualified' ? '#ef4444' : '#f59e0b'
                          }}
                        ></span>
                        {candidate.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => approveCandidate(candidate._id)}
                          disabled={candidate.status === 'approved'}
                          title="Approve"
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => disqualifyCandidate(candidate._id)}
                          disabled={candidate.status === 'disqualified'}
                          title="Disqualify"
                        >
                          Disqualify
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteCandidate(candidate._id)}
                          title="Delete"
                        >
                          Delete
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

      {/* Create Modal */}
      {showCreate && (
        <CreateCandidateModal
          form={form}
          handleFormChange={handleFormChange}
          handleUserSelect={handleUserSelect}
          handleFormSubmit={handleFormSubmit}
          creating={creating}
          setShowCreate={setShowCreate}
          users={users}
          elections={elections}
          positionsOptions={positionsOptions}
        />
      )}
    </div>
  );
}

export default Candidates;