import React from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useTheme } from '../../contexts/ThemeContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ObserverCharts = ({ dashboardData }) => {
  const { isDarkMode, colors } = useTheme();

  // Chart colors optimized for both themes
  const chartColors = {
    primary: '#10b981',
    secondary: '#3b82f6',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    cyan: '#06b6d4',
  };

  // Common chart options for dark mode support
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: colors.text,
          font: {
            size: 12,
            weight: 600
          }
        }
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
        titleColor: colors.text,
        bodyColor: colors.text,
        borderColor: colors.border,
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
      }
    },
    scales: {
      x: {
        ticks: {
          color: colors.textMuted,
          font: {
            size: 11
          }
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        }
      },
      y: {
        ticks: {
          color: colors.textMuted,
          font: {
            size: 11
          }
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        }
      }
    }
  };

  // Election Status Doughnut Chart
  const statusChartData = {
    labels: ['Active', 'Upcoming', 'Completed'],
    datasets: [{
      data: [
        dashboardData?.overview?.activeElections || 0,
        dashboardData?.overview?.upcomingElections || 0,
        dashboardData?.overview?.completedElections || 0
      ],
      backgroundColor: [
        chartColors.primary,
        chartColors.warning,
        chartColors.purple
      ],
      borderColor: colors.surface,
      borderWidth: 3,
      hoverOffset: 8
    }]
  };

  const statusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: colors.text,
          padding: 15,
          font: {
            size: 12,
            weight: 600
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
        titleColor: colors.text,
        bodyColor: colors.text,
        borderColor: colors.border,
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
      }
    }
  };

  // Voter Turnout Line Chart (Sample Data)
  const turnoutChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Votes Cast',
      data: [12, 19, 15, 25, 22, 30, 28],
      borderColor: chartColors.primary,
      backgroundColor: `${chartColors.primary}20`,
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: chartColors.primary,
      pointBorderColor: colors.surface,
      pointBorderWidth: 2
    }]
  };

  // Positions Bar Chart (Sample Data)
  const positionsChartData = {
    labels: ['President', 'Vice President', 'Secretary', 'Treasurer', 'Director'],
    datasets: [{
      label: 'Candidates',
      data: [4, 3, 5, 3, 6],
      backgroundColor: [
        chartColors.primary,
        chartColors.secondary,
        chartColors.warning,
        chartColors.purple,
        chartColors.cyan
      ],
      borderRadius: 8,
      barThickness: 40
    }]
  };

  const barChartOptions = {
    ...commonOptions,
    scales: {
      ...commonOptions.scales,
      y: {
        ...commonOptions.scales.y,
        beginAtZero: true
      }
    }
  };

  return (
    <div className="row g-4 mb-4">
      {/* Election Status Distribution */}
      <div className="col-12 col-lg-4">
        <div className="card border-0 shadow-sm h-100" style={{ background: colors.surface }}>
          <div className="card-header border-0 py-3" style={{ 
            background: 'transparent', 
            borderBottom: `1px solid ${colors.border}` 
          }}>
            <h6 className="mb-0 d-flex align-items-center" style={{ color: colors.text }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.75rem'
              }}>
                <i className="fas fa-chart-pie" style={{ color: '#fff', fontSize: '0.9rem' }}></i>
              </div>
              <span style={{ fontWeight: 600 }}>Election Status</span>
            </h6>
          </div>
          <div className="card-body">
            <div style={{ height: '280px' }}>
              <Doughnut data={statusChartData} options={statusChartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Voter Turnout Trend */}
      <div className="col-12 col-lg-8">
        <div className="card border-0 shadow-sm h-100" style={{ background: colors.surface }}>
          <div className="card-header border-0 py-3" style={{ 
            background: 'transparent', 
            borderBottom: `1px solid ${colors.border}` 
          }}>
            <h6 className="mb-0 d-flex align-items-center justify-content-between" style={{ color: colors.text }}>
              <div className="d-flex align-items-center">
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '0.75rem'
                }}>
                  <i className="fas fa-chart-line" style={{ color: '#fff', fontSize: '0.9rem' }}></i>
                </div>
                <span style={{ fontWeight: 600 }}>Weekly Voter Activity</span>
              </div>
              <span className="badge" style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                padding: '0.4rem 0.75rem',
                fontSize: '0.75rem'
              }}>
                <i className="fas fa-arrow-up me-1"></i>
                +24% vs last week
              </span>
            </h6>
          </div>
          <div className="card-body">
            <div style={{ height: '280px' }}>
              <Line data={turnoutChartData} options={commonOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Candidates by Position */}
      <div className="col-12">
        <div className="card border-0 shadow-sm" style={{ background: colors.surface }}>
          <div className="card-header border-0 py-3" style={{ 
            background: 'transparent', 
            borderBottom: `1px solid ${colors.border}` 
          }}>
            <h6 className="mb-0 d-flex align-items-center" style={{ color: colors.text }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.75rem'
              }}>
                <i className="fas fa-chart-bar" style={{ color: '#fff', fontSize: '0.9rem' }}></i>
              </div>
              <span style={{ fontWeight: 600 }}>Candidates Distribution</span>
            </h6>
          </div>
          <div className="card-body">
            <div style={{ height: '300px' }}>
              <Bar data={positionsChartData} options={barChartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObserverCharts;
