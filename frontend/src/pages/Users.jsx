import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const Users = ({ user }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editUser, setEditUser] = useState({});

    // Debug the user object
    console.log('User object in Users component:', user);
    console.log('User token:', user?.token);
    console.log('User role:', user?.role);

    useEffect(() => {
        if (user) {
            fetchUsers();
        }
    }, [user]);

    const getAuthHeaders = () => {
        const token = user?.token || localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/users', {
                headers: getAuthHeaders()
            });
            console.log('Fetch users response:', response.data);
            setUsers(response.data.users || response.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            if (error.response?.status === 401) {
                Swal.fire('Error', 'Session expired. Please login again.', 'error');
                localStorage.clear();
                window.location.href = '/login';
            } else {
                Swal.fire('Error', 'Failed to fetch users', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            fetchUsers();
            return;
        }
        
        try {
            setLoading(true);
            
            // Try different search approaches
            // First try the search endpoint if it exists
            let response;
            try {
                response = await axios.get(`http://localhost:5000/api/users/search?q=${searchTerm}`, {
                    headers: getAuthHeaders()
                });
            } catch (searchError) {
                console.log('Search endpoint not available, using client-side search');
                // If search endpoint doesn't exist, do client-side filtering
                const allUsersResponse = await axios.get('http://localhost:5000/api/users', {
                    headers: getAuthHeaders()
                });
                const allUsers = allUsersResponse.data.users || allUsersResponse.data || [];
                const filteredUsers = allUsers.filter(userItem => 
                    userItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    userItem.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    userItem.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setUsers(filteredUsers);
                return;
            }
            
            console.log('Search response:', response.data);
            setUsers(response.data.users || response.data || []);
        } catch (error) {
            console.error('Search error:', error);
            Swal.fire('Error', 'Search failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSuspendUser = async (userId) => {
        try {
            await axios.put(`http://localhost:5000/api/users/${userId}/suspend`, {}, {
                headers: getAuthHeaders()
            });
            Swal.fire('Success', 'User suspended successfully', 'success');
            fetchUsers();
        } catch (error) {
            console.error('Suspend error:', error);
            Swal.fire('Error', 'Failed to suspend user', 'error');
        }
    };

    const handleActivateUser = async (userId) => {
        try {
            await axios.put(`http://localhost:5000/api/users/${userId}/activate`, {}, {
                headers: getAuthHeaders()
            });
            Swal.fire('Success', 'User activated successfully', 'success');
            fetchUsers();
        } catch (error) {
            console.error('Activate error:', error);
            Swal.fire('Error', 'Failed to activate user', 'error');
        }
    };

    const handleDeleteUser = async (userId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:5000/api/users/${userId}`, {
                    headers: getAuthHeaders()
                });
                Swal.fire('Deleted!', 'User has been deleted.', 'success');
                fetchUsers();
            } catch (error) {
                console.error('Delete error:', error);
                Swal.fire('Error', 'Failed to delete user', 'error');
            }
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        try {
            await axios.put(`http://localhost:5000/api/users/${userId}/role`, 
                { role: newRole }, 
                { headers: getAuthHeaders() }
            );
            Swal.fire('Success', 'User role updated successfully', 'success');
            fetchUsers();
        } catch (error) {
            console.error('Role change error:', error);
            Swal.fire('Error', 'Failed to update user role', 'error');
        }
    };

    const handleExportUsers = async () => {
        try {
            // Try the export endpoint first
            try {
                const response = await axios.get('http://localhost:5000/api/users/export', {
                    headers: getAuthHeaders(),
                    responseType: 'blob'
                });
                
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                
                Swal.fire('Success', 'Users exported successfully', 'success');
            } catch (exportError) {
                console.log('Export endpoint not available, creating client-side export');
                // If export endpoint doesn't exist, create CSV client-side
                const csvContent = generateCSV(users);
                downloadCSV(csvContent, `users_${new Date().toISOString().split('T')[0]}.csv`);
                Swal.fire('Success', 'Users exported successfully', 'success');
            }
        } catch (error) {
            console.error('Export error:', error);
            Swal.fire('Error', 'Failed to export users', 'error');
        }
    };

    // Helper function to generate CSV
    const generateCSV = (data) => {
        const headers = ['ID', 'Name', 'Email', 'Student ID', 'Role', 'Status', 'Created At'];
        const csvRows = [headers.join(',')];
        
        data.forEach(userItem => {
            const row = [
                userItem.id,
                `"${userItem.name || ''}"`,
                `"${userItem.email || ''}"`,
                `"${userItem.studentId || 'N/A'}"`,
                userItem.role || '',
                userItem.status || 'active',
                userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : 'N/A'
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    };

    // Helper function to download CSV
    const downloadCSV = (csvContent, filename) => {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const viewUserDetails = async (userId) => {
        try {
            const userResponse = await axios.get(`http://localhost:5000/api/users/${userId}`, {
                headers: getAuthHeaders()
            });
            setSelectedUser(userResponse.data.user || userResponse.data);
            setShowProfileModal(true);
        } catch (error) {
            console.error('View user error:', error);
            Swal.fire('Error', 'Failed to fetch user details', 'error');
        }
    };

    const handleEditUser = (userToEdit) => {
        setEditUser(userToEdit);
        setShowEditModal(true);
    };

    const handleUpdateUser = async () => {
        try {
            await axios.put(`http://localhost:5000/api/users/${editUser.id}`, editUser, {
                headers: getAuthHeaders()
            });
            Swal.fire('Success', 'User updated successfully', 'success');
            setShowEditModal(false);
            fetchUsers();
        } catch (error) {
            console.error('Update error:', error);
            Swal.fire('Error', 'Failed to update user', 'error');
        }
    };

    // Only show unauthorized message if we're sure the user isn't an admin
    if (user && user.role !== 'admin') {
        return (
            <div className="container-fluid">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Unauthorized Access</h4>
                    <p>You need to be logged in as an admin to access this page.</p>
                    <p>Current role: {user.role}</p>
                </div>
            </div>
        );
    }

    // Show loading if user object is not available yet
    if (!user) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading user data...</span>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <div className="card shadow">
                        <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white">
                            <h4 className="mb-0">
                                <i className="fas fa-users me-2"></i>
                                User Management
                            </h4>
                            <button 
                                className="btn btn-light btn-sm"
                                onClick={handleExportUsers}
                            >
                                <i className="fas fa-download me-1"></i>
                                Export Users
                            </button>
                        </div>
                        <div className="card-body">
                            {/* Debug info - remove this in production */}
                            <div className="alert alert-info" role="alert">
                                <small>
                                    Debug: User: {user?.name}, Role: {user?.role}, Token: {user?.token ? 'Present' : 'Missing'}
                                    <br />
                                    Total Users Loaded: {users.length}
                                </small>
                            </div>

                            {/* Search Section */}
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search users by name, email, or student ID..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                        <button 
                                            className="btn btn-outline-primary"
                                            onClick={handleSearch}
                                        >
                                            <i className="fas fa-search"></i>
                                        </button>
                                        <button 
                                            className="btn btn-outline-secondary"
                                            onClick={() => {
                                                setSearchTerm('');
                                                fetchUsers();
                                            }}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="col-md-6 text-end">
                                    <span className="text-muted">
                                        {searchTerm ? `Found ${users.length} user(s)` : `Total Users: ${users.length}`}
                                    </span>
                                </div>
                            </div>

                            {/* Users Table */}
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Student ID</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Created At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length > 0 ? (
                                            users.map((userItem) => (
                                                <tr key={userItem.id}>
                                                    <td>{userItem.id}</td>
                                                    <td>{userItem.name}</td>
                                                    <td>{userItem.email}</td>
                                                    <td>{userItem.studentId || 'N/A'}</td>
                                                    <td>
                                                        <span className={`badge ${userItem.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                                                            {userItem.role}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${userItem.status === 'active' ? 'bg-danger' : 'bg-success'}`}>
                                                            {userItem.status || 'active'}
                                                        </span>
                                                    </td>
                                                    <td>{userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : 'N/A'}</td>
                                                    <td>
                                                        <div className="btn-group" role="group">
                                                            <button
                                                                className="btn btn-info btn-sm"
                                                                onClick={() => viewUserDetails(userItem.id)}
                                                                title="View Details"
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-secondary btn-sm"
                                                                onClick={() => handleEditUser(userItem)}
                                                                title="Edit User"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            {(userItem.status === 'active' || !userItem.status) ? (
                                                                <button
                                                                    className="btn btn-warning btn-sm"
                                                                    onClick={() => handleSuspendUser(userItem.id)}
                                                                    title="Suspend User"
                                                                >
                                                                    <i className="fas fa-pause"></i>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="btn btn-success btn-sm"
                                                                    onClick={() => handleActivateUser(userItem.id)}
                                                                    title="Activate User"
                                                                >
                                                                    <i className="fas fa-play"></i>
                                                                </button>
                                                            )}
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleDeleteUser(userItem.id)}
                                                                title="Delete User"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="text-center text-muted">
                                                    {searchTerm ? 'No users found matching your search.' : 'No users found'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rest of the modals remain the same... */}
            {/* User Profile Modal */}
            {showProfileModal && selectedUser && (
                <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-user me-2"></i>
                                    User Profile Details
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setShowProfileModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <p><strong>Name:</strong> {selectedUser.name}</p>
                                        <p><strong>Email:</strong> {selectedUser.email}</p>
                                        <p><strong>Role:</strong> 
                                            <span className={`badge ms-2 ${selectedUser.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                                                {selectedUser.role}
                                            </span>
                                        </p>
                                        <p><strong>Status:</strong> 
                                            <span className={`badge ms-2 ${selectedUser.status === 'active' ? 'bg-success' : 'bg-warning'}`}>
                                                {selectedUser.status || 'active'}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="col-md-6">
                                        <p><strong>Student ID:</strong> {selectedUser.studentId || 'N/A'}</p>
                                        <p><strong>Department:</strong> {selectedUser.department || 'N/A'}</p>
                                        <p><strong>Created:</strong> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</p>
                                        <p><strong>Last Updated:</strong> {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowProfileModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && editUser && (
                <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-edit me-2"></i>
                                    Edit User
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setShowEditModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="mb-3">
                                        <label className="form-label">Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editUser.name || ''}
                                            onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={editUser.email || ''}
                                            onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Student ID</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editUser.studentId || ''}
                                            onChange={(e) => setEditUser({...editUser, studentId: e.target.value})}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Department</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editUser.department || ''}
                                            onChange={(e) => setEditUser({...editUser, department: e.target.value})}
                                        />
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowEditModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={handleUpdateUser}
                                >
                                    Update User
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;