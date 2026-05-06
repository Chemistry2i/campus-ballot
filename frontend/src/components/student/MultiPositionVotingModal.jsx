import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaLock, FaSearch, FaArrowRight, FaCheck } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';

/**
 * Multi-Position Voting Modal
 * Allows voting for multiple positions in a single election
 * Features:
 * - Show all positions with status (not voted, selected, already voted)
 * - Select candidates for each position
 * - Preview all selections before submitting
 * - Submit all votes at once (batch)
 */
function MultiPositionVotingModal({
  election,
  myVotes = [],
  setShowMultiVotingModal,
  onVotesSuccess,
  colors,
  isDarkMode
}) {
  const [step, setStep] = useState('positions'); // 'positions', 'select-candidate', 'preview', 'submitting', 'success'
  const [selectedPositions, setSelectedPositions] = useState({}); // { position: candidateId }
  const [candidates, setCandidates] = useState({});
  const [currentPosition, setCurrentPosition] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Get already-voted positions for this election
  const votedPositions = myVotes
    .filter(v => v.election === election._id || v.election?._id === election._id)
    .map(v => v.position);

  // Get all positions for this election
  const allPositions = election.positions || [];

  // Get available positions (not yet voted)
  const availablePositions = allPositions.filter(p => !votedPositions.includes(p));

  // Get selected positions (at least one candidate selected)
  const selectedPositionsList = Object.keys(selectedPositions);

  // Load candidates on mount
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/elections/${election._id}/candidates`);
        const candidatesByPosition = {};
        
        response.data.forEach(candidate => {
          const pos = candidate.position || 'Unspecified';
          if (!candidatesByPosition[pos]) {
            candidatesByPosition[pos] = [];
          }
          candidatesByPosition[pos].push(candidate);
        });

        setCandidates(candidatesByPosition);
        setLoading(false);
      } catch (err) {
        console.error('Error loading candidates:', err);
        setError('Failed to load candidates');
        setLoading(false);
      }
    };

    loadCandidates();
  }, [election._id]);

  // Handle selecting a candidate for a position
  const handleSelectCandidate = (position, candidateId) => {
    setSelectedPositions(prev => ({
      ...prev,
      [position]: candidateId
    }));
    setStep('positions'); // Return to positions list
  };

  // Handle abstain for a position
  const handleAbstain = (position) => {
    setSelectedPositions(prev => ({
      ...prev,
      [position]: 'ABSTAIN'
    }));
    setStep('positions');
  };

  // Submit all votes at once
  const handleSubmitBatch = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Convert selections to vote array
      const votes = Object.entries(selectedPositions).map(([position, candidateId]) => ({
        position,
        candidateId: candidateId === 'ABSTAIN' ? null : candidateId,
        abstain: candidateId === 'ABSTAIN'
      }));

      if (votes.length === 0) {
        setError('Please select at least one candidate');
        setSubmitting(false);
        return;
      }

      const response = await axiosInstance.post('/api/votes/batch', {
        electionId: election._id,
        votes
      });

      setSubmitting(false);
      setStep('success');

      // Clear selections after success
      setTimeout(() => {
        setShowMultiVotingModal(false);
        onVotesSuccess?.();
      }, 2000);
    } catch (err) {
      console.error('Batch voting error:', err);
      setError(err.response?.data?.message || 'Failed to submit votes');
      setSubmitting(false);
    }
  };

  // Render positions step
  const renderPositionsStep = () => (
    <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
      {availablePositions.length === 0 ? (
        <div className="text-center py-5">
          <FaLock size={48} className="text-muted mb-3" />
          <h5 className="text-muted">No positions available</h5>
          <p className="text-muted small">You have already voted for all positions in this election</p>
        </div>
      ) : (
        <div className="row g-3">
          {/* Already Voted Positions */}
          {votedPositions.length > 0 && (
            <div className="col-12 mb-3">
              <h6 className="text-success fw-bold d-flex align-items-center gap-2 mb-2">
                <FaCheckCircle /> Already Voted ({votedPositions.length})
              </h6>
              <div className="row g-2">
                {votedPositions.map(position => (
                  <div key={position} className="col-12">
                    <div
                      className="p-3 rounded"
                      style={{
                        background: isDarkMode ? '#1a472a' : '#d4edda',
                        border: '1px solid #28a745',
                        opacity: 0.7
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <h6 className="mb-1 text-success fw-bold">{position}</h6>
                          <small className="text-muted">Already voted for this position</small>
                        </div>
                        <FaCheckCircle size={20} className="text-success" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Positions */}
          {availablePositions.length > 0 && (
            <div className="col-12">
              <h6 className="fw-bold d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-primary">{availablePositions.length}</span>
                Positions to Vote For
              </h6>
              <div className="row g-2">
                {availablePositions.map(position => {
                  const isSelected = selectedPositionsList.includes(position);
                  const selectedCandidate = selectedPositions[position];
                  const candidateData = selectedCandidate && selectedCandidate !== 'ABSTAIN'
                    ? candidates[position]?.find(c => c._id === selectedCandidate)
                    : null;

                  return (
                    <div key={position} className="col-12">
                      <div
                        className="p-3 rounded cursor-pointer"
                        style={{
                          background: isSelected
                            ? isDarkMode ? '#1a472a' : '#d4edda'
                            : isDarkMode ? colors.cardBackground : colors.surfaceHover,
                          border: `2px solid ${isSelected ? '#28a745' : colors.border}`,
                          transition: 'all 0.2s',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setCurrentPosition(position);
                          setStep('select-candidate');
                          setSearchTerm('');
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="flex-grow-1">
                            <h6 className="mb-1 fw-bold">{position}</h6>
                            {isSelected ? (
                              <div>
                                {selectedCandidate === 'ABSTAIN' ? (
                                  <small className="text-muted">✓ Abstaining from this position</small>
                                ) : (
                                  <small className="text-success">
                                    ✓ Selected: <strong>{candidateData?.name || 'Unknown'}</strong>
                                  </small>
                                )}
                              </div>
                            ) : (
                              <small className="text-muted">Click to select candidate</small>
                            )}
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            {isSelected && (
                              <FaCheckCircle size={18} className="text-success" />
                            )}
                            <FaArrowRight size={14} className="text-muted" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Render select candidate step
  const renderSelectCandidateStep = () => {
    const positionCandidates = (candidates[currentPosition] || []).filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <div className="mb-3">
          <h6 className="mb-3 fw-bold">Select candidate for: <span className="text-primary">{currentPosition}</span></h6>
          
          {/* Search */}
          <div className="input-group mb-3">
            <span className="input-group-text bg-light border-end-0">
              <FaSearch className="text-muted" size={12} />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={isDarkMode ? {
                backgroundColor: colors.cardBackground,
                color: colors.text,
                borderColor: colors.border
              } : {}}
            />
          </div>

          {/* Candidates List */}
          <div className="row g-2">
            {positionCandidates.map(candidate => (
              <div key={candidate._id} className="col-12">
                <div
                  className="p-3 rounded border cursor-pointer"
                  style={{
                    background: isDarkMode ? colors.cardBackground : colors.surfaceHover,
                    border: `1px solid ${colors.border}`,
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSelectCandidate(currentPosition, candidate._id)}
                >
                  <div className="d-flex align-items-start gap-2">
                    <div className="flex-grow-1">
                      <h6 className="mb-1 fw-bold">{candidate.name}</h6>
                      {candidate.party && (
                        <small className="text-muted d-block mb-1">Party: {candidate.party}</small>
                      )}
                      <small className="text-muted">{candidate.description}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Abstain Option */}
            <div className="col-12 mt-3 pt-3 border-top">
              <div
                className="p-3 rounded border cursor-pointer"
                style={{
                  background: isDarkMode ? colors.cardBackground : '#f8f9fa',
                  border: `1px solid ${colors.border}`,
                  cursor: 'pointer'
                }}
                onClick={() => handleAbstain(currentPosition)}
              >
                <h6 className="mb-1 fw-bold text-secondary">
                  <FaTimesCircle className="me-2" />
                  Abstain from this position
                </h6>
                <small className="text-muted">I do not wish to vote for this position</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render preview step
  const renderPreviewStep = () => (
    <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
      <h6 className="fw-bold mb-3">Review Your Selections</h6>
      <div className="row g-2">
        {selectedPositionsList.map(position => {
          const candidateId = selectedPositions[position];
          const candidateData = candidateId === 'ABSTAIN'
            ? null
            : candidates[position]?.find(c => c._id === candidateId);

          return (
            <div key={position} className="col-12">
              <div className="p-3 rounded" style={{
                background: isDarkMode ? colors.cardBackground : colors.surfaceHover,
                border: `1px solid ${colors.border}`
              }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="mb-1 fw-bold">{position}</h6>
                    {candidateId === 'ABSTAIN' ? (
                      <small className="text-muted">Abstaining</small>
                    ) : (
                      <small className="text-success">✓ {candidateData?.name}</small>
                    )}
                  </div>
                  <FaCheck size={18} className="text-success" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render success step
  const renderSuccessStep = () => (
    <div className="modal-body p-4 text-center">
      <div className="mb-3">
        <FaCheckCircle size={64} className="text-success mb-3" />
        <h5 className="fw-bold text-success">Votes Submitted Successfully!</h5>
        <p className="text-muted">You submitted {selectedPositionsList.length} vote(s) for {election.title}</p>
      </div>
    </div>
  );

  // Main render
  if (loading) {
    return (
      <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content" style={{ backgroundColor: colors.cardBackground, color: colors.text }}>
            <div className="modal-body text-center p-5">
              <div className="spinner-border text-primary mb-3" />
              <p className="text-muted">Loading candidates...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={{ backgroundColor: colors.cardBackground, color: colors.text }}>
          {/* Header */}
          <div className="modal-header border-0 pb-0">
            <div>
              <h5 className="modal-title fw-bold">{election.title}</h5>
              <small className="text-muted">
                {step === 'positions' && `${availablePositions.length} position(s) available • ${selectedPositionsList.length} selected`}
                {step === 'select-candidate' && `Voting for: ${currentPosition}`}
                {step === 'preview' && `Review ${selectedPositionsList.length} vote(s)`}
                {step === 'success' && 'Success!'}
              </small>
            </div>
            {step !== 'submitting' && step !== 'success' && (
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowMultiVotingModal(false)}
              ></button>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger m-3 mb-0">
              {error}
            </div>
          )}

          {/* Body */}
          {step === 'positions' && renderPositionsStep()}
          {step === 'select-candidate' && renderSelectCandidateStep()}
          {step === 'preview' && renderPreviewStep()}
          {step === 'success' && renderSuccessStep()}

          {/* Footer */}
          {step !== 'success' && (
            <div className="modal-footer border-0">
              {step === 'positions' && (
                <>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowMultiVotingModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  {selectedPositionsList.length > 0 && (
                    <button
                      className="btn btn-primary"
                      onClick={() => setStep('preview')}
                      disabled={submitting}
                    >
                      Review Selections ({selectedPositionsList.length})
                    </button>
                  )}
                </>
              )}
              {step === 'select-candidate' && (
                <>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setStep('positions')}
                    disabled={submitting}
                  >
                    Back
                  </button>
                </>
              )}
              {step === 'preview' && (
                <>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setStep('positions')}
                    disabled={submitting}
                  >
                    Back
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={handleSubmitBatch}
                    disabled={submitting || selectedPositionsList.length === 0}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaCheck className="me-2" />
                        Submit {selectedPositionsList.length} Vote{selectedPositionsList.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MultiPositionVotingModal;
