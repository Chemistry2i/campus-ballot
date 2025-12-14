import React from "react";
import { FaPoll, FaNewspaper, FaCog, FaSearch } from "react-icons/fa";

const ElectionsDashboard = ({
  loading,
  filteredElections,
  isAutoRefresh,
  refreshInterval,
  setIsAutoRefresh,
  setRefreshInterval,
  refreshData,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  getElectionStatus,
  myVotes,
  openElectionDetails,
  formatTimeRemaining
}) => (
  <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
    <div className="card-header bg-white border-0 py-3" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
      <div className="row align-items-center">
        <div className="col-12 col-md-6 mb-2 mb-md-0">
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <FaPoll className="text-primary" /> Elections
          </h5>
        </div>
        <div className="col-12 col-md-6">
          <div className="d-flex flex-column flex-md-row gap-2 justify-content-md-end">
            <div className="d-flex align-items-center gap-2 mb-2 mb-md-0">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="autoRefresh"
                  checked={isAutoRefresh}
                  onChange={e => setIsAutoRefresh(e.target.checked)}
                />
                <label className="form-check-label small" htmlFor="autoRefresh">
                  Auto
                </label>
              </div>
              <select
                className="form-select form-select-sm"
                style={{ width: '70px' }}
                value={refreshInterval}
                onChange={e => setRefreshInterval(parseInt(e.target.value))}
                disabled={!isAutoRefresh}
              >
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
                <option value={60000}>1m</option>
              </select>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={refreshData}
                title="Refresh now"
              >
                <FaCog className={loading ? 'fa-spin' : ''} />
              </button>
            </div>
            <div className="d-flex gap-2">
              <div className="input-group" style={{ width: '150px' }}>
                <span className="input-group-text bg-light border-end-0">
                  <FaSearch className="text-muted" size={12} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="form-select"
                style={{ width: '100px' }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="upcoming">Soon</option>
                <option value="active">Active</option>
                <option value="completed">Done</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="card-body p-3 p-md-4" style={{ minHeight: '400px' }}>
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p className="text-muted">Loading elections...</p>
        </div>
      ) : filteredElections.length === 0 ? (
        <div className="text-center py-5">
          <FaNewspaper size={48} className="text-muted mb-3" />
          <h5 className="text-muted">No elections found</h5>
          <p className="text-muted">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search criteria'
              : 'No elections available at the moment'}
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {filteredElections.map((election) => {
            const voted = myVotes.some((v) => v.election === (election._id || election.id));
            const { status, color, icon: StatusIcon } = getElectionStatus(election);
            return (
              <div key={election._id || election.id} className="col-12">
                {/* ElectionCard can be extracted further for each election */}
                <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: '12px' }}>
                  <div className="card-body p-3 p-md-4">
                    <div className="row mb-3">
                      <div className="col-12 col-md-8">
                        <div className="d-flex flex-column flex-sm-row align-items-start gap-2 mb-2">
                          <h5 className="fw-bold mb-0 flex-grow-1">{election.title || election.name}</h5>
                          <div className="d-flex gap-2 flex-wrap">
                            <span className={`badge bg-${color} d-flex align-items-center gap-1`}>
                              <StatusIcon size={12} />
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                            {voted && (
                              <span className="badge bg-success d-flex align-items-center gap-1">
                                Voted
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-muted mb-2 small">{election.description}</p>
                        <div className="row g-2 mb-3">
                          <div className="col-sm-6">
                            <small className="text-muted d-flex align-items-center gap-1">
                              Start: {new Date(election.startDate).toLocaleDateString()}
                            </small>
                          </div>
                          <div className="col-sm-6">
                            <small className="text-muted d-flex align-items-center gap-1">
                              {formatTimeRemaininwhichg(election.endDate)}
                            </small>
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-4 d-flex justify-content-end">
                        <button
                          className="btn btn-outline-primary btn-sm w-100 w-md-auto"
                          onClick={() => openElectionDetails(election)}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                    {/* Candidates and voting logic can be further extracted */}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);

export default ElectionsDashboard;
