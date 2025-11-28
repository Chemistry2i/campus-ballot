import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Reporting = () => {
  const [reports, setReports] = useState({});

  useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/super-admin/reports/admin-performance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data);
    };
    fetchReports();
  }, []);

  return (
    <div>
      <h3>Reporting</h3>
      <p>Admin Performance: {JSON.stringify(reports)}</p>
      {/* Add charts or tables */}
    </div>
  );
};

export default Reporting;
