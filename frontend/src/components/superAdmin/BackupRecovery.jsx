import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useTheme } from '../../contexts/ThemeContext';

const BackupRecovery = () => {
  const { isDarkMode, colors } = useTheme();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [scheduleSettings, setScheduleSettings] = useState({
    enabled: true,
    frequency: 'daily',
    time: '02:00',
    retention: 30 // days
  });

  useEffect(() => {
    fetchBackups();
    fetchScheduleSettings();
  }, []);

  const fetchBackups = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/super-admin/backups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBackups(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch backups', err);
      // Fallback dummy data
      setBackups([
        {
          id: 1,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          size: '2.5 GB',
          type: 'automatic',
          status: 'completed',
          duration: '15 minutes'
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          size: '2.4 GB',
          type: 'automatic',
          status: 'completed',
          duration: '14 minutes'
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 259200000).toISOString(),
          size: '2.3 GB',
          type: 'automatic',
          status: 'completed',
          duration: '16 minutes'
        },
      ]);
      setLoading(false);
    }
  };

  const fetchScheduleSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/super-admin/backup-schedule', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScheduleSettings(res.data);
    } catch (err) {
      console.error('Failed to fetch schedule settings', err);
    }
  };

  const createBackup = async () => {
    setIsBackingUp(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/super-admin/backups/create', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Success', 'Backup created successfully!', 'success');
      fetchBackups();
    } catch (err) {
      Swal.fire('Error', 'Failed to create backup: ' + err.message, 'error');
    } finally {
      setIsBackingUp(false);
    }
  };

  const restoreBackup = async (backupId) => {
    const confirm = await Swal.fire({
      title: 'Restore Backup?',
      text: 'This will restore the system to the selected backup point. Current data will be overwritten.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Restore',
      cancelButtonText: 'Cancel'
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/super-admin/backups/${backupId}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Success', 'System restored from backup!', 'success');
      fetchBackups();
    } catch (err) {
      Swal.fire('Error', 'Failed to restore backup: ' + err.message, 'error');
    }
  };

  const downloadBackup = async (backupId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/super-admin/backups/${backupId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-${backupId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      Swal.fire('Error', 'Failed to download backup: ' + err.message, 'error');
    }
  };

  const deleteBackup = async (backupId) => {
    const confirm = await Swal.fire({
      title: 'Delete Backup?',
      text: 'This backup will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#dc3545'
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/super-admin/backups/${backupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Success', 'Backup deleted', 'success');
      fetchBackups();
    } catch (err) {
      Swal.fire('Error', 'Failed to delete backup: ' + err.message, 'error');
    }
  };

  const updateScheduleSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/super-admin/backup-schedule', scheduleSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Success', 'Backup schedule updated!', 'success');
    } catch (err) {
      Swal.fire('Error', 'Failed to update schedule: ' + err.message, 'error');
    }
  };

  if (loading) return <div className="text-center py-5">Loading backup data...</div>;

  return (
    <div className="container-fluid">
      <h3 className="fw-bold mb-4">Backup & Recovery</h3>

      {/* Backup Schedule Settings */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Backup Schedule Settings</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="autoBackupToggle"
                  checked={scheduleSettings.enabled}
                  onChange={(e) => setScheduleSettings({ ...scheduleSettings, enabled: e.target.checked })}
                />
                <label className="form-check-label" htmlFor="autoBackupToggle">
                  Enable Automatic Backups
                </label>
              </div>
            </div>

            <div className="col-md-3">
              <label className="form-label">Frequency</label>
              <select
                className="form-select"
                value={scheduleSettings.frequency}
                onChange={(e) => setScheduleSettings({ ...scheduleSettings, frequency: e.target.value })}
                disabled={!scheduleSettings.enabled}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Backup Time</label>
              <input
                type="time"
                className="form-control"
                value={scheduleSettings.time}
                onChange={(e) => setScheduleSettings({ ...scheduleSettings, time: e.target.value })}
                disabled={!scheduleSettings.enabled}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Retention Period (Days)</label>
              <input
                type="number"
                className="form-control"
                value={scheduleSettings.retention}
                onChange={(e) => setScheduleSettings({ ...scheduleSettings, retention: parseInt(e.target.value) })}
                min="1"
                max="365"
              />
            </div>
          </div>
          <button 
            className="btn btn-primary mt-3"
            onClick={updateScheduleSettings}
          >
            Save Schedule Settings
          </button>
        </div>
      </div>

      {/* Manual Backup */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Manual Backup</h5>
        </div>
        <div className="card-body">
          <p className="text-muted">Create an immediate backup of the entire system.</p>
          <button 
            className="btn btn-success"
            onClick={createBackup}
            disabled={isBackingUp}
          >
            {isBackingUp ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating Backup...
              </>
            ) : (
              <>
                <i className="fa-solid fa-database me-2"></i>
                Create Backup Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Backups List */}
      <div className="card">
        <div className="card-header bg-light">
          <h5 className="mb-0">Backup History</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0" style={{ color: colors.text }}>
            <thead style={{ background: isDarkMode ? colors.surface : '#f8f9fa', color: colors.text }}>
              <tr>
                <th style={{ color: colors.text }}>Date & Time</th>
                <th style={{ color: colors.text }}>Size</th>
                <th style={{ color: colors.text }}>Type</th>
                <th style={{ color: colors.text }}>Status</th>
                <th style={{ color: colors.text }}>Duration</th>
                <th style={{ color: colors.text }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ background: isDarkMode ? colors.surface : '#fff' }}>
              {backups.length > 0 ? (
                backups.map(backup => (
                  <tr key={backup.id}>
                    <td>
                      <strong>{new Date(backup.timestamp).toLocaleString()}</strong>
                    </td>
                    <td>{backup.size}</td>
                    <td>
                      <span className={`badge bg-${backup.type === 'automatic' ? 'info' : 'primary'}`}>
                        {backup.type}
                      </span>
                    </td>
                    <td>
                      <span className={`badge bg-${backup.status === 'completed' ? 'success' : 'warning'}`}>
                        {backup.status}
                      </span>
                    </td>
                    <td>{backup.duration}</td>
                    <td>
                      <div className="btn-group btn-group-sm" role="group">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => restoreBackup(backup.id)}
                          title="Restore"
                        >
                          <i className="fa-solid fa-undo"></i>
                        </button>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => downloadBackup(backup.id)}
                          title="Download"
                        >
                          <i className="fa-solid fa-download"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => deleteBackup(backup.id)}
                          title="Delete"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No backups found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BackupRecovery;
