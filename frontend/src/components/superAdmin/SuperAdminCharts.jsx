import React, { useEffect, useState } from 'react';
import { Line, Bar, Pie, Doughnut, PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
} from 'chart.js';
import axios from '../../utils/axiosInstance';
import { useTheme } from '../../contexts/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale
);

const dummyData = {
  userGrowth: [
    { month: 'Jan', count: 20 },
    { month: 'Feb', count: 35 },
    { month: 'Mar', count: 50 },
    { month: 'Apr', count: 65 },
    { month: 'May', count: 80 },
    { month: 'Jun', count: 95 },
  ],
  electionParticipation: [
    { name: 'Presidential', turnout: 75 },
    { name: 'Guild', turnout: 60 },
    { name: 'Faculty', turnout: 45 },
    { name: 'Class Rep', turnout: 30 },
  ],
  adminActivity: [
    { month: 'Jan', actions: 10, logins: 8 },
    { month: 'Feb', actions: 15, logins: 12 },
    { month: 'Mar', actions: 20, logins: 16 },
    { month: 'Apr', actions: 25, logins: 20 },
    { month: 'May', actions: 30, logins: 24 },
    { month: 'Jun', actions: 35, logins: 28 },
  ],
  systemActivity: [
    { date: '2024-05-01', uptime: 99.9, requests: 1200 },
    { date: '2024-05-02', uptime: 99.8, requests: 1350 },
    { date: '2024-05-03', uptime: 98.5, requests: 980 },
    { date: '2024-05-04', uptime: 99.9, requests: 1400 },
    { date: '2024-05-05', uptime: 100, requests: 1550 },
    { date: '2024-05-06', uptime: 99.7, requests: 1100 },
  ],
  roleDistribution: [
    { role: 'Admin', count: 5 },
    { role: 'Super Admin', count: 2 },
    { role: 'Student', count: 120 },
    { role: 'Candidate', count: 20 },
  ],
  systemHealthHistory: [
    { date: '2024-05-01', status: 'OK' },
    { date: '2024-05-02', status: 'OK' },
    { date: '2024-05-03', status: 'Down' },
    { date: '2024-05-04', status: 'OK' },
    { date: '2024-05-05', status: 'OK' },
    { date: '2024-05-06', status: 'OK' },
  ],
  topElections: [
    { name: 'Presidential', participation: 80 },
    { name: 'Guild', participation: 65 },
    { name: 'Faculty', participation: 50 },
    { name: 'Class Rep', participation: 35 },
  ],
};

