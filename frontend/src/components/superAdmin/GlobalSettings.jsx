import React, { useEffect, useState } from 'react';
import axios from 'axios';

const GlobalSettings = () => {
  const [settings, setSettings] = useState({ maintenanceMode: false, votingStart: '', votingEnd: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/super-admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSettings(res.data);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    await axios.put('/api/super-admin/settings', settings, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  return (
    <div>
      <h3>Global Settings</h3>
      <form>
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            checked={settings.maintenanceMode}
            onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
          />
          <label className="form-check-label">Maintenance Mode</label>
        </div>
        <div className="mb-3">
          <label>Voting Start Time</label>
          <input
            type="datetime-local"
            className="form-control"
            value={settings.votingStart}
            onChange={(e) => setSettings({ ...settings, votingStart: e.target.value })}
          />
        </div>
        <button type="button" className="btn btn-primary" onClick={handleSave}>Save</button>
      </form>
    </div>
  );
};

export default GlobalSettings;
