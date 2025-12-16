import React from 'react';
import { FaCheckCircle, FaCalendarAlt, FaClock, FaUsers, FaUnlock, FaVoteYea, FaLock, FaEye, FaStar } from 'react-icons/fa';
import getImageUrl from '../../utils/getImageUrl';

export default function ElectionCard({
  election,
  myVotes = [],
  handleVote,
  openElectionDetails,
  getElectionStatus,
  formatTimeRemaining,
}) {
  const approvedCandidates = (election.candidates || []).filter((c) => c.status === 'approved');
  const voted = myVotes.some((v) => v.election === (election._id || election.id));
  const { status, color, icon: StatusIcon } = getElectionStatus(election);

  return (
    <div key={election._id || election.id} className="col-12">
      <div className="card border-1 shadow-sm mb-3" style={{ borderRadius: '12px', background: '#f1f3f5', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div className="card-body p-3 p-md-4">
          {/* Election Header */}
          <div className="row mb-3">
            <div className="col-12 col-md-8">
              <div className="d-flex flex-column flex-sm-row align-items-start gap-2 mb-2">
                <h4 className="fw-bold mb-0 flex-grow-1">{election.title || election.name}</h4>
                <div className="d-flex gap-2 flex-wrap">
                  <span className={`badge bg-${color} d-flex align-items-center gap-1`}>
                    <StatusIcon size={12} />
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                  {voted && (
                    <span className="badge bg-success d-flex align-items-center gap-1">
                      <FaCheckCircle size={12} />
                      Voted
                    </span>
                  )}
                </div>
              </div>
              <p className="text-muted mb-2 small">{election.description}</p>

              {/* Election Dates */}
              <div className="row g-2 mb-3">
                <div className="col-sm-6">
                  <small className="text-muted d-flex align-items-center gap-1">
                    <FaCalendarAlt /> Start: {election.startDate ? new Date(election.startDate).toLocaleDateString() : 'N/A'}
                  </small>
                </div>
                <div className="col-sm-6">
                  <small className="text-muted d-flex align-items-center gap-1">
                    <FaClock /> {formatTimeRemaining(election.endDate)}
                  </small>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4 d-flex justify-content-end">
              <button
                className="btn btn-outline-primary btn-sm w-100 w-md-auto"
                onClick={() => openElectionDetails(election)}
              >
                <FaEye className="me-1" /> Details
              </button>
            </div>
          </div>

          {/* Candidates Section */}
          <div>
            <div className="d-flex flex-column flex-sm-row align-items-start align-sm-center justify-content-between mb-3 gap-2">
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-1">
                <FaUsers /> Candidates ({approvedCandidates.length})
              </h6>
              {status === 'active' && !voted && (
                <small className="text-success d-flex align-items-center gap-1">
                  <FaUnlock />
                  Voting is open!
                </small>
              )}
            </div>

            {approvedCandidates.length > 0 ? (
              <div className="row g-2">
                {approvedCandidates.map((candidate) => (
                  <div className="col-sm-6 col-lg-4" key={candidate._id || candidate.id}>
                    <div className="card border shadow-sm h-100" style={{ borderRadius: '10px', background: voted ? '#f8f9fa' : 'white', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
                      <div className="card-body" style={{ padding: window.innerWidth <= 768 ? '0.75rem' : '1rem' }}>
                        <div className="d-flex align-items-center mb-2">
                          <img
                            src={(function(){ const s = getImageUrl(candidate.photo || '/default-avatar.png'); return s; })()}
                            alt={candidate.name}
                            style={{
                              width: 35,
                              height: 35,
                              objectFit: 'cover',
                              borderRadius: '50%',
                              border: '2px solid #e5e7eb',
                            }}
                            className="me-2 flex-shrink-0"
                          />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div className="fw-semibold text-truncate" title={candidate.name}>{candidate.name}</div>
                            <div className="small text-muted text-truncate">{candidate.party || 'Independent'}</div>
                            {typeof candidate.votes === 'number' && (
                              <div className="small text-primary">
                                <FaStar className="me-1" />
                                {candidate.votes} votes
                              </div>
                            )}
                          </div>
                        </div>

                        {voted ? (
                          <button className="btn btn-success btn-sm w-100 disabled">
                            <FaCheckCircle className="me-1" /> Voted
                          </button>
                        ) : status === 'active' ? (
                          <button
                            className="btn btn-primary btn-sm w-100"
                            onClick={() => handleVote(
                              election._id || election.id,
                              candidate._id || candidate.id,
                              candidate.position,
                              Array.isArray(election.positions) && election.positions.length === 1 ? election.positions[0] : undefined
                            )}
                          >
                            <FaVoteYea className="me-1" /> Vote
                          </button>
                        ) : (
                          <button className="btn btn-secondary btn-sm w-100 disabled">
                            <FaLock className="me-1" /> {status === 'upcoming' ? 'Not Started' : 'Ended'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 border rounded" style={{ background: '#f8f9fa' }}>
                <FaUsers className="text-muted mb-2" size={24} />
                <div className="text-muted">No approved candidates yet</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
