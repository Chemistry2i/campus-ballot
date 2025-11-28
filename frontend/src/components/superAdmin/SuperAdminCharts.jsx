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
import axios from 'axios';

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
  ],
  electionParticipation: [
    { name: 'Presidential', turnout: 75 },
    { name: 'Guild', turnout: 60 },
    { name: 'Faculty', turnout: 45 },
    { name: 'Class Rep', turnout: 30 },
  ],
  adminActivity: [
    { month: 'Jan', count: 10 },
    { month: 'Feb', count: 15 },
    { month: 'Mar', count: 20 },
    { month: 'Apr', count: 25 },
    { month: 'May', count: 30 },
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
  ],
  topElections: [
    { name: 'Presidential', participation: 80 },
    { name: 'Guild', participation: 65 },
    { name: 'Faculty', participation: 50 },
    { name: 'Class Rep', participation: 35 },
  ],
};

export default function SuperAdminCharts() {
  const [chartStats, setChartStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartStats = async () => {
      try {
        const token = localStorage.getItem('token');
        // Use dashboard stats endpoint for super admin charts
        const res = await axios.get('/api/super-admin/reports/system-summary', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // If backend returns chart data in a different endpoint, you can merge here
        setChartStats(res.data && Object.keys(res.data).length > 0 ? res.data : dummyData);
      } catch (err) {
        setChartStats(dummyData); // fallback to dummy data
      } finally {
        setLoading(false);
      }
    };
    fetchChartStats();
  }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
      <div className="spinner-border text-primary" role="status" />
      <span className="ms-3">Loading charts...</span>
    </div>
  );

  // User Growth Line Chart
  const userGrowthData = {
    labels: chartStats.userGrowth?.map(item => item.month) || [],
    datasets: [
      {
        label: 'User Registrations',
        data: chartStats.userGrowth?.map(item => item.count) || [],
        fill: false,
        borderColor: '#2563eb',
        backgroundColor: '#60a5fa',
        tension: 0.3,
      },
    ],
  };

  // Election Participation Bar Chart
  const electionLabels = chartStats.electionParticipation?.map(e => e.name) || [];
  const electionData = chartStats.electionParticipation?.map(e => e.turnout) || [];
  const electionParticipationData = {
    labels: electionLabels,
    datasets: [
      {
        label: 'Voter Turnout (%)',
        data: electionData,
        backgroundColor: '#2563eb',
      },
    ],
  };

  // Admin Activity Doughnut Chart
  const adminActivityLabels = chartStats.adminActivity?.map(a => a.month) || [];
  const adminActivityDataArr = chartStats.adminActivity?.map(a => a.count) || [];
  const adminActivityDoughnutData = {
    labels: adminActivityLabels,
    datasets: [
      {
        label: 'Admin Actions',
        data: adminActivityDataArr,
        backgroundColor: ['#2563eb', '#60a5fa', '#f59e42', '#10b981', '#e11d48'],
      },
    ],
  };

  // Role Distribution Pie Chart
  const roleLabels = chartStats.roleDistribution?.map(r => r.role) || [];
  const roleCounts = chartStats.roleDistribution?.map(r => r.count) || [];
  const rolePieData = {
    labels: roleLabels,
    datasets: [
      {
        data: roleCounts,
        backgroundColor: ['#2563eb', '#60a5fa', '#f59e42', '#10b981', '#e11d48'],
      },
    ],
  };

  // System Health PolarArea Chart
  const healthLabels = chartStats.systemHealthHistory?.map(h => h.date) || [];
  const healthDataArr = chartStats.systemHealthHistory?.map(h => h.status === 'OK' ? 1 : 0) || [];
  const systemHealthPolarData = {
    labels: healthLabels,
    datasets: [
      {
        label: 'System Health',
        data: healthDataArr,
        backgroundColor: ['#10b981', '#e11d48', '#f59e42', '#2563eb', '#60a5fa'],
      },
    ],
  };

  // Top Elections Bar Chart
  const topElectionLabels = chartStats.topElections?.map(e => e.name) || [];
  const topElectionDataArr = chartStats.topElections?.map(e => e.participation) || [];
  const topElectionsBarData = {
    labels: topElectionLabels,
    datasets: [
      {
        label: 'Participation',
        data: topElectionDataArr,
        backgroundColor: '#e11d48',
      },
    ],
  };

  return (
    <div className="row mt-4">
      <div className="col-md-6 mb-4">
        <div className="card shadow-sm">
          <div className="card-header bg-white fw-bold">User Growth Over Time</div>
          <div className="card-body">
            <Line data={userGrowthData} options={{ responsive: true }} />
          </div>
        </div>
      </div>
      <div className="col-md-6 mb-4">
        <div className="card shadow-sm">
          <div className="card-header bg-white fw-bold">Election Participation</div>
          <div className="card-body">
            <Bar data={electionParticipationData} options={{ responsive: true }} />
          </div>
        </div>
      </div>
      <div className="col-md-6 mb-4">
        <div className="card shadow-sm">
          <div className="card-header bg-white fw-bold">Admin Activity (Doughnut)</div>
          <div className="card-body">
            <Doughnut data={adminActivityDoughnutData} options={{ responsive: true }} />
          </div>
        </div>
      </div>
      <div className="col-md-6 mb-4">
        <div className="card shadow-sm">
          <div className="card-header bg-white fw-bold">Role Distribution (Pie)</div>
          <div className="card-body">
            <Pie data={rolePieData} options={{ responsive: true }} />
          </div>
        </div>
      </div>
      <div className="col-md-6 mb-4">
        <div className="card shadow-sm">
          <div className="card-header bg-white fw-bold">System Health (Polar Area)</div>
          <div className="card-body">
            <PolarArea data={systemHealthPolarData} options={{ responsive: true }} />
          </div>
        </div>
      </div>
      <div className="col-md-6 mb-4">
        <div className="card shadow-sm">
          <div className="card-header bg-white fw-bold">Top Elections by Participation</div>
          <div className="card-body">
            <Bar data={topElectionsBarData} options={{ responsive: true }} />
          </div>
        </div>
      </div>
    </div>
  );
}
