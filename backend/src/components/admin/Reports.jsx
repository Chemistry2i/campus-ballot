import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Bar, Pie } from "react-chartjs-2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar, faDownload, faFilePdf, faSearch, faUsers, faUserCheck, faUserTimes, faVoteYea, faCalendarAlt, faCheckCircle, faTimesCircle, faChartPie, faUserShield, faUserGraduate, faTrophy, faExclamationTriangle, faCalendarPlus, faCalendarMinus
} from "@fortawesome/free-solid-svg-icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function Reports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredElections, setFilteredElections] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("/api/reports/summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setStats(res.data);
        setFilteredElections(res.data.elections);
        setLoading(false);
      })
      .catch(() => {
        Swal.fire("Error", "Failed to load reports", "error");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!stats || !Array.isArray(stats.elections)) return;
    setFilteredElections(
      stats.elections.filter(
        (e) =>
          typeof e?.name === "string" &&
          e.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, stats]);

  const handleExportCSV = () => {
    if (!filteredElections || filteredElections.length === 0) {
      Swal.fire("No Data", "There is no data to export.", "info");
      return;
    }
    try {
      const headers = [
        "Election",
        "Status",
        "Start Date",
        "End Date",
        "Votes",
        "Turnout (%)",
      ];
      const rows = filteredElections.map((e) => [
        `"${e.name}"`,
        `"${e.status}"`,
        e.startDate ? `"${new Date(e.startDate).toLocaleDateString()}"` : "",
        e.endDate ? `"${new Date(e.endDate).toLocaleDateString()}"` : "",
        e.votes,
        e.turnout,
      ]);
      const csvContent =
        [headers, ...rows].map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "election_report.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      Swal.fire("Exported!", "Report exported as CSV.", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to export report.", "error");
    }
  };

  const handleExportPDF = () => {
    Swal.fire("Coming Soon", "PDF export will be available soon.", "info");
  };

  if (loading)
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="fw-bold text-primary">Loading reports and analytics...</p>
      </div>
    );

  if (!stats)
    return (
      <div className="alert alert-info d-flex align-items-center">
        <FontAwesomeIcon icon={faChartBar} className="me-2" />
        No report data available.
      </div>
    );

  // Helper for status badge color
  const getStatusBadge = (status) => {
    if (status === "completed") return "success";
    if (status === "active" || status === "ongoing") return "primary";
    return "secondary";
  };

  // Find most voted candidate overall
  let mostVotedCandidate = { name: "-", votes: 0 };
  if (stats.elections) {
    stats.elections.forEach(election => {
      (election.candidates || []).forEach(c => {
        if (c.votes > mostVotedCandidate.votes) {
          mostVotedCandidate = { name: c.name, votes: c.votes };
        }
      });
    });
  }

  // Find department with highest turnout
  let topDept = { department: "-", turnout: 0 };
  if (stats.participationByDepartment) {
    stats.participationByDepartment.forEach(d => {
      if (d.turnout > topDept.turnout) {
        topDept = d;
      }
    });
  }

  // Calculate average turnout
  let avgTurnout = 0;
  if (stats.elections && stats.elections.length > 0) {
    avgTurnout = (
      stats.elections.reduce((sum, e) => sum + (parseFloat(e.turnout) || 0), 0) /
      stats.elections.length
    ).toFixed(2);
  }

  // Count upcoming elections
  const upcomingCount = stats.elections
    ? stats.elections.filter((e) => e.status === "upcoming").length
    : 0;

  // Count invalid votes
  const totalInvalidVotes = stats.elections
    ? stats.elections.reduce((sum, e) => sum + (e.invalidVotes || 0), 0)
    : 0;

  // Count spoiled votes (if available)
  const totalSpoiledVotes = stats.elections
    ? stats.elections.reduce((sum, e) => sum + (e.spoiledVotes || 0), 0)
    : 0;

  // Last election created
  const lastElection = stats.elections && stats.elections.length > 0
    ? stats.elections.reduce((latest, e) =>
        !latest || new Date(e.createdAt) > new Date(latest.createdAt) ? e : latest, null)
    : null;

  // Last admin action (if available)
  const lastAdminAction = stats.auditLogs && stats.auditLogs.length > 0
    ? stats.auditLogs[0]
    : null;

  // 16 cards config
  const cards = [
    {
      icon: faCalendarAlt,
      iconClass: "text-primary",
      label: "Total Elections",
      value: stats.totalElections,
    },
    {
      icon: faVoteYea,
      iconClass: "text-success",
      label: "Total Votes",
      value: stats.totalVotes,
    },
    {
      icon: faUserCheck,
      iconClass: "text-success",
      label: "Voted Users",
      value: stats.voted,
    },
    {
      icon: faUserTimes,
      iconClass: "text-danger",
      label: "Not Voted",
      value: stats.notVoted,
    },
    {
      icon: faUsers,
      iconClass: "text-primary",
      label: "Registered Users",
      value: stats.totalUsers,
    },
    {
      icon: faChartPie,
      iconClass: "text-primary",
      label: "Voter Turnout",
      value: stats.voterTurnout + "%",
    },
    {
      icon: faCheckCircle,
      iconClass: "text-success",
      label: "Complete Elections",
      value: stats.elections.filter((e) => e.status === "completed").length,
    },
    {
      icon: faTimesCircle,
      iconClass: "text-primary",
      label: "Ongoing Elections",
      value: stats.elections.filter((e) => e.status === "active" || e.status === "ongoing").length,
    },
    {
      icon: faCalendarPlus,
      iconClass: "text-warning",
      label: "Upcoming Election",
      value: upcomingCount,
    },
    {
      icon: faExclamationTriangle,
      iconClass: "text-danger",
      label: "Invalid Votes",
      value: totalInvalidVotes,
    },
    {
      icon: faExclamationTriangle,
      iconClass: "text-warning",
      label: "Spoiled Votes",
      value: totalSpoiledVotes,
    },
    {
      icon: faChartPie,
      iconClass: "text-success",
      label: "Average Turnout",
      value: avgTurnout + "%",
    },
    {
      icon: faTrophy,
      iconClass: "text-warning",
      label: "Top Candidate",
      value: mostVotedCandidate.name,
    //   sub: mostVotedCandidate.votes + " votes",
    },
    {
      icon: faUserGraduate,
      iconClass: "text-primary",
      label: "Top Dept. Turnout",
    //   value: topDept.department,
      sub: topDept.turnout + "%",
    },
    {
      icon: faCalendarMinus,
      iconClass: "text-secondary",
      label: "Last Election",
      value: lastElection ? lastElection.name : "-",
      sub: lastElection ? new Date(lastElection.createdAt).toLocaleDateString() : "",
    },
    {
      icon: faUserShield,
      iconClass: "text-primary",
      label: "Last Admin Action",
      value: lastAdminAction ? lastAdminAction.action : "-",
      sub: lastAdminAction ? new Date(lastAdminAction.date).toLocaleString() : "",
    },
  ];

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-4">
        <FontAwesomeIcon icon={faChartBar} className="text-primary me-2" size="lg" />
        <h4 className="fw-bold mb-0">Reports & Analytics</h4>
      </div>

      {/* 16 Analytics Cards in 2 rows, 8 per row */}
      <div className="row g-1 mb-4">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="col-6 col-sm-4 col-md-3 col-lg-3 col-xl-1-5 small"
            // style={{ minWidth: "12.5%", padding: "0.5rem 0.5rem !important" }} // 8 per row
          >
            <div
              className={`card shadow-sm text-center analytics-card${hoveredCard === idx ? " hovered" : ""}`}
              onMouseEnter={() => setHoveredCard(idx)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="card-body">
                <FontAwesomeIcon icon={card.icon} className={`${card.iconClass} mb-2`} size="lg" />
                <h6 className="text-muted">{card.label}</h6>
                <h3 className="fw-bold">{card.value}</h3>
                {card.sub && <span className="text-muted small">{card.sub}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Export */}
      <div className="d-flex align-items-center mb-3">
        <div className="input-group w-auto me-2">
          <span className="input-group-text">
            <FontAwesomeIcon icon={faSearch} />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search election..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-outline-primary btn-sm me-2" onClick={handleExportCSV}>
          <FontAwesomeIcon icon={faDownload} className="me-1" />
          Export CSV
        </button>
        <button className="btn btn-outline-danger btn-sm" onClick={handleExportPDF}>
          <FontAwesomeIcon icon={faFilePdf} className="me-1" />
          Export PDF
        </button>
      </div>

      {/* Table */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white fw-bold d-flex align-items-center">
          Election Stats Table
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Election</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Votes</th>
                  <th>Turnout (%)</th>
                  <th>Invalid Votes</th>
                </tr>
              </thead>
              <tbody>
                {filteredElections.map((e) => (
                  <tr key={e._id}>
                    <td>{e.name}</td>
                    <td>
                      <span className={`badge bg-${getStatusBadge(e.status)}`}>
                        {e.status}
                      </span>
                    </td>
                    <td>{e.startDate ? new Date(e.startDate).toLocaleDateString() : "-"}</td>
                    <td>{e.endDate ? new Date(e.endDate).toLocaleDateString() : "-"}</td>
                    <td>{e.votes}</td>
                    <td>{e.turnout}</td>
                    <td>{e.invalidVotes ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Votes per Candidate for each Election */}
      {filteredElections.map((election) => (
        <div key={election._id} className="mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white fw-bold">
              {election.name} - Candidate Results
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-bordered mb-0">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(election.candidates || []).map((c) => (
                      <tr key={c._id}>
                        <td>{c.name}</td>
                        <td>{c.votes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Participation by Department (if available) */}
      {stats.participationByDepartment && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white fw-bold">
            Participation by Department
          </div>
          <div className="card-body">
            <Bar
              data={{
                labels: stats.participationByDepartment.map((d) => d.department),
                datasets: [
                  {
                    label: "Voter Turnout",
                    data: stats.participationByDepartment.map((d) => d.turnout),
                    backgroundColor: "#6610f2",
                  },
                ],
              }}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          </div>
        </div>
      )}

      {/* Audit Log Section */}
      {stats.auditLogs && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white fw-bold">
            Recent Admin Actions (Audit Log)
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-striped mb-0">
                <thead>
                  <tr>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.auditLogs.map((log, idx) => (
                    <tr key={idx}>
                      <td>{log.adminName}</td>
                      <td>{log.action}</td>
                      <td>{new Date(log.date).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Charts at the bottom */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white fw-bold">
              Votes per Election
            </div>
            <div className="card-body">
              <Bar
                data={{
                  labels: filteredElections.map((e) => e.name),
                  datasets: [
                    {
                      label: "Votes",
                      data: filteredElections.map((e) => e.votes),
                      backgroundColor: "#0d6efd",
                    },
                  ],
                }}
                options={{ responsive: true, plugins: { legend: { display: false } } }}
              />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white fw-bold">
              Voter Turnout Distribution
            </div>
            <div className="card-body">
              <Pie
                data={{
                  labels: ["Voted", "Not Voted"],
                  datasets: [
                    {
                      data: [stats.voted, stats.notVoted],
                      backgroundColor: ["#198754", "#dc3545"],
                    },
                  ],
                }}
                options={{ responsive: true }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;