import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';

const statusBadge = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'ongoing') return { text: 'Ongoing', cls: 'bg-success' };
  if (s === 'upcoming') return { text: 'Upcoming', cls: 'bg-info' };
  if (s === 'completed') return { text: 'Completed', cls: 'bg-secondary' };
  if (s === 'pending' || s === 'pending_approval') return { text: 'Pending Approval', cls: 'bg-warning text-dark' };
  return { text: status || 'Unknown', cls: 'bg-light text-dark' };
};

const ElectionOversight = () => {
  const { isDarkMode, colors } = useTheme();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [busyId, setBusyId] = useState(null);

  const fetchElections = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/elections', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.elections)
          ? res.data.elections
          : [];
      setElections(list);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const approveElection = async (id) => {
    setBusyId(id);
    try {
      const token = localStorage.getItem('token');
      // Backend lacks a dedicated approve endpoint; we move status to ongoing as a placeholder.
      await axios.put(`/api/elections/${id}`, { status: 'ongoing' }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchElections();
    } catch (err) {
      setError(err?.response?.data?.message || 'Approval failed');
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const s = statusFilter;
    return (elections || []).filter((e) => {
      const titleMatch = !q || (e.title || '').toLowerCase().includes(q);
      const status = (e.status || '').toLowerCase();
      const statusMatch = s === 'all'
        ? true
        : s === 'pending'
          ? ['pending', 'pending_approval'].includes(status)
          : status === s;
      return titleMatch && statusMatch;
    });
  }, [elections, search, statusFilter]);

  const counts = useMemo(() => {
    const base = { total: elections.length, pending: 0, upcoming: 0, ongoing: 0, completed: 0 };
    elections.forEach(e => {
      const s = (e.status || '').toLowerCase();
      if (['pending', 'pending_approval'].includes(s)) base.pending += 1;
      else if (s === 'upcoming') base.upcoming += 1;
      else if (s === 'ongoing') base.ongoing += 1;
      else if (s === 'completed') base.completed += 1;
    });
    return base;
  }, [elections]);

  if (loading) return <div className="p-3">Loading elections...</div>;
  if (error) return <div className="alert alert-danger small mb-3">{error}</div>;

  return (
    <div className="container-fluid" style={{ color: colors.text }}>
      {/* Header Section */}
      <div className="mb-5">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <h3 className="fw-bold mb-2" style={{ color: colors.text, fontSize: '1.75rem' }}>
              <i className="fa-solid fa-clipboard-check me-2" style={{ color: '#10b981' }}></i>
              Election Oversight
            </h3>
            <p className="text-muted mb-0">
              Review, approve, and manage pending elections with real-time status updates
            </p>
          </div>
          <button
            className="btn btn-outline-secondary"
            onClick={fetchElections}
            style={{
              borderRadius: '8px',
              padding: '0.5rem 1rem'
            }}
          >
            <i className="fa-solid fa-rotate-right me-2"></i>Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Pending', value: counts.pending, icon: 'fa-hourglass-half', tone: '#f59e0b', bg: '#fef3c7' },
            { label: 'Upcoming', value: counts.upcoming, icon: 'fa-calendar-day', tone: '#3b82f6', bg: '#dbeafe' },
            { label: 'Ongoing', value: counts.ongoing, icon: 'fa-play', tone: '#10b981', bg: '#d1fae5' },
            { label: 'Completed', value: counts.completed, icon: 'fa-flag-checkered', tone: '#8b5cf6', bg: '#ede9fe' }
          ].map((stat, idx) => (
            <div key={idx} className="col-6 col-md-3">
              <div
                style={{
                  background: isDarkMode ? `${stat.tone}15` : stat.bg,
                  border: `2px solid ${stat.tone}30`,
                  borderRadius: '12px',
                  padding: '1.5rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = stat.tone;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '10px',
                      background: stat.tone,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem'
                    }}
                  >
                    <i className={`fa-solid ${stat.icon}`}></i>
                  </div>
                  <div>
                    <div className="text-muted small fw-semibold">{stat.label}</div>
                    <div className="fw-bold" style={{ fontSize: '1.5rem', color: stat.tone }}>
                      {stat.value}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="fa-solid fa-circle-exclamation"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filter Section */}
      <div
        className="card mb-4"
        style={{
          borderColor: colors.border,
          background: isDarkMode ? colors.surface : '#fff',
          borderRadius: '12px',
          boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.08)'
        }}
      >
        <div className="card-body">
          <div className="row g-3">
            <div className="col-lg-7">
              <label className="form-label small fw-semibold mb-2">Search Elections</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: isDarkMode ? colors.inputBg : '#fff',
                  color: colors.text,
                  borderColor: colors.border,
                  borderRadius: '8px'
                }}
              />
            </div>
            <div className="col-lg-5">
              <label className="form-label small fw-semibold mb-2">Filter by Status</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  background: isDarkMode ? colors.inputBg : '#fff',
                  color: colors.text,
                  borderColor: colors.border,
                  borderRadius: '8px'
                }}
              >
                <option value="all">All Elections</option>
                <option value="pending">Pending Approval</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Elections Table */}
      <div
        className="card"
        style={{
          borderColor: colors.border,
          background: isDarkMode ? colors.surface : '#fff',
          borderRadius: '12px',
          boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}
      >
        {filtered.length === 0 ? (
          <div className="card-body py-5 text-center">
            <div
              style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                opacity: 0.5
              }}
            >
              <i className="fa-solid fa-inbox"></i>
            </div>
            <p className="text-muted fw-semibold">No elections match your filters</p>
            <small className="text-muted">Try adjusting your search or filter criteria</small>
          </div>
        ) : (
          <div className="table-responsive election-oversight-table-font-size">
            <table className="table mb-0">
                        {/* High-specificity CSS for table font size override */}
                        <style>{`
                          .election-oversight-table-font-size, .election-oversight-table-font-size * {
                            font-size: .84rem !important;
                          }
                        `}</style>
              <thead style={{ background: isDarkMode ? colors.cardBg : '#f8f9fa', borderBottomColor: colors.border }}>
                <tr>
                  <th style={{ color: colors.text }} className="fw-bold py-3">
                    <i className="fa-solid fa-poll me-2"></i>Election Title
                  </th>
                  <th style={{ color: colors.text }} className="fw-bold py-3">Status</th>
                  <th style={{ color: colors.text }} className="fw-bold py-3">
                    <i className="fa-solid fa-calendar-check me-2"></i>Start Date
                  </th>
                  <th style={{ color: colors.text }} className="fw-bold py-3">
                    <i className="fa-solid fa-calendar-xmark me-2"></i>End Date
                  </th>
                  <th style={{ color: colors.text }} className="fw-bold py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((election) => {
                  const badge = statusBadge(election.status);
                  return (
                    <tr
                      key={election._id}
                      style={{
                        borderBottomColor: colors.border,
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDarkMode ? colors.cardBg : '#f8f9fa';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td className="py-3">
                        <div className="fw-semibold" style={{ color: colors.text }}>
                          {election.title}
                        </div>
                        <small className="text-muted">ID: {election._id?.substring(0, 8)}</small>
                      </td>
                      <td className="py-3">
                        <span className={`badge ${badge.cls}`} style={{ borderRadius: '6px', fontSize: '0.75rem' }}>
                          {badge.text}
                        </span>
                      </td>
                      <td className="py-3 small">
                        <i className="fa-solid fa-clock me-2" style={{ color: '#3b82f6' }}></i>
                        {election.startDate ? new Date(election.startDate).toLocaleString() : '—'}
                      </td>
                      <td className="py-3 small">
                        <i className="fa-solid fa-clock me-2" style={{ color: '#ef4444' }}></i>
                        {election.endDate ? new Date(election.endDate).toLocaleString() : '—'}
                      </td>
                      <td className="py-3 text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          {['pending', 'pending_approval'].includes((election.status || '').toLowerCase()) && (
                            <button
                              className="btn btn-sm"
                              style={{
                                background: '#10b981',
                                color: '#fff',
                                borderRadius: '6px',
                                border: 'none',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                              }}
                              disabled={busyId === election._id}
                              onClick={() => approveElection(election._id)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#059669';
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#10b981';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              <i className="fa-solid fa-check me-1"></i>
                              {busyId === election._id ? 'Processing...' : 'Approve'}
                            </button>
                          )}
                          <button
                            className="btn btn-sm"
                            style={{
                              background: isDarkMode ? colors.cardBg : '#e5e7eb',
                              color: colors.text,
                              borderRadius: '6px',
                              border: `1px solid ${colors.border}`,
                              transition: 'all 0.2s',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = isDarkMode ? colors.border : '#d1d5db';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = isDarkMode ? colors.cardBg : '#e5e7eb';
                            }}
                          >
                            <i className="fa-solid fa-eye me-1"></i>
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElectionOversight;
