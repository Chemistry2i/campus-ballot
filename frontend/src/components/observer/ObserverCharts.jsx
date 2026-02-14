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

  // Extract real data from dashboardData
  const overview = dashboardData?.overview || {};
  const elections = dashboardData?.elections || [];
  const votingStats = dashboardData?.votingStats || {};
  const positionStats = dashboardData?.positionStats || [];

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
            size: window.innerWidth < 768 ? 10 : 12,
            weight: 600
          },
          padding: window.innerWidth < 768 ? 10 : 15
        }
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
        titleColor: colors.text,
        bodyColor: colors.text,
        borderColor: colors.border,
        borderWidth: 1,
        padding: window.innerWidth < 768 ? 8 : 12,
        boxPadding: window.innerWidth < 768 ? 4 : 6,
        usePointStyle: true,
        titleFont: {
          size: window.innerWidth < 768 ? 11 : 13,
          weight: 600
        },
        bodyFont: {
          size: window.innerWidth < 768 ? 10 : 12
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: colors.textMuted,
          font: {
            size: window.innerWidth < 768 ? 9 : 11
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
            size: window.innerWidth < 768 ? 9 : 11
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
          padding: window.innerWidth < 768 ? 10 : 15,
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
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
        padding: window.innerWidth < 768 ? 8 : 12,
        boxPadding: window.innerWidth < 768 ? 4 : 6,
        titleFont: {
          size: window.innerWidth < 768 ? 11 : 13,
          weight: 600
        },
        bodyFont: {
          size: window.innerWidth < 768 ? 10 : 12
        }
      }
    }
  };

  // Voter Turnout Line Chart - Use hourly voting activity (elections are typically one day)
  const hourlyActivity = votingStats?.hourlyActivity || [];
  const hasVotingData = hourlyActivity.length > 0 && hourlyActivity.some(d => d.count > 0);
  
  const turnoutChartData = {
    labels: hasVotingData
      ? hourlyActivity.map(d => d.time)
      : Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`),
    datasets: [{
      label: 'Votes Cast',
      data: hasVotingData
        ? hourlyActivity.map(d => d.count)
        : Array(24).fill(0),
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

  // Positions Bar Chart - Use real position data
  const hasPositionData = positionStats.length > 0;
  
  const positionsChartData = {
    labels: hasPositionData
      ? positionStats.map(p => p.positionName || 'Unknown')
      : ['No Positions Available'],
    datasets: [{
      label: 'Candidates',
      data: hasPositionData
        ? positionStats.map(p => p.candidateCount || 0)
        : [0],
      backgroundColor: hasPositionData
        ? positionStats.map((_, index) => {
            const colorKeys = ['primary', 'secondary', 'warning', 'purple', 'cyan'];
            return chartColors[colorKeys[index % colorKeys.length]];
          })
        : [chartColors.primary],
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
            borderBottom: `1px solid ${colors.border}`,
            padding: 'clamp(0.75rem, 2vw, 1rem)'
          }}>
            <h6 className="mb-0 d-flex align-items-center" style={{ color: colors.text }}>
              <div style={{
                width: 'clamp(2rem, 4vw, 2.25rem)',
                height: 'clamp(2rem, 4vw, 2.25rem)',
                borderRadius: 'clamp(0.4rem, 1vw, 0.5rem)',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 'clamp(0.5rem, 1.5vw, 0.75rem)'
              }}>
                <i className="fas fa-chart-pie" style={{ color: '#fff', fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}></i>
              </div>
              <span style={{ fontWeight: 600, fontSize: 'clamp(0.84rem !important, 1.8vw, 0.95rem)' }}>Election Status</span>
            </h6>
          </div>
          <div className="card-body" style={{ padding: 'clamp(0.75rem, 2vw, 1rem)' }}>
            <div style={{ height: 'clamp(220px, 40vh, 280px)' }}>
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
            borderBottom: `1px solid ${colors.border}`,
            padding: 'clamp(0.75rem, 2vw, 1rem)'
          }}>
            <h6 className="mb-0 d-flex align-items-center justify-content-between flex-wrap" style={{ 
              color: colors.text,
              gap: 'clamp(0.5rem, 1vw, 0.75rem)'
            }}>
              <div className="d-flex align-items-center">
                <div style={{
                  width: 'clamp(2rem, 4vw, 2.25rem)',
                  height: 'clamp(2rem, 4vw, 2.25rem)',
                  borderRadius: 'clamp(0.4rem, 1vw, 0.5rem)',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 'clamp(0.5rem, 1.5vw, 0.75rem)'
                }}>
                  <i className="fas fa-chart-line" style={{ color: '#fff', fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}></i>
                </div>
                <span style={{ fontWeight: 600, fontSize: 'clamp(0.84rem !important, 1.8vw, 0.95rem)' }}>
                  Hourly Voting Activity
                </span>
              </div>
              {votingStats?.totalVotesToday > 0 && (
                <span className="badge" style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  padding: 'clamp(0.3rem, 1vw, 0.4rem) clamp(0.6rem, 1.5vw, 0.75rem)',
                  fontSize: 'clamp(0.7rem, 1.4vw, 0.75rem)',
                  fontWeight: 600
                }}>
                  <i className="fas fa-vote-yea me-1"></i>
                  {votingStats.totalVotesToday} votes today
                  {votingStats.peakHour && ` • Peak: ${votingStats.peakHour.time}`}
                </span>
              )}
            </h6>
          </div>
          <div className="card-body" style={{ padding: 'clamp(0.75rem, 2vw, 1rem)' }}>
            <div style={{ height: 'clamp(220px, 40vh, 280px)' }}>
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
            borderBottom: `1px solid ${colors.border}`,
            padding: 'clamp(0.75rem, 2vw, 1rem)'
          }}>
            <h6 className="mb-0 d-flex align-items-center" style={{ color: colors.text }}>
              <div style={{
                width: 'clamp(2rem, 4vw, 2.25rem)',
                height: 'clamp(2rem, 4vw, 2.25rem)',
                borderRadius: 'clamp(0.4rem, 1vw, 0.5rem)',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 'clamp(0.5rem, 1.5vw, 0.75rem)'
              }}>
                <i className="fas fa-chart-bar" style={{ color: '#fff', fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}></i>
              </div>
              <span style={{ fontWeight: 600, fontSize: 'clamp(0.84rem !important, 1.8vw, 0.95rem)' }}>
                {positionStats.length > 0 ? 'Candidates by Position' : 'Candidates Distribution'}
              </span>
            </h6>
          </div>
          <div className="card-body" style={{ padding: 'clamp(0.75rem, 2vw, 1rem)' }}>
            <div style={{ height: 'clamp(250px, 45vh, 300px)' }}>
              <Bar data={positionsChartData} options={barChartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObserverCharts;
