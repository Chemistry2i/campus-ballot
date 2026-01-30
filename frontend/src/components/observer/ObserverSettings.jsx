import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import { FaCog, FaBell, FaLock, FaUser } from 'react-icons/fa';

const ObserverSettings = () => {
  const { isDarkMode, colors } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    twoFactorAuth: false,
    privateProfile: false,
    autoLogout: true,
    autoLogoutTime: 30
  });
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings({
      ...settings,
      [key]: value
    });
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/observer/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Settings saved successfully');
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

      <div className="row g-4">
        {/* Tabs */}
        <div className="col-12 col-md-3">
          <div className="list-group">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`list-group-item list-group-item-action d-flex gap-2 align-items-center ${
                  activeTab === tab.id ? 'active' : ''
                }`}
                onClick={() => setActiveTab(tab.id)}
                style={
                  activeTab === tab.id
                    ? {
                        background: colors.primary,
                        borderColor: colors.primary,
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
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="col-12 col-md-9">
          <div
            className="card"
            style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              color: colors.text
            }}
          >
            <div className="card-body">
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <>
                  <h5 className="card-title mb-4">Profile Settings</h5>
                  <div className="mb-4">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={user?.name || ''}
                      disabled
                      style={{
                        background: colors.background,
                        color: colors.text,
                        border: `1px solid ${colors.border}`
                      }}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={user?.email || ''}
                      disabled
                      style={{
                        background: colors.background,
                        color: colors.text,
                        border: `1px solid ${colors.border}`
                      }}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Add your phone number"
                      style={{
                        background: colors.background,
                        color: colors.text,
                        border: `1px solid ${colors.border}`
                      }}
                    />
                  </div>
                  <button className="btn btn-primary">
                    Update Profile
                  </button>
                </>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <>
                  <h5 className="card-title mb-4">Notification Preferences</h5>
                  <div className="mb-4">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      />
                      <label className="form-check-label">
                        Email Notifications
                      </label>
                    </div>
                    <small style={{ color: colors.textSecondary }}>
                      Receive notifications via email
                    </small>
                  </div>
                  <div className="mb-4">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.smsNotifications}
                        onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                      />
                      <label className="form-check-label">
                        SMS Notifications
                      </label>
                    </div>
                    <small style={{ color: colors.textSecondary }}>
                      Receive notifications via SMS
                    </small>
                  </div>
                  <div className="mb-4">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.pushNotifications}
                        onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                      />
                      <label className="form-check-label">
                        Push Notifications
                      </label>
                    </div>
                    <small style={{ color: colors.textSecondary }}>
                      Receive push notifications on your device
                    </small>
                  </div>
                </>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <>
                  <h5 className="card-title mb-4">Security Settings</h5>
                  <div className="mb-4">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.twoFactorAuth}
                        onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                      />
                      <label className="form-check-label">
                        Two-Factor Authentication
                      </label>
                    </div>
                    <small style={{ color: colors.textSecondary }}>
                      Require a second form of verification when logging in
                    </small>
                  </div>
                  <div className="mb-4">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.privateProfile}
                        onChange={(e) => handleSettingChange('privateProfile', e.target.checked)}
                      />
                      <label className="form-check-label">
                        Private Profile
                      </label>
                    </div>
                    <small style={{ color: colors.textSecondary }}>
                      Make your profile private to other observers
                    </small>
                  </div>
                  <div className="mb-4">
                    <button className="btn btn-warning btn-sm">
                      Change Password
                    </button>
                  </div>
                </>
              )}

              {/* System Settings */}
              {activeTab === 'system' && (
                <>
                  <h5 className="card-title mb-4">System Settings</h5>
                  <div className="mb-4">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.autoLogout}
                        onChange={(e) => handleSettingChange('autoLogout', e.target.checked)}
                      />
                      <label className="form-check-label">
                        Auto Logout
                      </label>
                    </div>
                    <small style={{ color: colors.textSecondary }}>
                      Automatically log out when inactive
                    </small>
                  </div>
                  {settings.autoLogout && (
                    <div className="mb-4">
                      <label className="form-label">Inactivity Timeout (minutes)</label>
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
                          border: `1px solid ${colors.border}`
                        }}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Save Button */}
              <button
                className="btn btn-success"
                onClick={saveSettings}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObserverSettings;
