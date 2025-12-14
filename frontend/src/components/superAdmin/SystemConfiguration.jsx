import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const SystemConfiguration = () => {
  const [config, setConfig] = useState({
    emailSettings: {
      smtpServer: 'smtp.gmail.com',
      smtpPort: 587,
      senderEmail: 'noreply@kyu.ac.ug',
      username: '',
      password: '',
      tlsEnabled: true
    },
    smsSettings: {
      enabled: false,
      provider: 'twilio',
      accountSid: '',
      authToken: '',
      phoneNumber: ''
    },
    systemParameters: {
      electionTimeout: 24, // hours
      votingStartTime: '08:00',
      votingEndTime: '17:00',
      maxLoginAttempts: 5,
      passwordExpiryDays: 90,
      maintenanceMode: false
    },
    featureToggles: {
      enableVotingNotifications: true,
      enableCandidateApproval: true,
      enableResultsPublication: true,
      enableCandidateComparison: true,
      enableVoteReceipts: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('email');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/super-admin/system-config', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConfig(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch config', err);
      setLoading(false);
    }
  };

  const handleConfigChange = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const saveConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/super-admin/system-config', config, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Success', 'Configuration saved successfully!', 'success');
      setHasChanges(false);
    } catch (err) {
      Swal.fire('Error', 'Failed to save configuration: ' + err.message, 'error');
    }
  };

  const testEmailConnection = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/super-admin/test-email', config.emailSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Success', 'Email connection test passed!', 'success');
    } catch (err) {
      Swal.fire('Error', 'Email connection test failed: ' + err.message, 'error');
    }
  };

  const testSmsConnection = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/super-admin/test-sms', config.smsSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Success', 'SMS connection test passed!', 'success');
    } catch (err) {
      Swal.fire('Error', 'SMS connection test failed: ' + err.message, 'error');
    }
  };

  if (loading) return <div className="text-center py-5">Loading configuration...</div>;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">System Configuration</h3>
        {hasChanges && (
          <button className="btn btn-primary" onClick={saveConfig}>
            <i className="fa-solid fa-save me-2"></i>Save Changes
          </button>
        )}
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => setActiveTab('email')}
          >
            <i className="fa-solid fa-envelope me-2"></i>Email Settings
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'sms' ? 'active' : ''}`}
            onClick={() => setActiveTab('sms')}
          >
            <i className="fa-solid fa-message me-2"></i>SMS Settings
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            <i className="fa-solid fa-gears me-2"></i>System Parameters
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            <i className="fa-solid fa-toggle-on me-2"></i>Feature Toggles
          </button>
        </li>
      </ul>

      {/* Email Settings */}
      {activeTab === 'email' && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title mb-4">Email Configuration</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">SMTP Server</label>
                <input
                  type="text"
                  className="form-control"
                  value={config.emailSettings.smtpServer}
                  onChange={(e) => handleConfigChange('emailSettings', 'smtpServer', e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">SMTP Port</label>
                <input
                  type="number"
                  className="form-control"
                  value={config.emailSettings.smtpPort}
                  onChange={(e) => handleConfigChange('emailSettings', 'smtpPort', parseInt(e.target.value))}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Sender Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={config.emailSettings.senderEmail}
                  onChange={(e) => handleConfigChange('emailSettings', 'senderEmail', e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={config.emailSettings.username}
                  onChange={(e) => handleConfigChange('emailSettings', 'username', e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={config.emailSettings.password}
                  onChange={(e) => handleConfigChange('emailSettings', 'password', e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <div className="form-check mt-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="tlsToggle"
                    checked={config.emailSettings.tlsEnabled}
                    onChange={(e) => handleConfigChange('emailSettings', 'tlsEnabled', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="tlsToggle">
                    Enable TLS
                  </label>
                </div>
              </div>
            </div>
            <button className="btn btn-outline-primary mt-3" onClick={testEmailConnection}>
              <i className="fa-solid fa-vial me-2"></i>Test Connection
            </button>
          </div>
        </div>
      )}

      {/* SMS Settings */}
      {activeTab === 'sms' && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title mb-4">SMS Configuration</h5>
            <div className="form-check form-switch mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="smsToggle"
                checked={config.smsSettings.enabled}
                onChange={(e) => handleConfigChange('smsSettings', 'enabled', e.target.checked)}
              />
              <label className="form-check-label" htmlFor="smsToggle">
                Enable SMS Notifications
              </label>
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">SMS Provider</label>
                <select
                  className="form-select"
                  value={config.smsSettings.provider}
                  onChange={(e) => handleConfigChange('smsSettings', 'provider', e.target.value)}
                  disabled={!config.smsSettings.enabled}
                >
                  <option value="twilio">Twilio</option>
                  <option value="aws-sns">AWS SNS</option>
                  <option value="nexmo">Nexmo</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Account SID</label>
                <input
                  type="text"
                  className="form-control"
                  value={config.smsSettings.accountSid}
                  onChange={(e) => handleConfigChange('smsSettings', 'accountSid', e.target.value)}
                  disabled={!config.smsSettings.enabled}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Auth Token</label>
                <input
                  type="password"
                  className="form-control"
                  value={config.smsSettings.authToken}
                  onChange={(e) => handleConfigChange('smsSettings', 'authToken', e.target.value)}
                  disabled={!config.smsSettings.enabled}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={config.smsSettings.phoneNumber}
                  onChange={(e) => handleConfigChange('smsSettings', 'phoneNumber', e.target.value)}
                  disabled={!config.smsSettings.enabled}
                  placeholder="+1234567890"
                />
              </div>
            </div>
            <button 
              className="btn btn-outline-primary mt-3" 
              onClick={testSmsConnection}
              disabled={!config.smsSettings.enabled}
            >
              <i className="fa-solid fa-vial me-2"></i>Test Connection
            </button>
          </div>
        </div>
      )}

      {/* System Parameters */}
      {activeTab === 'system' && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title mb-4">System Parameters</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Election Timeout (Hours)</label>
                <input
                  type="number"
                  className="form-control"
                  value={config.systemParameters.electionTimeout}
                  onChange={(e) => handleConfigChange('systemParameters', 'electionTimeout', parseInt(e.target.value))}
                  min="1"
                  max="72"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Max Login Attempts</label>
                <input
                  type="number"
                  className="form-control"
                  value={config.systemParameters.maxLoginAttempts}
                  onChange={(e) => handleConfigChange('systemParameters', 'maxLoginAttempts', parseInt(e.target.value))}
                  min="1"
                  max="10"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Voting Start Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={config.systemParameters.votingStartTime}
                  onChange={(e) => handleConfigChange('systemParameters', 'votingStartTime', e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Voting End Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={config.systemParameters.votingEndTime}
                  onChange={(e) => handleConfigChange('systemParameters', 'votingEndTime', e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Password Expiry (Days)</label>
                <input
                  type="number"
                  className="form-control"
                  value={config.systemParameters.passwordExpiryDays}
                  onChange={(e) => handleConfigChange('systemParameters', 'passwordExpiryDays', parseInt(e.target.value))}
                  min="1"
                  max="365"
                />
              </div>
              <div className="col-md-6">
                <div className="form-check mt-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="maintenanceToggle"
                    checked={config.systemParameters.maintenanceMode}
                    onChange={(e) => handleConfigChange('systemParameters', 'maintenanceMode', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="maintenanceToggle">
                    Enable Maintenance Mode
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Toggles */}
      {activeTab === 'features' && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title mb-4">Feature Toggles</h5>
            <div className="row g-3">
              <div className="col-12">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="votingNotifications"
                    checked={config.featureToggles.enableVotingNotifications}
                    onChange={(e) => handleConfigChange('featureToggles', 'enableVotingNotifications', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="votingNotifications">
                    Enable Voting Notifications
                  </label>
                </div>
              </div>
              <div className="col-12">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="candidateApproval"
                    checked={config.featureToggles.enableCandidateApproval}
                    onChange={(e) => handleConfigChange('featureToggles', 'enableCandidateApproval', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="candidateApproval">
                    Enable Candidate Approval Workflow
                  </label>
                </div>
              </div>
              <div className="col-12">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="resultsPublication"
                    checked={config.featureToggles.enableResultsPublication}
                    onChange={(e) => handleConfigChange('featureToggles', 'enableResultsPublication', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="resultsPublication">
                    Enable Results Publication
                  </label>
                </div>
              </div>
              <div className="col-12">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="candidateComparison"
                    checked={config.featureToggles.enableCandidateComparison}
                    onChange={(e) => handleConfigChange('featureToggles', 'enableCandidateComparison', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="candidateComparison">
                    Enable Candidate Comparison Tool
                  </label>
                </div>
              </div>
              <div className="col-12">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="voteReceipts"
                    checked={config.featureToggles.enableVoteReceipts}
                    onChange={(e) => handleConfigChange('featureToggles', 'enableVoteReceipts', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="voteReceipts">
                    Enable Vote Receipts
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemConfiguration;
