import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaFileCsv, FaFilePdf, FaFileExcel } from 'react-icons/fa';
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
import ThemedTable from '../common/ThemedTable';

// Distinct color palette for chart bars
const CHART_COLORS = [
  'rgba(59, 130, 246, 0.8)',   // Blue
  'rgba(249, 115, 22, 0.8)',   // Orange
  'rgba(168, 85, 247, 0.8)',   // Purple
  'rgba(236, 72, 153, 0.8)',   // Pink
  'rgba(14, 165, 233, 0.8)',   // Sky
  'rgba(245, 158, 11, 0.8)',   // Amber
  'rgba(99, 102, 241, 0.8)',   // Indigo
  'rgba(239, 68, 68, 0.8)',    // Red
  'rgba(20, 184, 166, 0.8)',   // Teal
  'rgba(132, 204, 22, 0.8)',   // Lime
];

const WINNER_COLOR = 'rgba(34, 197, 94, 0.9)'; // Green for winner

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
  const [exportLoading, setExportLoading] = useState(false);

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

  const exportResultsCSV = async () => {
    try {
      setExportLoading(true);
      const electionTitle = selectedElection?.title || 'results';
      const rows = [['Candidate', 'Votes', 'Percentage', 'Status']];
      const totalVotes = results.reduce((sum, r) => sum + (r.votes || 0), 0);
      const maxVotes = Math.max(...results.map(r => r.votes || 0), 0);
      
      results.forEach(r => {
        const percent = totalVotes > 0 ? ((r.votes || 0) / totalVotes * 100).toFixed(1) : '0.0';
        const isWinner = r.votes === maxVotes && maxVotes > 0;
        rows.push([
          `"${r.name || ''}"`,
          r.votes || 0,
          `${percent}%`,
          isWinner ? 'Winner' : ''
        ]);
      });
      
      rows.push(['']);
      rows.push(['Total Votes', totalVotes]);
      
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${electionTitle}_results_${new Date().toISOString().split('T')[0]}.csv`;
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
      text: 'Excel export functionality will be available soon. Use CSV export for now.',
      confirmButtonText: 'OK'
    });
  };

  const exportToPDF = () => {
    Swal.fire({
      icon: 'info',
      title: 'PDF Export',
      text: 'PDF export functionality will be available soon. Use CSV export for now.',
      confirmButtonText: 'OK'
    });
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
  // Calculate total votes, single winner (highest votes), percentages, last updated
  const totalVotes = results.reduce((sum, r) => sum + (r.votes || 0), 0);
  const maxVotes = Math.max(...results.map(r => r.votes || 0), 0);
  
  // Get only ONE winner - the first person with highest votes (in case of tie, first in array)
  const sortedResults = [...results].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  const winner = maxVotes > 0 ? sortedResults[0] : null;
  
  const lastUpdated = selectedElection?.updatedAt || selectedElection?.lastModified || null;
  const published = !unpublished;
  
  // Helper to check if a candidate is the winner
  const isWinner = (candidate) => {
    if (!winner) return false;
    return (candidate._id === winner._id || candidate.id === winner.id || candidate.name === winner.name);
  };
  
  // Generate unique colors for each candidate
  const getBarColors = () => {
    return results.map((r, index) => {
      if (isWinner(r)) return WINNER_COLOR;
      return CHART_COLORS[index % CHART_COLORS.length];
    });
  };

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
                {winner && (
                  <div className="mt-1">
                    <strong>Winner:</strong> <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{winner.name}</span>
                    <span className="ms-2 badge bg-success">🏆 {winner.votes} votes</span>
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
                <button 
                  className="btn btn-sm me-2" 
                  onClick={exportResultsCSV} 
                  disabled={!results.length || exportLoading}
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
                      <FaFileCsv className="me-2" /> CSV
                    </>
                  )}
                </button>
                <button 
                  className="btn btn-outline-success btn-sm me-2" 
                  onClick={exportToExcel}
                  disabled={!results.length}
                >
                  <FaFileExcel className="me-2" /> Excel
                </button>
                <button 
                  className="btn btn-outline-primary btn-sm" 
                  onClick={exportToPDF}
                  disabled={!results.length}
                >
                  <FaFilePdf className="me-2" /> PDF
                </button>
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
                <div style={{ minHeight: 220 }}>
                  <ThemedTable striped hover bordered>
                    <thead>
                      <tr>
                        <th style={{ padding: '0.75rem', color: colors.text }}>Candidate</th>
                        <th style={{ padding: '0.75rem', color: colors.text }}>Votes</th>
                        <th style={{ padding: '0.75rem', color: colors.text }}>Percent</th>
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
                      ) : results.map((r, index) => {
                        const percent = totalVotes > 0 ? ((r.votes || 0) / totalVotes * 100).toFixed(1) : '0.0';
                        const candidateIsWinner = isWinner(r);
                        const barColor = candidateIsWinner ? WINNER_COLOR : CHART_COLORS[index % CHART_COLORS.length];
                        return (
                          <tr key={r._id || r.id || r.name} style={{ background: candidateIsWinner ? (isDarkMode ? 'rgba(34,197,94,0.15)' : '#e6ffe6') : undefined }}>
                            <td style={{ padding: '0.75rem', color: colors.text }}>
                              <div className="d-flex align-items-center gap-2">
                                {/* Color indicator matching chart */}
                                <span style={{ 
                                  width: 12, 
                                  height: 12, 
                                  borderRadius: '3px', 
                                  backgroundColor: barColor,
                                  flexShrink: 0
                                }} />
                                {r.photo ? (
                                  <img src={r.photo} alt={r.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${candidateIsWinner ? '#22c55e' : colors.border}` }} />
                                ) : (
                                  <span className="bg-secondary rounded-circle d-inline-block" style={{ width: 32, height: 32, lineHeight: '32px', textAlign: 'center', color: '#fff', fontWeight: 600 }}>{r.name?.charAt(0) || '?'}</span>
                                )}
                                <span style={{ fontWeight: candidateIsWinner ? 'bold' : 'normal', color: candidateIsWinner ? '#22c55e' : colors.text }}>{r.name}</span>
                                {candidateIsWinner && <span className="badge bg-success ms-2">🏆 Winner</span>}
                              </div>
                            </td>
                            <td style={{ padding: '0.75rem', color: colors.textSecondary }}>{r.votes || 0}</td>
                            <td style={{ padding: '0.75rem', color: colors.textSecondary }}>{percent}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </ThemedTable>
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
                            backgroundColor: getBarColors(),
                            borderColor: getBarColors().map(c => c.replace('0.8', '1').replace('0.9', '1')),
                            borderWidth: 2,
                            borderRadius: 6,
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        plugins: { 
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const votes = context.parsed.y;
                                const percent = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0.0';
                                const candidateName = context.label;
                                const isTopCandidate = winner && candidateName === winner.name;
                                return `${votes} votes (${percent}%)${isTopCandidate ? ' 🏆' : ''}`;
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
