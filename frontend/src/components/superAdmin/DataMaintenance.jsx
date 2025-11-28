import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DataMaintenance = () => {
  const [backups, setBackups] = useState([]);

  useEffect(() => {
    const fetchBackups = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/super-admin/backups', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBackups(res.data);
    };
    fetchBackups();
  }, []);

  const createBackup = async () => {
    const token = localStorage.getItem('token');
    await axios.post('/api/super-admin/backup', {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Refresh
  };

  return (
    <div>
      <h3>Data Maintenance</h3>
      <button className="btn btn-primary" onClick={createBackup}>Create Backup</button>
      <ul>
        {backups.map(backup => (
          <li key={backup._id}>
            {backup.name} - {new Date(backup.createdAt).toLocaleString()}
            <button className="btn btn-secondary">Restore</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DataMaintenance;
