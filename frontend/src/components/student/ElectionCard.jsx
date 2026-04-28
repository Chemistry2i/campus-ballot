import React from 'react';
import { 
  FaCheckCircle, FaCalendarAlt, FaClock, FaUsers, FaUnlock, 
  FaVoteYea, FaLock, FaEye, FaStar, FaFlag, FaUserTie,
  FaBalanceScale, FaHandshake, FaLeaf, FaIndustry,
  FaTrophy, FaHeart, FaGraduationCap
} from 'react-icons/fa';
import getImageUrl from '../../utils/getImageUrl';

// Helper function to get party symbol and color
const getPartyInfo = (partyName) => {
  if (!partyName || partyName.toLowerCase() === 'independent') {
    return { icon: FaUserTie, color: '#6c757d', bgColor: '#f8f9fa' };
  }
  
  const party = partyName.toLowerCase();
  if (party.includes('democrat') || party.includes('blue')) {
    return { icon: FaBalanceScale, color: '#0d6efd', bgColor: '#e7f1ff' };
  } else if (party.includes('republican') || party.includes('red')) {
    return { icon: FaFlag, color: '#dc3545', bgColor: '#f8d7da' };
  } else if (party.includes('green') || party.includes('environment')) {
    return { icon: FaLeaf, color: '#198754', bgColor: '#d1e7dd' };
  } else if (party.includes('labor') || party.includes('worker')) {
    return { icon: FaIndustry, color: '#fd7e14', bgColor: '#ffeaa7' };
  } else if (party.includes('liberal') || party.includes('progressive')) {
    return { icon: FaHeart, color: '#e83e8c', bgColor: '#f7d6e6' };
  } else if (party.includes('student') || party.includes('education')) {
    return { icon: FaGraduationCap, color: '#6f42c1', bgColor: '#e2d9f3' };
  } else {
    return { icon: FaHandshake, color: '#20c997', bgColor: '#d1ecf1' };
  }
};

