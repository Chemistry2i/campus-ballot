import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaFileCsv, FaFilePdf, FaFileExcel, FaTrophy, FaUsers, FaVoteYea } from 'react-icons/fa';
import useSocket from '../../hooks/useSocket';
import ErrorBoundary from '../common/ErrorBoundary';
import { PositionCardSkeleton } from './SkeletonLoaders';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTheme } from '../../contexts/ThemeContext';
import ThemedTable from '../common/ThemedTable';

// Position icons mapping
const POSITION_ICONS = {
  'President': '👑',
  'Vice President': '🎤',
  'Treasurer': '💰',
  'Secretary': '📝',
  'Chairperson': '🎯',
  'Director': '📊',
  'Coordinator': '🔗',
  'Representative': '🗳️'
};

// Distinct color palettes per position
const POSITION_COLORS = {
  0: 'rgba(59, 130, 246, 0.8)',   // Blue
  1: 'rgba(249, 115, 22, 0.8)',   // Orange
  2: 'rgba(168, 85, 247, 0.8)',   // Purple
  3: 'rgba(236, 72, 153, 0.8)',   // Pink
  4: 'rgba(14, 165, 233, 0.8)',   // Sky
  5: 'rgba(245, 158, 11, 0.8)',   // Amber
  6: 'rgba(99, 102, 241, 0.8)',   // Indigo
  7: 'rgba(239, 68, 68, 0.8)',    // Red
};

