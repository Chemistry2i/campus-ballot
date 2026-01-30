import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import { FaFileExport, FaChartBar, FaDownload } from 'react-icons/fa';

const ObserverReports = () => {
  const { isDarkMode, colors } = useTheme();
  const [reportType, setReportType] = useState('summary');
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/observer/assigned-elections', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const electionsList = response.data.data?.elections || [];
      setElections(electionsList);
      if (electionsList.length > 0) {
        setSelectedElection(electionsList[0]._id);
      }
    } catch (err) {
      console.error('Error fetching elections:', err);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      // Simulate report generation
      setTimeout(() => {
        alert(`Report "${reportType}" for election "${selectedElection}" generated successfully`);
        setLoading(false);
      }, 1500);
    } catch (err) {
      console.error('Error generating report:', err);
      setLoading(false);
    }
  };

  const reportOptions = [
    { value: 'summary', label: 'Election Summary', description: 'Overview of election statistics and results' },
    { value: 'voters', label: 'Voter Statistics', description: 'Detailed voter participation data' },
    { value: 'candidates', label: 'Candidates Report', description: 'Information about all candidates' },
    { value: 'results', label: 'Election Results', description: 'Final results and vote distribution' },
    { value: 'incidents', label: 'Incidents Report', description: 'All reported incidents and resolutions' },
    { value: 'audit', label: 'Audit Trail', description: 'Complete audit log of all activities' }
  ];

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: colors.text }}>
          <FaFileExport className="me-2" />
          Reports
        </h3>
        <p className="text-muted mb-0">Generate and export election reports</p>
      </div>

      <div className="row g-4">
        {/* Report Generator */}
        <div className="col-12 col-lg-8">
          <div
            className="card"
            style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              color: colors.text
            }}
          >
            <div className="card-body">
              <h5 className="card-title mb-4">Generate Report</h5>

              {/* Election Selection */}
              <div className="mb-4">
                <label className="form-label">Select Election</label>
                <select
                  className="form-select"
                  value={selectedElection}
                  onChange={(e) => setSelectedElection(e.target.value)}
                  style={{
                    background: colors.background,
                    color: colors.text,
                    border: `1px solid ${colors.border}`
                  }}
                >
                  <option value="">Choose an election...</option>
                  {elections.map(election => (
                    <option key={election._id} value={election._id}>
                      {election.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Report Type Selection */}
              <div className="mb-4">
                <label className="form-label">Report Type</label>
                <div className="row g-2">
                  {reportOptions.map(option => (
                    <div key={option.value} className="col-12 col-md-6">
                      <div
                        className="p-3"
                        style={{
                          border: `2px solid ${reportType === option.value ? colors.primary : colors.border}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: reportType === option.value ? `${colors.primary}20` : colors.background,
                          transition: 'all 0.3s ease'
                        }}
                        onClick={() => setReportType(option.value)}
                      >
                        <h6 style={{ color: colors.text, marginBottom: '4px' }}>
                          {option.label}
                        </h6>
                        <p style={{ color: colors.textSecondary, fontSize: '0.875rem', marginBottom: 0 }}>
                          {option.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                className="btn btn-primary w-100"
                onClick={handleGenerateReport}
                disabled={loading || !selectedElection}
                style={{
                  background: colors.primary,
                  border: 'none',
                  color: 'white',
                  padding: '10px 20px'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Generating...
                  </>
                ) : (
                  <>
                    <FaDownload className="me-2" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="col-12 col-lg-4">
          <div
            className="card"
            style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              color: colors.text
            }}
          >
            <div className="card-body">
              <h5 className="card-title mb-4">Recent Reports</h5>
              <div className="list-group">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="list-group-item"
                    style={{
                      background: colors.background,
                      border: `1px solid ${colors.border}`,
                      color: colors.text
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">Election Summary Report</h6>
                        <small style={{ color: colors.textSecondary }}>Generated 2 hours ago</small>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        style={{ color: colors.primary }}
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObserverReports;
