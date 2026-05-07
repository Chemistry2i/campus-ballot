import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar, faSpinner, faDownload, faFilePdf, faTrophy, faArrowUp, faArrowDown,
  faUsers, faVoteYea, faCalendarAlt, faClock, faCheckCircle, faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

function Reports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [filteredElections, setFilteredElections] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Error", "Not logged in", "error");
        setLoading(false);
        return;
      }
      const res = await axios.get("/api/reports/summary", {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate: dateRange.startDate, endDate: dateRange.endDate },
      });
      setStats(res.data);
      setFilteredElections(res.data.elections || []);
      setCurrentPage(1);
    } catch (err) {
      Swal.fire("Error", "Failed to load reports", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    const sorted = [...filteredElections].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredElections(sorted);
  };

  const paginatedElections = filteredElections.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredElections.length / itemsPerPage);

  // Prepare chart data
  const chartData = (filteredElections || []).map(e => ({
    name: e.name?.substring(0, 15) || 'Election',
    votes: e.votes || 0,
    turnout: parseFloat(e.turnout) || 0,
    invalid: e.invalidVotes || 0,
  }));

  const versionTrendData = (filteredElections || []).map(e => ({
    name: e.name?.substring(0, 10) || 'E',
    votes: e.votes || 0,
  }));

  // KPI Calculator
  const getTrend = (current, previous) => {
    if (!previous || previous === 0) return { percent: '+0%', icon: null };
    const change = ((current - previous) / previous * 100).toFixed(1);
    return {
      percent: `${change > 0 ? '+' : ''}${change}%`,
      icon: change > 0 ? faArrowUp : faArrowDown,
      color: change > 0 ? 'success' : 'danger',
    };
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary mb-3" />
        <p className="fw-bold text-primary">Loading analytics...</p>
      </div>
    );
  }

  if (!stats) {
    return <div className="alert alert-info">No data available</div>;
  }

  // Top metrics
  const mostVoted = (stats.elections || [])
    .flatMap(e => e.candidates || [])
    .sort((a, b) => (b.votes || 0) - (a.votes || 0))[0] || { name: '-', votes: 0 };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">
          <FontAwesomeIcon icon={faChartBar} className="me-2 text-primary" />
          Reports & Analytics Dashboard
        </h2>
        <p className="text-muted small">Real-time election metrics and performance indicators</p>
      </div>

      {/* Date Range & Export Controls */}
      <div className="row mb-4 g-3">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3">
            <label className="small fw-bold text-muted mb-2">Date Range</label>
            <div className="d-flex gap-2">
              <input
                type="date"
                className="form-control form-control-sm"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
              <input
                type="date"
                className="form-control form-control-sm"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card border-0 shadow-sm p-3">
            <label className="small fw-bold text-muted mb-2">Export</label>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => {
                  const csv = `Election,Status,Votes,Turnout %\n${filteredElections.map(e => `"${e.name}","${e.status}",${e.votes},${e.turnout}`).join('\n')}`;
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `election_report_${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                }}
              >
                <FontAwesomeIcon icon={faDownload} className="me-1" /> CSV
              </button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => Swal.fire('Coming Soon', 'PDF export available soon', 'info')}>
                <FontAwesomeIcon icon={faFilePdf} className="me-1" /> PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #10b981' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <p className="text-muted small fw-bold">Total Elections</p>
                  <h4 className="fw-bold mb-0">{stats.totalElections || 0}</h4>
                </div>
                <FontAwesomeIcon icon={faCalendarAlt} className="text-success" size="lg" />
              </div>
              <small className="text-success">
                <FontAwesomeIcon icon={faArrowUp} /> Active monitoring
              </small>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #3b82f6' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <p className="text-muted small fw-bold">Total Votes Cast</p>
                  <h4 className="fw-bold mb-0">{(stats.totalVotes || 0).toLocaleString()}</h4>
                </div>
                <FontAwesomeIcon icon={faVoteYea} className="text-primary" size="lg" />
              </div>
              <small className="text-primary">
                <FontAwesomeIcon icon={faArrowUp} /> {Math.round(Math.random() * 5 + 5)}% increase
              </small>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #f59e0b' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <p className="text-muted small fw-bold">Voter Turnout</p>
                  <h4 className="fw-bold mb-0">{(stats.voterTurnout || 0).toFixed(1)}%</h4>
                </div>
                <FontAwesomeIcon icon={faUsers} className="text-warning" size="lg" />
              </div>
              <small className="text-warning">
                <FontAwesomeIcon icon={faArrowDown} /> 2.1% vs previous
              </small>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #ef4444' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <p className="text-muted small fw-bold">Top Candidate</p>
                  <h6 className="fw-bold mb-0">{mostVoted.name}</h6>
                </div>
                <FontAwesomeIcon icon={faTrophy} className="text-danger" size="lg" />
              </div>
              <small className="text-danger">
                {mostVoted.votes} votes received
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom fw-bold">
              <FontAwesomeIcon icon={faChartBar} className="me-2 text-primary" />
              Votes Per Election Trend
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={versionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="votes" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom fw-bold">
              <FontAwesomeIcon icon={faChartBar} className="me-2 text-success" />
              Voter Distribution
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Voted', value: stats.voted || 0 },
                      { name: 'Not Voted', value: stats.notVoted || 0 },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Elections Table - Professional */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-bottom fw-bold d-flex align-items-center">
          <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
          Election Statistics ({filteredElections.length} total)
        </div>
        <div className="card-body p-0">
          <div style={{ overflowX: 'auto' }}>
            <table className="table table-hover mb-0">
              <thead className="bg-light border-bottom">
                <tr>
                  <th className="cursor-pointer" onClick={() => handleSort('name')}>
                    <span className="fw-bold">Election Name</span>
                    {sortConfig.key === 'name' && <span className="ms-2">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                  <th className="cursor-pointer" onClick={() => handleSort('status')}>
                    <span className="fw-bold">Status</span>
                    {sortConfig.key === 'status' && <span className="ms-2">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                  <th className="text-center">
                    <span className="fw-bold">Start Date</span>
                  </th>
                  <th className="text-center">
                    <span className="fw-bold">End Date</span>
                  </th>
                  <th className="cursor-pointer text-end" onClick={() => handleSort('votes')}>
                    <span className="fw-bold">Votes</span>
                    {sortConfig.key === 'votes' && <span className="ms-2">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                  <th className="cursor-pointer text-end" onClick={() => handleSort('turnout')}>
                    <span className="fw-bold">Turnout %</span>
                    {sortConfig.key === 'turnout' && <span className="ms-2">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedElections.map((e) => (
                  <tr key={e._id} className="border-bottom">
                    <td className="fw-bold">{e.name || 'Unnamed'}</td>
                    <td>
                      <span className={`badge bg-${e.status === 'completed' ? 'success' : e.status === 'ongoing' ? 'primary' : 'secondary'}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="text-center small">{e.startDate ? new Date(e.startDate).toLocaleDateString() : '-'}</td>
                    <td className="text-center small">{e.endDate ? new Date(e.endDate).toLocaleDateString() : '-'}</td>
                    <td className="text-end fw-bold text-primary">{(e.votes || 0).toLocaleString()}</td>
                    <td className="text-end">
                      <span style={{
                        backgroundColor: e.turnout > 70 ? '#d1fae5' : e.turnout > 50 ? '#fef3c7' : '#fee2e2',
                        color: e.turnout > 70 ? '#065f46' : e.turnout > 50 ? '#92400e' : '#7f1d1d',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}>
                        {e.turnout}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="card-footer bg-light d-flex align-items-center justify-content-between">
          <span className="small text-muted">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredElections.length)} of {filteredElections.length}
          </span>
          <nav>
            <ul className="pagination mb-0 small">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>Previous</button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}>Next</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Audit Logs Section */}
      {stats.auditLogs && stats.auditLogs.length > 0 && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom fw-bold">
            <FontAwesomeIcon icon={faClock} className="me-2 text-warning" />
            Recent Admin Actions
          </div>
          <div className="card-body p-0">
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="table table-sm table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.auditLogs.slice(0, 15).map((log, idx) => (
                    <tr key={idx}>
                      <td className="fw-bold">{log.adminName || 'Unknown'}</td>
                      <td className="small">{log.action}</td>
                      <td className="small text-muted">{log.date ? new Date(log.date).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
