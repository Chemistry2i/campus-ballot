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
  const [searchField, setSearchField] = useState('all'); // 'all', 'name', 'email', 'studentId', 'faculty'
  const [showSearchTips, setShowSearchTips] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      setCurrentPage(1); // Reset to page 1 when election changes
      fetchVoters();
    }
  }, [selectedElection]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedElection) {
      fetchVoters();
    }
  }, [currentPage, limit, searchTerm, sortBy, sortOrder, searchField]); // eslint-disable-line react-hooks/exhaustive-deps

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
        searchField: searchField,
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

  // Export functionality
  const handleExportVoters = async (format = 'csv') => {
    if (!selectedElection) {
      alert('Please select an election first');
      return;
    }

    try {
      setExportLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        searchField: searchField,
        search: searchTerm,
        sortBy: sortBy,
        sortOrder: sortOrder,
        format: format
      });
      
      const response = await axios.get(
        `/api/observer/elections/${selectedElection}/voters/export?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const election = elections.find(e => e._id === selectedElection);
      const electionTitle = election?.title || 'election';
      const timestamp = new Date().toISOString().split('T')[0];
      
      link.setAttribute('download', `${electionTitle.replace(/\s+/g, '_')}_voters_${timestamp}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting voters:', err);
      alert('Failed to export voters list');
    } finally {
      setExportLoading(false);
    }
  };

  // Clear search functionality
  const clearSearch = () => {
    setSearchTerm('');
    setSearchField('all');
    setCurrentPage(1); // Reset to page 1 when clearing search
  };

  // Handle keyboard shortcuts
  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      clearSearch();
    }
  };


  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h3 className="fw-bold mb-1" style={{ color: colors.text }}>
              <i className="fas fa-users me-2"></i>
              Eligible Voters
            </h3>
            <p className="text-muted mb-0">View and manage eligible voters in elections</p>
          </div>
          
          {/* Export Buttons */}
          {selectedElection && voters.length > 0 && (
            <div className="d-flex gap-2">
              <button
                className="btn btn-success"
                onClick={() => handleExportVoters('csv')}
                disabled={exportLoading}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {exportLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Exporting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-file-csv"></i>
                    Export CSV
                  </>
                )}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleExportVoters('pdf')}
                disabled={exportLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <i className="fas fa-file-pdf"></i>
                Export PDF
              </button>
            </div>
          )}
        </div>
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
          <label className="form-label mb-2" style={{ color: colors.text }}>
            Search Voters 
            <small className="text-muted ms-1">(Press Esc to clear)</small>
          </label>
          <div className="input-group position-relative">
            <select 
              className="form-select" 
              style={{
                maxWidth: '140px',
                background: colors.surface,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px 0 0 8px'
              }}
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              title="Select which field to search in"
            >
              <option value="all">All Fields</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="studentId">Student ID</option>
              <option value="faculty">Faculty</option>
            </select>
            <input
              type="text"
              className="form-control"
              placeholder={
                searchField === 'all' 
                  ? 'Search by name, email, ID, or faculty...' 
                  : `Search by ${searchField}...`
              }
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to page 1 when searching
              }}
              onKeyDown={handleKeyPress}
              onFocus={() => setShowSearchTips(true)}
              onBlur={() => setTimeout(() => setShowSearchTips(false), 200)}
              style={{
                background: colors.surface,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: '0'
              }}
            />
            <button 
              className="btn btn-outline-secondary"
              onClick={clearSearch}
              title="Clear search"
              style={{
                borderColor: colors.border,
                borderRadius: '0 8px 8px 0',
                background: colors.surface,
                color: colors.text
              }}
            >
              <i className="fas fa-times"></i>
            </button>
            
            {/* Search Tips Dropdown */}
            {showSearchTips && !searchTerm && (
              <div 
                className="position-absolute"
                style={{
                  top: '100%',
                  left: '140px',
                  right: '0px',
                  zIndex: 1000,
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0 0 8px 8px',
                  borderTop: 'none',
                  padding: '10px',
                  boxShadow: isDarkMode ? '0 4px 8px rgba(0, 0, 0, 0.3)' : '0 4px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                <small style={{ color: colors.textMuted }}>
                  <strong>Search Tips:</strong><br />
                  • Use partial names: "john" finds "John Doe"<br />
                  • Email domains: "@gmail.com"<br />
                  • Faculty codes: "CS", "ENG", etc.<br />
                  • Student IDs: "2021" finds all 2021 students
                </small>
              </div>
            )}
          </div>
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

      {/* Search Results Indicator */}
      {searchTerm && (
        <div className="row mb-3">
          <div className="col-12">
            <div 
              className="alert alert-info d-flex justify-content-between align-items-center"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                color: colors.text,
                marginBottom: '1rem'
              }}
            >
              <div>
                <i className="fas fa-search me-2"></i>
                Searching for "<strong>{searchTerm}</strong>" 
                {searchField !== 'all' && (
                  <span> in <strong>{searchField}</strong></span>
                )}
                {pagination && (
                  <span> - Found {pagination.totalVoters} result(s)</span>
                )}
              </div>
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={clearSearch}
                style={{
                  borderColor: colors.border,
                  color: colors.text
                }}
              >
                <i className="fas fa-times me-1"></i>
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-md-3">
            <div
              className="card p-3 h-100"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: isDarkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    flexShrink: 0
                  }}
                >
                  <i className="fas fa-users text-white" style={{ fontSize: '1.25rem' }}></i>
                </div>
                <div>
                  <small style={{ color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Total Eligible Voters</small>
                  <h4 className="fw-bold mb-0" style={{ color: colors.text }}>
                    {statistics.totalEligible || 0}
                  </h4>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <div
              className="card p-3 h-100"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: isDarkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    flexShrink: 0
                  }}
                >
                  <i className="fas fa-check-circle text-white" style={{ fontSize: '1.25rem' }}></i>
                </div>
                <div>
                  <small style={{ color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Total Voted</small>
                  <h4 className="fw-bold mb-0" style={{ color: '#10b981' }}>
                    {statistics.totalVoted || 0}
                  </h4>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <div
              className="card p-3 h-100"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: isDarkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    flexShrink: 0
                  }}
                >
                  <i className="fas fa-clock text-white" style={{ fontSize: '1.25rem' }}></i>
                </div>
                <div>
                  <small style={{ color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Pending</small>
                  <h4 className="fw-bold mb-0" style={{ color: '#f59e0b' }}>
                    {statistics.pendingVoters || 0}
                  </h4>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <div
              className="card p-3 h-100"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: isDarkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    flexShrink: 0
                  }}
                >
                  <i className="fas fa-percentage text-white" style={{ fontSize: '1.25rem' }}></i>
                </div>
                <div>
                  <small style={{ color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Turnout %</small>
                  <h4 className="fw-bold mb-0" style={{ color: '#8b5cf6' }}>
                    {parseFloat(statistics.turnoutPercentage || 0).toFixed(1)}%
                  </h4>
                </div>
              </div>
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
          <ThemedTable striped hover responsive>
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
                      <i className="fas fa-search mb-3" style={{ fontSize: '2rem', display: 'block' }}></i>
                      {searchTerm ? (
                        <div>
                          <strong>No matching voters found</strong>
                          <p className="mb-2">Try adjusting your search criteria:</p>
                          <ul className="list-unstyled">
                            <li>• Check spelling</li>
                            <li>• Try different search field</li>
                            <li>• Use partial names or emails</li>
                          </ul>
                          <button 
                            className="btn btn-sm btn-primary mt-2"
                            onClick={clearSearch}
                          >
                            <i className="fas fa-times me-1"></i>
                            Clear Search
                          </button>
                        </div>
                      ) : (
                        <div>
                          <strong>No voters to display</strong>
                          <p>Please select an election to view eligible voters</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  voters.map((voter) => (
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
            </ThemedTable>
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
