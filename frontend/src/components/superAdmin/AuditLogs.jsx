import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/super-admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data);
    };
    fetchLogs();
  }, []);

  return (
    <div>
      <h3>Audit Logs</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Action</th>
            <th>User</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log._id}>
              <td>{log.action}</td>
              <td>{log.user?.name}</td>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLogs;
