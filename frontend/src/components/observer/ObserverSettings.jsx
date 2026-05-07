import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from '../../utils/axiosInstance';
import { FaCog, FaBell, FaLock, FaUser, FaSave } from 'react-icons/fa';

const ObserverSettings = () => {
  const { isDarkMode: _isDarkMode, colors } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [_user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    organization: ''
  });
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    twoFactorAuth: false,
    privateProfile: false,
    autoLogout: true,
    autoLogoutTime: 30
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users/me/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        phoneNumber: response.data.phoneNumber || '',
        organization: response.data.observerInfo?.organization || ''
      });
      setProfileImage(response.data.profilePicture || null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/users/upload-profile-picture', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setProfileImage(response.data.profilePicture);
      setSuccessMessage('Profile image updated successfully!');
      setShowImageModal(false);
      setImagePreview(null);
      
      // Update localStorage user data
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      userData.profilePicture = response.data.profilePicture;
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      console.error('Error uploading image:', err);
      alert(err.response?.data?.message || 'Failed to upload image. Please try again.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/user/profile', {
        name: formData.name,
        phoneNumber: formData.phoneNumber
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/observer/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage('Settings saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FaUser /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
    { id: 'security', label: 'Security', icon: <FaLock /> },
    { id: 'system', label: 'System', icon: <FaCog /> }
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: colors.text }}>
          <FaCog className="me-2" />
          Settings
        </h3>
        <p className="text-muted mb-0">Manage your account preferences and settings</p>
      </div>

      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          {successMessage}
          <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
        </div>
      )}

      <div className="row g-4">
        {/* Sidebar Tabs */}
        <div className="col-12 col-md-3">
          <div className="list-group sticky-top" style={{ top: '20px' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${
                  activeTab === tab.id ? 'active' : ''
                }`}
                onClick={() => setActiveTab(tab.id)}
                style={
                  activeTab === tab.id
                    ? {
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        borderColor: '#3b82f6',
                        color: 'white'
                      }
                    : {
                        background: colors.surface,
                        border: `1px solid ${colors.border}`,
                        color: colors.text
                      }
                }
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="col-12 col-md-9">
          <div
            className="card border-0 shadow-sm"
            style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              color: colors.text
            }}
          >
            <div className="card-body p-4">
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <>
                  <h5 className="card-title mb-4 fw-bold">Profile Settings</h5>
                  
                  <div className="mb-4">
                    <label className="form-label fw-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      style={{
                        background: colors.background,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '8px',
                        padding: '0.75rem'
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium mb-2">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      disabled
                      style={{
                        background: colors.background,
                        color: colors.textMuted,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '8px',
                        padding: '0.75rem'
                      }}
                    />
                    <small className="text-muted">Email cannot be changed</small>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Enter your phone number"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      style={{
                        background: colors.background,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '8px',
                        padding: '0.75rem'
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium mb-2">Organization</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.organization}
                      disabled
                      style={{
                        background: colors.background,
                        color: colors.textMuted,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '8px',
                        padding: '0.75rem'
                      }}
                    />
                    <small className="text-muted">Organization set by administrator</small>
                  </div>

                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-primary"
                      onClick={saveProfile}
                      disabled={saving}
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        border: 'none',
                        padding: '0.6rem 1.5rem'
                      }}
                    >
                      <FaSave className="me-2" />
                      {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <>
                  <h5 className="card-title mb-4 fw-bold">Notification Preferences</h5>
                  
                  <div className="mb-4">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="emailNotif"
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <label className="form-check-label" htmlFor="emailNotif">
                        <span className="fw-medium">Email Notifications</span>
                      </label>
                    </div>
                    <small className="text-muted ms-4">Receive notifications via email</small>
                  </div>

                  <div className="mb-4">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="smsNotif"
                        checked={settings.smsNotifications}
                        onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <label className="form-check-label" htmlFor="smsNotif">
                        <span className="fw-medium">SMS Notifications</span>
                      </label>
                    </div>
                    <small className="text-muted ms-4">Receive notifications via SMS</small>
                  </div>

                  <div className="mb-4">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="pushNotif"
                        checked={settings.pushNotifications}
                        onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <label className="form-check-label" htmlFor="pushNotif">
                        <span className="fw-medium">Push Notifications</span>
                      </label>
                    </div>
                    <small className="text-muted ms-4">Receive push notifications on your device</small>
                  </div>

                  <div className="d-flex gap-2 mt-4">
                    <button 
                      className="btn btn-primary"
                      onClick={saveSettings}
                      disabled={saving}
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        border: 'none',
                        padding: '0.6rem 1.5rem'
                      }}
                    >
                      <FaSave className="me-2" />
                      {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <>
                  <h5 className="card-title mb-4 fw-bold">Security Settings</h5>
                  
                  <div className="mb-4">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="twoFa"
                        checked={settings.twoFactorAuth}
                        onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <label className="form-check-label" htmlFor="twoFa">
                        <span className="fw-medium">Two-Factor Authentication</span>
                      </label>
                    </div>
                    <small className="text-muted ms-4">Require a second form of verification when logging in</small>
                  </div>

                  <div className="mb-4">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="privateProfile"
                        checked={settings.privateProfile}
                        onChange={(e) => handleSettingChange('privateProfile', e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <label className="form-check-label" htmlFor="privateProfile">
                        <span className="fw-medium">Private Profile</span>
                      </label>
                    </div>
                    <small className="text-muted ms-4">Make your profile private to other observers</small>
                  </div>

                  <div className="mt-4">
                    <button 
                      className="btn btn-outline-warning"
                      style={{
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                        padding: '0.6rem 1.5rem'
                      }}
                    >
                      <i className="fas fa-key me-2"></i>
                      Change Password
                    </button>
                  </div>

                  <div className="d-flex gap-2 mt-4">
                    <button 
                      className="btn btn-primary"
                      onClick={saveSettings}
                      disabled={saving}
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        border: 'none',
                        padding: '0.6rem 1.5rem'
                      }}
                    >
                      <FaSave className="me-2" />
                      {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </>
              )}

              {/* System Settings */}
              {activeTab === 'system' && (
                <>
                  <h5 className="card-title mb-4 fw-bold">System Settings</h5>
                  
                  <div className="mb-4">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="autoLogout"
                        checked={settings.autoLogout}
                        onChange={(e) => handleSettingChange('autoLogout', e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <label className="form-check-label" htmlFor="autoLogout">
                        <span className="fw-medium">Auto Logout</span>
                      </label>
                    </div>
                    <small className="text-muted ms-4">Automatically log out when inactive</small>
                  </div>

                  {settings.autoLogout && (
                    <div className="mb-4">
                      <label className="form-label fw-medium mb-2">Inactivity Timeout (minutes)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={settings.autoLogoutTime}
                        onChange={(e) => handleSettingChange('autoLogoutTime', parseInt(e.target.value))}
                        min="5"
                        max="120"
                        style={{
                          background: colors.background,
                          color: colors.text,
                          border: `1px solid ${colors.border}`,
                          borderRadius: '8px',
                          maxWidth: '150px',
                          padding: '0.75rem'
                        }}
                      />
                      <small className="text-muted d-block mt-2">Set timeout between 5 and 120 minutes</small>
                    </div>
                  )}

                  <div className="d-flex gap-2 mt-4">
                    <button 
                      className="btn btn-primary"
                      onClick={saveSettings}
                      disabled={saving}
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        border: 'none',
                        padding: '0.6rem 1.5rem'
                      }}
                    >
                      <FaSave className="me-2" />
                      {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Image Upload Modal */}
      {showImageModal && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowImageModal(false)}
        >
          <div 
            className="modal-dialog modal-dialog-centered" 
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="modal-content"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`
              }}
            >
              <div 
                className="modal-header"
                style={{ borderBottom: `1px solid ${colors.border}` }}
              >
                <h5 className="modal-title" style={{ color: colors.text }}>Update Profile Picture</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowImageModal(false)}
                  style={{ filter: isDarkMode ? 'invert(1)' : 'none' }}
                ></button>
              </div>
              <div className="modal-body text-center">
                {imagePreview && (
                  <div className="mb-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="rounded-circle"
                      style={{
                        width: '150px',
                        height: '150px',
                        objectFit: 'cover',
                        border: `3px solid ${colors.border}`
                      }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{
                    background: colors.surface,
                    color: colors.text,
                    border: `1px solid ${colors.border}`
                  }}
                />
                <small className="text-muted mt-2 d-block">
                  Supported formats: JPG, PNG, GIF. Max size: 2MB
                </small>
              </div>
              <div 
                className="modal-footer"
                style={{ borderTop: `1px solid ${colors.border}` }}
              >
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowImageModal(false);
                    setImagePreview(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    const fileInput = document.querySelector('input[type="file"]');
                    const file = fileInput.files[0];
                    if (file) {
                      handleImageUpload(file);
                    }
                  }}
                  disabled={!imagePreview}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ObserverSettings;
