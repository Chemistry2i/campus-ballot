import React from 'react';
import { FaTrophy, FaMedal, FaStar, FaAward, FaFire, FaCrown } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const AchievementsBadges = ({ myVotes, electionStats }) => {
  const { isDarkMode, colors } = useTheme();

  const achievements = [
    {
      id: 'first-vote',
      name: 'First Steps',
      description: 'Cast your first vote',
      icon: FaStar,
      color: '#3b82f6',
      unlocked: myVotes.length >= 1
    },
    {
      id: 'active-voter',
      name: 'Active Voter',
      description: 'Voted in 5 elections',
      icon: FaMedal,
      color: '#10b981',
      unlocked: myVotes.length >= 5
    },
    {
      id: 'dedicated',
      name: 'Dedicated Citizen',
      description: 'Voted in 10 elections',
      icon: FaAward,
      color: '#f59e0b',
      unlocked: myVotes.length >= 10
    },
    {
      id: 'champion',
      name: 'Democracy Champion',
      description: 'Voted in 25 elections',
      icon: FaTrophy,
      color: '#eab308',
      unlocked: myVotes.length >= 25
    },
    {
      id: 'streak',
      name: 'On Fire',
      description: 'Vote in 3 consecutive elections',
      icon: FaFire,
      color: '#ef4444',
      unlocked: electionStats.participated >= 3 && electionStats.participated === electionStats.total
    },
    {
      id: 'perfectionist',
      name: 'Perfect Record',
      description: '100% participation rate',
      icon: FaCrown,
      color: '#8b5cf6',
      unlocked: electionStats.total > 0 && electionStats.participated === electionStats.total && electionStats.total >= 5
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div
      className="card shadow-sm"
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
        <div className="d-flex align-items-center justify-content-between">
          <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: isDarkMode ? colors.text : '#212529' }}>
            <FaTrophy className="text-warning" /> Achievements
          </h6>
          <span className="badge bg-primary">
            {unlockedCount} / {achievements.length}
          </span>
        </div>
      </div>
      <div className="card-body p-3">
        <div className="row g-3">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div key={achievement.id} className="col-6 col-md-4">
                <div
                  className="text-center p-3"
                  style={{
                    background: achievement.unlocked 
                      ? (isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)')
                      : (isDarkMode ? colors.surfaceHover : '#f8f9fa'),
                    borderRadius: '12px',
                    border: `2px solid ${achievement.unlocked ? achievement.color : (isDarkMode ? colors.border : '#e9ecef')}`,
                    opacity: achievement.unlocked ? 1 : 0.5,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <div
                    className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center"
                    style={{
                      width: '60px',
                      height: '60px',
                      background: achievement.unlocked ? achievement.color : (isDarkMode ? colors.border : '#dee2e6')
                    }}
                  >
                    <Icon size={28} color="#fff" />
                  </div>
                  <h6 className="fw-bold mb-1 small" style={{ 
                    color: achievement.unlocked ? (isDarkMode ? colors.text : '#212529') : (isDarkMode ? colors.textMuted : '#6c757d')
                  }}>
                    {achievement.name}
                  </h6>
                  <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                    {achievement.description}
                  </p>
                  {achievement.unlocked && (
                    <div className="mt-2">
                      <span className="badge" style={{ background: achievement.color }}>
                        Unlocked!
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementsBadges;
