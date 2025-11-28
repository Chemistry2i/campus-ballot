import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SuperAdminSidebar from './Sidebar';

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    const fetchAdmins = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/super-admin/admins', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(res.data);
    };
    fetchAdmins();
  }, []);

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/super-admin/admins', newAdmin, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowCreateModal(false);
      // Refresh list
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <SuperAdminSidebar />
      <main style={{ marginLeft: 220, width: '100%' }}>
        <div className="container py-4">
          <h3 className="mb-4 fw-bold" style={{ color: '#2563eb' }}>
            <i className="fa-solid fa-user-shield me-2"></i>
            Manage Admins
          </h3>
          <button className="btn btn-primary mb-3" onClick={() => setShowCreateModal(true)}>
            <i className="fa-solid fa-plus me-1"></i>
            Create Admin
          </button>
          <div className="card shadow-sm">
            <div className="card-body">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(admin => (
                    <tr key={admin._id}>
                      <td>{admin.name}</td>
                      <td>{admin.email}</td>
                      <td>
                        <span className={`badge ${admin.accountStatus === 'active' ? 'bg-success' : 'bg-warning'}`}>
                          {admin.accountStatus}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-warning me-2">
                          <i className="fa-solid fa-pen"></i> Edit
                        </button>
                        <button className="btn btn-sm btn-danger">
                          <i className="fa-solid fa-ban"></i> Suspend
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Add create modal here */}
        </div>
      </main>
    </div>
  );
};

export default ManageAdmins;
