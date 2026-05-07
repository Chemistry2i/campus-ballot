import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import getImageUrl from '../utils/getImageUrl';

function PublicWinners() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const res = await axios.get('/api/public/winners');
        setWinners(res.data || []);
      } catch (err) {
        console.error('Failed to fetch winners', err);
        setError('Failed to fetch winners');
      } finally {
        setLoading(false);
      }
    };
    fetchWinners();
  }, []);

  if (loading) return <div className="p-4">Loading winners...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container py-4">
      <h2 className="mb-3">Election Winners</h2>
      {winners.length === 0 && <div className="alert alert-info">No published winners yet.</div>}

      <div className="row g-3">
        {winners.map(e => (
          <div key={e._id} className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">{e.title}</h5>
                <p className="small text-muted">Ended: {new Date(e.endDate).toLocaleString()}</p>

                <div className="list-group list-group-flush">
                  {e.winners.map(w => (
                    <div key={`${e._id}-${w.position}`} className="list-group-item d-flex align-items-center">
                      <img
                        src={getImageUrl(w.candidate)}
                        alt={w.candidate.name}
                        onError={(ev) => { ev.target.style.display = 'none'; }}
                        style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', marginRight: 12 }}
                      />
                      <div>
                        <div className="fw-bold">{w.candidate.name}</div>
                        <div className="small text-muted">{w.position} • {w.candidate.party || 'Independent'}</div>
                        <div className="small text-secondary">Votes: {w.candidate.votes || w.candidate.voteCount || 0}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PublicWinners;
