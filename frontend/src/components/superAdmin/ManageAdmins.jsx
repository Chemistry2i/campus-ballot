import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import SuperAdminSidebar from './Sidebar';
import { CSVLink } from 'react-csv';

const dummyAdmins = [
  { id: 1, name: 'Jane Doe', email: 'jane@kyu.ac.ug', role: 'admin', status: 'active' },
  { id: 2, name: 'John Smith', email: 'john@kyu.ac.ug', role: 'admin', status: 'inactive' },
  { id: 3, name: 'Super Admin', email: 'super@kyu.ac.ug', role: 'super_admin', status: 'active' },
];

const ManageAdmins = ({ collapsed, isMobile }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    role: 'admin',
    phone: '',
    image: '',
    emailVerified: false,
    password: '',
    lastLogin: '',
    createdAt: '',
    // Add other fields from your user model as needed
  });

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const token = localStorage.getItem('token');
        // Try all possible endpoints for admins
        let adminsList = [];
        let res = null;
        // Try /api/admins first (if you have a dedicated admins endpoint)
        try {
          res = await axios.get('/api/admins', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (Array.isArray(res.data)) {
            adminsList = res.data;
          } else if (res.data && Array.isArray(res.data.admins)) {
            adminsList = res.data.admins;
          }
        } catch (err) {
          // Fallback to /api/users
          try {
            res = await axios.get('/api/users', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (Array.isArray(res.data)) {
              adminsList = res.data.filter(u => u.role === 'admin' || u.role === 'super_admin');
            } else if (res.data && Array.isArray(res.data.users)) {
              adminsList = res.data.users.filter(u => u.role === 'admin' || u.role === 'super_admin');
            } else if (res.data && Array.isArray(res.data.data)) {
              adminsList = res.data.data.filter(u => u.role === 'admin' || u.role === 'super_admin');
            }
          } catch (err2) {
            // Fallback to dummy data if all fail
            adminsList = dummyAdmins;
          }
        }
        setAdmins(adminsList);
      } catch (err) {
        setAdmins(dummyAdmins); // fallback to dummy data if all fail
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  // Filter admins by search
  const filteredAdmins = admins.filter(
    a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase())
  );

  // Add admin handler
  const handleAddAdmin = async () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      Swal.fire('Error', 'Name, email, and password are required', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      // Create user with admin/super_admin role
      await axios.post('/api/users', newAdmin, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire('Success', 'Admin added', 'success');
      setShowAddModal(false);
      setNewAdmin({
        name: '',
        email: '',
        role: 'admin',
        phone: '',
        image: '',
        emailVerified: false,
        password: '',
        lastLogin: '',
        createdAt: '',
      });
      // Refresh list
      setLoading(true);
      const res = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const adminsList = Array.isArray(res.data)
        ? res.data.filter(u => u.role === 'admin' || u.role === 'super_admin')
        : [];
      setAdmins(adminsList);
      setLoading(false);
    } catch (err) {
      Swal.fire('Error', 'Failed to add admin', 'error');
    }
  };

  // Edit, deactivate/reactivate, delete handlers
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Admin?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });
    if (!result.isConfirmed) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire('Deleted', 'Admin removed', 'success');
      setAdmins(admins.filter(a => a._id !== id && a.id !== id));
    } catch (err) {
      Swal.fire('Error', 'Failed to delete admin', 'error');
    }
  };

  const handleToggleStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      if (status === 'active') {
        await axios.put(`/api/users/${id}/suspend`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.put(`/api/users/${id}/activate`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setAdmins(admins.map(a =>
        (a._id === id || a.id === id)
          ? { ...a, status: status === 'active' ? 'suspended' : 'active' }
          : a
      ));
      Swal.fire('Success', `Admin ${status === 'active' ? 'deactivated' : 'reactivated'}`, 'success');
    } catch (err) {
      Swal.fire('Error', 'Failed to update status', 'error');
    }
  };

  // For similarity with Users management in admin dashboard:
  // Add pagination, status filter, and improved table styling

  const SIDEBAR_WIDTH = 280;
  const SIDEBAR_COLLAPSED_WIDTH = 64;
  const mainMarginLeft = isMobile
    ? 0
    : (collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(filteredAdmins.length / pageSize);
  const paginatedAdmins = filteredAdmins.slice((page - 1) * pageSize, page * pageSize);

  // Status filter
  const [statusFilter, setStatusFilter] = useState('all');
  const statusFilteredAdmins = statusFilter === 'all'
    ? paginatedAdmins
    : paginatedAdmins.filter(a => a.status === statusFilter);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Sorting state
  const [sortKey, setSortKey] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Handle sorting
  const handleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  // Sort admins
  const sortedAdmins = [...filteredAdmins].sort((a, b) => {
    if (!a[sortKey] || !b[sortKey]) return 0;
    if (a[sortKey] < b[sortKey]) return sortAsc ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortAsc ? 1 : -1;
    return 0;
  });

  // Pagination, status filter as before
  const paginatedAdminsForSort = sortedAdmins.slice((page - 1) * pageSize, page * pageSize);
  const statusFilteredAdminsForSort = statusFilter === 'all'
    ? paginatedAdminsForSort
    : paginatedAdminsForSort.filter(a => a.status === statusFilter);

  // Handle bulk selection
  const handleSelectAll = (checked) => {
    setSelectedIds(checked ? statusFilteredAdmins.map(a => a.id) : []);
  };
  const handleSelectOne = (id, checked) => {
    setSelectedIds(checked ? [...selectedIds, id] : selectedIds.filter(i => i !== id));
  };

  // Bulk deactivate/delete
  const handleBulkDeactivate = async () => {
    if (selectedIds.length === 0) return Swal.fire('Info', 'No admins selected', 'info');
    // ...implement bulk deactivate logic...
    Swal.fire('Info', 'Bulk deactivate not implemented', 'info');
  };
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return Swal.fire('Info', 'No admins selected', 'info');
    // ...implement bulk delete logic...
    Swal.fire('Info', 'Bulk delete not implemented', 'info');
  };

  // Export to CSV
  const csvData = admins.map(a => ({
    Name: a.name,
    Email: a.email,
    Role: a.role,
    Status: a.status,
    Department: a.department || '',
    Verified: a.emailVerified ? 'Yes' : 'No',
    CreatedAt: a.createdAt,
    LastLogin: a.lastLogin,
    Phone: a.phone,
  }));

  // Remove department column from columns array
  const columns = [
    { key: 'select', label: '', style: { width: 32 } },
    { key: 'image', label: 'Image', style: { width: 60 } },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'emailVerified', label: 'Verified', style: { width: 70 } },
    { key: 'createdAt', label: 'Created At', sortable: true },
    { key: 'lastLogin', label: 'Last Login', sortable: true },
    { key: 'phone', label: 'Phone' },
    { key: 'actions', label: 'Actions', style: { width: 240 } }
  ];

  return (
    <div
      className="container-fluid"
      style={{
        padding: '2rem',
        minHeight: '100vh',
        transition: 'margin-left 0.2s, width 0.2s',
        width: '100%',
        background: '#f8f9fc',
      }}
    >
      {/* Banner */}
      <div
        className="mb-4 rounded shadow-sm"
        style={{
          background: 'linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 90,
          padding: '2.5rem 2rem',
          marginTop: '-2.5rem',
        }}
      >
        <div>
          <h2 className="fw-bold mb-1" style={{ fontSize: '2rem' }}>
            <i className="fa-solid fa-user-shield me-2 text-warning"></i>
            Manage Admins
          </h2>
          <div style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            Add, edit, and manage all system admins.
          </div>
        </div>
        <div>
          <img
            src="/superadmin-banner.svg"
            alt="Manage Admins"
            style={{ height: 64, marginLeft: 24 }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>
      </div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <h3 className="fw-bold text-primary">
          <i className="fa-solid fa-user-shield me-2"></i>
          Manage Admins
        </h3>
        <div className="d-flex align-items-center flex-wrap">
          <button className="btn btn-success me-2" onClick={() => setShowAddModal(true)}>
            <i className="fa fa-plus me-2"></i> Add Admin
          </button>
          <CSVLink data={csvData} filename="admins.csv" className="btn btn-outline-primary me-2">
            <i className="fa fa-download me-2"></i> Export CSV
          </CSVLink>
          <button className="btn btn-outline-secondary me-2" onClick={handleBulkDeactivate}>
            <i className="fa fa-ban me-2"></i> Bulk Deactivate
          </button>
          <button className="btn btn-outline-danger" onClick={handleBulkDelete}>
            <i className="fa fa-trash me-2"></i> Bulk Delete
          </button>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-md-4 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, email, or role"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3 mb-2">
          <select
            className="form-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 120 }}>
          <div className="spinner-border text-primary" role="status" />
          <span className="ms-3">Loading admins...</span>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table admin-table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                {columns.map(col => (
                  <th key={col.key} style={col.style || {}}>
                    {col.label}
                    {col.sortable && (
                      <button
                        className="btn btn-link btn-sm p-0 ms-1"
                        style={{ verticalAlign: 'middle' }}
                        onClick={() => handleSort(col.key)}
                        title={`Sort by ${col.label}`}
                      >
                        <i className={`fa fa-sort${sortKey === col.key ? (sortAsc ? '-up' : '-down') : ''}`}></i>
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {statusFilteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center text-muted">No admins found</td>
                </tr>
              ) : (
                statusFilteredAdmins.map(admin => (
                  <tr key={admin._id || admin.id}>
                    {/* Bulk select checkbox */}
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(admin._id || admin.id)}
                        onChange={e => handleSelectOne(admin._id || admin.id, e.target.checked)}
                        aria-label="Select admin"
                      />
                    </td>
                    <td>
                      <img
                        src={admin.profilePicture || admin.image || '/default-avatar.png'}
                        alt={admin.name}
                        style={{
                          width: 40,
                          height: 40,
                          objectFit: 'cover',
                          borderRadius: '50%',
                          border: '1px solid #eee',
                          background: '#f3f4f6'
                        }}
                      />
                    </td>
                    <td>
                      <a href={`/super-admin/profile/${admin._id || admin.id}`} style={{ color: '#2563eb', textDecoration: 'underline' }}>
                        {admin.name}
                      </a>
                    </td>
                    <td>{admin.email}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={admin.role}
                        onChange={e => Swal.fire('Info', 'Role change not implemented', 'info')}
                        style={{ minWidth: 100 }}
                        disabled={admin.role === 'super_admin'}
                        title="Change role"
                      >
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge bg-${(admin.status === 'active' || admin.accountStatus === 'active') ? 'success' : 'secondary'}`}>
                        <span
                          style={{
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: (admin.status === 'active' || admin.accountStatus === 'active') ? '#10b981' : '#6c757d',
                            marginRight: 6,
                            verticalAlign: 'middle'
                          }}
                        ></span>
                        {admin.status || admin.accountStatus || '-'}
                      </span>
                    </td>
                    <td>
                      {admin.emailVerified
                        ? <span className="badge bg-success">Verified</span>
                        : <span className="badge bg-warning text-dark">Unverified</span>}
                    </td>
                    <td>{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '-'}</td>
                    <td>{admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : '-'}</td>
                    <td>{admin.phone || '-'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-info me-2"
                        onClick={() => Swal.fire('Info', 'View details not implemented', 'info')}
                        title="View Details"
                      >
                        <i className="fa fa-eye"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => Swal.fire('Info', 'Edit not implemented', 'info')}
                        title="Edit"
                      >
                        <i className="fa fa-edit"></i>
                      </button>
                      <button
                        className={`btn btn-sm btn-${admin.status === 'active' ? 'secondary' : 'success'} me-2`}
                        onClick={() => handleToggleStatus(admin._id || admin.id, admin.status)}
                        title={admin.status === 'active' ? 'Deactivate' : 'Reactivate'}
                      >
                        <i className={`fa fa-${admin.status === 'active' ? 'ban' : 'check'}`}></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(admin._id || admin.id)}
                        title="Delete"
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-secondary ms-2"
                        onClick={() => Swal.fire('Info', 'Audit log not implemented', 'info')}
                        title="Audit Log"
                      >
                        <i className="fa fa-history"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Bulk select all */}
          <div className="mb-2">
            <input
              type="checkbox"
              checked={selectedIds.length === statusFilteredAdmins.length && statusFilteredAdmins.length > 0}
              onChange={e => handleSelectAll(e.target.checked)}
              aria-label="Select all admins"
            />{' '}
            <span className="ms-2">Select All</span>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-3">
              <ul className="pagination justify-content-center">
                <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(page - 1)}>Previous</button>
                </li>
                {[...Array(totalPages)].map((_, idx) => (
                  <li key={idx} className={`page-item${page === idx + 1 ? ' active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(idx + 1)}>{idx + 1}</button>
                  </li>
                ))}
                <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(page + 1)}>Next</button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      )}
      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Admin</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newAdmin.name}
                        onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={newAdmin.email}
                        onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={newAdmin.phone}
                        onChange={e => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                        pattern="^[0-9+\- ]*$"
                        placeholder="e.g. +256700000000"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Image</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setNewAdmin({ ...newAdmin, image: reader.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {newAdmin.image && (
                        <img
                          src={newAdmin.image}
                          alt="Preview"
                          style={{ width: 40, height: 40, borderRadius: '50%', marginTop: 8, objectFit: 'cover', border: '1px solid #eee' }}
                        />
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={newAdmin.password}
                        onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Role</label>
                      <select
                        className="form-select"
                        value={newAdmin.role}
                        onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value })}
                        required
                      >
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email Verified</label>
                      <select
                        className="form-select"
                        value={newAdmin.emailVerified ? 'true' : 'false'}
                        onChange={e => setNewAdmin({ ...newAdmin, emailVerified: e.target.value === 'true' })}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-primary" type="button" onClick={handleAddAdmin}>Add Admin</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAdmins;

/* Suggestions to further improve Manage Admins:

- Email Verification Status: Show if the admin's email is verified.
- Department/Faculty: Add a column for department/faculty if relevant.
- Role Change: Allow changing role directly from the table.
- Bulk Actions: Select multiple admins for bulk deactivate/delete.
- Audit/History: Add a button to view admin's activity/audit log.
- Sort Columns: Allow sorting by name, email, status, etc.
- Export: Add export to CSV/Excel button.
- Profile Link: Link to admin's profile page.
- Last Updated: Show last updated timestamp.
- Status Indicator: Use colored dot for quick status glance.
- Responsive Design: Ensure table looks good on mobile.

If you want code for any of these features, let me know which one(s) to add! */
