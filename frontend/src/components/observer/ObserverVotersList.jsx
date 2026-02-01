import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import ThemedTable from '../common/ThemedTable';

const ObserverVotersList = () => {
  const { isDarkMode, colors } = useTheme();
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedElection, setSelectedElection] = useState('');
  const [elections, setElections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statistics, setStatistics] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      setCurrentPage(1); // Reset to page 1 when election changes
      fetchVoters();
    }
  }, [selectedElection]);

  useEffect(() => {
    if (selectedElection) {
      fetchVoters();
    }
  }, [currentPage, limit, searchTerm, sortBy, sortOrder]);

  const fetchElections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/observer/assigned-elections', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const electionsList = response.data.data?.elections || [];
      setElections(electionsList);
      if (electionsList?.length > 0) {
        setSelectedElection(electionsList[0]._id);
      }
    } catch (err) {
      console.error('Error fetching elections:', err);
      setError('Failed to load elections');
      setElections([]);
    }
  };

  const fetchVoters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        search: searchTerm,
        sortBy: sortBy,
        sortOrder: sortOrder
      });
      
      const response = await axios.get(`/api/observer/elections/${selectedElection}/voters?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data.data;
      setVoters(data?.voters || []);
      setStatistics(data?.statistics || null);
      setPagination(data?.pagination || null);
      setError(null);
    } catch (err) {
      console.error('Error fetching voters:', err);
      setError('Failed to load voters list');
      setVoters([]);
      setStatistics(null);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: colors.text }}>
          <i className="fas fa-users me-2"></i>
          Eligible Voters
        </h3>
        <p className="text-muted mb-0">View and manage eligible voters in elections</p>
      </div>

      {/* Filters */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <label className="form-label mb-2" style={{ color: colors.text }}>Select Election</label>
          <select
            className="form-select"
            value={selectedElection}
            onChange={(e) => setSelectedElection(e.target.value)}
            style={{
              background: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px'
            }}
          >
            <option value="">-- Select Election --</option>
            {elections.map(election => (
              <option key={election._id} value={election._id}>
                {election.title}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label mb-2" style={{ color: colors.text }}>Search Voters</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to page 1 when searching
            }}
            style={{
              background: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px'
            }}
          />
        </div>
        <div className="col-12 col-md-2">
          <label className="form-label mb-2" style={{ color: colors.text }}>Sort By</label>
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              background: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px'
            }}
          >
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="createdAt">Registration Date</option>
          </select>
        </div>
        <div className="col-12 col-md-2">
          <label className="form-label mb-2" style={{ color: colors.text }}>Per Page</label>
          <select
            className="form-select"
            value={limit}
            onChange={(e) => {
              setLimit(e.target.value);
              setCurrentPage(1); // Reset to page 1 when changing limit
            }}
            style={{
              background: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px'
            }}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-3">
            <div
              className="card p-3"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px'
              }}
            >
              <small className="text-muted">Total Eligible Voters</small>
              <h4 className="fw-bold mt-2" style={{ color: colors.text }}>
                {statistics.totalEligible || 0}
              </h4>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div
              className="card p-3"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px'
              }}
            >
              <small className="text-muted">Total Voted</small>
              <h4 className="fw-bold mt-2" style={{ color: '#10b981' }}>
                {statistics.totalVoted || 0}
              </h4>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div
              className="card p-3"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px'
              }}
            >
              <small className="text-muted">Pending</small>
              <h4 className="fw-bold mt-2" style={{ color: '#f59e0b' }}>
                {statistics.pendingVoters || 0}
              </h4>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div
              className="card p-3"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px'
              }}
            >
              <small className="text-muted">Turnout %</small>
              <h4 className="fw-bold mt-2" style={{ color: '#3b82f6' }}>
                {parseFloat(statistics.turnoutPercentage || 0).toFixed(1)}%
              </h4>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <div
          className="card"
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px'
          }}
        >
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead style={{
                background: isDarkMode ? colors.surfaceHover : '#f9fafb',
                borderBottom: `2px solid ${colors.border}`
              }}>
                <tr>
                  <th style={{ color: colors.text, cursor: 'pointer' }} onClick={() => {
                    setSortBy('name');
                    setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}>
                    Name 
                    {sortBy === 'name' && (
                      <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                    )}
                  </th>
                  <th style={{ color: colors.text, cursor: 'pointer' }} onClick={() => {
                    setSortBy('email');
                    setSortOrder(sortBy === 'email' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}>
                    Email
                    {sortBy === 'email' && (
                      <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                    )}
                  </th>
                  <th style={{ color: colors.text }}>Student ID</th>
                  <th style={{ color: colors.text }}>Faculty</th>
                  <th style={{ color: colors.text }}>Phone</th>
                  <th style={{ color: colors.text }}>Status</th>
                  <th style={{ color: colors.text, cursor: 'pointer' }} onClick={() => {
                    setSortBy('createdAt');
                    setSortOrder(sortBy === 'createdAt' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}>
                    Registered
                    {sortBy === 'createdAt' && (
                      <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                    )}
                  </th>
                  <th style={{ color: colors.text }}>Voted</th>
                </tr>
              </thead>
              <tbody>
                {voters.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5" style={{ color: colors.textMuted }}>
                      <i className="fas fa-inbox mb-3" style={{ fontSize: '2rem', display: 'block' }}></i>
                      {searchTerm ? 'No matching voters found' : 'No voters to display'}
                    </td>
                  </tr>
                ) : (
                  voters.map((voter, idx) => (
                    <tr key={voter._id} style={{ borderColor: colors.border }}>
                      <td style={{ color: colors.text }}>
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white me-2"
                            style={{
                              width: '35px',
                              height: '35px',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              fontSize: '0.875rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {voter.name?.charAt(0).toUpperCase()}
                          </div>
                          {voter.name}
                        </div>
                      </td>
                      <td style={{ color: colors.text }}>{voter.email}</td>
                      <td style={{ color: colors.textSecondary }}>{voter.studentId || 'N/A'}</td>
                      <td style={{ color: colors.textSecondary }}>{voter.faculty || 'N/A'}</td>
                      <td style={{ color: colors.textSecondary }}>{voter.phone || 'N/A'}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: voter.accountStatus === 'active' ? '#10b98130' : '#f5a0a030',
                            color: voter.accountStatus === 'active' ? '#10b981' : '#f59e0b'
                          }}
                        >
                          {voter.accountStatus}
                        </span>
                      </td>
                      <td style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                        {voter.registeredAt
                          ? new Date(voter.registeredAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : '-'
                        }
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: voter.hasVoted ? '#10b98130' : '#ef444430',
                            color: voter.hasVoted ? '#10b981' : '#ef4444'
                          }}
                        >
                          <i className={`fas fa-${voter.hasVoted ? 'check' : 'times'} me-1`}></i>
                          {voter.hasVoted ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div style={{ color: colors.text }}>
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, pagination.totalVoters)} of {pagination.totalVoters} voters
          </div>
          
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${!pagination.hasPrev ? 'disabled' : ''}`}>
                <button 
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  style={{
                    background: colors.surface,
                    border: `1px solid ${colors.border}`,
                    color: colors.text
                  }}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
              </li>
              
              {/* Page numbers */}
              {[...Array(pagination.totalPages)].map((_, index) => {
                const pageNum = index + 1;
                const isActive = pageNum === currentPage;
                
                // Show first 2, last 2, current and adjacent pages
                const showPage = pageNum === 1 || 
                                pageNum === pagination.totalPages || 
                                Math.abs(pageNum - currentPage) <= 1;
                
                if (!showPage && pageNum !== 2 && pageNum !== pagination.totalPages - 1) {
                  // Show ellipsis
                  if (pageNum === 3 && currentPage > 4) {
                    return (
                      <li key={pageNum} className="page-item disabled">
                        <span className="page-link" style={{ background: colors.surface, border: `1px solid ${colors.border}`, color: colors.textMuted }}>...</span>
                      </li>
                    );
                  }
                  if (pageNum === pagination.totalPages - 2 && currentPage < pagination.totalPages - 3) {
                    return (
                      <li key={pageNum} className="page-item disabled">
                        <span className="page-link" style={{ background: colors.surface, border: `1px solid ${colors.border}`, color: colors.textMuted }}>...</span>
                      </li>
                    );
                  }
                  return null;
                }
                
                return (
                  <li key={pageNum} className={`page-item ${isActive ? 'active' : ''}`}>
                    <button 
                      className="page-link"
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        background: isActive ? '#007bff' : colors.surface,
                        border: `1px solid ${isActive ? '#007bff' : colors.border}`,
                        color: isActive ? 'white' : colors.text
                      }}
                    >
                      {pageNum}
                    </button>
                  </li>
                );
              })}
              
              <li className={`page-item ${!pagination.hasNext ? 'disabled' : ''}`}>
                <button 
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  style={{
                    background: colors.surface,
                    border: `1px solid ${colors.border}`,
                    color: colors.text
                  }}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ObserverVotersList;
