import React, { useEffect, useMemo, useState } from 'react';
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
  const allPositions = useMemo(() => {
    const setPos = new Set();
    winners.forEach(e => e.winners && e.winners.forEach(w => setPos.add(w.position)));
    return ['all', ...Array.from(setPos)];
  }, [winners]);

  const filtered = useMemo(() => {
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

  if (loading) {
    return (
      <div className="container py-4">
        <div className="mb-4 p-4 rounded-4 border shadow-sm text-center" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f4f8ff 100%)' }}>
          <div className="spinner-border text-success mb-3" role="status" aria-label="Loading winners"></div>
          <h2 className="mb-1 fw-bold" style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', letterSpacing: '-0.03em', color: '#0f172a' }}>
            Loading Election Winners
          </h2>
          <p className="mb-0 text-muted">Fetching official results and winner details...</p>
        </div>

        <div className="row g-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="col-12 col-md-6 col-lg-4">
              <div className="card shadow-sm h-100 placeholder-glow">
                <div className="card-body">
                  <div className="d-flex align-items-start gap-3">
                    <div className="placeholder rounded-circle" style={{ width: 96, height: 96 }}></div>
                    <div className="flex-grow-1">
                      <div className="placeholder col-7 mb-2" style={{ height: 16 }}></div>
                      <div className="placeholder col-5 mb-3" style={{ height: 12 }}></div>
                      <div className="placeholder col-4 mb-2" style={{ height: 12 }}></div>
                      <div className="placeholder col-6 mb-3" style={{ height: 12 }}></div>
                      <div className="placeholder col-12" style={{ height: 8 }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (error) return <div className="alert alert-danger">{error}</div>;

  const getWinnerPercentage = (winner) => {
    const percentage = Number(winner?.percentage ?? winner?.candidate?.percentage ?? winner?.candidate?.votePercentage ?? winner?.candidate?.percentageOfVotes);
    return Number.isFinite(percentage) ? percentage : 0;
  };

  return (
    <div className="container py-4">
      <div className="mb-4 p-4 rounded-4 border shadow-sm" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f4f8ff 100%)' }}>
        <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-2">
          <div>
            <div className="d-inline-flex align-items-center gap-2 mb-2 px-3 py-1 rounded-pill" style={{ backgroundColor: '#fff4cc', color: '#9a6b00', fontSize: '0.82rem', fontWeight: 700 }}>
              <span>🏆</span>
              <span>Official Results</span>
            </div>
            <h2 className="mb-1 fw-bold" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', letterSpacing: '-0.03em', color: '#0f172a' }}>
              Election Winners
            </h2>
            <p className="mb-0 text-muted">Published winners from completed elections</p>
          </div>
        </div>
      </div>
      {winners.length === 0 && (
        <div className="card border-0 shadow-sm text-center py-5 px-3 mb-4">
          <div className="mb-3" style={{ fontSize: '2.5rem' }}>🏆</div>
          <h4 className="fw-bold mb-2">No published winners yet</h4>
          <p className="text-muted mb-0">Once results are published, winners will appear here automatically.</p>
        </div>
      )}

      {/* Controls: Position dropdown and Sort dropdown (responsive) */}
      <div className="row g-3 g-md-4 align-items-end mb-4 mb-md-4">
        <div className="col-12 col-md-6">
          <label className="form-label small mb-2">Filter by position</label>
          <select className="form-select py-2" value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)} aria-label="Filter by position">
            {allPositions.map(pos => (
              <option key={pos} value={pos}>{pos === 'all' ? 'All Positions' : pos}</option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label small mb-2">Sort winners</label>
          <select className="form-select py-2" value={sortOption} onChange={(e) => setSortOption(e.target.value)} aria-label="Sort winners">
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
                      <div className="card h-100 shadow-sm position-relative overflow-hidden" role="button" tabIndex={0} onKeyPress={(ev) => { if (ev.key === 'Enter') {/* noop */} }}>
                        <div
                          className="position-absolute top-0 start-0 m-2 d-flex align-items-center justify-content-center"
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: '999px',
                            background: 'linear-gradient(135deg, #ffd54a 0%, #f4b400 100%)',
                            boxShadow: '0 4px 12px rgba(244, 180, 0, 0.35)',
                            zIndex: 2,
                            border: '2px solid #fff'
                          }}
                          title="Winner"
                          aria-label="Winner medal"
                        >
                          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>🏅</span>
                        </div>

                        <div className="card-body d-flex align-items-start gap-3 pe-4 pt-4">
                          <div>
                            <img
                              src={getImageUrl((w.candidate && w.candidate.photo) || '')}
                              alt={w.candidate?.name || ''}
                              onError={(ev) => { ev.target.style.display = 'none'; }}
                              style={{ width: 108, height: 108, borderRadius: '50%', objectFit: 'cover', marginRight: 12 }}
                            />
                          </div>

                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <div className="fw-bold" style={{ fontSize: '0.98rem' }}>🏆 {w.candidate?.name}</div>
                              <span className="badge rounded-pill bg-success px-3 py-2" style={{ fontSize: '0.75rem' }}>{w.position}</span>
                            </div>
                            <div className="small text-muted mb-2">{w.candidate?.party || 'Independent'}</div>
                            <div className="d-flex flex-wrap align-items-center gap-2 small text-secondary">
                              <span>Votes: {w.candidate?.votes || w.candidate?.voteCount || 0}</span>
                              <span className="badge rounded-pill text-bg-light border text-success px-3 py-2">
                                {getWinnerPercentage(w).toFixed(1)}% win share
                              </span>
                            </div>
                            <div className="mt-3">
                              <div className="d-flex justify-content-between align-items-center small mb-1">
                                <span className="text-muted">Winning percentage</span>
                                <span className="fw-bold text-success">{getWinnerPercentage(w).toFixed(1)}%</span>
                              </div>
                              <div className="progress" style={{ height: 8 }}>
                                <div
                                  className="progress-bar bg-success"
                                  role="progressbar"
                                  style={{ width: `${Math.min(getWinnerPercentage(w), 100)}%` }}
                                  aria-valuenow={getWinnerPercentage(w)}
                                  aria-valuemin="0"
                                  aria-valuemax="100"
                                />
                              </div>
                            </div>
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
