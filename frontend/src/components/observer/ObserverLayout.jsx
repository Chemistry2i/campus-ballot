import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import ObserverSidebar from './ObserverSidebar';
import ObserverHeader from './ObserverHeader';

const ObserverLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const { colors } = useTheme();

  useEffect(() => {
    fetchUserData();
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      });
      
      if (!response.ok) {
        console.error('Failed to fetch user data:', response.status);
        return;
      }
      
      const data = await response.json();
      
      // API returns { message: "Profile fetched", user: {...} }
      const userData = data.user || data;
      
      // Only update if we got valid data with _id
      if (userData && userData._id) {
        setUser(userData);
        // Update localStorage with fresh data
        localStorage.setItem('currentUser', JSON.stringify(userData));
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      // Don't clear user state on error - keep the localStorage data
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', background: colors.background }}>
      {/* Sidebar */}
      <ObserverSidebar
        user={user}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <main
        style={{
          marginLeft: isMobile ? 0 : (sidebarCollapsed ? 64 : 280),
          transition: 'margin-left 0.3s',
          width: isMobile ? '100vw' : (sidebarCollapsed ? 'calc(100vw - 64px)' : 'calc(100vw - 220px)'),
          minHeight: '100vh',
          background: colors.background,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <ObserverHeader
          user={user}
          isMobile={isMobile}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />

        {/* Dynamic Content (Child Routes) */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ObserverLayout;
