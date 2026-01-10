import { useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const ObserverHeader = ({ user, isMobile, sidebarCollapsed, setSidebarCollapsed }) => {
  const location = useLocation();
  const { isDarkMode, colors, toggleTheme } = useTheme();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/observer/dashboard') return 'Observer Dashboard';
    if (path.startsWith('/observer/elections/')) return 'Election Monitor';
    if (path === '/observer/profile') return 'Profile Settings';
    return 'Observer Panel';
  };

  const getPageSubtitle = () => {
    const path = location.pathname;
    if (path === '/observer/dashboard') return 'Monitor election activities and statistics';
    if (path.startsWith('/observer/elections/')) return 'Real-time election monitoring';
    if (path === '/observer/profile') return 'Manage your profile settings';
    return 'Election oversight and transparency';
  };

  return (
    <div 
      className="shadow-sm"
      style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(16, 185, 129, 0.01) 100%)'
          : 'linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, #ffffff 100%)',
        borderBottom: `2px solid ${isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'}`,
        padding: '1.25rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backdropFilter: 'blur(10px)',
        fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          {isMobile && (
            <button
              className="btn btn-sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                background: 'transparent',
                border: `1px solid ${colors.border}`,
                color: colors.text,
                borderRadius: '8px',
                padding: '0.5rem 0.75rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <i className="fas fa-bars"></i>
            </button>
          )}
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
              }}>
                <i className="fas fa-eye" style={{ color: '#fff', fontSize: '0.9rem' }}></i>
              </div>
              <h4 className="mb-0" style={{ 
                color: colors.text,
                fontWeight: 700,
                fontSize: '1.25rem',
                letterSpacing: '-0.02em'
              }}>
                {getPageTitle()}
              </h4>
            </div>
            <small style={{ 
              color: colors.textMuted,
              fontSize: '0.8rem',
              marginLeft: '40px',
              display: 'block'
            }}>
              {getPageSubtitle()}
            </small>
          </div>
        </div>
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={toggleTheme}
            className="btn btn-sm"
            style={{
              background: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
              border: `1px solid ${isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)'}`,
              color: '#10b981',
              borderRadius: '8px',
              padding: '0.5rem 0.75rem',
              transition: 'all 0.2s',
              fontWeight: 600
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'} me-2`}></i>
            {isDarkMode ? 'Light' : 'Dark'}
          </button>
          {user?.observerInfo?.accessLevel && (
            <span className="badge" style={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
            }}>
              <i className="fas fa-shield-halved me-2"></i>
              {user.observerInfo.accessLevel === 'full' ? 'Full Access' : 'Specific Access'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ObserverHeader;
