import React, { useState } from 'react';
import { FaBalanceScale, FaTimes } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const CandidateComparison = ({ candidates, onClose }) => {
  const { isDarkMode, colors } = useTheme();
  const [selectedCandidates, setSelectedCandidates] = useState([]);

  const toggleCandidate = (candidate) => {
    if (selectedCandidates.find(c => c._id === candidate._id)) {
      setSelectedCandidates(selectedCandidates.filter(c => c._id !== candidate._id));
    } else if (selectedCandidates.length < 3) {
      setSelectedCandidates([...selectedCandidates, candidate]);
    }
  };

  const comparisonAttributes = [
    { key: 'name', label: 'Name' },
    { key: 'position', label: 'Position' },
    { key: 'department', label: 'Department' },
    { key: 'year', label: 'Year' },
    { key: 'manifesto', label: 'Manifesto' },
    { key: 'experience', label: 'Experience' }
  ];

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content" style={{
          background: isDarkMode ? colors.surface : '#fff',
          border: `1px solid ${isDarkMode ? colors.border : '#dee2e6'}`
        }}>
          <div className="modal-header" style={{ borderColor: isDarkMode ? colors.border : '#dee2e6' }}>
            <h5 className="modal-title d-flex align-items-center gap-2" style={{ color: isDarkMode ? colors.text : '#212529' }}>
              <FaBalanceScale className="text-primary" />
              Compare Candidates
            </h5>
            <button 
              className="btn-close" 
              onClick={onClose}
              style={{ filter: isDarkMode ? 'invert(1)' : 'none' }}
            />
          </div>
          <div className="modal-body" style={{ color: isDarkMode ? colors.text : '#212529' }}>
            {selectedCandidates.length === 0 ? (
              <div className="text-center py-5">
                <FaBalanceScale size={64} className="text-muted mb-3 opacity-50" />
                <h5 className="text-muted">Select candidates to compare</h5>
                <p className="text-muted">Choose up to 3 candidates from the list below</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table" style={{
                  color: isDarkMode ? colors.text : '#212529'
                }}>
                  <thead>
                    <tr>
                      <th style={{ 
                        background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
                        borderColor: isDarkMode ? colors.border : '#dee2e6',
                        position: 'sticky',
                        left: 0,
                        zIndex: 1
                      }}>
                        Attribute
                      </th>
                      {selectedCandidates.map((candidate) => (
                        <th key={candidate._id} style={{
                          background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
                          borderColor: isDarkMode ? colors.border : '#dee2e6'
                        }}>
                          <div className="d-flex align-items-center justify-content-between">
                            <span className="text-truncate">{candidate.name}</span>
                            <button
                              className="btn btn-sm btn-outline-danger ms-2"
                              onClick={() => toggleCandidate(candidate)}
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonAttributes.map((attr) => (
                      <tr key={attr.key}>
                        <td style={{
                          fontWeight: 600,
                          background: isDarkMode ? colors.surface : '#fff',
                          borderColor: isDarkMode ? colors.border : '#dee2e6',
                          position: 'sticky',
                          left: 0,
                          zIndex: 1
                        }}>
                          {attr.label}
                        </td>
                        {selectedCandidates.map((candidate) => (
                          <td key={candidate._id} style={{
                            borderColor: isDarkMode ? colors.border : '#dee2e6'
                          }}>
                            {candidate[attr.key] || 'N/A'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <hr style={{ borderColor: isDarkMode ? colors.border : '#dee2e6' }} />

            <div>
              <h6 className="fw-bold mb-3">Available Candidates</h6>
              <div className="row g-2">
                {candidates.map((candidate) => (
                  <div key={candidate._id} className="col-md-4">
                    <button
                      className={`btn w-100 text-start ${
                        selectedCandidates.find(c => c._id === candidate._id)
                          ? 'btn-primary'
                          : 'btn-outline-secondary'
                      }`}
                      onClick={() => toggleCandidate(candidate)}
                      disabled={!selectedCandidates.find(c => c._id === candidate._id) && selectedCandidates.length >= 3}
                      style={{
                        borderColor: isDarkMode ? colors.border : '#dee2e6',
                        color: selectedCandidates.find(c => c._id === candidate._id) 
                          ? '#fff' 
                          : (isDarkMode ? colors.text : '#212529')
                      }}
                    >
                      {candidate.name}
                      {selectedCandidates.find(c => c._id === candidate._id) && (
                        <span className="badge bg-light text-primary ms-2">Selected</span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
              {selectedCandidates.length >= 3 && (
                <div className="alert alert-info mt-3 mb-0" role="alert">
                  Maximum 3 candidates can be compared at once. Deselect one to add another.
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer" style={{ borderColor: isDarkMode ? colors.border : '#dee2e6' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateComparison;
