import React, { useState } from 'react';
import { 
  FaCheckCircle, FaCalendarAlt, FaClock, FaUsers, FaUnlock, 
  FaVoteYea, FaLock, FaEye, FaStar, FaFlag, FaUserTie,
  FaBalanceScale, FaHandshake, FaLeaf, FaIndustry,
  FaTrophy, FaHeart, FaGraduationCap, FaSpinner
} from 'react-icons/fa';
import getImageUrl from '../../utils/getImageUrl';
import axiosInstance from '../../utils/axiosInstance';

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
  myVotes = [],
  openElectionDetails,
  getElectionStatus,
  formatTimeRemaining,
  setSelectedElection,
  setSelectedCandidateForVoting,
  setShowVotingModal,
  setVotingStep,
}) {
  // ✅ State for multi-position checkbox voting
  const [selectedVotes, setSelectedVotes] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const approvedCandidates = (election.candidates || []).filter((c) => c.status === 'approved');

  const getCandidatePosition = (candidate) => {
    const position = candidate?.position || candidate?.role || candidate?.post || 'Unspecified Position';
    return String(position).trim() || 'Unspecified Position';
  };

  const groupedCandidates = (() => {
    const byPosition = new Map();

    approvedCandidates.forEach((candidate) => {
      const position = getCandidatePosition(candidate);
      if (!byPosition.has(position)) {
        byPosition.set(position, []);
      }
      byPosition.get(position).push(candidate);
    });

    const orderedGroups = [];
    const seenPositions = new Set();

    if (Array.isArray(election.positions)) {
      election.positions.forEach((position) => {
        const normalizedPosition = String(position).trim();
        if (byPosition.has(normalizedPosition)) {
          orderedGroups.push({
            position: normalizedPosition,
            candidates: byPosition.get(normalizedPosition).sort((a, b) => (a.name || '').localeCompare(b.name || '')),
          });
          seenPositions.add(normalizedPosition);
        }
      });
    }

    byPosition.forEach((candidates, position) => {
      if (!seenPositions.has(position)) {
        orderedGroups.push({
          position,
          candidates: candidates.sort((a, b) => (a.name || '').localeCompare(b.name || '')),
        });
      }
    });

    return orderedGroups;
  })();
  
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

  // ✅ Check if this is a multi-position election (multiple positions available)
  const isMultiPositionElection = groupedCandidates.length > 1;

  // ✅ Toggle checkbox selection for a candidate
  const handleToggleCandidate = (position, candidateId) => {
    setSelectedVotes(prev => {
      const updated = { ...prev };
      if (updated[position] === candidateId) {
        // Deselect if already selected
        delete updated[position];
      } else {
        // Select this candidate for this position
        updated[position] = candidateId;
      }
      return updated;
    });
  };

  // ✅ Submit all selected votes at once
  const handleSubmitBatchVotes = async () => {
    if (Object.keys(selectedVotes).length === 0) return;
    
    setIsSubmitting(true);
    try {
      const votes = Object.entries(selectedVotes).map(([position, candidateId]) => ({
        position,
        candidateId,
        abstain: false
      }));

      await axiosInstance.post('/api/votes/batch', {
        electionId: election._id || election.id,
        votes
      });

      // Success - reset and refresh
      setSelectedVotes({});
      window.location.reload(); // Refresh to show updated votes
    } catch (err) {
      console.error('Batch vote submission failed:', err);
      alert(`Error submitting votes: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                Candidates by Position ({approvedCandidates.length})
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

            {groupedCandidates.length > 0 ? (
              <div className="d-flex flex-column gap-4">
                {groupedCandidates.map((group) => (
                  <div key={group.position}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                        <span className="badge bg-primary px-3 py-2" style={{ fontSize: '0.8rem' }}>
                          {group.position}
                        </span>
                      </h6>
                      <span className="text-muted small">{group.candidates.length} candidate{group.candidates.length !== 1 ? 's' : ''}</span>
                    </div>

                    <div className="row g-2">
                      {group.candidates.map((candidate) => {
                        const partyInfo = getPartyInfo(candidate.party);
                        const PartyIcon = partyInfo.icon;
                        const candidatePosition = getCandidatePosition(candidate);

                        return (
                          <div className="col-12 col-lg-6" key={candidate._id || candidate.id}>
                            <div className="card border shadow-sm h-100" style={{ 
                              borderRadius: '8px', 
                              background: voted ? '#f8f9fa' : 'white',
                              borderColor: voted ? '#28a745' : '#0d6efd',
                              borderWidth: '2px',
                              transition: 'all 0.2s ease'
                            }}>
                              <div className="w-100" style={{ 
                                height: '3px', 
                                background: voted ? '#28a745' : 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(29, 78, 216) 100%)'
                              }}></div>

                              <div className="card-body p-3">
                                <div className="d-flex align-items-center mb-2">
                                  <div className="position-relative me-2">
                                    <img
                                      src={getImageUrl(candidate.photo || '/default-avatar.png')}
                                      alt={candidate.name}
                                      style={{
                                        width: 60,
                                        height: 60,
                                        objectFit: 'cover',
                                        borderRadius: '50%',
                                        border: `2px solid ${voted ? '#28a745' : '#0d6efd'}`,
                                      }}
                                      className="flex-shrink-0"
                                    />
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
                                    <div className="d-flex align-items-center flex-wrap gap-1 mb-1">
                                      <span className="badge rounded-pill bg-success px-3 py-1" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', letterSpacing: 0.2, whiteSpace: 'nowrap' }}>
                                        {candidatePosition}
                                      </span>
                                      {candidate.symbol && (
                                        <span className="badge rounded-pill bg-warning text-dark px-2 py-1 d-flex align-items-center gap-1" style={{ fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap', border: '1px solid #ffc107' }}>
                                          <FaStar className="me-1" size={12} style={{ color: '#f59e42' }} />
                                          <span style={{ fontWeight: 700 }}>{candidate.symbol}</span>
                                        </span>
                                      )}
                                    </div>
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

                                <div className="mt-2">
                                  {/* ✅ Multi-Position: Show Checkbox */}
                                  {isMultiPositionElection && !voted && status === 'active' ? (
                                    <label className="d-flex align-items-center gap-2 mb-0 cursor-pointer" style={{ cursor: 'pointer' }}>
                                      <input
                                        type="checkbox"
                                        className="form-check-input"
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        checked={selectedVotes[candidatePosition] === (candidate._id || candidate.id)}
                                        onChange={() => handleToggleCandidate(candidatePosition, candidate._id || candidate.id)}
                                      />
                                      <span className="fw-semibold" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                                        {selectedVotes[candidatePosition] === (candidate._id || candidate.id) ? 'Selected' : 'Select'}
                                      </span>
                                    </label>
                                  ) : voted ? (
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
                                        console.log('Candidate data:', candidate);
                                        console.log('Election data:', election);

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
                  </div>
                ))}
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

            {/* ✅ Sticky Footer with Submit/Clear Buttons - Always Visible */}
            {isMultiPositionElection && !voted && status === 'active' && (
              <div 
                className="mt-4 pt-3 border-top"
                style={{
                  background: '#f8f9fa',
                  padding: '12px 0',
                  marginLeft: '-12px',
                  marginRight: '-12px',
                  marginBottom: '-12px',
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  borderTop: '1px solid #dee2e6'
                }}
              >
                {/* Selection Counter */}
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <FaVoteYea size={14} style={{ color: '#28a745' }} />
                    <span className="fw-semibold" style={{ fontSize: '0.95rem', color: '#28a745' }}>
                      {Object.keys(selectedVotes).length} {Object.keys(selectedVotes).length === 1 ? 'position' : 'positions'} selected
                    </span>
                  </div>
                  <small className="text-muted">{groupedCandidates.length - Object.keys(selectedVotes).length} to go</small>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-2 justify-content-end">
                  {/* Clear Button */}
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    style={{ 
                      borderRadius: '4px',
                      borderColor: '#6c757d',
                      color: '#6c757d'
                    }}
                    onClick={() => setSelectedVotes({})}
                    disabled={Object.keys(selectedVotes).length === 0}
                  >
                    Clear
                  </button>

                  {/* Submit Button */}
                  <button
                    className="btn btn-success btn-sm"
                    style={{ 
                      borderRadius: '4px',
                      background: Object.keys(selectedVotes).length > 0 
                        ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' 
                        : '#ccc',
                      border: 'none',
                      cursor: Object.keys(selectedVotes).length > 0 ? 'pointer' : 'not-allowed'
                    }}
                    disabled={isSubmitting || Object.keys(selectedVotes).length === 0}
                    onClick={handleSubmitBatchVotes}
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="me-2" size={12} /> 
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaVoteYea className="me-2" size={12} />
                        Submit {Object.keys(selectedVotes).length}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
