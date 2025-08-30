import React from "react";
import { FaPoll, FaCheckCircle, FaClock, FaTrophy } from "react-icons/fa";

const StatsCards = ({ stats }) => (
  <div className="row g-3 mb-4">
    <div className="col-6 col-md-3">
      <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
        <div className="card-body d-flex align-items-center p-3">
          <div className="bg-primary bg-opacity-10 rounded-circle p-2 p-md-3 me-2 me-md-3">
            <FaPoll className="text-primary" size={24} />
          </div>
          <div>
            <h5 className="fw-bold mb-0 fs-6 fs-md-4">{stats.total}</h5>
            <p className="text-muted mb-0 small">Elections</p>
          </div>
        </div>
      </div>
    </div>
    <div className="col-6 col-md-3">
      <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
        <div className="card-body d-flex align-items-center p-3">
          <div className="bg-success bg-opacity-10 rounded-circle p-2 p-md-3 me-2 me-md-3">
            <FaCheckCircle className="text-success" size={24} />
          </div>
          <div>
            <h5 className="fw-bold mb-0 fs-6 fs-md-4">{stats.participated}</h5>
            <p className="text-muted mb-0 small">Voted</p>
          </div>
        </div>
      </div>
    </div>
    <div className="col-6 col-md-3">
      <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
        <div className="card-body d-flex align-items-center p-3">
          <div className="bg-warning bg-opacity-10 rounded-circle p-2 p-md-3 me-2 me-md-3">
            <FaClock className="text-warning" size={24} />
          </div>
          <div>
            <h5 className="fw-bold mb-0 fs-6 fs-md-4">{stats.upcoming}</h5>
            <p className="text-muted mb-0 small">Upcoming</p>
          </div>
        </div>
      </div>
    </div>
    <div className="col-6 col-md-3">
      <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
        <div className="card-body d-flex align-items-center p-3">
          <div className="bg-secondary bg-opacity-10 rounded-circle p-2 p-md-3 me-2 me-md-3">
            <FaTrophy className="text-secondary" size={24} />
          </div>
          <div>
            <h5 className="fw-bold mb-0 fs-6 fs-md-4">{stats.completed}</h5>
            <p className="text-muted mb-0 small">Complete</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default StatsCards;
