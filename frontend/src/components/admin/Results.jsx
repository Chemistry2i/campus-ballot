import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import useSocket from '../../hooks/useSocket';
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Results({ user }) {
  const { socketRef } = useSocket();
  const { isDarkMode, colors } = useTheme();
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState(null);
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unpublished, setUnpublished] = useState(false); // true when 403 returned

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/elections', { headers: { Authorization: `Bearer ${token}` } });
      // API may return either an array or an object { elections, total, page }
      const payload = res.data;
      if (Array.isArray(payload)) {
        setElections(payload);
      } else if (payload && Array.isArray(payload.elections)) {
        setElections(payload.elections);
      } else if (payload && Array.isArray(payload.elections?.docs)) {
        // some paginated responses may nest docs
        setElections(payload.elections.docs);
      } else {
        console.warn('Unexpected elections payload shape, coercing to empty array', payload);
        setElections([]);
      }
    } catch (err) {
      console.error('Failed to load elections', err);
      Swal.fire('Error', 'Failed to load elections', 'error');
    }
  };

  const loadResults = async (electionId) => {
    // Defensive: if electionId is falsy (empty string, null, undefined), do not proceed
    if (!electionId) {
      console.warn('loadResults called without electionId');
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      setSelectedElectionId(electionId);
      const url = `/api/elections/${electionId}/results`;
      console.debug('Loading results from', url);
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedElection(res.data.election || null);
      setResults(res.data.results || []);
      setUnpublished(false);
    } catch (err) {
      console.error('Failed to load results', err);
      if (err.response?.status === 403) {
        setUnpublished(true);
        setResults([]);
        Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Results not published yet' });
      } else if (err.response?.status === 404) {
        const serverMsg = err.response?.data?.message || err.response?.statusText || 'Not Found';
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
  };

  const publishResults = async () => {
    if (!selectedElectionId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`/api/elections/${selectedElectionId}/publish-results`, {}, { headers: { Authorization: `Bearer ${token}` } });
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Results published' });
      // refresh results
      await loadResults(selectedElectionId);
      // also mark unpublished false
      setUnpublished(false);
    } catch (err) {
      console.error('Failed to publish results', err);
      Swal.fire('Error', 'Failed to publish results', 'error');
    }
  };

  const exportResultsCSV = () => {
    try {
      const rows = [['Candidate','Votes']];
      results.forEach(r => rows.push([`"${r.name || ''}"`, r.votes || 0]));
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = typeof selectedElection === 'string' && selectedElection.length > 0 ? selectedElection : (selectedElection?.title || 'results');
      a.download = `${filename}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Export failed', err);
      Swal.fire('Error', 'Failed to export results', 'error');
    }
  };

  // Listen for server-side published events and refresh when relevant
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;
    const onPublished = (payload) => {
      try {
        // payload = { id: electionId }
        if (payload && payload.id && payload.id.toString() === String(selectedElectionId)) {
          Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'Results were published — refreshing' });
          loadResults(selectedElectionId);
        }
      } catch (e) {
        console.error('Error handling election:results:published', e);
      }
    };

    socket.on('election:results:published', onPublished);
    return () => {
      socket.off('election:results:published', onPublished);
    };
  }, [socketRef, selectedElectionId]);

  // --- Enhancement logic ---
  // Calculate total votes, winner(s), percentages, last updated
  const totalVotes = results.reduce((sum, r) => sum + (r.votes || 0), 0);
  const maxVotes = Math.max(...results.map(r => r.votes || 0), 0);
  const winners = results.filter(r => r.votes === maxVotes && maxVotes > 0);
  const lastUpdated = selectedElection?.updatedAt || selectedElection?.lastModified || null;
  const published = !unpublished;

  return (
    <div className="container-fluid">
      {/* Summary Card */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="card shadow-sm" style={{
            background: isDarkMode ? colors.surface : '#f8fafc',
            borderColor: colors.border,
            color: colors.text
          }}>
            <div className="card-body d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <h5 className="fw-bold mb-1" style={{ color: colors.text }}>Election Summary</h5>
                <div className="mb-1">
                  <span className="me-3"><strong>Status:</strong> <span className={`badge bg-${published ? 'success' : 'warning'}`}>{published ? 'Published' : 'Unpublished'}</span></span>
                  <span className="me-3"><strong>Candidates:</strong> {results.length}</span>
                  <span className="me-3"><strong>Total Votes:</strong> {totalVotes}</span>
                  {lastUpdated && (
                    <span className="me-3"><strong>Last Updated:</strong> {new Date(lastUpdated).toLocaleString()}</span>
                  )}
                </div>
                {winners.length > 0 && (
                  <div className="mt-1">
                    <strong>Winner{winners.length > 1 ? 's' : ''}:</strong> {winners.map(w => w.name).join(', ')}
                  </div>
                )}
              </div>
              <div>
                <select 
                  className="form-select me-2 d-inline-block" 
                  style={{
                    width: '280px',
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.text
                  }} 
                  onChange={e => { const v = e.target.value; if (v) loadResults(v); }}
                >
                  <option value="">Select an election...</option>
                  {Array.isArray(elections) && elections.length > 0 ? (
                    elections.map(el => {
                      const id = el._id || el.id || el;
                      const label = el.title || el.name || (typeof el === 'string' ? el : `Election ${id}`);
                      return (
                        <option key={id} value={id}>{label}</option>
                      );
                    })
                  ) : null}
                </select>
                <button className="btn btn-outline-secondary btn-sm" onClick={exportResultsCSV} disabled={!results.length}>Export CSV</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
        <div className="card-body" style={{ backgroundColor: colors.cardBg }}>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <div style={{ color: colors.textMuted }}>Loading results...</div>
            </div>
          ) : unpublished ? (
            <div className="text-center py-4">
              <div className="mb-3" style={{ color: colors.warning }}>Results are not published for this election.</div>
              {user?.role === 'admin' && (
                <button className="btn btn-primary btn-sm" onClick={publishResults}>Publish Results</button>
              )}
            </div>
          ) : (
            <div className="row">
              <div className="col-md-6">
                <div className="table-responsive" style={{ borderRadius: '0.5rem', border: `1px solid ${colors.border}`, backgroundColor: colors.surface, minHeight: 220, transition: 'all 0.3s' }}>
                  <table className="table table-striped mb-0" style={{ backgroundColor: colors.surface, color: colors.text, ...(isDarkMode && { '--bs-table-bg': colors.surface, '--bs-table-striped-bg': '#2d3748', '--bs-table-hover-bg': '#3b4a5c', '--bs-table-border-color': colors.border, }) }}>
                    <thead style={{ backgroundColor: isDarkMode ? '#334155' : '#f8f9fa', borderBottomColor: colors.border }}>
                      <tr>
                        <th style={{ color: colors.text, borderBottomColor: colors.border, padding: '0.75rem' }}>Candidate</th>
                        <th style={{ color: colors.text, borderBottomColor: colors.border, padding: '0.75rem' }}>Votes</th>
                        <th style={{ color: colors.text, borderBottomColor: colors.border, padding: '0.75rem' }}>Percent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center" style={{ color: colors.textMuted, padding: '2rem' }}>
                            <div className="d-flex flex-column align-items-center">
                              <span className="bg-secondary rounded-circle d-inline-block mb-2" style={{ width: 48, height: 48, lineHeight: '48px', textAlign: 'center', color: '#fff', fontWeight: 600, fontSize: '2rem' }}>?</span>
                              <div>No candidates/results yet.</div>
                            </div>
                          </td>
                        </tr>
                      ) : results.map(r => {
                        const percent = totalVotes > 0 ? ((r.votes || 0) / totalVotes * 100).toFixed(1) : '0.0';
                        const isWinner = winners.some(w => w._id === r._id || w.id === r.id || w.name === r.name);
                        return (
                          <tr key={r._id || r.id || r.name} style={{ borderBottomColor: colors.border, background: isWinner ? (isDarkMode ? 'rgba(34,197,94,0.15)' : '#e6ffe6') : undefined, transition: 'background 0.3s' }}>
                            <td style={{ color: colors.text, borderBottomColor: colors.border, padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {r.photo ? (
                                <img src={r.photo} alt={r.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${isWinner ? '#22c55e' : colors.border}` }} />
                              ) : (
                                <span className="bg-secondary rounded-circle d-inline-block" style={{ width: 32, height: 32, lineHeight: '32px', textAlign: 'center', color: '#fff', fontWeight: 600 }}>{r.name?.charAt(0) || '?'}</span>
                              )}
                              <span style={{ fontWeight: isWinner ? 'bold' : 'normal', color: isWinner ? '#22c55e' : colors.text }}>{r.name}</span>
                              {isWinner && <span className="badge bg-success ms-2">Winner</span>}
                            </td>
                            <td style={{ color: colors.textSecondary, borderBottomColor: colors.border, padding: '0.75rem' }}>{r.votes || 0}</td>
                            <td style={{ color: colors.textSecondary, borderBottomColor: colors.border, padding: '0.75rem' }}>{percent}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card p-3" style={{ backgroundColor: colors.cardBg, borderColor: colors.border, minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                  {results.length === 0 ? (
                    <div className="text-center" style={{ color: colors.textMuted }}>
                      <span className="bg-secondary rounded-circle d-inline-block mb-2" style={{ width: 48, height: 48, lineHeight: '48px', textAlign: 'center', color: '#fff', fontWeight: 600, fontSize: '2rem' }}>?</span>
                      <div>No chart data.</div>
                    </div>
                  ) : (
                    <Bar
                      data={{
                        labels: results.map(r => r.name || 'Unknown'),
                        datasets: [
                          {
                            label: 'Votes',
                            data: results.map(r => r.votes || 0),
                            backgroundColor: results.map(r => {
                              const isWinner = winners.some(w => w._id === r._id || w.id === r.id || w.name === r.name);
                              return isWinner ? 'rgba(34,197,94,0.8)' : (isDarkMode ? 'rgba(96, 165, 250, 0.8)' : 'rgba(54, 162, 235, 0.7)');
                            })
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        plugins: { 
                          legend: { display: false, labels: { color: colors.text } },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const votes = context.parsed.y;
                                const percent = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0.0';
                                return `${votes} votes (${percent}%)`;
                              }
                            }
                          }
                        },
                        scales: { 
                          y: { beginAtZero: true, grid: { color: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(0,0,0,0.1)' }, ticks: { color: colors.textSecondary } },
                          x: { grid: { display: false }, ticks: { color: colors.textSecondary } }
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Results;
