import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useTheme } from '../../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, 
  faUniversity, 
  faPlus, 
  faEdit, 
  faTrash, 
  faSearch,
  faUsers,
  faVoteYea,
  faChevronDown,
  faChevronRight,
  faCheck,
  faTimes,
  faSpinner,
  faUserShield
} from '@fortawesome/free-solid-svg-icons';

const OrganizationManagement = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [expandedFederations, setExpandedFederations] = useState({});
  const [admins, setAdmins] = useState([]);
  const [saving, setSaving] = useState(false);
  const [isAddingNewOrg, setIsAddingNewOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'university',
    parent: '',
    contact: {
      email: '',
      phone: '',
      address: '',
      website: ''
    },
    settings: {
      allowSelfRegistration: false,
      requireEmailVerification: true,
      maxElectionsPerYear: 10
    }
  });

  const { isDarkMode, colors } = useTheme();

  // Dark mode styles for SweetAlert2
  const swalDarkOptions = isDarkMode ? {
    background: colors.surface,
    color: colors.text,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#6b7280',
    customClass: {
      popup: 'swal-dark-popup',
      title: 'swal-dark-title',
      htmlContainer: 'swal-dark-content',
      input: 'swal-dark-input',
      confirmButton: 'swal-dark-confirm',
      cancelButton: 'swal-dark-cancel'
    }
  } : {};

  // Helper function for themed Swal
  const showAlert = (title, text, icon) => {
    return Swal.fire({
      title,
      text,
      icon,
      ...swalDarkOptions
    });
  };

  // Fetch organizations
  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/organizations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrganizations(res.data);
      
      // Auto-expand federations
      const federations = res.data.filter(org => org.type === 'federation');
      const expanded = {};
      federations.forEach(fed => { expanded[fed._id] = true; });
      setExpandedFederations(expanded);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      showAlert('Error', 'Failed to load organizations', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch admins for assignment
  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/super-admin/admins', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(res.data);
    } catch (err) {
      console.error('Error fetching admins:', err);
    }
  };

  useEffect(() => {
    fetchOrganizations();
    fetchAdmins();
  }, []);

  // Get federations for parent dropdown
  const federations = organizations.filter(org => org.type === 'federation');
  
  // Get universities for a specific federation
  const getUniversitiesForFederation = (federationId) => {
    return organizations.filter(org => {
      if (org.type !== 'university') return false;
      // Handle both populated parent object and plain ID
      const parentId = org.parent?._id || org.parent;
      return parentId?.toString() === federationId?.toString();
    });
  };

  // Filter organizations
  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(search.toLowerCase()) ||
                         org.code.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || org.type === filterType;
    return matchesSearch && matchesType;
  });

  // Toggle federation expansion
  const toggleFederation = (fedId) => {
    setExpandedFederations(prev => ({
      ...prev,
      [fedId]: !prev[fedId]
    }));
  };

  // Open create modal
  const openCreateModal = (type = 'university', parentId = '') => {
    setModalMode('create');
    setSelectedOrg(null);
    setIsAddingNewOrg(false);
    setNewOrgName('');
    setFormData({
      name: '',
      code: '',
      type: type,
      parent: parentId,
      contact: { email: '', phone: '', address: '', website: '' },
      settings: {
        allowSelfRegistration: false,
        requireEmailVerification: true,
        maxElectionsPerYear: 10
      }
    });
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (org) => {
    setModalMode('edit');
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      code: org.code,
      type: org.type,
      parent: org.parent?._id || '',
      contact: org.contact || { email: '', phone: '', address: '', website: '' },
      settings: org.settings || {
        allowSelfRegistration: false,
        requireEmailVerification: true,
        maxElectionsPerYear: 10
      }
    });
    setShowModal(true);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code) {
      showAlert('Error', 'Name and code are required', 'error');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        parent: formData.type === 'university' ? formData.parent : undefined
      };

      if (modalMode === 'create') {
        await axios.post('/api/organizations', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showAlert('Success', `${formData.type === 'federation' ? 'Federation' : 'University'} created successfully`, 'success');
      } else {
        await axios.put(`/api/organizations/${selectedOrg._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showAlert('Success', 'Organization updated successfully', 'success');
      }

      setShowModal(false);
      fetchOrganizations();
    } catch (err) {
      console.error('Error saving organization:', err);
      showAlert('Error', err.response?.data?.message || 'Failed to save organization', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete organization
  const handleDelete = async (org) => {
    const result = await Swal.fire({
      title: 'Delete Organization?',
      html: `<p>Are you sure you want to delete <strong>${org.name}</strong>?</p>
             <p class="${isDarkMode ? 'text-warning' : 'text-danger'}">This will also remove all associated data.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Yes, delete it',
      ...swalDarkOptions
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/organizations/${org._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showAlert('Deleted', 'Organization has been deleted', 'success');
        fetchOrganizations();
      } catch (err) {
        showAlert('Error', err.response?.data?.message || 'Failed to delete organization', 'error');
      }
    }
  };

  // Assign admin to organization
  const handleAssignAdmin = async (org) => {
    const adminOptions = admins
      .filter(a => a.role === 'admin' && !a.organization)
      .reduce((acc, admin) => {
        acc[admin._id] = admin.name + ' (' + admin.email + ')';
        return acc;
      }, {});

    if (Object.keys(adminOptions).length === 0) {
      showAlert('No Admins Available', 'All admins are already assigned to organizations. Create a new admin first.', 'info');
      return;
    }

    const { value: adminId } = await Swal.fire({
      title: `Assign Admin to ${org.name}`,
      input: 'select',
      inputOptions: adminOptions,
      inputPlaceholder: 'Select an admin',
      showCancelButton: true,
      confirmButtonText: 'Assign',
      ...swalDarkOptions
    });

    if (adminId) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(`/api/organizations/${org._id}/assign-admin`, 
          { adminId },
          { headers: { Authorization: `Bearer ${token}` }}
        );
        showAlert('Success', 'Admin assigned successfully', 'success');
        fetchOrganizations();
        fetchAdmins();
      } catch (err) {
        showAlert('Error', err.response?.data?.message || 'Failed to assign admin', 'error');
      }
    }
  };

  // Surface styles tuned for stronger visual identity
  const cardStyle = {
    background: isDarkMode
      ? `linear-gradient(140deg, ${colors.surface} 0%, ${colors.background} 100%)`
      : `linear-gradient(140deg, ${colors.surface} 0%, #f8fbff 100%)`,
    border: `1px solid ${colors.border}`,
    borderRadius: '4px',
    padding: '1.25rem',
    marginBottom: '1rem',
    boxShadow: isDarkMode
      ? '0 10px 28px rgba(0, 0, 0, 0.28)'
      : '0 12px 28px rgba(13, 38, 76, 0.08)'
  };

  const statCardBaseStyle = {
    borderRadius: '4px',
    padding: '1.1rem 1.15rem',
    position: 'relative',
    overflow: 'hidden',
    border: isDarkMode ? `1px solid ${colors.border}` : '1px solid rgba(255,255,255,0.75)',
    boxShadow: isDarkMode
      ? '0 10px 24px rgba(0, 0, 0, 0.32)'
      : '0 12px 30px rgba(14, 22, 40, 0.10)'
  };

  const orgCardStyle = {
    background: isDarkMode
      ? `linear-gradient(120deg, ${colors.surface} 0%, ${colors.background} 100%)`
      : 'linear-gradient(120deg, #ffffff 0%, #f7fbff 100%)',
    border: `1px solid ${colors.border}`,
    borderRadius: '4px',
    padding: '1rem',
    marginBottom: '0.75rem',
    transition: 'all 0.2s ease',
    boxShadow: isDarkMode
      ? '0 8px 18px rgba(0,0,0,0.22)'
      : '0 8px 20px rgba(15, 48, 85, 0.08)'
  };

  const getStatusPillStyle = (status) => {
    const active = status === 'active';
    return {
      padding: '0.32rem 0.7rem',
      borderRadius: '4px',
      fontSize: '0.72rem',
      fontWeight: 700,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      border: `1px solid ${active ? '#10b98155' : '#9ca3af55'}`,
      background: active ? '#10b9811a' : '#6b72801a',
      color: active ? '#059669' : isDarkMode ? '#d1d5db' : '#4b5563'
    };
  };

  const actionButtonStyle = {
    borderRadius: '4px',
    width: 34,
    height: 34,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const addUniversityButtonStyle = {
    borderRadius: '4px',
    padding: '0.38rem 0.65rem',
    fontWeight: 600,
    fontSize: '0.78rem'
  };

  return (
    <div style={{ padding: '1.5rem', color: colors.text }}>
      {/* Dark mode styles for SweetAlert2 */}
      {isDarkMode && (
        <style>{`
          .swal-dark-popup {
            background: ${colors.surface} !important;
            color: ${colors.text} !important;
          }
          .swal-dark-title {
            color: ${colors.text} !important;
          }
          .swal-dark-content {
            color: ${colors.textSecondary} !important;
          }
          .swal-dark-input, .swal2-select {
            background: ${colors.background} !important;
            color: ${colors.text} !important;
            border-color: ${colors.border} !important;
          }
          .swal2-select option {
            background: ${colors.surface} !important;
            color: ${colors.text} !important;
          }
        `}</style>
      )}
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1" style={{ color: colors.text }}>
            <FontAwesomeIcon icon={faBuilding} className="me-2" style={{ color: '#2563eb' }} />
            Organization Management
          </h2>
          <p className="text-muted mb-0">Manage federations and universities</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary"
            onClick={() => openCreateModal('federation')}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            New Federation
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => openCreateModal('university')}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            New University
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4 g-3">
        {[
          {
            label: 'Federations',
            value: federations.length,
            icon: faBuilding,
            accent: '#2563eb',
            gradient: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)'
          },
          {
            label: 'Universities',
            value: organizations.filter(o => o.type === 'university').length,
            icon: faUniversity,
            accent: '#10b981',
            gradient: 'linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)'
          },
          {
            label: 'Total Users',
            value: organizations.reduce((sum, o) => sum + (o.stats?.totalUsers || 0), 0),
            icon: faUsers,
            accent: '#d97706',
            gradient: 'linear-gradient(135deg, #ffedd5 0%, #fff7ed 100%)'
          },
          {
            label: 'Total Elections',
            value: organizations.reduce((sum, o) => sum + (o.stats?.totalElections || 0), 0),
            icon: faVoteYea,
            accent: '#0f766e',
            gradient: 'linear-gradient(135deg, #ccfbf1 0%, #f0fdfa 100%)'
          }
        ].map((stat) => (
          <div key={stat.label} className="col-md-3 col-sm-6">
            <div
              style={{
                ...statCardBaseStyle,
                background: isDarkMode
                  ? `linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%)`
                  : stat.gradient
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  top: -30,
                  right: -20,
                  background: `${stat.accent}22`
                }}
              />
              <div className="d-flex justify-content-between align-items-center" style={{ position: 'relative', zIndex: 1 }}>
                <div>
                  <p className="mb-1 small" style={{ color: isDarkMode ? colors.textSecondary : '#4b5563', fontWeight: 600 }}>
                    {stat.label}
                  </p>
                  <h3 className="mb-0" style={{ color: isDarkMode ? colors.text : '#0f172a', fontWeight: 800 }}>
                    {stat.value}
                  </h3>
                </div>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `${stat.accent}1f`
                  }}
                >
                  <FontAwesomeIcon icon={stat.icon} style={{ fontSize: 20, color: stat.accent }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div style={cardStyle}>
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                <FontAwesomeIcon icon={faSearch} style={{ color: colors.textSecondary }} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search organizations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ 
                  backgroundColor: colors.background, 
                  color: colors.text,
                  borderColor: colors.border 
                }}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ 
                backgroundColor: colors.background, 
                color: colors.text,
                borderColor: colors.border 
              }}
            >
              <option value="all">All Types</option>
              <option value="federation">Federations Only</option>
              <option value="university">Universities Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Organizations List */}
      {loading ? (
        <div className="text-center py-5">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" style={{ color: '#2563eb' }} />
          <p className="mt-3 text-muted">Loading organizations...</p>
        </div>
      ) : organizations.length === 0 ? (
        <div className="text-center py-5" style={cardStyle}>
          <FontAwesomeIcon icon={faBuilding} size="3x" style={{ color: colors.textSecondary, opacity: 0.5 }} />
          <h5 className="mt-3" style={{ color: colors.text }}>No Organizations Found</h5>
          <p className="text-muted">Create a federation or university to get started.</p>
          <button className="btn btn-primary" onClick={() => openCreateModal('federation')}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Create First Federation
          </button>
        </div>
      ) : filteredOrganizations.length === 0 ? (
        <div className="text-center py-5" style={cardStyle}>
          <FontAwesomeIcon icon={faSearch} size="3x" style={{ color: colors.textSecondary, opacity: 0.5 }} />
          <h5 className="mt-3" style={{ color: colors.text }}>No Results Found</h5>
          <p className="text-muted">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div>
          {/* Federations with nested universities */}
          {(filterType === 'all' || filterType === 'federation') && federations.filter(f => 
            f.name.toLowerCase().includes(search.toLowerCase()) || 
            f.code.toLowerCase().includes(search.toLowerCase())
          ).map(federation => (
            <div key={federation._id} style={cardStyle} className="mb-3">
              {/* Federation Header */}
              <div 
                className="d-flex justify-content-between align-items-center"
                onClick={() => toggleFederation(federation._id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center gap-3">
                  <FontAwesomeIcon 
                    icon={expandedFederations[federation._id] ? faChevronDown : faChevronRight} 
                    style={{ color: colors.textSecondary }}
                  />
                  <div 
                    style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: '12px', 
                      backgroundColor: '#2563eb20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FontAwesomeIcon icon={faBuilding} style={{ color: '#2563eb', fontSize: 20 }} />
                  </div>
                  <div>
                    <h5 className="mb-0" style={{ color: colors.text }}>{federation.name}</h5>
                    <small className="text-muted">
                      Code: {federation.code} • {getUniversitiesForFederation(federation._id).length} universities
                    </small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span style={getStatusPillStyle(federation.status)}>{federation.status}</span>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={(e) => { e.stopPropagation(); openCreateModal('university', federation._id); }}
                    style={addUniversityButtonStyle}
                  >
                    <FontAwesomeIcon icon={faPlus} className="me-1" />
                    Add University
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={(e) => { e.stopPropagation(); openEditModal(federation); }}
                    style={actionButtonStyle}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={(e) => { e.stopPropagation(); handleDelete(federation); }}
                    style={actionButtonStyle}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>

              {/* Universities under this federation */}
              {expandedFederations[federation._id] && (
                <div className="mt-3 ps-4" style={{ borderLeft: `2px solid ${colors.border}` }}>
                  {getUniversitiesForFederation(federation._id).length === 0 ? (
                    <p className="text-muted py-2 mb-0">
                      No universities yet. Click "Add University" to create one.
                    </p>
                  ) : (
                    getUniversitiesForFederation(federation._id).map(uni => (
                      <div 
                        key={uni._id} 
                        style={orgCardStyle}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div 
                            style={{ 
                              width: 40, 
                              height: 40, 
                              borderRadius: '10px', 
                              backgroundColor: '#10b98120',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <FontAwesomeIcon icon={faUniversity} style={{ color: '#10b981', fontSize: 16 }} />
                          </div>
                          <div>
                            <h6 className="mb-0" style={{ color: colors.text }}>{uni.name}</h6>
                            <small className="text-muted">
                              Code: {uni.code} • 
                              {uni.stats?.totalUsers || 0} users • 
                              {uni.stats?.totalElections || 0} elections
                            </small>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span style={getStatusPillStyle(uni.status)}>{uni.status}</span>
                          <button 
                            className="btn btn-sm btn-outline-info"
                            onClick={() => handleAssignAdmin(uni)}
                            title="Assign Admin"
                            style={actionButtonStyle}
                          >
                            <FontAwesomeIcon icon={faUserShield} />
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => openEditModal(uni)}
                            style={actionButtonStyle}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(uni)}
                            style={actionButtonStyle}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Standalone universities (no parent federation) */}
          {organizations.filter(o => o.type === 'university' && !o.parent).length > 0 && (
            <div style={cardStyle}>
              <h5 className="mb-3" style={{ color: colors.text }}>
                <FontAwesomeIcon icon={faUniversity} className="me-2" style={{ color: '#f59e0b' }} />
                Standalone Universities
              </h5>
              {organizations.filter(o => o.type === 'university' && !o.parent).map(uni => (
                <div 
                  key={uni._id} 
                  style={orgCardStyle}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div className="d-flex align-items-center gap-3">
                    <div 
                      style={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '10px', 
                        backgroundColor: '#f59e0b20',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FontAwesomeIcon icon={faUniversity} style={{ color: '#f59e0b', fontSize: 16 }} />
                    </div>
                    <div>
                      <h6 className="mb-0" style={{ color: colors.text }}>{uni.name}</h6>
                      <small className="text-muted">Code: {uni.code}</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span style={getStatusPillStyle(uni.status)}>{uni.status}</span>
                    <button 
                      className="btn btn-sm btn-outline-info"
                      onClick={() => handleAssignAdmin(uni)}
                      title="Assign Admin"
                      style={actionButtonStyle}
                    >
                      <FontAwesomeIcon icon={faUserShield} />
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => openEditModal(uni)}
                      style={actionButtonStyle}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(uni)}
                      style={actionButtonStyle}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div 
          className="modal show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowModal(false)}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content" style={{ backgroundColor: colors.surface, color: colors.text }}>
              <div className="modal-header" style={{ borderColor: colors.border }}>
                <h5 className="modal-title">
                  <FontAwesomeIcon 
                    icon={formData.type === 'federation' ? faBuilding : faUniversity} 
                    className="me-2" 
                    style={{ color: formData.type === 'federation' ? '#2563eb' : '#10b981' }}
                  />
                  {modalMode === 'create' ? 'Create' : 'Edit'} {formData.type === 'federation' ? 'Federation' : 'University'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                  style={{ filter: isDarkMode ? 'invert(1)' : 'none' }}
                />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    {/* Basic Info */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Organization Name *</label>
                      {modalMode === 'edit' ? (
                        // In edit mode, show text input
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={formData.type === 'federation' ? 'e.g., Nigerian University Students Federation' : 'e.g., University of Lagos'}
                          required
                          style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
                        />
                      ) : isAddingNewOrg ? (
                        // Adding new organization - show text input with cancel button
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            value={newOrgName}
                            onChange={(e) => {
                              setNewOrgName(e.target.value);
                              setFormData({ ...formData, name: e.target.value });
                            }}
                            placeholder={formData.type === 'federation' ? 'e.g., Nigerian University Students Federation' : 'e.g., University of Lagos'}
                            required
                            autoFocus
                            style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => {
                              setIsAddingNewOrg(false);
                              setNewOrgName('');
                              setFormData({ ...formData, name: '' });
                            }}
                            title="Cancel"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </div>
                      ) : (
                        // Select from existing organizations
                        <>
                          <select
                            className="form-select"
                            value={formData.name}
                            onChange={(e) => {
                              if (e.target.value === '__ADD_NEW__') {
                                setIsAddingNewOrg(true);
                                setFormData({ ...formData, name: '' });
                              } else {
                                const selectedOrg = organizations.find(o => o.name === e.target.value);
                                setFormData({ 
                                  ...formData, 
                                  name: e.target.value,
                                  code: selectedOrg?.code || formData.code
                                });
                              }
                            }}
                            required
                            style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
                          >
                            <option value="">-- Select {formData.type === 'federation' ? 'Federation' : 'University'} --</option>
                            {organizations
                              .filter(org => org.type === formData.type)
                              .map(org => (
                                <option key={org._id} value={org.name}>{org.name} ({org.code})</option>
                              ))
                            }
                            <option value="__ADD_NEW__" style={{ fontStyle: 'italic', color: '#2563eb' }}>
                              + Add New {formData.type === 'federation' ? 'Federation' : 'University'}...
                            </option>
                          </select>
                          <small className="text-muted">Select existing or add new</small>
                        </>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Code *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder={formData.type === 'federation' ? 'e.g., NUSF' : 'e.g., UNILAG'}
                        required
                        maxLength={10}
                        style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
                      />
                      <small className="text-muted">Short unique identifier (max 10 chars)</small>
                    </div>

                    {/* Type selector (only for create) */}
                    {modalMode === 'create' && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Type</label>
                        <select
                          className="form-select"
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value, parent: '' })}
                          style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
                        >
                          <option value="university">University</option>
                          <option value="federation">Federation</option>
                        </select>
                      </div>
                    )}

                    {/* Parent Federation (for universities) */}
                    {formData.type === 'university' && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Parent Federation</label>
                        <select
                          className="form-select"
                          value={formData.parent}
                          onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                          style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
                        >
                          <option value="">-- No Federation (Standalone) --</option>
                          {federations.map(fed => (
                            <option key={fed._id} value={fed._id}>{fed.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="col-12">
                      <h6 className="mb-3 mt-2" style={{ color: colors.textSecondary }}>Contact Information</h6>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.contact.email}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          contact: { ...formData.contact, email: e.target.value }
                        })}
                        placeholder="contact@organization.edu"
                        style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.contact.phone}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          contact: { ...formData.contact, phone: e.target.value }
                        })}
                        placeholder="+234..."
                        style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Website</label>
                      <input
                        type="url"
                        className="form-control"
                        value={formData.contact.website}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          contact: { ...formData.contact, website: e.target.value }
                        })}
                        placeholder="https://www.organization.edu"
                        style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.contact.address}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          contact: { ...formData.contact, address: e.target.value }
                        })}
                        placeholder="Physical address"
                        style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
                      />
                    </div>

                    {/* Settings */}
                    <div className="col-12">
                      <h6 className="mb-3 mt-2" style={{ color: colors.textSecondary }}>Settings</h6>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="allowSelfReg"
                          checked={formData.settings.allowSelfRegistration}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: { ...formData.settings, allowSelfRegistration: e.target.checked }
                          })}
                        />
                        <label className="form-check-label" htmlFor="allowSelfReg">
                          Allow self-registration
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="requireEmail"
                          checked={formData.settings.requireEmailVerification}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: { ...formData.settings, requireEmailVerification: e.target.checked }
                          })}
                        />
                        <label className="form-check-label" htmlFor="requireEmail">
                          Require email verification
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Max Elections Per Year</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.settings.maxElectionsPerYear}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: { ...formData.settings, maxElectionsPerYear: parseInt(e.target.value) || 10 }
                        })}
                        min={1}
                        max={100}
                        style={{ backgroundColor: colors.background, color: colors.text, borderColor: colors.border }}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer" style={{ borderColor: colors.border }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheck} className="me-2" />
                        {modalMode === 'create' ? 'Create' : 'Save Changes'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationManagement;
