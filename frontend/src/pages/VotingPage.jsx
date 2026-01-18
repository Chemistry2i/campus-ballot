
import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import { Modal, Button, Spinner, Alert, ProgressBar } from "react-bootstrap";
import Swal from "sweetalert2";

const VotingPage = () => {
  const token = localStorage.getItem("token");
  const [positions, setPositions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [votes, setVotes] = useState([]); // { positionId, candidateId or 'abstain' }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBioModal, setShowBioModal] = useState(false);
  const [showManifestoModal, setShowManifestoModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    setLoading(true);
    axios.get("/api/elections?withCandidates=true", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        // Find the ongoing election and its positions/candidates
        let election = null;
        if (Array.isArray(res.data)) {
          election = res.data.find(e => e.status === "ongoing");
        } else if (res.data && Array.isArray(res.data.elections)) {
          election = res.data.elections.find(e => e.status === "ongoing");
        }
        if (!election) {
          setError("No ongoing election found.");
          setLoading(false);
          return;
        }
        // Build positions array: [{ title, candidates, electionId }]
        let posArr = [];
        if (Array.isArray(election.positions)) {
          posArr = election.positions.map(posTitle => ({
            title: posTitle,
            candidates: (election.candidates || []).filter(c => c.position === posTitle),
            electionId: election._id
          }));
        }
        setPositions(posArr);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load positions");
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    // Reset selection when position changes
    setSelected(null);
  }, [currentIndex]);

  const handleSelect = (candidateId) => setSelected(candidateId);

  const handleAbstain = () => setSelected("abstain");

  const handleViewBio = (candidate) => {
    setModalTitle(candidate.name + " - Bio");
    setModalContent(candidate.bio || "No bio available.");
    setShowBioModal(true);
  };
  const handleViewManifesto = (candidate) => {
    setModalTitle(candidate.name + " - Manifesto");
    setModalContent(candidate.manifesto || "No manifesto available.");
    setShowManifestoModal(true);
  };

  const handleVote = async () => {
    if (!selected) {
      Swal.fire({ icon: "warning", title: "No Selection", text: "Please select a candidate or abstain." });
      return;
    }
    setError("");
    const position = positions[currentIndex];
    try {
      await axios.post(
        "/api/vote",
        {
          electionId: position.electionId,
          position: position.title,
          candidateId: selected !== "abstain" ? selected : undefined,
          abstain: selected === "abstain"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVotes([...votes, { position: position.title, choice: selected }]);
      if (currentIndex < positions.length - 1) {
        Swal.fire({ icon: "success", title: "Vote Submitted", text: "Your vote has been recorded. Proceed to the next position." });
        setCurrentIndex(currentIndex + 1);
      } else {
        // Voting complete
        Swal.fire({ icon: "success", title: "Voting Complete", text: "Thank you for voting!" }).then(() => {
          window.location.href = "/student-dashboard";
        });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err?.response?.data?.message || "Failed to submit vote. Try again." });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  if (loading) return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #f3e8ff 0%, #f0f4ff 100%)"
    }}>
      <div style={{ textAlign: "center" }}>
        <Spinner animation="grow" variant="primary" style={{ width: 80, height: 80, marginBottom: 16 }} />
        <div style={{ color: "#7c3aed", fontWeight: 600, fontSize: 22 }}>Loading Voting Data...</div>
      </div>
    </div>
  );
  if (error) return (
    <div style={{
      minHeight: "80vh",
      width: "100vw",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #f3e8ff 0%, #f0f4ff 100%)"
    }}>
      <Alert variant="danger" className="text-center" style={{ fontSize: 22, padding: 40, width: "100%", maxWidth: 500 }}>
        {error}
      </Alert>
    </div>
  );
  if (!positions.length) return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}><Alert variant="info" className="text-center" style={{ fontSize: 20, padding: 32 }}>No positions available for voting.</Alert></div>;

  const position = positions[currentIndex];
  const progress = Math.round(((currentIndex + 1) / positions.length) * 100);

  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: "linear-gradient(135deg, #f3e8ff 0%, #f0f4ff 100%)", padding: 0 }}>
      <div style={{ width: "100%", padding: "32px 0" }}>
        <h2 style={{ color: "#a21caf", fontWeight: 700, marginBottom: 24, textAlign: "center" }}>2025 Student Council Elections</h2>
        <div style={{ width: "90%", margin: "0 auto 16px auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#7c3aed", fontWeight: 600 }}>Position {currentIndex + 1} of {positions.length}</span>
            <span style={{ color: "#71717a" }}>{progress}% Complete</span>
          </div>
          <ProgressBar now={progress} style={{ height: 8, marginTop: 4 }} variant="purple" />
        </div>
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(124,58,237,0.08)", padding: 32, width: "90%", margin: "0 auto" }}>
          <h3 style={{ color: "#7c3aed", fontWeight: 600, marginBottom: 16 }}>Position: {position.title}</h3>
          {position.candidates && position.candidates.length > 0 ? (
            position.candidates.map(candidate => (
              <div key={candidate._id} style={{ marginBottom: 16, padding: 16, borderRadius: 12, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="radio"
                    name="candidate"
                    checked={selected === candidate._id}
                    onChange={() => handleSelect(candidate._id)}
                    style={{ marginRight: 16, width: 20, height: 20 }}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>{candidate.name}</div>
                    <div style={{ color: "#6b7280" }}>{candidate.grade ? `Grade ${candidate.grade}` : null}</div>
                  </div>
                </div>
                <div>
                  <Button variant="outline-dark" className="me-2" onClick={() => handleViewBio(candidate)}>View Bio</Button>
                  <Button variant="outline-primary" onClick={() => handleViewManifesto(candidate)}>View Manifesto</Button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: "#71717a", fontSize: 16, marginBottom: 16 }}>No candidates for this position.</div>
          )}
          {/* Abstain option */}
          <div style={{ marginTop: 24, color: "#71717a", fontSize: 15, display: "flex", alignItems: "center" }}>
            <input
              type="radio"
              name="candidate"
              checked={selected === "abstain"}
              onChange={handleAbstain}
              style={{ marginRight: 16, width: 20, height: 20 }}
            />
            <div>
              <strong>Abstain</strong> — Choose this option if you do not wish to vote for any candidate for this position.
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, width: "90%", margin: "32px auto 0 auto" }}>
          <Button variant="light" style={{ width: "48%" }} onClick={handlePrev} disabled={currentIndex === 0}>&lt; Previous Position</Button>
          <Button variant="primary" style={{ width: "48%" }} onClick={handleVote}>{currentIndex === positions.length - 1 ? "Submit Vote" : "Next Position >"}</Button>
        </div>
      </div>
      {/* Bio Modal */}
      <Modal show={showBioModal} onHide={() => setShowBioModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalContent}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBioModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
      {/* Manifesto Modal */}
      <Modal show={showManifestoModal} onHide={() => setShowManifestoModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalContent}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowManifestoModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default VotingPage;