export default function ElectionCard({
  election,
  user,
  myVotes = [],
  handleVote,
  openElectionDetails,
  getElectionStatus,
  formatTimeRemaining,
  setSelectedElection,
  setSelectedCandidateForVoting,
  setShowVotingModal,
  setVotingStep,
}) {
  const approvedCandidates = (election.candidates || []).filter((c) => c.status === 'approved');
  
  // Check if user's faculty is eligible for this election
  const isEligibleByFaculty = !election.allowedFaculties || 
    election.allowedFaculties.length === 0 || 
    (user?.faculty && election.allowedFaculties.includes(user.faculty));
  
  // More precise vote checking - check if user voted for this specific election and position
  const voted = myVotes.some((vote) => {
    const voteElectionId = vote.election?._id || vote.election?.id || vote.election;
    const electionId = election._id || election.id;
    return voteElectionId === electionId;
  });
  
  console.log('Vote check for election', election.title, ':', {
    voted,
    myVotes: myVotes.length,
    electionId: election._id || election.id,
    myVoteElections: myVotes.map(v => ({
      electionId: v.election?._id || v.election?.id || v.election,
      position: v.position
    }))
  });
  
  const { status, color, icon: StatusIcon } = getElectionStatus(election);

  return (
    <div key={election._id || election.id} className="col-12">
      <div className="card border shadow-sm mb-3" style={{ 
        borderRadius: '8px', 
        background: '#f1f3f5', 
        overflow: 'hidden', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e9ecef'
      }}>
        {/* Election Status Bar */}
        <div className={`bg-${color} text-white px-3 py-2 d-flex align-items-center justify-content-between`} style={{ borderRadius: '8px 8px 0 0' }}>
          <div className="d-flex align-items-center gap-2">
            <StatusIcon size={14} />
            <span className="fw-semibold small">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
          </div>
          {voted && (
            <div className="d-flex align-items-center gap-1">
              <FaCheckCircle size={12} />
              <span className="small">Voted</span>
            </div>
          )}
        </div>

        <div className="card-body p-3">
          {/* Election Header - Consistent Blue Theme */}
          <div className="d-flex flex-column flex-md-row align-items-start justify-content-between gap-3 mb-3">
            <div className="flex-grow-1">
              <h5 className="fw-bold mb-2" style={{ color: '#0d6efd' }}>{election.title || election.name}</h5>
              {election.description && (
                <p className="text-muted mb-0 small" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: '1.4'
                }}>
                  {election.description}
                </p>
              )}
            </div>
            <button
              className="btn btn-outline-primary btn-sm px-3"
              onClick={() => openElectionDetails(election)}
              style={{ borderRadius: '4px' }}
            >
              <FaEye className="me-1" /> View Details
            </button>
          </div>

          {/* Election Info Cards with Borders */}
          <div className="row g-2 mb-3">
            <div className="col-6">
              <div className="border rounded p-2 text-center" style={{ 
                borderRadius: '4px',
                background: 'linear-gradient(135deg, #e7f1ff 0%, #cce7ff 100%)',
                borderColor: '#b3d7ff'
              }}>
                <FaCalendarAlt className="text-primary mb-1" size={14} />
                <div className="small fw-semibold">Start Date</div>
                <div className="small text-muted">
                  {election.startDate ? new Date(election.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  }) : 'TBD'}
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="border rounded p-2 text-center" style={{ 
                borderRadius: '4px',
                background: 'linear-gradient(135deg, #e7f1ff 0%, #cce7ff 100%)',
                borderColor: '#b3d7ff'
              }}>
                <FaClock className="text-primary mb-1" size={14} />
                <div className="small fw-semibold">Time Left</div>
                <div className="small text-muted">{formatTimeRemaining(election.endDate)}</div>
              </div>
            </div>
          </div>

          {/* Faculty Eligibility Notice - Only show as info since ineligible users won't see this election */}
          {election.allowedFaculties && election.allowedFaculties.length > 0 && (
            <div className="alert alert-info py-2 px-3 mb-3" style={{ fontSize: '0.85rem', borderRadius: '6px' }}>
              <div className="d-flex align-items-start gap-2">
                <FaUsers className="mt-1" size={14} />
                <div>
                  <strong>Open to:</strong>{' '}
                  {election.allowedFaculties.length === 1 
                    ? election.allowedFaculties[0]
                    : election.allowedFaculties.slice(0, -1).join(', ') + ' and ' + election.allowedFaculties[election.allowedFaculties.length - 1]
                  }
                </div>
              </div>
            </div>
          )}

          {/* Candidates Section with Enhanced Design */}
          <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                  <FaUsers size={12} />
                </div>
                Candidates ({approvedCandidates.length})
              </h6>
              {status === 'active' && !voted && (
                <span className="badge d-flex align-items-center gap-1 px-2 py-1" style={{ 
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  color: 'white'
                }}>
                  <FaUnlock size={10} />
                  Voting Open
                </span>
              )}
            </div>

            {approvedCandidates.length > 0 ? (
              <div className="row g-2">
                {approvedCandidates.map((candidate) => {
                  const partyInfo = getPartyInfo(candidate.party);
                  const PartyIcon = partyInfo.icon;
                  
                  return (
                    <div className="col-sm-6" key={candidate._id || candidate.id}>
                      <div className="card border shadow-sm h-100" style={{ 
                        borderRadius: '8px', 
                        background: voted ? '#f8f9fa' : 'white',
                        borderColor: voted ? '#28a745' : '#0d6efd',
                        borderWidth: '2px',
                        transition: 'all 0.2s ease'
                      }}>
                        {/* Blue Color Strip */}
                        <div className="w-100" style={{ 
                          height: '3px', 
                          background: voted ? '#28a745' : 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(29, 78, 216) 100%)'
                        }}></div>
                        
                        <div className="card-body p-3">
                          {/* Candidate Header */}
                          <div className="d-flex align-items-center mb-2">
                            <div className="position-relative me-2">
                              <img
                                src={(function(){ const s = getImageUrl(candidate.photo || '/default-avatar.png'); return s; })()}
                                alt={candidate.name}
                                style={{
                                  width: 40,
                                  height: 40,
                                  objectFit: 'cover',
                                  borderRadius: '50%',
                                  border: `2px solid ${voted ? '#28a745' : '#0d6efd'}`,
                                }}
                                className="flex-shrink-0"
                              />
                              {/* Party Symbol Badge with Blue Theme */}
                              <div 
                                className="position-absolute bottom-0 end-0 rounded-circle d-flex align-items-center justify-content-center"
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  background: voted ? '#28a745' : 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(29, 78, 216) 100%)',
                                  border: '2px solid white'
                                }}
                              >
                                <PartyIcon size={8} color="white" />
                              </div>
                            </div>
                            
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div className="fw-bold text-truncate mb-1" title={candidate.name} style={{ fontSize: '0.95rem', lineHeight: 1.2 }}>
                                {candidate.name}
                              </div>
                              {/* Candidate Position - prominent and responsive */}
                              <div className="d-flex align-items-center flex-wrap gap-1 mb-1">
                                {candidate.position || candidate.role || candidate.post ? (
                                  <span className="badge bg-info text-dark px-2 py-1" style={{ fontSize: '0.72rem', fontWeight: 600, borderRadius: '6px', whiteSpace: 'nowrap' }}>
                                    {(candidate.position || candidate.role || candidate.post)}
                                  </span>
                                ) : null}
                                {/* Candidate Symbol (if any) */}
                                {candidate.symbol && (
                                  <span className="badge bg-secondary px-2 py-1 d-flex align-items-center gap-1" style={{ fontSize: '0.7rem', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                                    <FaStar className="me-1 text-warning" size={10} />
                                    {candidate.symbol}
                                  </span>
                                )}
                              </div>
                              {/* Party badge */}
                              <div className="d-flex align-items-center gap-1 mb-1">
                                <div 
                                  className="px-2 py-1 rounded-pill d-flex align-items-center gap-1"
                                  style={{ 
                                    background: voted ? '#d4edda' : 'linear-gradient(135deg, #e7f1ff 0%, #cce7ff 100%)',
                                    color: voted ? '#155724' : '#0d6efd',
                                    fontSize: '0.7rem',
                                    fontWeight: '600',
                                    border: `1px solid ${voted ? '#c3e6cb' : '#b3d7ff'}`
                                  }}
                                >
                                  <PartyIcon size={8} />
                                  {candidate.party || 'Independent'}
                                </div>
                              </div>
                              {typeof candidate.votes === 'number' && (
                                <div className="d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                                  <FaTrophy className="text-warning" size={10} />
                                  <span className="text-muted">{candidate.votes} votes</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="mt-2">
                            {voted ? (
                              <button className="btn btn-success btn-sm w-100 disabled" style={{ borderRadius: '4px' }}>
                                <FaCheckCircle className="me-1" size={12} /> 
                                <span className="fw-semibold">Voted</span>
                              </button>
                            ) : status === 'active' ? (
                              <button
                                className="btn btn-primary btn-sm w-100"
                                style={{ 
                                  borderRadius: '4px',
                                  background: 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(29, 78, 216) 100%)',
                                  border: 'none'
                                }}
                                onClick={() => {
                                  // Debug candidate data to see what's available
                                  console.log('Candidate data:', candidate);
                                  console.log('Election data:', election);
                                  
                                  // Get position from multiple possible sources
                                  const candidatePosition = candidate.position || candidate.role || candidate.post;
                                  const electionPosition = Array.isArray(election.positions) && election.positions.length === 1 ? election.positions[0] : null;
                                  const electionFirstPosition = Array.isArray(election.positions) && election.positions.length > 0 ? election.positions[0] : null;
                                  
                                  console.log('Position sources:', {
                                    candidatePosition,
                                    electionPosition,
                                    electionFirstPosition,
                                    electionPositions: election.positions
                                  });
                                  
                                  // Set modal state first, then call vote function
                                  setSelectedElection(election);
                                  setSelectedCandidateForVoting(candidate);
                                  setShowVotingModal(true);
                                  setVotingStep(1);
                                }}
                              >
                                <FaVoteYea className="me-1" size={12} /> 
                                <span className="fw-semibold">Vote Now</span>
                              </button>
                            ) : (
                              <button className="btn btn-secondary btn-sm w-100 disabled" style={{ borderRadius: '4px' }}>
                                <FaLock className="me-1" size={12} /> 
                                {status === 'upcoming' ? 'Coming Soon' : 'Election Ended'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 border rounded" style={{ 
                background: '#f1f3f5',
                borderStyle: 'dashed !important',
                borderRadius: '4px',
                borderColor: '#dee2e6'
              }}>
                <div className="mb-2">
                  <FaUsers className="text-muted" size={32} />
                </div>
                <h6 className="text-muted mb-1">No Candidates Yet</h6>
                <small className="text-muted">Candidates will appear here once approved</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
