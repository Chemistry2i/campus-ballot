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
  const [positionFilter, setPositionFilter] = useState('all');
  const [sortOption, setSortOption] = useState('election'); // 'election' | 'votes' | 'name'

  // derive positions and filtered/sorted winners
  const allPositions = React.useMemo(() => {
    const setPos = new Set();
    winners.forEach(e => e.winners && e.winners.forEach(w => setPos.add(w.position)));
    return ['all', ...Array.from(setPos)];
  }, [winners]);

  const filtered = React.useMemo(() => {
    return winners.map(election => ({
      ...election,
      winners: (election.winners || [])
        .filter(w => positionFilter === 'all' ? true : w.position === positionFilter)
        .slice()
        .sort((a, b) => {
          if (sortOption === 'votes') return (b.candidate?.votes || 0) - (a.candidate?.votes || 0);
          if (sortOption === 'name') return (a.candidate?.name || '').localeCompare(b.candidate?.name || '');
          return 0;
        })
    })).filter(e => e.winners && e.winners.length > 0);
  }, [winners, positionFilter, sortOption]);

  if (loading) return <div className="p-4">Loading winners...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container py-4">
      <h2 className="mb-3">Election Winners</h2>
      {winners.length === 0 && <div className="alert alert-info">No published winners yet.</div>}

      {/* Controls: Position dropdown and Sort dropdown (responsive) */}
      <div className="row g-2 align-items-center mb-3">
        <div className="col-12 col-md-6">
          <label className="form-label small mb-1">Filter by position</label>
          <select className="form-select" value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)} aria-label="Filter by position">
            {allPositions.map(pos => (
              <option key={pos} value={pos}>{pos === 'all' ? 'All Positions' : pos}</option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label small mb-1">Sort winners</label>
          <select className="form-select" value={sortOption} onChange={(e) => setSortOption(e.target.value)} aria-label="Sort winners">
            <option value="election">Default (by election)</option>
            <option value="votes">Votes (high → low)</option>
            <option value="name">Name (A → Z)</option>
          </select>
        </div>
      </div>

      <div className="row g-3">
        {filtered.map(e => (
          <div key={e._id} className="col-12">
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="card-title mb-0">{e.title}</h5>
                    <p className="small text-muted">Ended: {new Date(e.endDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="row g-3">
                  {e.winners.map((w, idx) => (
                    <div key={`${e._id}-${w.position}-${idx}`} className="col-12 col-md-6 col-lg-4">
                      <div className="card h-100 shadow-sm" role="button" tabIndex={0} onKeyPress={(ev) => { if (ev.key === 'Enter') {/* noop */} }}>
                        <div className="card-body d-flex align-items-start gap-3">
                          <div>
                            <img
                              src={getImageUrl((w.candidate && w.candidate.photo) || '')}
                              alt={w.candidate?.name || ''}
                              onError={(ev) => { ev.target.style.display = 'none'; }}
                              style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', marginRight: 12 }}
                            />
                          </div>

                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <div className="fw-bold" style={{ fontSize: '0.98rem' }}>🏆 {w.candidate?.name}</div>
                              <span className="badge bg-success" style={{ fontSize: '0.75rem' }}>{w.position}</span>
                            </div>
                            <div className="small text-muted mb-2">{w.candidate?.party || 'Independent'}</div>
                            <div className="small text-secondary">Votes: {w.candidate?.votes || w.candidate?.voteCount || 0}</div>
                          </div>
                        </div>
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
