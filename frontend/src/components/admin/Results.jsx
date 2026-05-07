import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
// IMPORTATION OF THE icons from the fontaswsome icons
import { FaFileCsv, FaFilePdf, FaFileExcel, FaTrophy, FaUsers, FaVoteYea, FaCrown, FaMicrophone, FaMoneyBillWave, FaClipboardList, FaBullseye, FaChartBar, FaLink, FaCity, FaBell, FaSearch } from 'react-icons/fa';
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

// Position icons mapping using Font Awesome
const POSITION_ICONS_MAP = {
  'President': FaCrown,
  'Vice President': FaMicrophone,
  'Treasurer': FaMoneyBillWave,
  'Secretary': FaClipboardList,
  'Chairperson': FaBullseye,
  'Director': FaChartBar,
  'Coordinator': FaLink,
  'Representative': FaCity
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

// Ensure API_URL is correctly defined and used for absolute paths
// It should be set in your .env.production or .env file (e.g., VITE_API_URL=https://api.campusballot.tech)
const API_URL = import.meta.env.VITE_API_URL || 'https://api.campusballot.tech';

// Helper function to get image URLs, prepending API_URL if it's a relative path
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  // Ensure path starts with /
  const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return `${API_URL.replace(/\/$/, '')}${path}`;
};

