import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSpinner,
    faEye,
    faCopy,
    faPen,
    faBan,
    faCheck,
    faTimes,
    faCheckCircle,
    faTrash,
    faUserCog
} from "@fortawesome/free-solid-svg-icons";
import './users-actions.css';

// Toast helper for non-blocking notifications
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
});

const Users = ({ user }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editUser, setEditUser] = useState({});
    const [roleChangingId, setRoleChangingId] = useState(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Debug the user object
    console.log('User object in Users component:', user);
    console.log('User token:', user?.token);
    console.log('User role:', user?.role);

    useEffect(() => {
        if (user) {
            fetchUsers(1, itemsPerPage, ''); // Initialize with default values
        }
    }, [user]);

    const getAuthHeaders = () => {
        const token = user?.token || localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    const fetchUsers = async (page = currentPage, limit = itemsPerPage, search = searchTerm) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });
            
            if (search && search.trim()) {
                params.append('search', search.trim());
            }
            
            const response = await axios.get(`https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/api/users?${params}`, {
                headers: getAuthHeaders()
            });
            
            console.log('Fetch users response:', response.data);
            
            // Handle different response structures
            if (response.data.users) {
                // Paginated response
                setUsers(response.data.users);
                setTotalUsers(response.data.totalUsers || response.data.total || 0);
                setTotalPages(response.data.totalPages || Math.ceil((response.data.totalUsers || response.data.total || 0) / limit));
            } else if (Array.isArray(response.data)) {
                // Non-paginated response - handle client-side pagination
                const allUsers = response.data;
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedUsers = allUsers.slice(startIndex, endIndex);
                
                setUsers(paginatedUsers);
                setTotalUsers(allUsers.length);
                setTotalPages(Math.ceil(allUsers.length / limit));
            } else {
                // Fallback
                setUsers([]);
                setTotalUsers(0);
                setTotalPages(0);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            if (error.response?.status === 401) {
                Toast.fire({ icon: 'error', title: 'Session expired. Please login again.' });
                localStorage.clear();
                window.location.href = '/login';
            } else {
                Toast.fire({ icon: 'error', title: 'Failed to fetch users' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setCurrentPage(1); // Reset to first page when searching
        await fetchUsers(1, itemsPerPage, searchTerm);
    };
    
    const clearSearch = async () => {
        setSearchTerm('');
        setCurrentPage(1);
        await fetchUsers(1, itemsPerPage, '');
    };

    const handleSuspendUser = async (userId) => {
        try {
            await axios.put(`https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/api/users/${userId}/suspend`, {}, {
                headers: getAuthHeaders()
            });
            Toast.fire({ icon: 'success', title: 'User suspended successfully' });
            fetchUsers();
        } catch (error) {
            console.error('Suspend error:', error);
            Toast.fire({ icon: 'error', title: 'Failed to suspend user' });
        }
    };

    const handleActivateUser = async (userId) => {
        try {
            await axios.put(`https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/api/users/${userId}/activate`, {}, {
                headers: getAuthHeaders()
            });
            Toast.fire({ icon: 'success', title: 'User activated successfully' });
            fetchUsers();
        } catch (error) {
            console.error('Activate error:', error);
            Toast.fire({ icon: 'error', title: 'Failed to activate user' });
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
                await axios.delete(`https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/api/users/${userId}`, {
                    headers: getAuthHeaders()
                });
                Swal.fire('Deleted!', 'User has been deleted.', 'success');
                await fetchUsers();
            } catch (error) {
                console.error('Delete error:', error);
                Swal.fire('Error!', 'Failed to delete user.', 'error');
            }
        }
    };

    const handleChangeRole = async (userId, newRole, options = { suppressToast: false }) => {
        try {
            await axios.put(`https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/api/users/${userId}/role`, 
                { role: newRole }, 
                { headers: getAuthHeaders() }
            );
            if (!options.suppressToast) Toast.fire({ icon: 'success', title: 'User role updated successfully' });
            await fetchUsers();
        } catch (error) {
            console.error('Role change error:', error);
            Toast.fire({ icon: 'error', title: 'Failed to update user role' });
            throw error;
        }
    };

    const handleExportUsers = async () => {
        try {
            // Try the export endpoint first
            try {
                const response = await axios.get('https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/api/users/export', {
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
                
                Toast.fire({ icon: 'success', title: 'Users exported successfully' });
            } catch (exportError) {
                console.log('Export endpoint not available, fetching all users for export');
                // If export endpoint doesn't exist, fetch all users for export
                const response = await axios.get('https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/api/users?limit=10000', {
                    headers: getAuthHeaders()
                });
                const allUsers = response.data.users || response.data || [];
                const csvContent = generateCSV(allUsers);
                downloadCSV(csvContent, `users_${new Date().toISOString().split('T')[0]}.csv`);
                Toast.fire({ icon: 'success', title: 'Users exported successfully' });
            }
        } catch (error) {
            console.error('Export error:', error);
            Toast.fire({ icon: 'error', title: 'Failed to export users' });
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
            const userResponse = await axios.get(`https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/api/users/${userId}`, {
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
            const idToUpdate = editUser._id || editUser.id;
            await axios.put(`https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/api/users/${idToUpdate}`, editUser, {
                headers: getAuthHeaders()
            });
            Swal.fire('Success', 'User updated successfully', 'success');
            setShowEditModal(false);
            await fetchUsers();
        } catch (error) {
            console.error('Update error:', error);
            Swal.fire('Error', 'Failed to update user', 'error');
        }
    };

    const handleVerifyToggle = async (userId, shouldVerify) => {
        try {
            await axios.put(`https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/api/users/${userId}`, { isVerified: shouldVerify }, {
                headers: getAuthHeaders()
            });
            Swal.fire('Success', `User ${shouldVerify ? 'verified' : 'unverified'} successfully`, 'success');
            await fetchUsers();
        } catch (error) {
            console.error('Verify toggle error:', error);
            Swal.fire('Error', `Failed to ${shouldVerify ? 'verify' : 'unverify'} user`, 'error');
        }
    };
    
    // Pagination functions
    const handlePageChange = async (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            await fetchUsers(newPage, itemsPerPage, searchTerm);
        }
    };
    
    const handleItemsPerPageChange = async (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
        await fetchUsers(1, newItemsPerPage, searchTerm);
    };
    
    const getPaginationRange = () => {
        const delta = 2; // Number of pages to show on each side of current page
        const range = [];
        const rangeWithDots = [];
        
        // Handle case where there are very few pages
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                range.push(i);
            }
            return range;
        }
        
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }
        
        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }
        
        rangeWithDots.push(...range);
        
        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }
        
        return rangeWithDots;
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
                {/* <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div> */}
                <div className="text-center">
                    <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary mb-3" />
                    <p>Loading users...</p>
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
                                            onClick={clearSearch}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="d-flex justify-content-end align-items-center gap-3">
                                        <div className="d-flex align-items-center">
                                            <label className="form-label me-2 mb-0">Show:</label>
                                            <select 
                                                className="form-select form-select-sm" 
                                                style={{width: 'auto'}}
                                                value={itemsPerPage} 
                                                onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                                            >
                                                <option value={5}>5</option>
                                                <option value={10}>10</option>
                                                <option value={25}>25</option>
                                                <option value={50}>50</option>
                                                <option value={100}>100</option>
                                            </select>
                                        </div>
                                        <span className="text-muted">
                                            {searchTerm ? 
                                                `Found ${totalUsers} user(s) - Page ${currentPage} of ${totalPages}` : 
                                                `Total: ${totalUsers} users - Page ${currentPage} of ${totalPages}`
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Users Table */}
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            {/* ID intentionally hidden; admin can copy via action */}
                                            {/* <th>ID</th> */}
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
                                            users.map((u) => {
                                                const uid = u._id || u.id;
                                                return (
                                                    <tr key={uid}>
                                                        {/* <td>{uid}</td> */}
                                                        <td>{u.name}</td>
                                                        <td>{u.email}</td>
                                                        <td>{u.studentId || 'N/A'}</td>
                                                        <td>
                                                            <span className={`badge ${u.role === 'admin' ? 'bg-danger' : u.role === 'moderator' ? 'bg-warning text-dark' : 'bg-primary'}`}>{u.role}</span>
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${(u.accountStatus || u.status) === 'active' ? 'bg-success' : (u.accountStatus || u.status) === 'suspended' ? 'bg-warning text-dark' : 'bg-secondary'}`}>{u.accountStatus || u.status || 'active'}</span>
                                                        </td>
                                                        <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                                                        <td>
                                                            <div className="btn-group" role="group">
                                                                {/* View */}
                                                                <button className="action-btn cool" onClick={() => viewUserDetails(uid)} title="View Details">
                                                                    <FontAwesomeIcon icon={faEye} />
                                                                </button>

                                                                {/* Copy ID - admin only */}
                                                                {user?.role === 'admin' && (
                                                                    <button className="action-btn copy" onClick={async () => {
                                                                        try {
                                                                            await navigator.clipboard.writeText(uid);
                                                                            Swal.fire('Copied', 'User ID copied to clipboard', 'success');
                                                                        } catch (err) {
                                                                            console.error('Copy failed', err);
                                                                            Swal.fire('Error', 'Could not copy ID', 'error');
                                                                        }
                                                                    }} title="Copy ID">
                                                                        <i className="fas fa-copy"></i>
                                                                    </button>
                                                                )}

                                                                {/* Edit */}
                                                                <button className="action-btn edit" onClick={() => handleEditUser(u)} title="Edit User">
                                                                    <FontAwesomeIcon icon={faPen} />
                                                                </button>

                                                                {/* Suspend / Activate */}
                                                                {(u.accountStatus || u.status) === 'suspended' ? (
                                                                    <button className="action-btn activate" onClick={() => handleActivateUser(uid)} title="Activate User">
                                                                        <FontAwesomeIcon icon={faCheck} />
                                                                    </button>
                                                                ) : (
                                                                    <button className="action-btn suspend" onClick={() => handleSuspendUser(uid)} title="Suspend User">
                                                                        <FontAwesomeIcon icon={faBan} />
                                                                    </button>
                                                                )}

                                                                {/* Verify / Unverify */}
                                                                {u.isVerified ? (
                                                                    <button className="action-btn unverify" onClick={() => handleVerifyToggle(uid, false)} title="Unverify User">
                                                                        <FontAwesomeIcon icon={faTimes} />
                                                                    </button>
                                                                ) : (
                                                                    <button className="action-btn verify" onClick={() => handleVerifyToggle(uid, true)} title="Verify User">
                                                                        <FontAwesomeIcon icon={faCheckCircle} />
                                                                    </button>
                                                                )}

                                                                {/* Delete - second last */}
                                                                <button className="action-btn delete" onClick={() => handleDeleteUser(uid)} title="Delete User">
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </button>

                                                                {/* Role dropdown - last */}
                                                                <div className="btn-group">
                                                                    <button type="button" className="btn btn-secondary btn-sm dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                                                        <FontAwesomeIcon icon={faUserCog} />
                                                                    </button>
                                                                    <ul className="dropdown-menu dropdown-menu-end">
                                                                        {['user','moderator','admin'].map(r => (
                                                                            <li key={r}>
                                                                                <button className="dropdown-item" onClick={async () => {
                                                                                    const confirm = await Swal.fire({
                                                                                        title: 'Change role?',
                                                                                        text: `Change role of ${u.name} to ${r}?`,
                                                                                        showCancelButton: true,
                                                                                        confirmButtonText: 'Yes',
                                                                                    });
                                                                                    if (confirm.isConfirmed) {
                                                                                        const previousRole = u.role;
                                                                                        setRoleChangingId(uid);
                                                                                        try {
                                                                                            await handleChangeRole(uid, r, { suppressToast: true });

                                                                                            // show small toast with Undo option
                                                                                            const { value: undo } = await Swal.fire({
                                                                                                toast: true,
                                                                                                position: 'top-end',
                                                                                                showConfirmButton: true,
                                                                                                showCancelButton: false,
                                                                                                confirmButtonText: 'Undo',
                                                                                                title: `Role changed to ${r}`,
                                                                                                timer: 5000,
                                                                                                timerProgressBar: true
                                                                                            });

                                                                                            if (undo) {
                                                                                                // revert to previous role
                                                                                                setRoleChangingId(uid);
                                                                                                try {
                                                                                                    await handleChangeRole(uid, previousRole, { suppressToast: true });
                                                                                                    Toast.fire({ icon: 'info', title: 'Role reverted' });
                                                                                                } finally {
                                                                                                    setRoleChangingId(null);
                                                                                                }
                                                                                            } else {
                                                                                                Toast.fire({ icon: 'success', title: `Role changed to ${r}` });
                                                                                            }

                                                                                        } finally {
                                                                                            setRoleChangingId(null);
                                                                                        }
                                                                                    }
                                                                                }}>
                                                                                    {roleChangingId === uid && <FontAwesomeIcon icon={faSpinner} spin className="me-2" />} {r}
                                                                                </button>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center text-muted">
                                                    {searchTerm ? 'No users found matching your search.' : 'No users found'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="row mt-3">
                                    <div className="col-12">
                                        <nav aria-label="Users pagination">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="text-muted">
                                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users
                                                </div>
                                                <ul className="pagination mb-0">
                                                    {/* Previous button */}
                                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                        <button 
                                                            className="page-link" 
                                                            onClick={() => handlePageChange(currentPage - 1)}
                                                            disabled={currentPage === 1}
                                                        >
                                                            <i className="fas fa-chevron-left"></i>
                                                        </button>
                                                    </li>
                                                    
                                                    {/* Page numbers */}
                                                    {getPaginationRange().map((page, index) => (
                                                        <li key={index} className={`page-item ${page === currentPage ? 'active' : page === '...' ? 'disabled' : ''}`}>
                                                            {page === '...' ? (
                                                                <span className="page-link">...</span>
                                                            ) : (
                                                                <button 
                                                                    className="page-link" 
                                                                    onClick={() => handlePageChange(page)}
                                                                >
                                                                    {page}
                                                                </button>
                                                            )}
                                                        </li>
                                                    ))}
                                                    
                                                    {/* Next button */}
                                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                        <button 
                                                            className="page-link" 
                                                            onClick={() => handlePageChange(currentPage + 1)}
                                                            disabled={currentPage === totalPages}
                                                        >
                                                            <i className="fas fa-chevron-right"></i>
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </nav>
                                    </div>
                                </div>
                            )}
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
