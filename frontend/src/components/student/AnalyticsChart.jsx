import React from 'react';
import { FaChartLine, FaTrophy, FaCalendarAlt } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const AnalyticsChart = ({ myVotes, electionStats }) => {
  const { isDarkMode, colors } = useTheme();

  // Calculate monthly participation
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const votesInMonth = myVotes.filter(vote => {
        const voteDate = new Date(vote.createdAt);
        return voteDate.getMonth() === monthIndex;
      }).length;
      
      last6Months.push({
        month: months[monthIndex],
        votes: votesInMonth
      });
    }
    
    return last6Months;
  };

  const monthlyData = getMonthlyData();
  const maxVotes = Math.max(...monthlyData.map(d => d.votes), 1);
  const participationRate = electionStats.total > 0 
    ? Math.round((electionStats.participated / electionStats.total) * 100) 
    : 0;

  return (
    <div className="row g-3 mb-4">
      {/* Participation Chart */}
      <div className="col-md-8">
        <div
          className="card shadow-sm h-100"
          style={{
            background: isDarkMode ? colors.surface : '#fff',
            border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
            borderRadius: '12px'
          }}
        >
          <div className="card-header border-0 py-3" style={{
            background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
            borderBottom: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`
          }}>
            <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: isDarkMode ? colors.text : '#212529' }}>
              <FaChartLine className="text-primary" /> Voting Activity (Last 6 Months)
            </h6>
          </div>
          <div className="card-body p-4">
            <div className="d-flex align-items-end gap-3" style={{ height: '200px' }}>
              {monthlyData.map((data, index) => {
                const height = maxVotes > 0 ? (data.votes / maxVotes) * 100 : 0;
                return (
                  <div key={index} className="flex-fill d-flex flex-column align-items-center" style={{ height: '100%' }}>
                    <div className="flex-fill d-flex flex-column justify-content-end w-100">
                      <div
                        className="w-100"
                        style={{
                          height: `${height}%`,
                          background: `linear-gradient(to top, ${colors.primary}, ${isDarkMode ? '#6366f1' : '#93c5fd'})`,
                          borderRadius: '6px 6px 0 0',
                          transition: 'height 0.3s ease',
                          minHeight: data.votes > 0 ? '20px' : '0'
                        }}
                        title={`${data.votes} votes`}
                      />
                    </div>
                    <div className="text-center mt-2">
                      <div className="fw-bold small" style={{ color: isDarkMode ? colors.text : '#212529' }}>
                        {data.votes}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {data.month}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="col-md-4">
        <div className="d-flex flex-column gap-3 h-100">
          {/* Participation Rate */}
          <div
            className="card shadow-sm flex-fill"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-body p-3 d-flex flex-column justify-content-center align-items-center text-center">
              <FaTrophy className="text-warning mb-2" size={32} />
              <h3 className="fw-bold mb-1" style={{ color: isDarkMode ? colors.text : '#212529' }}>
                {participationRate}%
              </h3>
              <p className="text-muted small mb-0">Participation Rate</p>
              <div className="progress w-100 mt-2" style={{ height: '8px' }}>
                <div
                  className="progress-bar bg-warning"
                  role="progressbar"
                  style={{ width: `${participationRate}%` }}
                  aria-valuenow={participationRate}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
            </div>
          </div>

          {/* Total Votes */}
          <div
            className="card shadow-sm flex-fill"
            style={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${isDarkMode ? '#4f46e5' : '#6366f1'} 100%)`,
              border: 'none',
              borderRadius: '12px',
              color: '#fff'
            }}
          >
            <div className="card-body p-3 d-flex flex-column justify-content-center align-items-center text-center">
              <FaCalendarAlt className="mb-2" size={28} />
              <h3 className="fw-bold mb-1">{myVotes.length}</h3>
              <p className="opacity-90 small mb-0">Total Votes Cast</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;
