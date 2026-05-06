import { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faUsers,
  faSpinner,
  faExclamationTriangle,
  faDownload,
  faFileDownload
} from "@fortawesome/free-solid-svg-icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { useTheme } from '../../contexts/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

function ElectionDetailedCharts({ electionId }) {
  const { isDarkMode, colors } = useTheme();
  const [electionData, setElectionData] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportFormat, setExportFormat] = useState('csv');

  useEffect(() => {
    const fetchElectionData = async () => {
      if (!electionId) {
        setError('No election selected');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Not authenticated. Please log in again.');
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `/api/admin/election/${electionId}/detailed-stats`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        console.log('Election detailed stats:', response.data);
        setElectionData(response.data);
        
        // Set first position as default selection
        if (response.data.positions && response.data.positions.length > 0) {
          setSelectedPosition(response.data.positions[0]);
        }
      } catch (err) {
        console.error('Error fetching election stats:', err);
        console.error('Error details:', err.response?.data || err.message);
        const errorMsg = err.response?.data?.message || err.message;
        setError(`Failed to load election data: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    };

    fetchElectionData();
  }, [electionId]);

  const exportData = () => {
    if (!electionData) return;

    if (exportFormat === 'csv') {
      exportToCSV();
    } else if (exportFormat === 'json') {
      exportToJSON();
    }
  };

  const exportToCSV = () => {
    try {
      let csv = `Election: ${electionData.election.title}\n`;
      csv += `Date: ${new Date().toLocaleString()}\n\n`;
      csv += `Position,Candidate Name,Party,Vote Count,Status\n`;

      electionData.positionStats.forEach(positionData => {
        positionData.candidates.forEach(candidate => {
          csv += `"${positionData.position}","${candidate.name}","${candidate.party || 'N/A'}",${candidate.voteCount},"${candidate.status}"\n`;
        });
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `election-results-${electionData.election._id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export CSV failed:', err);
    }
  };

  const exportToJSON = () => {
    try {
      const jsonData = {
        election: electionData.election,
        exportDate: new Date().toISOString(),
        positions: electionData.positionStats
      };
      
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `election-results-${electionData.election._id}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export JSON failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary mb-3" />
        <p className="mt-3 text-muted">Loading election results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center" role="alert">
        <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="mb-3" />
        <h5>Error Loading Data</h5>
        <p>{error}</p>
      </div>
    );
  }

  if (!electionData) {
    return (
      <div className="alert alert-info text-center" role="alert">
        <p>No election data available. Please select an election.</p>
      </div>
    );
  }

  const currentPositionData = selectedPosition 
    ? electionData.positionStats.find(p => p.position === selectedPosition)
    : null;
    
  // Prepare data for positions overview bar chart (all positions, total votes)
  const positionsOverviewData = {
    labels: electionData.positionStats.map(p => p.position),
    datasets: [{
      label: 'Total Votes Per Position',
      data: electionData.positionStats.map(p => p.totalVotes),
      backgroundColor: [
        'rgba(13, 110, 253, 0.8)',
        'rgba(25, 135, 84, 0.8)',
        'rgba(255, 193, 7, 0.8)',
        'rgba(220, 53, 69, 0.8)',
        'rgba(111, 66, 193, 0.8)',
        'rgba(13, 202, 240, 0.8)',
      ],
      borderColor: [
        '#0d6efd',
        '#198754',
        '#ffc107',
        '#dc3545',
        '#6f42c1',
        '#0dcaf0',
      ],
      borderWidth: 2,
      borderRadius: 4,
    }]
  };

  // Prepare data for selected position candidates chart
  const selectedPositionCandidatesData = currentPositionData ? {
    labels: currentPositionData.candidates.map(c => c.name),
    datasets: [{
      label: `Votes in ${selectedPosition}`,
      data: currentPositionData.candidates.map(c => c.voteCount),
      backgroundColor: 'rgba(220, 53, 69, 0.8)',
      borderColor: '#dc3545',
      borderWidth: 2,
      borderRadius: 4,
    }]
  } : null;

  // Doughnut chart for vote distribution in selected position
  const voteDoughnutData = currentPositionData && currentPositionData.candidates.length > 0 ? {
    labels: currentPositionData.candidates.map(c => c.name),
    datasets: [{
      data: currentPositionData.candidates.map(c => c.voteCount),
      backgroundColor: [
        'rgba(13, 110, 253, 0.8)',
        'rgba(25, 135, 84, 0.8)',
        'rgba(255, 193, 7, 0.8)',
        'rgba(220, 53, 69, 0.8)',
        'rgba(111, 66, 193, 0.8)',
      ],
      borderColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1'],
      borderWidth: 2,
    }]
  } : null;

  return (
    <div className="row g-4">
      {/* Election Header */}
      <div className="col-12">
        <div
          className="card shadow-sm border-0"
          style={{
            backgroundColor: colors.cardBg,
            borderColor: colors.border
          }}
        >
          <div
            className="card-header bg-transparent border-0 py-3 d-flex justify-content-between align-items-center"
            style={{
              backgroundColor: isDarkMode ? colors.surfaceHover : 'transparent',
              borderBottomColor: colors.border
            }}
          >
            <div>
              <h4 className="mb-1 fw-bold" style={{ color: colors.text }}>
                {electionData.election.title}
              </h4>
              <p className="mb-0" style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>
                Status: <strong>{electionData.election.status}</strong> | 
                Total Votes: <strong>{electionData.totalVotes}</strong> | 
                Total Candidates: <strong>{electionData.totalCandidates}</strong>
              </p>
            </div>
            <div className="d-flex gap-2">
              <select
                className="form-select form-select-sm"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                style={{ width: '120px' }}
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
              <button
                className="btn btn-primary btn-sm"
                onClick={exportData}
                title="Export results"
              >
                <FontAwesomeIcon icon={faDownload} className="me-1" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Positions Overview - Bar Chart */}
      <div className="col-12">
        <div
          className="card shadow-sm border-0"
          style={{
            backgroundColor: colors.cardBg,
            borderColor: colors.border
          }}
        >
          <div
            className="card-header bg-transparent border-0 py-3"
            style={{
              backgroundColor: isDarkMode ? colors.surfaceHover : 'transparent',
              borderBottomColor: colors.border
            }}
          >
            <h5 className="mb-0 fw-bold d-flex align-items-center" style={{ color: colors.text }}>
              <FontAwesomeIcon icon={faChartBar} className="text-primary me-2" />
              Votes by Position Overview
            </h5>
          </div>
          <div className="card-body" style={{ backgroundColor: colors.cardBg }}>
            <Bar
              data={positionsOverviewData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { 
                    display: true,
                    labels: { color: colors.text }
                  },
                  tooltip: {
                    backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(0,0,0,0.8)',
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
              height={300}
            />
          </div>
        </div>
      </div>

      {/* Position Selector */}
      <div className="col-12">
        <div className="d-flex gap-2 flex-wrap mb-2">
          {electionData.positions.map(position => (
            <button
              key={position}
              className={`btn ${selectedPosition === position ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSelectedPosition(position)}
              size="sm"
            >
              {position}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Position - Candidates Bar Chart */}
      {selectedPositionCandidatesData && (
        <div className="col-md-6">
          <div
            className="card shadow-sm border-0"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.border
            }}
          >
            <div
              className="card-header bg-transparent border-0 py-3"
              style={{
                backgroundColor: isDarkMode ? colors.surfaceHover : 'transparent',
                borderBottomColor: colors.border
              }}
            >
              <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>
                {selectedPosition} - Candidates Votes
              </h5>
              <small style={{ color: colors.textSecondary }}>
                Total: {currentPositionData.totalVotes} votes | {currentPositionData.totalCandidates} candidates
              </small>
            </div>
            <div className="card-body" style={{ backgroundColor: colors.cardBg }}>
              {currentPositionData.candidates.length > 0 ? (
                <Bar
                  data={selectedPositionCandidatesData}
                  options={{
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(0,0,0,0.8)',
                      }
                    },
                    scales: {
                      x: {
                        beginAtZero: true,
                        grid: {
                          color: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(0,0,0,0.1)'
                        },
                        ticks: { color: colors.textSecondary }
                      },
                      y: {
                        grid: { display: false },
                        ticks: { color: colors.textSecondary }
                      }
                    }
                  }}
                  height={300}
                />
              ) : (
                <div className="text-center py-5" style={{ color: colors.textMuted }}>
                  <FontAwesomeIcon icon={faUsers} size="3x" className="mb-3 opacity-25" />
                  <p>No candidates for this position</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vote Distribution Doughnut */}
      {voteDoughnutData && (
        <div className="col-md-6">
          <div
            className="card shadow-sm border-0"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.border
            }}
          >
            <div
              className="card-header bg-transparent border-0 py-3"
              style={{
                backgroundColor: isDarkMode ? colors.surfaceHover : 'transparent',
                borderBottomColor: colors.border
              }}
            >
              <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>
                {selectedPosition} - Vote Distribution
              </h5> 
            </div>
            <div className="card-body" style={{ backgroundColor: colors.cardBg }}>
              <Doughnut
                data={voteDoughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'bottom',
                      labels: {
                        color: colors.text,
                        usePointStyle: true,
                        padding: 15
                      }
                    },
                    tooltip: {
                      backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(0,0,0,0.8)',
                    }
                  }
                }}
                height={300}
              />
            </div>
          </div>
        </div>
      )}

      {/* Detailed Candidates Table */}
      {currentPositionData && (
        <div className="col-12">
          <div
            className="card shadow-sm border-0"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.border
            }}
          >
            <div
              className="card-header bg-transparent border-0 py-3"
              style={{
                backgroundColor: isDarkMode ? colors.surfaceHover : 'transparent',
                borderBottomColor: colors.border
              }}
            >
              <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>
                {selectedPosition} - Detailed Results
              </h5>
            </div>
            <div className="card-body table-responsive" style={{ backgroundColor: colors.cardBg }}>
              {currentPositionData.candidates.length > 0 ? (
                <table
                  className="table table-hover mb-0"
                  style={{
                    borderColor: colors.border,
                    color: colors.text
                  }}
                >
                  <thead style={{ borderBottomColor: colors.border }}>
                    <tr style={{ backgroundColor: isDarkMode ? colors.surfaceHover : '#f8f9fa' }}>
                      <th style={{ color: colors.text }}>Rank</th>
                      <th style={{ color: colors.text }}>Candidate Name</th>
                      <th style={{ color: colors.text }}>Party</th>
                      <th style={{ color: colors.text }}>Votes</th>
                      <th style={{ color: colors.text }}>% of Position Votes</th>
                      <th style={{ color: colors.text }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...currentPositionData.candidates]
                      .sort((a, b) => b.voteCount - a.voteCount)
                      .map((candidate, idx) => {
                        const percentage = currentPositionData.totalVotes > 0
                          ? ((candidate.voteCount / currentPositionData.totalVotes) * 100).toFixed(1)
                          : 0;
                        return (
                          <tr
                            key={candidate._id}
                            style={{
                              borderColor: colors.border,
                              backgroundColor: idx === 0 
                                ? isDarkMode 
                                  ? 'rgba(220, 53, 69, 0.15)' 
                                  : 'rgba(220, 53, 69, 0.05)'
                                : 'transparent'
                            }}
                          >
                            <td style={{ color: colors.text }}>
                              <strong>#{idx + 1}</strong>
                            </td>
                            <td style={{ color: colors.text }}>
                              <div>{candidate.name}</div>
                              {candidate.photo && (
                                <small style={{ color: colors.textSecondary }}>
                                  Has Photo
                                </small>
                              )}
                            </td>
                            <td style={{ color: colors.textSecondary }}>
                              {candidate.party || '-'}
                            </td>
                            <td>
                              <strong style={{ color: '#dc3545' }}>
                                {candidate.voteCount}
                              </strong>
                            </td>
                            <td style={{ color: colors.textSecondary }}>
                              {percentage}%
                            </td>
                            <td>
                              <span
                                className="badge"
                                style={{
                                  backgroundColor:
                                    candidate.status === 'approved'
                                      ? '#198754'
                                      : '#ffc107'
                                }}
                              >
                                {candidate.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-4" style={{ color: colors.textMuted }}>
                  <p>No candidates data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ElectionDetailedCharts;