export default function SuperAdminCharts() {
  const { isDarkMode, colors } = useTheme();
  const [chartStats, setChartStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartStats = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch from multiple endpoints to build comprehensive chart data
        const [analyticsRes, summaryRes, activityRes] = await Promise.allSettled([
          axios.get('/api/super-admin/reports/analytics', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('/api/super-admin/reports/system-summary', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('/api/super-admin/reports/activity', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Process analytics data
        let mergedData = { ...dummyData };
        
        if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.data) {
          const data = analyticsRes.value.data;
          console.log('Analytics API Response:', data);
          if (data.userGrowth && data.userGrowth.length > 0) mergedData.userGrowth = data.userGrowth;
          if (data.electionParticipation && data.electionParticipation.length > 0) mergedData.electionParticipation = data.electionParticipation;
          if (data.adminActivity && data.adminActivity.length > 0) mergedData.adminActivity = data.adminActivity;
          if (data.systemActivity && data.systemActivity.length > 0) mergedData.systemActivity = data.systemActivity;
          if (data.roleDistribution && data.roleDistribution.length > 0) mergedData.roleDistribution = data.roleDistribution;
          if (data.topElections && data.topElections.length > 0) mergedData.topElections = data.topElections;
        } else if (analyticsRes.status === 'rejected') {
          console.error('Analytics API Error:', analyticsRes.reason);
        }

        // Process activity data
        if (activityRes.status === 'fulfilled' && activityRes.value?.data) {
          const data = activityRes.value.data;
          console.log('Activity API Response:', data);
          if (data.adminActivity && data.adminActivity.length > 0) mergedData.adminActivity = data.adminActivity;
          if (data.systemActivity && data.systemActivity.length > 0) mergedData.systemActivity = data.systemActivity;
        } else if (activityRes.status === 'rejected') {
          console.error('Activity API Error:', activityRes.reason);
        }

        console.log('Final Merged Data:', mergedData);
        setChartStats(mergedData);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setChartStats(dummyData); // fallback to dummy data
      } finally {
        setLoading(false);
      }
    };
    fetchChartStats();
  }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="text-center">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading charts...</p>
      </div>
    </div>
  );

  // User Growth Line Chart
  const userGrowthData = {
    labels: chartStats.userGrowth?.map(item => item.month) || dummyData.userGrowth.map(item => item.month),
    datasets: [
      {
        label: 'User Registrations',
        data: chartStats.userGrowth?.map(item => item.count) || dummyData.userGrowth.map(item => item.count),
        fill: false,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  // Election Participation Bar Chart
  const electionLabels = chartStats.electionParticipation?.map(e => e.name) || dummyData.electionParticipation.map(e => e.name);
  const electionData = chartStats.electionParticipation?.map(e => e.turnout || e.participation) || dummyData.electionParticipation.map(e => e.turnout);
  const electionParticipationData = {
    labels: electionLabels,
    datasets: [
      {
        label: 'Voter Turnout (%)',
        data: electionData,
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
        borderRadius: 8,
      },
    ],
  };

  // Admin Activity Line Chart
  const adminActivityLabels = chartStats.adminActivity?.map(a => a.month) || dummyData.adminActivity.map(a => a.month);
  const adminActivityData = {
    labels: adminActivityLabels,
    datasets: [
      {
        label: 'Admin Actions',
        data: chartStats.adminActivity?.map(a => a.actions) || dummyData.adminActivity.map(a => a.actions),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#f59e0b',
      },
      {
        label: 'Admin Logins',
        data: chartStats.adminActivity?.map(a => a.logins) || dummyData.adminActivity.map(a => a.logins),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#8b5cf6',
      },
    ],
  };

  // System Activity Line Chart
  const systemActivityLabels = chartStats.systemActivity?.map(s => s.date) || dummyData.systemActivity.map(s => s.date);
  const systemActivityData = {
    labels: systemActivityLabels,
    datasets: [
      {
        label: 'System Uptime (%)',
        data: chartStats.systemActivity?.map(s => s.uptime) || dummyData.systemActivity.map(s => s.uptime),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#8b5cf6',
        yAxisID: 'y',
      },
      {
        label: 'API Requests (per hour)',
        data: chartStats.systemActivity?.map(s => s.requests / 100) || dummyData.systemActivity.map(s => s.requests / 100),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#06b6d4',
        yAxisID: 'y1',
      },
    ],
  };

  // Role Distribution Pie Chart
  const roleLabels = chartStats.roleDistribution?.map(r => r.role) || dummyData.roleDistribution.map(r => r.role);
  const roleCounts = chartStats.roleDistribution?.map(r => r.count) || dummyData.roleDistribution.map(r => r.count);
  const rolePieData = {
    labels: roleLabels,
    datasets: [
      {
        data: roleCounts,
        backgroundColor: ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b'],
        borderColor: isDarkMode ? colors.surface : '#fff',
        borderWidth: 2,
      },
    ],
  };

  // Top Elections Bar Chart - Independent data mapping
  const getTopElectionsData = () => {
    if (chartStats.topElections && Array.isArray(chartStats.topElections) && chartStats.topElections.length > 0) {
      // Verify data structure
      const firstItem = chartStats.topElections[0];
      if (firstItem.name && (firstItem.participation !== undefined || firstItem.turnout !== undefined)) {
        return chartStats.topElections;
      }
    }
    return dummyData.topElections;
  };
  
  const topElectionsArray = getTopElectionsData();
  const topElectionLabels = topElectionsArray.map(e => e.name);
  const topElectionDataArr = topElectionsArray.map(e => e.participation !== undefined ? e.participation : (e.turnout || 0));
  
  const topElectionsBarData = {
    labels: topElectionLabels,
    datasets: [
      {
        label: 'Participation %',
        data: topElectionDataArr,
        backgroundColor: '#06b6d4',
        borderRadius: 8,
      },
    ],
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Header */}
      <div className="mb-4">
        <h5 className="fw-bold mb-3" style={{ color: colors.text, fontSize: '1.25rem' }}>
          <i className="fa-solid fa-chart-line me-2"></i>
          Analytics & Reports
        </h5>
      </div>

      

      {/* Row 1: User Growth (Full Width) */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              borderColor: colors.border,
              borderRadius: '12px',
              boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.08)',
              border: `1px solid ${colors.border}`
            }}
          >
            <div className="card-body">
              <h6 className="fw-bold mb-4" style={{ color: colors.text }}>
                <i className="fa-solid fa-arrow-trend-up me-2" style={{ color: '#3b82f6' }}></i>
                User Growth Over Time
              </h6>
              <div style={{ height: '350px' }}>
                <Line
                  data={userGrowthData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: { color: colors.text, font: { size: 12 } }
                      }
                    },
                    scales: {
                      y: {
                        ticks: { color: colors.text },
                        grid: { color: isDarkMode ? colors.border : '#e5e7eb' }
                      },
                      x: {
                        ticks: { color: colors.text },
                        grid: { color: isDarkMode ? colors.border : '#e5e7eb' }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Admin Activity & System Activity (Side by Side) */}
      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              borderColor: colors.border,
              borderRadius: '12px',
              boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.08)',
              border: `1px solid ${colors.border}`
            }}
          >
            <div className="card-body">
              <h6 className="fw-bold mb-4" style={{ color: colors.text }}>
                <i className="fa-solid fa-person-circle-check me-2" style={{ color: '#f59e0b' }}></i>
                Admin Activity Trends
              </h6>
              <div style={{ height: '300px' }}>
                <Line
                  data={adminActivityData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: { color: colors.text, font: { size: 11 } }
                      }
                    },
                    scales: {
                      y: {
                        ticks: { color: colors.text },
                        grid: { color: isDarkMode ? colors.border : '#e5e7eb' }
                      },
                      x: {
                        ticks: { color: colors.text },
                        grid: { color: isDarkMode ? colors.border : '#e5e7eb' }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              borderColor: colors.border,
              borderRadius: '12px',
              boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.08)',
              border: `1px solid ${colors.border}`
            }}
          >
            <div className="card-body">
              <h6 className="fw-bold mb-4" style={{ color: colors.text }}>
                <i className="fa-solid fa-server me-2" style={{ color: '#8b5cf6' }}></i>
                System Activity & Uptime
              </h6>
              <div style={{ height: '300px' }}>
                <Line
                  data={systemActivityData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: { color: colors.text, font: { size: 11 } }
                      }
                    },
                    scales: {
                      y: {
                        ticks: { color: colors.text },
                        grid: { color: isDarkMode ? colors.border : '#e5e7eb' }
                      },
                      x: {
                        ticks: { color: colors.text },
                        grid: { color: isDarkMode ? colors.border : '#e5e7eb' }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Election Participation (Full Width) */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              borderColor: colors.border,
              borderRadius: '12px',
              boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.08)',
              border: `1px solid ${colors.border}`
            }}
          >
            <div className="card-body">
              <h6 className="fw-bold mb-4" style={{ color: colors.text }}>
                <i className="fa-solid fa-person-booth me-2" style={{ color: '#10b981' }}></i>
                Election Participation Rates
              </h6>
              <div style={{ height: '350px' }}>
                <Bar
                  data={electionParticipationData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: { color: colors.text, font: { size: 12 } }
                      }
                    },
                    scales: {
                      y: {
                        ticks: { color: colors.text },
                        grid: { color: isDarkMode ? colors.border : '#e5e7eb' }
                      },
                      x: {
                        ticks: { color: colors.text },
                        grid: { color: isDarkMode ? colors.border : '#e5e7eb' }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      

      {/* Row 4: Distribution Charts (Side by Side) */}
      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              borderColor: colors.border,
              borderRadius: '12px',
              boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.08)',
              border: `1px solid ${colors.border}`
            }}
          >
            <div className="card-body">
              <h6 className="fw-bold mb-4" style={{ color: colors.text }}>
                <i className="fa-solid fa-users-gear me-2" style={{ color: '#ec4899' }}></i>
                Role Distribution
              </h6>
              <div style={{ height: '300px' }}>
                <Pie
                  data={rolePieData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: { color: colors.text, font: { size: 11 } }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              borderColor: colors.border,
              borderRadius: '12px',
              boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.08)',
              border: `1px solid ${colors.border}`
            }}
          >
            <div className="card-body">
              <h6 className="fw-bold mb-4" style={{ color: colors.text }}>
                <i className="fa-solid fa-poll me-2" style={{ color: '#06b6d4' }}></i>
                Top Elections by Participation
              </h6>
              <div style={{ height: '300px' }}>
                <Bar
                  data={topElectionsBarData}
                  options={{
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: { color: colors.text, font: { size: 11 } }
                      }
                    },
                    scales: {
                      x: {
                        ticks: { color: colors.text },
                        grid: { color: isDarkMode ? colors.border : '#e5e7eb' }
                      },
                      y: {
                        ticks: { color: colors.text },
                        grid: { color: isDarkMode ? colors.border : '#e5e7eb' }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
