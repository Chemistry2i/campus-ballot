import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";

const StudentHeader = ({ user, onLogout }) => (
  <div
    style={{
      background: "#fff",
      color: "#18181b",
      padding: "0.75rem 1.5rem",
      width: "100%",
      minHeight: 30,
      boxShadow: "0 2px 12px rgba(124,58,237,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap"
    }}
  >
    <div>
      <div style={{ fontWeight: 700, fontSize: 28 }}>
        2025 Student Council Elections
      </div>
      <div style={{ fontSize: 16 }}>
        Welcome, {user?.name || "Student"}
      </div>
    </div>
    <div style={{ display: "flex", gap: 16 }}>
      <button
        className="btn btn-light me-2"
        style={{ background: '#ede9fe', color: '#7c3aed', border: 'none', fontWeight: 600, borderRadius: 5, padding: '6px 18px', boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}
      >
        <FontAwesomeIcon icon={faCircleInfo} className="me-1" /> Help
      </button>
      <button
        className="btn btn-primary"
        style={{ background: '#7c3aed', color: '#fff', border: 'none', fontWeight: 600, borderRadius: 5, padding: '6px 18px', boxShadow: '0 1px 4px rgba(124,58,237,0.10)' }}
        onClick={onLogout}
      >
        Logout
      </button>
    </div>
  </div>
);

export default StudentHeader;
