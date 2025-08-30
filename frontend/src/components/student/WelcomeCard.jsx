
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faCalendarAlt, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";


const WelcomeCard = () => {
  const navigate = useNavigate();
  return (
    <div
      className="mb-2 p-4 rounded-4 shadow-sm"
      style={{ background: "#fff", position: "relative", width: "100%", marginBottom: 32 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          width: "100%"
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 28,
              color: "#a21caf",
              display: "flex",
              alignItems: "center"
            }}
          >
            <FontAwesomeIcon icon={faCircleInfo} className="me-2" style={{ color: "#a21caf" }} />
            Welcome to the Voting Portal
          </div>
          <div style={{ color: "#6b7280", fontSize: 18, marginTop: 4 }}>
            Your voice shapes the future. Cast your vote for student leadership.
          </div>
          <div className="mt-3 d-flex align-items-center" style={{ gap: 16 }}>
            <div style={{ fontWeight: 600 }}><FontAwesomeIcon icon={faCalendarAlt} className="me-2" />Voting Period</div>
            <div style={{ color: "#6b7280" }}>August 25 - August 31, 2025</div>
            <div style={{ color: "#71717a", fontSize: 15 }}><i>2d 16h 42m remaining</i></div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
          <span className="badge bg-danger mb-2" style={{ fontSize: 15, borderRadius: 5 }}>Not Voted Yet</span>
          <button
            className="btn btn-primary px-4 py-2"
            style={{ fontWeight: 600, fontSize: 18, borderRadius: 5 }}
            onClick={() => navigate("/vote")}
          >
            <FontAwesomeIcon icon={faArrowRight} className="me-2" /> Start Voting
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
