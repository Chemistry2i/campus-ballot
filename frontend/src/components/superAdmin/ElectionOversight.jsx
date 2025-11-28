import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ElectionOversight = () => {
  const [elections, setElections] = useState([]);

  useEffect(() => {
    const fetchElections = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/elections?status=pending_approval', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setElections(res.data);
    };
    fetchElections();
  }, []);

  const approveElection = async (id) => {
    const token = localStorage.getItem('token');
    await axios.put(`/api/super-admin/elections/${id}/approve`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Refresh
  };

  return (
    <div>
      <h3>Election Oversight</h3>
      <ul>
        {elections.map(election => (
          <li key={election._id}>
            {election.title}
            <button className="btn btn-success" onClick={() => approveElection(election._id)}>Approve</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ElectionOversight;