const WINNER_COLOR = 'rgba(34, 197, 94, 0.95)'; // Green for winner
const CHART_COLORS = Object.values(POSITION_COLORS);

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Results({ user }) {
  const { socketRef } = useSocket();
  const { isDarkMode, colors } = useTheme();
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState(null);
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState([]);
  const [groupedResults, setGroupedResults] = useState({}); // { position: [candidates] }
  const [loading, setLoading] = useState(false);
  const [unpublished, setUnpublished] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Authorization check - must happen but not early return (hooks rule violation)
  const isAuthorized = user?.role === 'admin';

  // Sanitize candidate names to prevent XSS
  const sanitizeName = (name) => {
    if (!name) return '(Unknown)';
    return String(name)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim();
  };

  // Get color for position index
  const getPositionColor = (index) => {
    return POSITION_COLORS[index % Object.keys(POSITION_COLORS).length];
  };

  // Get icon for position name
  const getPositionIcon = (position) => {
    return POSITION_ICONS[position] || '📌';
  };

  // Group results by position and find winner per position
  const groupResultsByPosition = (candidatesList) => {
    const grouped = {};
    const positions = [];

    // Group candidates by position
    candidatesList.forEach(candidate => {
      const pos = candidate.position || 'Unassigned';
      if (!grouped[pos]) {
        grouped[pos] = [];
        positions.push(pos);
      }
      grouped[pos].push(candidate);
    });

    // Sort candidates within each position by votes (descending)
    Object.keys(grouped).forEach(position => {
      grouped[position].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    });

    setGroupedResults(grouped);
    return { grouped, positions };
  };

  // Get ALL winners for a position (handles ties - multiple candidates with same highest votes)
  const getPositionWinners = (positionCandidates) => {
    if (!positionCandidates || positionCandidates.length === 0) return [];
    const maxVotes = Math.max(...positionCandidates.map(c => c.votes || 0), 0);
    if (maxVotes === 0) return [];
    return positionCandidates.filter(c => c.votes === maxVotes);
  };

  // Get winner for a specific position (returns first winner, kept for backward compat)
  const getPositionWinner = (positionCandidates) => {
    const winners = getPositionWinners(positionCandidates);
    return winners.length > 0 ? winners[0] : null;
  };

  // Check if candidate is winner in their position (handles ties)
  const isPositionWinner = (candidate, position) => {
    const winners = getPositionWinners(groupedResults[position]);
    return winners.some(w => candidate._id === w._id || candidate.id === w.id || candidate.name === w.name);
  };

  // Calculate total votes for a position
  const getPositionTotalVotes = (positionCandidates) => {
    return positionCandidates.reduce((sum, c) => sum + (c.votes || 0), 0);
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://api.campusballot.tech/api/elections', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload = res.data;
      if (Array.isArray(payload)) {
        setElections(payload);
      } else if (payload?.elections && Array.isArray(payload.elections)) {
        setElections(payload.elections);
      } else {
        setElections([]);
      }
    } catch (err) {
      console.error('Failed to load elections', err);
      Swal.fire('Error', 'Failed to load elections', 'error');
    }
  };

  const loadResults = useCallback(async (electionId) => {
    if (!electionId) {
      console.warn('loadResults called without electionId');
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      setSelectedElectionId(electionId);
      const url = `https://api.campusballot.tech/api/elections/${electionId}/results`;
      console.debug('Loading results from', url);
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedElection(res.data.election || null);
      const candidatesList = res.data.results || [];
      setResults(candidatesList);
      groupResultsByPosition(candidatesList);
      setUnpublished(false);
    } catch (err) {
      console.error('Failed to load results', err);
      if (err.response?.status === 403) {
        setUnpublished(true);
        setResults([]);
        Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Results not published yet' });
      } else if (err.response?.status === 404) {
        const serverMsg = err.response?.data?.message || 'Not Found';
        Swal.fire('Not Found', `Results endpoint returned 404: ${serverMsg}`, 'error');
      } else {
        const status = err.response?.status ? ` (${err.response.status})` : '';
        const serverMsg = err.response?.data?.message ? `: ${err.response.data.message}` : '';
        Swal.fire('Error', `Failed to load results${status}${serverMsg}`, 'error');
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const publishResults = async () => {
    if (!selectedElectionId) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://api.campusballot.tech/api/elections/${selectedElectionId}/publish-results`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Results published' });
      await loadResults(selectedElectionId);
      setUnpublished(false);
    } catch (err) {
      console.error('Failed to publish results', err);
      Swal.fire('Error', 'Failed to publish results', 'error');
    }
  };

  // Audit logging for exports
  const auditLog = async (action, metadata = {}) => {
    try {
      const logData = {
        action,
        userId: user?._id || user?.id || 'unknown',
        userName: user?.name || user?.email || 'unknown',
        electionId: selectedElectionId,
        electionTitle: selectedElection,
        timestamp: new Date().toISOString(),
        ...metadata
      };
      
      console.log(`[AUDIT] ${action}:`, logData);
      
      // Optional: Send to backend audit log endpoint
      // const token = localStorage.getItem('token');
      // await axios.post('/api/audit-logs', logData, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.error('Audit logging failed:', err);
    }
  };

  const exportResultsCSV = async () => {
    try {
      setExportLoading(true);
      
      // Audit log the export action
      await auditLog('EXPORT_RESULTS', { 
        format: 'CSV',
        candidateCount: results.length,
        positionCount: Object.keys(groupedResults).length
      });
      
      const electionTitle = selectedElection || 'Election Results';
      let csv = `${electionTitle}\n`;
      csv += `Exported: ${new Date().toLocaleString()}\n`;
      csv += `Exported by: ${user?.name || user?.email || 'Admin'}\n\n`;

      Object.keys(groupedResults).forEach((position) => {
        const positionCandidates = groupedResults[position];
        const totalVotes = getPositionTotalVotes(positionCandidates);

        csv += `"${position}"\n`;
        csv += `Position Total Votes,${totalVotes}\n`;
        csv += `Candidate,Votes,Percentage,Status\n`;

        positionCandidates.forEach((candidate) => {
          const percent = totalVotes > 0 ? ((candidate.votes || 0) / totalVotes * 100).toFixed(1) : '0.0';
          const winner = getPositionWinner(positionCandidates);
          const isWinner = candidate._id === winner?._id;
          const status = isWinner ? 'WINNER 🏆' : '';

          csv += `"${candidate.name || 'Unknown'}",${candidate.votes || 0},"${percent}%","${status}"\n`;
        });
        csv += `\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `election-results-${selectedElectionId}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      Swal.fire({
        icon: 'success',
        title: 'Export Successful',
        text: `Exported results for "${electionTitle}"`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Export failed', err);
      Swal.fire('Error', 'Failed to export results', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  const exportToExcel = () => {
    Swal.fire({
      icon: 'info',
      title: 'Excel Export',
      text: 'Excel export will be available soon. Use CSV export for now.',
      confirmButtonText: 'OK'
    });
  };

  const exportToPDF = () => {
    Swal.fire({
      icon: 'info',
      title: 'PDF Export',
      text: 'PDF export will be available soon. Use CSV export for now.',
      confirmButtonText: 'OK'
    });
  };

  // Listen for published events
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;

    const onPublished = (payload) => {
      try {
        if (payload?.id && payload.id.toString() === String(selectedElectionId)) {
          Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'Results were published — refreshing' });
          if (selectedElectionId) loadResults(selectedElectionId);
        }
      } catch (e) {
        console.error('Error handling election:results:published', e);
      }
    };

    socket.on('election:results:published', onPublished);
    return () => socket.off('election:results:published', onPublished);
  }, [socketRef, selectedElectionId, loadResults]);

  const totalVotesOverall = results.reduce((sum, r) => sum + (r.votes || 0), 0);
  const positions = Object.keys(groupedResults);

  return (
    <div className="container-fluid py-4">
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>

      {/* Authorization Check - render denied message if not admin */}
      {!isAuthorized && (
        <div className="alert alert-danger m-4" role="alert">
          <h4 className="alert-heading">🔒 Access Denied</h4>
          <p>You do not have permission to view election results. Only administrators can access this page.</p>
        </div>
      )}

      {/* Main Content - only show if authorized */}
      {isAuthorized && (
      <>
      {/* Header Summary */}
      <div className="row mb-4">
        <div className="col-12">
          <div
            className="card shadow-sm border-0"
            style={{
              background: isDarkMode
                ? `linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)`
                : `linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)`,
              color: '#fff',
              borderRadius: '12px'
            }}
          >
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h3 className="fw-bold mb-1">{selectedElection || 'Election Results'}</h3>
                  <div className="mt-3">
                    <div className="mb-2">
                      <FaVoteYea className="me-2" />
                      <strong>Total Votes:</strong> {totalVotesOverall}
                    </div>
                    <div className="mb-2">
                      <FaUsers className="me-2" />
                      <strong>Positions:</strong> {positions.length}
                    </div>
                    <div>
                      <strong>Status:</strong> <span className={`badge bg-${unpublished ? 'warning' : 'success'}`}>{unpublished ? '⏳ Unpublished' : '✅ Published'}</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="text-end">
                    <select
                      className="form-select mb-3"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        color: '#000',
                        border: '2px solid white'
                      }}
                      onChange={e => {
                        const v = e.target.value;
                        if (v) loadResults(v);
                      }}
                      defaultValue=""
                    >
                      <option value="">📋 Select an election...</option>
                      {Array.isArray(elections) && elections.length > 0
                        ? elections.map(el => {
                          const id = el._id || el.id || el;
                          const label = el.title || el.name || `Election ${id}`;
                          return (
                            <option key={id} value={id}>
                              {label}
                            </option>
                          );
                        })
                        : null}
                    </select>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-light btn-sm"
                        onClick={exportResultsCSV}
                        disabled={!results.length || exportLoading}
                      >
                        {exportLoading ? (
                          <><span className="spinner-border spinner-border-sm me-2" /> Exporting...</>
                        ) : (
                          <><FaFileCsv className="me-2" /> CSV</>
                        )}
                      </button>
                      <button className="btn btn-outline-light btn-sm" onClick={exportToExcel} disabled={!results.length}>
                        <FaFileExcel className="me-2" /> Excel
                      </button>
                      <button className="btn btn-outline-light btn-sm" onClick={exportToPDF} disabled={!results.length}>
                        <FaFilePdf className="me-2" /> PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State with Skeletons */}
      {loading && (
        <div className="row">
          {[...Array(2)].map((_, i) => (
            <PositionCardSkeleton key={i} isDarkMode={isDarkMode} colors={colors} />
          ))}
        </div>
      )}

      {/* Unpublished State */}
      {unpublished && (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-warning text-center" role="alert">
              <h5>📊 Results are not published for this election</h5>
              <p className="mb-3">Publish results to make them visible to all users.</p>
              {user?.role === 'admin' && (
                <button className="btn btn-primary btn-sm" onClick={publishResults}>
                  🔓 Publish Results Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Position Sections */}
      {!loading && !unpublished && positions.length > 0 && (
        <div className="row">
          {positions.map((position, posIndex) => {
            const positionCandidates = groupedResults[position];
            const totalPositionVotes = getPositionTotalVotes(positionCandidates);
            const winners = getPositionWinners(positionCandidates);
            const posColor = getPositionColor(posIndex);

            return (
              <div key={position} className="col-lg-6 mb-4">
                {/* Position Card */}
                <div
                  className="card shadow-sm border-0 h-100"
                  style={{
                    backgroundColor: colors.cardBg,
                    borderLeft: `5px solid ${posColor}`,
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}
                >
                  {/* Position Header */}
                  <div
                    style={{
                      background: posColor,
                      color: '#fff',
                      padding: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <h5 className="fw-bold mb-1">
                        {getPositionIcon(position)} {position}
                      </h5>
                      <small>
                        👥 {positionCandidates.length} candidates | 🗳️ {totalPositionVotes} votes
                      </small>
                    </div>
                    {winners.length > 0 && (
                      <div className="text-center">
                        <div style={{ fontSize: '2rem' }}>🏆</div>
                        <small>{winners.length === 1 ? 'Winner' : `${winners.length} Co-Winners`}</small>
                      </div>
                    )}
                  </div>

                  {/* Candidates Table */}
                  <div className="card-body p-0">
                    <div style={{ overflowX: 'auto' }}>
                      <table className="table table-hover mb-0" style={{ color: colors.text }}>
                        <thead>
                          <tr style={{ backgroundColor: isDarkMode ? colors.surfaceHover : '#f8f9fa' }}>
                            <th style={{ padding: '1rem', color: colors.text }}>Rank</th>
                            <th style={{ padding: '1rem', color: colors.text }}>Candidate</th>
                            <th style={{ padding: '1rem', color: colors.text }}>Votes</th>
                            <th style={{ padding: '1rem', color: colors.text }}>%</th>
                            <th style={{ padding: '1rem', color: colors.text }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {positionCandidates.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center py-4" style={{ color: colors.textMuted }}>
                                No candidates
                              </td>
                            </tr>
                          ) : (
                            positionCandidates.map((candidate, idx) => {
                              const percent = totalPositionVotes > 0 ? ((candidate.votes || 0) / totalPositionVotes * 100).toFixed(1) : '0.0';
                              const candidateIsWinner = isPositionWinner(candidate, position);
                              const rowBg = candidateIsWinner
                                ? isDarkMode
                                  ? 'rgba(34, 197, 94, 0.15)'
                                  : 'rgba(34, 197, 94, 0.08)'
                                : 'transparent';

                              return (
                                <tr key={candidate._id || idx} style={{ backgroundColor: rowBg, borderBottomColor: colors.border }}>
                                  <td style={{ padding: '1rem', fontWeight: 'bold', color: colors.text }}>
                                    {candidateIsWinner ? '🥇' : ''}
                                    {idx + 1}
                                  </td>
                                  <td style={{ padding: '1rem', color: colors.text }}>
                                    <div className="d-flex align-items-center gap-2">
                                      {candidate.photo ? (
                                        <img
                                          src={candidate.photo}
                                          alt={candidate.name}
                                          style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: `2px solid ${candidateIsWinner ? '#22c55e' : colors.border}`
                                          }}
                                        />
                                      ) : (
                                        <div
                                          style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            backgroundColor: posColor,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            fontWeight: 'bold',
                                            fontSize: '0.9rem'
                                          }}
                                        >
                                          {candidate.name?.charAt(0) || '?'}
                                        </div>
                                      )}
                                      <div>
                                        <div style={{ fontWeight: candidateIsWinner ? 'bold' : 'normal', color: candidateIsWinner ? '#22c55e' : colors.text }}>
                                          {sanitizeName(candidate.name)}
                                        </div>
                                        {candidate.party && <small style={{ color: colors.textSecondary }}>{sanitizeName(candidate.party)}</small>}
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ padding: '1rem', fontWeight: 'bold', color: colors.text }}>
                                    {candidate.votes || 0}
                                  </td>
                                  <td style={{ padding: '1rem', color: colors.textSecondary }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <div
                                        style={{
                                          width: '40px',
                                          height: '24px',
                                          backgroundColor: isDarkMode ? 'rgba(75,85,99,0.3)' : '#e5e7eb',
                                          borderRadius: '4px',
                                          overflow: 'hidden',
                                          position: 'relative'
                                        }}
                                      >
                                        <div
                                          style={{
                                            height: '100%',
                                            width: `${percent}%`,
                                            backgroundColor: posColor,
                                            transition: 'width 0.3s'
                                          }}
                                        />
                                      </div>
                                      <span>{percent}%</span>
                                    </div>
                                  </td>
                                  <td style={{ padding: '1rem' }}>
                                    {candidateIsWinner && (
                                      <span
                                        className="badge"
                                        style={{
                                          backgroundColor: '#22c55e',
                                          color: '#fff',
                                          fontSize: '0.85rem',
                                          padding: '0.5rem 0.75rem'
                                        }}
                                      >
                                        🏆 WINNER
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Chart */}
                  <div style={{ padding: '1.5rem', borderTop: `1px solid ${colors.border}` }}>
                    <h6 style={{ color: colors.text, marginBottom: '1rem' }}>Vote Distribution</h6>
                    <div style={{ height: '250px' }}>
                      <Bar
                        data={{
                          labels: positionCandidates.map(c => sanitizeName(c.name)),
                          datasets: [
                            {
                              label: 'Votes',
                              data: positionCandidates.map(c => c.votes || 0),
                              backgroundColor: positionCandidates.map((c) =>
                                isPositionWinner(c, position) ? WINNER_COLOR : posColor
                              ),
                              borderColor: positionCandidates.map((c) =>
                                isPositionWinner(c, position)
                                  ? 'rgba(34, 197, 94, 1)'
                                  : posColor.replace('0.8', '1')
                              ),
                              borderWidth: 2,
                              borderRadius: 6,
                              maxBarThickness: 50
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              callbacks: {
                                label: function (context) {
                                  const votes = context.parsed.y;
                                  const percent = totalPositionVotes > 0 ? ((votes / totalPositionVotes) * 100).toFixed(1) : '0.0';
                                  return `${votes} votes (${percent}%)`;
                                },
                                afterLabel: function (context) {
                                  const candidate = positionCandidates[context.dataIndex];
                                  return isPositionWinner(candidate, position) ? '🏆 WINNER' : '';
                                }
                              },
                              backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(0,0,0,0.8)',
                              padding: 12,
                              titleFont: { size: 12, weight: 'bold' },
                              bodyFont: { size: 11 }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: {
                                color: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(0,0,0,0.1)'
                              },
                              ticks: { color: colors.textSecondary }
                            },
                            x: {
                              grid: { display: false },
                              ticks: { color: colors.textSecondary }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && !unpublished && positions.length === 0 && results.length === 0 && (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-info text-center py-5" role="alert">
              <h5>📊 No Results Yet</h5>
              <p>Select an election from the dropdown above to view results.</p>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}

export default function ResultsWithErrorBoundary(props) {
  return (
    <ErrorBoundary>
      <Results {...props} />
    </ErrorBoundary>
  );
}
