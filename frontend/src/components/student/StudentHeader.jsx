import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";

const StudentHeader = ({ user, onLogout }) => (
  <div
    style={{
      background: "#fff",
      color: "#111827",
      padding: "0.35rem 0.75rem",
      width: "100%",
      minHeight: 40,
      boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    }}
  >
    <div>
      <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1 }}>
        2025 Student Council Elections
      </div>
      <div style={{ fontSize: 12, color: '#6b7280' }}>
        Welcome, {user?.name || "Student"}
      </div>
    </div>
    <div style={{ display: "flex", gap: 8, alignItems: 'center' }}>
      <button
        className="btn btn-light"
        style={{ background: '#f8f7ff', color: '#5b21b6', border: 'none', fontWeight: 600, borderRadius: 6, padding: '4px 10px', boxShadow: 'none', fontSize: 13 }}
      >
        <FontAwesomeIcon icon={faCircleInfo} className="me-1" /> Help
      </button>
      <button
        className="btn btn-primary"
        style={{ background: '#5b21b6', color: '#fff', border: 'none', fontWeight: 600, borderRadius: 6, padding: '4px 10px', fontSize: 13 }}
        onClick={onLogout}
      >
        Logout
      </button>
    </div>
  </div>
);

export default StudentHeader;
