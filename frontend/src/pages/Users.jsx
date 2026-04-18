import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
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
    const [allUsers, setAllUsers] = useState([]); // Store all users
    const [users, setUsers] = useState([]); // Filtered/paginated users for display
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchField, setSearchField] = useState('all'); // 'all', 'name', 'email', 'studentId'
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editUser, setEditUser] = useState({});
    const [roleChangingId, setRoleChangingId] = useState(null);
    
    // Loading states for each action type
    const [loadingStates, setLoadingStates] = useState({
        suspend: null,
        activate: null,
        delete: null,
        verify: null,
        edit: null,
        view: null
    });
    
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
            fetchUsers();
        }
    }, [user]);

    // Instant search filtering
    useEffect(() => {
        if (allUsers.length > 0) {
            filterUsers();
        }
    }, [searchTerm, searchField, allUsers, currentPage, itemsPerPage]);

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
            const params = new URLSearchParams({
                page: '1',
                limit: '1000', // Load all users at once for client-side filtering
                role: 'student' // Only show student users to admin
            });
            
            const response = await axios.get(`https://api.campusballot.tech/api/users?${params}`, {
                headers: getAuthHeaders()
            });
            
            console.log('Fetch users response:', response.data);
            
            // Handle different response structures
            let loadedUsers = [];
            if (response.data.users) {
                loadedUsers = response.data.users;
            } else if (Array.isArray(response.data)) {
                loadedUsers = response.data;
            }
            
            setAllUsers(loadedUsers);
            console.log('Loaded users count:', loadedUsers.length);
            // filterUsers will be called by useEffect
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

    const filterUsers = () => {
        let filtered = allUsers;
        
        console.log('Filtering users. AllUsers:', allUsers.length, 'SearchTerm:', searchTerm);

        // Instant search filtering
        if (searchTerm && searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(u => {
                if (searchField === 'all') {
                    return (
                        u.name?.toLowerCase().includes(searchLower) ||
                        u.email?.toLowerCase().includes(searchLower) ||
                        u.studentId?.toLowerCase().includes(searchLower)
                    );
                } else {
                    return u[searchField]?.toLowerCase().includes(searchLower);
                }
            });
        }

        // Update total counts
        const total = filtered.length;
        setTotalUsers(total);
        setTotalPages(Math.ceil(total / itemsPerPage));

        // Client-side pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedUsers = filtered.slice(startIndex, endIndex);
        
        console.log('Filtered users:', total, 'Paginated:', paginatedUsers.length);
        setUsers(paginatedUsers);
    };

    const handleSearch = () => {
        setCurrentPage(1); // Reset to first page when searching
    };
    
    const clearSearch = () => {
        setSearchTerm('');
        setSearchField('all');
        setCurrentPage(1);
    };

    const handleSuspendUser = async (userId) => {
        try {
            setLoadingStates(prev => ({ ...prev, suspend: userId }));
            await axios.put(`https://api.campusballot.tech/api/users/${userId}/suspend`, {}, {
                headers: getAuthHeaders()
            });
            Toast.fire({ icon: 'success', title: 'User suspended successfully' });
            fetchUsers();
        } catch (error) {
            console.error('Suspend error:', error);
            Toast.fire({ icon: 'error', title: 'Failed to suspend user' });
        } finally {
            setLoadingStates(prev => ({ ...prev, suspend: null }));
        }
    };

    const handleActivateUser = async (userId) => {
        try {
            setLoadingStates(prev => ({ ...prev, activate: userId }));
            await axios.put(`https://api.campusballot.tech/api/users/${userId}/activate`, {}, {
                headers: getAuthHeaders()
            });
            Toast.fire({ icon: 'success', title: 'User activated successfully' });
            fetchUsers();
        } catch (error) {
            console.error('Activate error:', error);
            Toast.fire({ icon: 'error', title: 'Failed to activate user' });
        } finally {
            setLoadingStates(prev => ({ ...prev, activate: null }));
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
                setLoadingStates(prev => ({ ...prev, delete: userId }));
                await axios.delete(`https://api.campusballot.tech/api/users/${userId}`, {
                    headers: getAuthHeaders()
                });
                Swal.fire('Deleted!', 'User has been deleted.', 'success');
                await fetchUsers();
            } catch (error) {
                console.error('Delete error:', error);
                Swal.fire('Error!', 'Failed to delete user.', 'error');
            } finally {
                setLoadingStates(prev => ({ ...prev, delete: null }));
            }
        }
    };

    const handleChangeRole = async (userId, newRole, options = { suppressToast: false }) => {
        try {
            await axios.put(`https://api.campusballot.tech/api/users/${userId}/role`, 
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
                const response = await axios.get('https://api.campusballot.tech/api/users/export', {
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
                const response = await axios.get('https://api.campusballot.tech/api/users?limit=10000', {
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
            setLoadingStates(prev => ({ ...prev, view: userId }));
            const userResponse = await axios.get(`https://api.campusballot.tech/api/users/${userId}`, {
                headers: getAuthHeaders()
            });
            setSelectedUser(userResponse.data.user || userResponse.data);
            setShowProfileModal(true);
        } catch (error) {
            console.error('View user error:', error);
            Swal.fire('Error', 'Failed to fetch user details', 'error');
        } finally {
            setLoadingStates(prev => ({ ...prev, view: null }));
        }
    };

    const handleEditUser = (userToEdit) => {
        setEditUser(userToEdit);
        setShowEditModal(true);
    };

    const handleUpdateUser = async () => {
        try {
            const idToUpdate = editUser._id || editUser.id;
            setLoadingStates(prev => ({ ...prev, edit: idToUpdate }));
            await axios.put(`https://api.campusballot.tech/api/users/${idToUpdate}`, editUser, {
                headers: getAuthHeaders()
            });
            Swal.fire('Success', 'User updated successfully', 'success');
            setShowEditModal(false);
            await fetchUsers();
        } catch (error) {
            console.error('Update error:', error);
            Swal.fire('Error', 'Failed to update user', 'error');
        } finally {
            setLoadingStates(prev => ({ ...prev, edit: null }));
        }
    };

    const handleVerifyToggle = async (userId, shouldVerify) => {
        try {
            setLoadingStates(prev => ({ ...prev, verify: userId }));
            await axios.put(`https://api.campusballot.tech/api/users/${userId}`, { isVerified: shouldVerify }, {
                headers: getAuthHeaders()
            });
            Swal.fire('Success', `User ${shouldVerify ? 'verified' : 'unverified'} successfully`, 'success');
            await fetchUsers();
        } catch (error) {
            console.error('Verify toggle error:', error);
            Swal.fire('Error', `Failed to ${shouldVerify ? 'verify' : 'unverify'} user`, 'error');
        } finally {
            setLoadingStates(prev => ({ ...prev, verify: null }));
        }
    };
    
    // Pagination functions
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
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
                                        <select 
                                            className="form-select" 
                                            style={{maxWidth: '150px'}}
                                            value={searchField}
                                            onChange={(e) => setSearchField(e.target.value)}
                                        >
                                            <option value="all">All Fields</option>
                                            <option value="name">Name</option>
                                            <option value="email">Email</option>
                                            <option value="studentId">Student ID</option>
                                        </select>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder={`Search ${searchField === 'all' ? 'users by name, email, or student ID' : 'by ' + searchField}...`}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <button 
                                            className="btn btn-outline-secondary"
                                            onClick={clearSearch}
                                            title="Clear search"
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
                                                                <style>{`
                                                                    .users-table-font84, .users-table-font84 th, .users-table-font84 td {
                                                                        font-size: 0.84rem !important;
                                                                    }
                                                                    .action-btn {
                                                                        font-size: 0.75rem !important;
                                                                        padding: 0.18rem 0.38rem !important;
                                                                        max-width: 2rem;
                                                                        max-height: 2rem;
                                                                        line-height: 1.1;
                                                                    }
                                                                `}</style>
                                                                <table className="table table-striped table-hover users-table-font84">
                                    <thead className="table-light">
                                        <tr>
                                            {/* ID intentionally hidden; admin can copy via action */}
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
                                            users.map((u) => {
                                                const uid = u._id || u.id;
                                                return (
                                                    <tr key={uid}>
                                                        <td>{uid}</td>
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
                                                                <button 
                                                                    className="action-btn cool" 
                                                                    onClick={() => viewUserDetails(uid)} 
                                                                    title="View Details"
                                                                    disabled={loadingStates.view === uid}
                                                                >
                                                                    {loadingStates.view === uid ? (
                                                                        <FontAwesomeIcon icon={faSpinner} spin />
                                                                    ) : (
                                                                        <FontAwesomeIcon icon={faEye} />
                                                                    )}
                                                                </button>

                                                                {/* Copy ID - admin only */}
                                                                {user?.role === 'admin' && (
                                                                    <button 
                                                                        className="action-btn copy" 
                                                                        onClick={async () => {
                                                                            try {
                                                                                await navigator.clipboard.writeText(uid);
                                                                                Swal.fire('Copied', 'User ID copied to clipboard', 'success');
                                                                            } catch (err) {
                                                                                console.error('Copy failed', err);
                                                                                Swal.fire('Error', 'Could not copy ID', 'error');
                                                                            }
                                                                        }} 
                                                                        title="Copy ID"
                                                                    >
                                                                        <i className="fas fa-copy"></i>
                                                                    </button>
                                                                )}

                                                                {/* Edit */}
                                                                <button 
                                                                    className="action-btn edit" 
                                                                    onClick={() => handleEditUser(u)} 
                                                                    title="Edit User"
                                                                    disabled={loadingStates.edit === uid}
                                                                >
                                                                    {loadingStates.edit === uid ? (
                                                                        <FontAwesomeIcon icon={faSpinner} spin />
                                                                    ) : (
                                                                        <FontAwesomeIcon icon={faPen} />
                                                                    )}
                                                                </button>

                                                                {/* Suspend / Activate */}
                                                                {(u.accountStatus || u.status) === 'suspended' ? (
                                                                    <button 
                                                                        className="action-btn activate" 
                                                                        onClick={() => handleActivateUser(uid)} 
                                                                        title="Activate User"
                                                                        disabled={loadingStates.activate === uid}
                                                                    >
                                                                        {loadingStates.activate === uid ? (
                                                                            <FontAwesomeIcon icon={faSpinner} spin />
                                                                        ) : (
                                                                            <FontAwesomeIcon icon={faCheck} />
                                                                        )}
                                                                    </button>
                                                                ) : (
                                                                    <button 
                                                                        className="action-btn suspend" 
                                                                        onClick={() => handleSuspendUser(uid)} 
                                                                        title="Suspend User"
                                                                        disabled={loadingStates.suspend === uid}
                                                                    >
                                                                        {loadingStates.suspend === uid ? (
                                                                            <FontAwesomeIcon icon={faSpinner} spin />
                                                                        ) : (
                                                                            <FontAwesomeIcon icon={faBan} />
                                                                        )}
                                                                    </button>
                                                                )}

                                                                {/* Verify / Unverify */}
                                                                {u.isVerified ? (
                                                                    <button 
                                                                        className="action-btn unverify" 
                                                                        onClick={() => handleVerifyToggle(uid, false)} 
                                                                        title="Unverify User"
                                                                        disabled={loadingStates.verify === uid}
                                                                    >
                                                                        {loadingStates.verify === uid ? (
                                                                            <FontAwesomeIcon icon={faSpinner} spin />
                                                                        ) : (
                                                                            <FontAwesomeIcon icon={faTimes} />
                                                                        )}
                                                                    </button>
                                                                ) : (
                                                                    <button 
                                                                        className="action-btn verify" 
                                                                        onClick={() => handleVerifyToggle(uid, true)} 
                                                                        title="Verify User"
                                                                        disabled={loadingStates.verify === uid}
                                                                    >
                                                                        {loadingStates.verify === uid ? (
                                                                            <FontAwesomeIcon icon={faSpinner} spin />
                                                                        ) : (
                                                                            <FontAwesomeIcon icon={faCheckCircle} />
                                                                        )}
                                                                    </button>
                                                                )}

                                                                {/* Delete - second last */}
                                                                <button 
                                                                    className="action-btn delete" 
                                                                    onClick={() => handleDeleteUser(uid)} 
                                                                    title="Delete User"
                                                                    disabled={loadingStates.delete === uid}
                                                                >
                                                                    {loadingStates.delete === uid ? (
                                                                        <FontAwesomeIcon icon={faSpinner} spin />
                                                                    ) : (
                                                                        <FontAwesomeIcon icon={faTrash} />
                                                                    )}
                                                                </button>

                                                                {/* Role dropdown - last */}
                                                                {/* COMMENTED OUT - Role change functionality disabled */}
                                                                {/*
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
                                                                */}
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
                                    disabled={loadingStates.edit !== null}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={handleUpdateUser}
                                    disabled={loadingStates.edit !== null}
                                >
                                    {loadingStates.edit !== null ? (
                                        <>
                                            <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                                            Updating...
                                        </>
                                    ) : (
                                        'Update User'
                                    )}
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
