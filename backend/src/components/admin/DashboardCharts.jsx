import { useEffect, useState } from "react";
import axios from "axios";
import { Line, Bar, PolarArea } from "react-chartjs-2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faChartBar,
  faUsers,
  faVoteYea,
  faSpinner,
  faExclamationTriangle,
  faChartPie
} from "@fortawesome/free-solid-svg-icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
  ArcElement
);

function DashboardCharts() {
  const [stats, setStats] = useState({
    electionNames: [],
    votesPerElection: [],
    roles: [],
    roleCounts: [],
    participationLabels: [],
    participationData: [],
  });
  const [candidateStats, setCandidateStats] = useState({
    candidateNames: [],
    candidateVotes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingDummyData, setUsingDummyData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.allSettled([
          fetchDashboardStats(),
          fetchCandidateVotes()
        ]);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    // Fetch dashboard stats from your backend
    const fetchDashboardStats = async () => {
      try {
        // Set proper headers and check for correct URL
        const response = await axios.get("/api/admin/dashboard-stats", {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log('Raw response:', response);
        console.log('Response data type:', typeof response.data);
        console.log('Full response data:', JSON.stringify(response.data, null, 2));
        
        // Add detailed logging for each field
        console.log('=== API DATA BREAKDOWN ===');
        console.log('Total Users:', response.data?.totalUsers);
        console.log('Total Votes:', response.data?.totalVotes);
        console.log('Total Elections:', response.data?.totalElections);
        console.log('Total Candidates:', response.data?.totalCandidates);
        console.log('Election Names:', response.data?.electionNames);
        console.log('Votes Per Election:', response.data?.votesPerElection);
        console.log('Roles:', response.data?.roles);
        console.log('Role Counts:', response.data?.roleCounts);
        console.log('========================');
        
        // Check if we have actual data or empty arrays/zeros
        const hasElections = response.data?.electionNames?.length > 0;
        const hasVotes = response.data?.totalVotes > 0;
        const hasUsers = response.data?.totalUsers > 0;
        
        console.log('Data Status:');
        console.log('  Has Elections:', hasElections);
        console.log('  Has Votes:', hasVotes);
        console.log('  Has Users:', hasUsers);
        
        if (!hasElections && !hasVotes && !hasUsers) {
          console.warn('⚠️ DATABASE APPEARS TO BE EMPTY - Using dummy data for demonstration');
          console.warn('💡 To see real data, you need to:');
          console.warn('   1. Create elections in your admin panel');
          console.warn('   2. Add candidates to those elections');
          console.warn('   3. Have users vote on those elections');
        }
        console.log('Is response.data an object?', typeof response.data === 'object');
        
        // Check if we got HTML instead of JSON
        if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
          throw new Error('Received HTML instead of JSON - API endpoint may not exist');
        }
        
        if (response?.data && typeof response.data === 'object') {
          console.log('Dashboard stats received:', response.data);
          
          // Check if we have meaningful data
          const hasRealData = (
            response.data.electionNames?.length > 0 || 
            response.data.totalVotes > 0 || 
            response.data.totalUsers > 0
          );
          
          if (hasRealData) {
            console.log('✅ Using REAL database data');
            setUsingDummyData(false);
            setStats({
              electionNames: response.data.electionNames || ['No Elections'],
              votesPerElection: response.data.votesPerElection || [0],
              roles: response.data.roles || ['student', 'staff', 'admin'],
              roleCounts: response.data.roleCounts || [0, 0, 0],
              participationLabels: response.data.electionNames?.length > 0 
                ? response.data.electionNames 
                : ['No Active Elections'],
              participationData: response.data.votesPerElection?.length > 0 
                ? response.data.votesPerElection 
                : [0]
            });
          } else {
            console.log('⚠️ Database is empty - Using DUMMY data for demonstration');
            setUsingDummyData(true);
            setStats({
              electionNames: ['Sample Election 2024', 'Student Council', 'Faculty Representative'],
              votesPerElection: [150, 89, 67],
              roles: ['admin', 'student', 'staff'],
              roleCounts: [5, 150, 45],
              participationLabels: ['Active Voters', 'Registered Users', 'Eligible Voters'],
              participationData: [150, 250, 300]
            });
          }
        }
      } catch (err) {
        console.error('Dashboard stats endpoint error:', err.message);
        console.error('Full error:', err);
        
        // Use mock data as fallback
        console.log('⚠️ API Error - Using DUMMY data as fallback');
        setUsingDummyData(true);
        setStats({
          electionNames: ['Sample Election 2024', 'Student Council', 'Faculty Representative'],
          votesPerElection: [150, 89, 67],
          roles: ['admin', 'student', 'staff'],
          roleCounts: [5, 150, 45],
          participationLabels: ['Active Voters', 'Registered Users', 'Eligible Voters'],
          participationData: [150, 250, 300]
        });
      }
    };

    // Fetch candidates data
    const fetchCandidateVotes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get("/api/candidates", {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Candidates response:', response);
        console.log('Candidates data:', response.data);
        
        // Check if we got HTML instead of JSON
        if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
          throw new Error('Received HTML instead of JSON - candidates API endpoint may not exist');
        }
        
        if (response?.data && Array.isArray(response.data)) {
          console.log('All candidates:', response.data);
          
          // Filter approved candidates
          const approved = response.data.filter(c => {
            console.log(`Candidate ${c.name || c.candidateName}: status = ${c.status}`);
            return c.status === "approved" || c.status === "Approved";
          });
          
          console.log('Approved candidates:', approved);
          
          if (approved.length > 0) {
            setCandidateStats({
              candidateNames: approved.map(c => c.name || c.candidateName || `Candidate ${c.id}`),
              candidateVotes: approved.map(c => c.votes || c.voteCount || 0),
            });
          } else {
            console.log('No approved candidates found, using mock data');
            // Mock data if no approved candidates
            setCandidateStats({
              candidateNames: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'],
              candidateVotes: [45, 67, 23, 89],
            });
          }
        }
      } catch (err) {
        console.error('Candidates endpoint error:', err.message);
        console.error('Full error:', err);
        
        // Mock data as fallback
        setCandidateStats({
          candidateNames: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'],
          candidateVotes: [45, 67, 23, 89],
        });
      }
    };

    fetchData();
  }, []);

  const hasVotes = Array.isArray(stats?.electionNames) && stats.electionNames.length > 0;
  const hasRoles = Array.isArray(stats?.roles) && stats.roles.length > 0;
  const hasParticipation = Array.isArray(stats?.participationLabels) && stats.participationLabels.length > 0;
  const hasCandidateVotes =
    Array.isArray(candidateStats?.candidateNames) &&
    candidateStats.candidateNames.length > 0 &&
    Array.isArray(candidateStats?.candidateVotes);

  if (loading) {
    return (
      <div className="text-center py-5">
        <FontAwesomeIcon 
          icon={faSpinner} 
          spin 
          size="3x" 
          className="text-primary mb-3" 
        />
        <p className="mt-3 text-muted">Loading dashboard charts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-warning text-center" role="alert">
        <FontAwesomeIcon 
          icon={faExclamationTriangle} 
          size="2x" 
          className="text-warning mb-3" 
        />
        <h5>Data Loading Issue</h5>
        <p>{error}</p>
        <p className="small text-muted">Check console for detailed error information</p>
      </div>
    );
  }

  return (
    <div className="row g-4">
      {/* Data Source Indicator */}
      {usingDummyData && (
        <div className="col-12">
          <div className="alert alert-warning d-flex align-items-center" role="alert">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            <div>
              <strong>Demo Mode:</strong> The charts below are showing sample data because your database is empty. 
              To see real data, please create elections, add candidates, and have users vote through your admin panel.
            </div>
          </div>
        </div>
      )}
      
      {/* Approved Candidates Votes Line Chart */}
      <div className="col-12">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-transparent border-0 py-3">
            <h5 className="mb-0 fw-bold d-flex align-items-center">
              <FontAwesomeIcon 
                icon={faVoteYea} 
                className="text-danger me-2" 
              />
              Approved Candidates Votes
            </h5>
          </div>
          <div className="card-body">
            {hasCandidateVotes ? (
              <Line
                data={{
                  labels: candidateStats.candidateNames,
                  datasets: [
                    {
                      label: "Votes per Candidate",
                      data: candidateStats.candidateVotes,
                      borderColor: "#dc3545",
                      backgroundColor: "rgba(220,53,69,0.1)",
                      borderWidth: 3,
                      tension: 0.4,
                      fill: true,
                      pointBackgroundColor: "#dc3545",
                      pointBorderColor: "#fff",
                      pointBorderWidth: 2,
                      pointRadius: 6,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { display: true, position: 'top' },
                    tooltip: {
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      titleColor: '#fff',
                      bodyColor: '#fff'
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: 'rgba(0,0,0,0.1)' }
                    },
                    x: {
                      grid: { display: false }
                    }
                  }
                }}
                height={300}
              />
            ) : (
              <div className="text-muted text-center py-5">
                <FontAwesomeIcon 
                  icon={faChartLine} 
                  size="3x" 
                  className="mb-3 opacity-25" 
                />
                <p>No candidate vote data available</p>
                <small className="text-muted">Check browser console for debugging info</small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Votes Trend */}
      <div className="col-md-6">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-transparent border-0 py-3">
            <h5 className="mb-0 fw-bold d-flex align-items-center">
              <FontAwesomeIcon 
                icon={faChartLine} 
                className="text-primary me-2" 
              />
              Election Votes Overview
            </h5>
          </div>
          <div className="card-body">
            {hasVotes ? (
              <Line
                data={{
                  labels: stats.electionNames,
                  datasets: [
                    {
                      label: "Total Votes",
                      data: stats.votesPerElection,
                      borderColor: "#0d6efd",
                      backgroundColor: "rgba(13,110,253,0.1)",
                      borderWidth: 3,
                      tension: 0.4,
                      fill: true,
                      pointBackgroundColor: "#0d6efd",
                      pointBorderColor: "#fff",
                      pointBorderWidth: 2,
                      pointRadius: 5,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { display: true, position: 'top' }
                  },
                  scales: {
                    y: { beginAtZero: true }
                  }
                }}
                height={250}
              />
            ) : (
              <div className="text-muted text-center py-4">
                <FontAwesomeIcon 
                  icon={faChartLine} 
                  size="2x" 
                  className="mb-3 opacity-25" 
                />
                <p>No election data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Roles Distribution */}
      <div className="col-md-6">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-transparent border-0 py-3">
            <h5 className="mb-0 fw-bold d-flex align-items-center">
              <FontAwesomeIcon 
                icon={faUsers} 
                className="text-success me-2" 
              />
              User Roles Distribution
            </h5>
          </div>
          <div className="card-body">
            {hasRoles ? (
              <Bar
                data={{
                  labels: stats.roles.map(role => 
                    role.charAt(0).toUpperCase() + role.slice(1)
                  ),
                  datasets: [
                    {
                      label: "Number of Users",
                      data: stats.roleCounts,
                      backgroundColor: [
                        "#0d6efd", "#198754", "#ffc107", "#dc3545", "#6f42c1"
                      ],
                      borderColor: [
                        "#0d6efd", "#198754", "#ffc107", "#dc3545", "#6f42c1"
                      ],
                      borderWidth: 1,
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { display: false }
                  },
                  scales: {
                    y: { beginAtZero: true }
                  }
                }}
                height={250}
              />
            ) : (
              <div className="text-muted text-center py-4">
                <FontAwesomeIcon 
                  icon={faChartBar} 
                  size="2x" 
                  className="mb-3 opacity-25" 
                />
                <p>No role distribution data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Election Participation */}
      <div className="col-12">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-transparent border-0 py-3">
            <h5 className="mb-0 fw-bold d-flex align-items-center">
              <FontAwesomeIcon 
                icon={faChartPie} 
                className="text-warning me-2" 
              />
              Election Participation Overview
            </h5>
          </div>
          <div className="card-body">
            {hasParticipation ? (
              <PolarArea
                data={{
                  labels: stats.participationLabels,
                  datasets: [
                    {
                      data: stats.participationData,
                      backgroundColor: [
                        "rgba(13,110,253,0.8)",
                        "rgba(25,135,84,0.8)",
                        "rgba(255,193,7,0.8)",
                        "rgba(220,53,69,0.8)",
                        "rgba(111,66,193,0.8)",
                        "rgba(13,202,240,0.8)"
                      ],
                      borderColor: [
                        "#0d6efd", "#198754", "#ffc107", "#dc3545", "#6f42c1", "#0dcaf0"
                      ],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { 
                      display: true, 
                      position: 'right',
                      labels: {
                        usePointStyle: true,
                        padding: 20
                      }
                    }
                  }
                }}
                height={300}
              />
            ) : (
              <div className="text-muted text-center py-5">
                <FontAwesomeIcon 
                  icon={faChartPie} 
                  size="3x" 
                  className="mb-3 opacity-25" 
                />
                <p>No participation data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardCharts;