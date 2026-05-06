import React, { useState } from "react";
import getImageUrl from '../../utils/getImageUrl';
import axios from "axios";
import Swal from "sweetalert2";
import { FaCheckCircle, FaUserGraduate, FaVoteYea, FaUserTie, FaUsers, FaBookOpen } from "./icons";

const ElectionDetailsModal = ({ show, onClose, election, myVotes, refreshData }) => {
  const [voting, setVoting] = useState(false);

  if (!show || !election) return null;

  // Check if user has already voted in this election
  const hasVoted = myVotes.some(v => v.election && v.election._id === election._id);

  const handleVote = async candidateId => {
    setVoting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/votes",
        { electionId: election._id, candidateId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Success", "Your vote has been cast!", "success");
      refreshData();
      onClose();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to vote", "error");
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header small" style={{ borderTopLeftRadius: '5px', borderTopRightRadius: '5px' }}>
            <h5 className="modal-title fs-5">{election.title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body small" style={{padding: '1.5rem'}}>
            {/* Set border radius for modal body */}
            <div className="mb-2">
              <FaBookOpen className="me-1 text-primary" />
              <strong>Description:</strong> <span className="text-muted fs-6">{election.description}</span>
            </div>
            <div className="mb-2 small">
              <FaCheckCircle className="me-1 text-success" />
              <strong>Status:</strong> <span className="text-muted fs-6">{election.status?.charAt(0).toUpperCase() + election.status?.slice(1)}</span>
            </div>
            <div className="mb-2 small d-flex align-items-center gap-3">
              <FaVoteYea className="me-1 text-info" />
              <span className="me-2"><strong>Start:</strong> <span className="text-muted fs-6">{election.startDate ? new Date(election.startDate).toLocaleString() : "-"}</span></span>
              <span><strong>End:</strong> <span className="text-muted fs-6">{election.endDate ? new Date(election.endDate).toLocaleString() : "-"}</span></span>
            </div>
            <div className="mb-2 small">
              <FaUserTie className="me-1 text-warning" />
              <strong>Positions:</strong> <span className="text-muted fs-6">{election.positions && election.positions.length > 0 ? election.positions.filter(p => typeof p === "string").join(", ") : "-"}</span>
            </div>
            {election.createdBy && (
              <div className="mb-2">
                <FaUserGraduate className="me-1 text-secondary" />
                <strong>Created by:</strong> <span className="fs-6">{election.createdBy.name} ({election.createdBy.email})</span>
              </div>
            )}
            {election.eligibility && (
              <div className="mb-2">
                <FaUsers className="me-1 text-secondary" />
                <strong>Eligibility:</strong> <span className="fs-6">{Object.entries(election.eligibility).filter(([k,v])=>v).map(([k,v])=>`${k}: ${v}`).join(", ") || "All students"}</span>
              </div>
            )}
            <h6 className="mt-4">Candidates</h6>
            <div className="row">
              {election.candidates && election.candidates.length > 0 ? (
                election.candidates.map((candidate, idx) => (
                  <div className="col-md-6 mb-3" key={candidate._id || idx}>
                    <div className="card h-100 shadow-sm border-0" style={{ borderRadius: '5px' }}>
                      <div className="card-body small" style={{padding: '1rem', borderRadius: '5px'}}>
                        <div className="d-flex align-items-center mb-3 fs-6">
                          <img
                            className="candidate-photo"
                            src={(function(){ const s = getImageUrl(candidate.photo) || ("https://ui-avatars.com/api/?name=" + encodeURIComponent(candidate.name)); return s; })()}
                            alt={candidate.name}
                            style={{ width: 84, height: 84, objectFit: "cover", marginRight: 16, border: "2px solid #e0e7ef" }}
                          />
                          <div style={{ width: '100%' }}>
                            <div className="d-flex align-items-center justify-content-between">
                              <div>
                                <h5 className="card-title mb-0 d-flex align-items-center">
                                  {candidate.name}
                                  {candidate.position && (
                                    <span className="badge bg-secondary ms-2" style={{ fontSize: '0.65rem' }}>{candidate.position}</span>
                                  )}
                                </h5>
                              </div>
                              {candidate.symbol && (
                                <img
                                  src={getImageUrl(candidate.symbol)}
                                  alt={candidate.party || 'Symbol'}
                                  style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid #e9ecef', marginLeft: 12 }}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                        {candidate.party && <div className="mb-1"><strong>Party:</strong> {candidate.party}</div>}
                        {candidate.votes !== undefined && <div className="mb-1"><strong>Votes:</strong> {candidate.votes}</div>}
                        {candidate.description && <div className="mb-1"><strong>About:</strong> {candidate.description}</div>}
                        {candidate.manifesto && <div className="mb-2"><strong>Manifesto:</strong> <span className="text-muted">{candidate.manifesto}</span></div>}
                        {hasVoted ? (
                          <button className="btn btn-success btn-sm w-100 mt-2 disabled d-flex align-items-center justify-content-center gap-2" style={{ borderRadius: '4px' }} disabled>
                            <FaCheckCircle className="me-1" size={14} />
                            <span className="fw-semibold">Voted</span>
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm w-100 mt-2"
                            disabled={voting}
                            onClick={() => handleVote(candidate._id)}
                          >
                            {voting ? "Voting..." : "Vote"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted">No candidates available.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionDetailsModal;
