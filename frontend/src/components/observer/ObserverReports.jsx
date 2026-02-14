import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import { FaFileExport, FaChartBar, FaDownload, FaFilePdf, FaFileCsv, FaFileExcel } from 'react-icons/fa';
import Swal from 'sweetalert2';

const ObserverReports = () => {
  const { isDarkMode, colors } = useTheme();
  const [reportType, setReportType] = useState('summary');
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchElections();
    fetchRecentReports();
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

  const fetchRecentReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/observer/reports/recent', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecentReports(response.data.data || []);
    } catch (err) {
      console.error('Error fetching recent reports:', err);
      setRecentReports([]);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedElection) {
      Swal.fire({
        icon: 'warning',
        title: 'No Election Selected',
        text: 'Please select an election first',
        background: colors.surface,
        color: colors.text,
        confirmButtonColor: '#10b981'
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/observer/elections/${selectedElection}/reports/${reportType}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setReportData(response.data.data);
      
      Swal.fire({
        icon: 'success',
        title: 'Report Generated',
        text: `${reportType} report generated successfully`,
        background: colors.surface,
        color: colors.text,
        confirmButtonColor: '#10b981'
      });
      
      // Refresh recent reports
      fetchRecentReports();
    } catch (err) {
      console.error('Error generating report:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to generate report',
        background: colors.surface,
        color: colors.text,
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (format = 'pdf') => {
    if (!selectedElection) {
      Swal.fire({
        icon: 'warning',
        title: 'No Election Selected',
        text: 'Please select an election first',
        background: colors.surface,
        color: colors.text,
        confirmButtonColor: '#10b981'
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/observer/elections/${selectedElection}/reports/${reportType}/export?format=${format}`,
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
      
      link.setAttribute('download', `${electionTitle.replace(/\s+/g, '_')}_${reportType}_${timestamp}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      Swal.fire({
        icon: 'success',
        title: 'Export Successful',
        text: `Report exported as ${format.toUpperCase()}`,
        background: colors.surface,
        color: colors.text,
        confirmButtonColor: '#10b981',
        timer: 2000
      });
    } catch (err) {
      console.error('Error exporting report:', err);
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: err.response?.data?.message || 'Failed to export report',
        background: colors.surface,
        color: colors.text,
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (reportId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/observer/reports/${reportId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading report:', err);
      Swal.fire({
        icon: 'error',
        title: 'Download Failed',
        text: 'Failed to download report',
        background: colors.surface,
        color: colors.text,
        confirmButtonColor: '#ef4444'
      });
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
                        <p style={{ color: colors.textSecondary, fontSize: '0.84rem !important', marginBottom: 0 }}>
                          {option.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary flex-grow-1"
                  onClick={handleGenerateReport}
                  disabled={loading || !selectedElection}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    border: 'none',
                    color: 'white',
                    padding: '12px 20px'
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaChartBar className="me-2" />
                      Generate Report
                    </>
                  )}
                </button>
              </div>

              {/* Export Buttons */}
              {reportData && (
                <div className="mt-3">
                  <h6 className="mb-3" style={{ color: colors.text }}>Export Options</h6>
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className="btn btn-success"
                      onClick={() => handleExportReport('pdf')}
                      disabled={loading}
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <FaFilePdf />
                      Export PDF
                    </button>
                    <button
                      className="btn btn-info"
                      onClick={() => handleExportReport('csv')}
                      disabled={loading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <FaFileCsv />
                      Export CSV
                    </button>
                    <button
                      className="btn btn-warning"
                      onClick={() => handleExportReport('xlsx')}
                      disabled={loading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <FaFileExcel />
                      Export Excel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Report Preview */}
        {reportData && (
          <div className="col-12">
            <div
              className="card"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                color: colors.text
              }}
            >
              <div className="card-body">
                <h5 className="card-title mb-4">Report Preview</h5>
                <div
                  className="p-4"
                  style={{
                    background: colors.background,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}
                >
                  <pre style={{ 
                    color: colors.text, 
                    whiteSpace: 'pre-wrap',
                    margin: 0 
                  }}>
                    {JSON.stringify(reportData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

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
              {recentReports.length === 0 ? (
                <div className="text-center py-4" style={{ color: colors.textMuted }}>
                  <FaFileExport style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }} />
                  <p>No recent reports</p>
                </div>
              ) : (
                <div className="list-group">
                  {recentReports.map((report) => (
                    <div
                      key={report._id}
                      className="list-group-item"
                      style={{
                        background: colors.background,
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                        marginBottom: '8px',
                        borderRadius: '8px'
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1" style={{ color: colors.text }}>
                            {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
                          </h6>
                          <small style={{ color: colors.textMuted }}>
                            {new Date(report.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </small>
                        </div>
                        <button
                          className="btn btn-sm"
                          onClick={() => handleDownloadReport(report._id)}
                          style={{ 
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            border: 'none'
                          }}
                        >
                          <FaDownload />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObserverReports;