// Helper for ordinal suffixes (1st, 2nd, 3rd, etc.)
const getOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// Helper component to display candidate image with fallback to initials
function CandidateImageDisplay({ src, name, size, colors, isDarkMode, posColor, isWinner }) {
  const [failed, setFailed] = useState(false);
  const resolvedSrc = src ? getImageUrl(src) : '';

  const effectiveBorderColor = isWinner ? '#22c55e' : colors.border;

  if (!resolvedSrc || failed) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        backgroundColor: posColor || '#6b7280', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: '#fff',
        fontWeight: 'bold', fontSize: size >= 80 ? '2.5rem' : '0.9rem',
        border: `${size >= 80 ? '4px' : '2px'} solid ${effectiveBorderColor}`,
        boxShadow: size >= 80 ? '0 4px 15px rgba(0,0,0,0.2)' : 'none'
      }}>
        {name?.charAt(0) || '?'}
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={name || 'Candidate'}
      style={{
        width: size, height: size, objectFit: 'cover', borderRadius: '50%',
        padding: size >= 80 ? '8px' : '3px',
        border: `${size >= 80 ? '4px' : '2px'} solid ${effectiveBorderColor}`,
        boxShadow: size >= 80 ? '0 4px 15px rgba(0,0,0,0.2)' : 'none',
        backgroundColor: isDarkMode ? colors.surfaceHover : '#fff'
      }}
      onError={() => setFailed(true)}
    />
  );
}

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

  // Get Font Awesome icon component for position
  const getPositionIcon = (position) => {
    const IconComponent = POSITION_ICONS_MAP[position];
    return IconComponent ? <IconComponent style={{ marginRight: '0.5rem' }} /> : <FaCity style={{ marginRight: '0.5rem' }} />;
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
    return positionCandidates.filter(c => Number(c.votes) === maxVotes);
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

  // Notify winners via multiple channels
  const notifyWinners = async (winners, position) => {
    try {
      const token = localStorage.getItem('token');
      const winnerEmails = winners.map(w => w.email).filter(Boolean);
      
      if (winnerEmails.length === 0) {
        console.warn('No email addresses found for winners');
        return;
      }


      // Send notification to backend for processing and return success/failure
      await axios.post(
        'https://api.campusballot.tech/api/elections/notify-winners',
        {
          winners,
          position,
          electionId: selectedElectionId,
          electionTitle: selectedElection,
          recipientEmails: winnerEmails
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Audit log winner notification
      await auditLog('NOTIFY_WINNERS', {
        position,
        winnerCount: winners.length,
        emailsSent: winnerEmails.length
      });

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `✉️ ${position} winner(s) notified`,
        timer: 3000
      });
    } catch (err) {
      console.error('Failed to notify winners:', err);
      Swal.fire('Notification Error', `Could not notify ${position} winner(s)`, 'warning');
    }
  };

  // Export only winners as CSV
  const exportWinnersOnlyCSV = async () => {
    try {
      setExportLoading(true);

      // Audit log the export action
      await auditLog('EXPORT_WINNERS_ONLY', {
        format: 'CSV',
        electionTitle: selectedElection
      });

      const electionTitle = selectedElection || 'Election Winners';
      let csv = `${electionTitle} - WINNERS ONLY\n`;
      csv += `Exported: ${new Date().toLocaleString()}\n`;
      csv += `Exported by: ${user?.name || user?.email || 'Admin'}\n\n`;

      csv += `Position,Winner Name,Votes,Photo URL,Contact Email,Party\n`;

      // Collect all winners across all positions
      const allWinners = [];
      Object.keys(groupedResults).forEach((position) => {
        const positionCandidates = groupedResults[position];
        const winners = getPositionWinners(positionCandidates);
        
        winners.forEach((winner) => {
          allWinners.push({
            position,
            name: winner.name || 'Unknown',
            votes: winner.votes || 0,
            photo: winner.photo || '',
            email: winner.email || '',
            party: winner.party || ''
          });
        });
      });

      // Add winners to CSV
      allWinners.forEach((winner) => {
        const photoUrl = winner.photo ? `"${winner.photo}"` : '(No photo)';
        csv += `"${winner.position}","${sanitizeName(winner.name)}",${winner.votes},${photoUrl},"${winner.email}","${winner.party}"\n`;
      });

      csv += `\n\nTotal Winners: ${allWinners.length}\n`;

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `election-winners-${selectedElectionId}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      Swal.fire({
        icon: 'success',
        title: 'Export Successful',
        text: `Exported ${allWinners.length} winner(s)`,
        timer: 2000
      });
    } catch (err) {
      console.error('Export winners failed', err);
      Swal.fire('Error', 'Failed to export winners', 'error');
    } finally {
      setExportLoading(false);
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
              borderRadius: '5px',
              padding: '1.5rem'
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
                      <option value=""> <FaSearch className="me-2" /> Select an election...</option>
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
                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => {
                          Object.keys(groupedResults).forEach(async (position) => {
                            const positionWinners = getPositionWinners(groupedResults[position]);
                            if (positionWinners.length > 0) {
                              await notifyWinners(positionWinners, position);
                            }
                          });
                        }}
                        disabled={!results.length || results.length === 0}
                        title="Send notifications to all position winners"
                      >
                        <FaBell className="me-2" /> Notify Winners
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={exportWinnersOnlyCSV}
                        disabled={!results.length || exportLoading}
                        title="Export winners only (with contact details)"
                      >
                        {exportLoading ? (
                          <><span className="spinner-border spinner-border-sm me-2" /> Exporting...</>
                        ) : (
                          <><FaTrophy className="me-2" /> Winners Only</>
                        )}
                      </button>
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

      {/* Winners Gallery Section */}
      {!loading && !unpublished && positions.length > 0 && (
        <div className="row mb-5">
          <div className="col-12">
            <div className="card shadow-sm border-0" style={{ backgroundColor: colors.cardBg }}>
              <div className="card-header" style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                color: '#fff',
                padding: '1.5rem',
                borderRadius: '12px 12px 0 0'
              }}>
                <h4 className="mb-0"><FaTrophy className="me-2" /> Election Winners Showcase</h4>
              </div>
              <div className="card-body p-4">
                <div className="row">
                  {positions.map((position, posIndex) => {
                    const positionCandidates = groupedResults[position];
                    const winners = getPositionWinners(positionCandidates);
                    const posColor = getPositionColor(posIndex);

                    return (
                      <div key={position} className="col-md-6 col-lg-3 mb-4">
                        {winners.length > 0 ? (
                          <div className="text-center">
                            <h6 style={{ color: posColor, fontWeight: 'bold', marginBottom: '1rem' }}>
                              {getPositionIcon(position)} {position}
                            </h6>
                            {winners.map((winner) => (
                              <div key={winner._id} className="mb-3">
                                <div className="position-relative" style={{ display: 'inline-block' }}>
                                  {winner.photo && getImageUrl(winner.photo) ? (
                                    <img
                                      src={getImageUrl(winner.photo)}
                                      alt={winner.name}
                                      style={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: '50%',
                                        objectFit: 'contain',
                                        padding: '8px',
                                        border: `4px solid ${posColor}`,
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                                      }}
                                    />
                                  ) : (
                                    <div
                                      style={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: '50%',
                                        backgroundColor: posColor,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                        fontWeight: 'bold',
                                        fontSize: '2.5rem',
                                        border: '4px solid ' + posColor,
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                                      }}
                                    >
                                      {winner.name?.charAt(0) || '?'}
                                    </div>
                                  )}
                                  <div style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-8px',
                                    fontSize: '2rem',
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                                  }}>
                                    🏆
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <strong style={{ color: colors.text, display: 'block' }}>
                                    {sanitizeName(winner.name)}
                                  </strong>
                                  {winner.party && (
                                    <small style={{ color: colors.textSecondary, display: 'block' }}>
                                      {sanitizeName(winner.party)}
                                    </small>
                                  )}
                                  <small style={{
                                    color: posColor,
                                    display: 'block',
                                    fontWeight: 'bold',
                                    marginTop: '0.5rem'
                                  }}>
                                    {winner.votes} votes
                                  </small>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{
                            padding: '2rem 1rem',
                            textAlign: 'center',
                            color: colors.textSecondary
                          }}>
                            <p style={{ fontSize: '0.9rem' }}>No votes yet</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
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
                      justifyContent: 'space-between',
                      borderTopLeftRadius: '12px',
                      borderTopRightRadius: '12px'
                      
                    }}
                  >
                    <div>
                      <h5 className="fw-bold mb-1" style={{ display: 'flex', alignItems: 'center' }}>
                        {getPositionIcon(position)} {position}
                      </h5>
                      <small>
                        <FaUsers style={{ marginRight: '0.3rem' }} /> {positionCandidates.length} candidates | <FaVoteYea style={{ marginRight: '0.3rem' }} /> {totalPositionVotes} votes
                      </small>
                    </div>
                    {winners.length > 0 && (
                      <div className="text-center">
                        <div style={{ fontSize: '1.8rem' }}><FaTrophy /></div>
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
                              const rowBg = candidateIsWinner && totalPositionVotes > 0
                                ? isDarkMode
                                  ? 'rgba(34, 197, 94, 0.15)'
                                  : 'rgba(34, 197, 94, 0.08)'
                                : 'transparent';

                              return (
                                <tr key={candidate._id || idx} style={{ backgroundColor: rowBg, borderBottomColor: colors.border }}>
                                  <td style={{ padding: '1rem', fontWeight: 'bold', color: colors.text }}>
                                    {candidateIsWinner && totalPositionVotes > 0 ? '🥇 ' : ''}
                                    {getOrdinal(idx + 1)}
                                  </td>
                                  <td style={{ padding: '1rem', color: colors.text }}>
                                    <div className="d-flex align-items-center gap-2">
                                      {candidate.photo && getImageUrl(candidate.photo) ? (
                                        <img
                                          src={getImageUrl(candidate.photo)}
                                          alt={candidate.name}
                                          style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            objectFit: 'contain',
                                            padding: '3px',
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '100px' }}>
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
                                    {candidateIsWinner && totalPositionVotes > 0 && (
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
