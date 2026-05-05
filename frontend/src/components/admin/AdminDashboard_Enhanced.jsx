import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faSpinner } from "@fortawesome/free-solid-svg-icons";

import DashboardCharts from './DashboardCharts';
import ElectionDetailedCharts from './ElectionDetailedCharts';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Enhanced Admin Dashboard with:
 * 1. Overall Dashboard Stats (existing)
 * 2. Election-Specific Results Charts (new)
 */
function AdminDashboard() {
  const { isDarkMode, colors } = useTheme();
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState(null);
  const [loadingElections, setLoadingElections] = useState(false);
  const [chartView, setChartView] = useState('overview'); // 'overview' or 'detailed'

  // Fetch available elections on mount
  useEffect(() => {
    const fetchElections = async () => {
      try {
        setLoadingElections(true);
        const response = await axios.get('/api/elections');
        setElections(response.data);
        
        // Auto-select first election if available
        if (response.data.length > 0) {
          setSelectedElectionId(response.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch elections:', err);
      } finally {
        setLoadingElections(false);
      }
    };

    fetchElections();
  }, []);

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-2">
                <FontAwesomeIcon icon={faChartLine} className="me-2 text-primary" />
                Admin Dashboard
              </h2>
              <p className="text-muted mb-0">
                Monitor elections, candidates, and voting statistics in real-time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle & Election Selector */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm"
            style={{ backgroundColor: colors.cardBg }}
          >
            <div className="card-body">
              <label className="form-label fw-bold mb-2">Chart View</label>
              <div className="btn-group w-100" role="group">
                <input
                  type="radio"
                  className="btn-check"
                  name="view"
                  id="overview"
                  value="overview"
                  checked={chartView === 'overview'}
                  onChange={(e) => setChartView(e.target.value)}
                />
                <label className="btn btn-outline-primary" htmlFor="overview">
                  Overview
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="view"
                  id="detailed"
                  value="detailed"
                  checked={chartView === 'detailed'}
                  onChange={(e) => setChartView(e.target.value)}
                />
                <label className="btn btn-outline-primary" htmlFor="detailed">
                  Election Results
                </label>
              </div>
            </div>
          </div>
        </div>

        {chartView === 'detailed' && (
          <div className="col-md-8">
            <div
              className="card border-0 shadow-sm"
              style={{ backgroundColor: colors.cardBg }}
            >
              <div className="card-body">
                <label className="form-label fw-bold mb-2">Select Election</label>
                {loadingElections ? (
                  <div className="text-center">
                    <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                    Loading elections...
                  </div>
                ) : elections.length > 0 ? (
                  <select
                    className="form-select"
                    value={selectedElectionId || ''}
                    onChange={(e) => setSelectedElectionId(e.target.value)}
                  >
                    <option value="">-- Choose an election --</option>
                    {elections.map((election) => (
                      <option key={election._id} value={election._id}>
                        {election.title} ({election.status})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="alert alert-info mb-0">
                    No elections available yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="row">
        <div className="col-12">
          {chartView === 'overview' ? (
            // Overall System Statistics
            <>
              <div className="mb-4">
                <h5 className="fw-bold mb-3">
                  <FontAwesomeIcon icon={faChartLine} className="me-2 text-primary" />
                  System-wide Statistics
                </h5>
              </div>
              <DashboardCharts />
            </>
          ) : selectedElectionId ? (
            // Election-Specific Results
            <>
              <div className="mb-4">
                <h5 className="fw-bold mb-3">
                  <FontAwesomeIcon icon={faChartLine} className="me-2 text-success" />
                  Election Results & Analysis
                </h5>
              </div>
              <ElectionDetailedCharts electionId={selectedElectionId} />
            </>
          ) : (
            <div className="alert alert-warning text-center">
              Please select an election to view results
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics Row (Optional Footer) */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{ backgroundColor: colors.cardBg }}>
            <div className="card-body">
              <h6 className="fw-bold mb-3">💡 Tips</h6>
              <ul className="mb-0 small">
                <li><strong>Overview Tab:</strong> See all-time statistics across all elections</li>
                <li><strong>Election Results Tab:</strong> Dive deep into a specific election with position-by-position breakdown</li>
                <li><strong>Position Buttons:</strong> Switch between positions to see their candidates and vote counts</li>
                <li><strong>Export:</strong> Download results as CSV or JSON for record-keeping</li>
                <li><strong>Real-time Updates:</strong> Charts update automatically as new votes come in</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
