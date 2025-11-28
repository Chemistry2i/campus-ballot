import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const SuperAdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/super-admin/reports/system-summary', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Super Admin Dashboard</h2>
      <div className="row">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5>Total Admins</h5>
              <p>{stats.totalAdmins || 0}</p>
            </div>
          </div>
        </div>
        {/* Add more stats cards */}
      </div>
      <div className="mt-4">
        <Link to="/super-admin/manage-admins" className="btn btn-primary">Manage Admins</Link>
        <Link to="/super-admin/global-settings" className="btn btn-secondary">Global Settings</Link>
        {/* Add links to other modules */}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
