import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUsers, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaGraduationCap,
  FaBullhorn,
  FaCalendarAlt,
  FaVoteYea,
  FaTimes,
  FaChevronDown,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaGlobe,
  FaImages,
  FaArrowLeft,
  FaShare,
  FaMoon,
  FaSun,
  FaSlidersH,
  FaUser,
  FaTrophy,
  FaFlag
} from 'react-icons/fa';

// Add CSS animations
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      max-height: 0;
    }
    to {
      opacity: 1;
      max-height: 500px;
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

// Helper to get the full image URL
const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const apiBase = import.meta.env.VITE_API_URL || '';
  if (apiBase) {
    return `${apiBase.replace(/\/$/, '')}${url}`;
  }
  return url;
};

const PublicCandidates = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElection, setSelectedElection] = useState(searchParams.get('election') || 'all');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [positions, setPositions] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateMaterials, setCandidateMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedElection !== 'all') {
      fetchPositions(selectedElection);
    } else {
      setPositions([]);
      setSelectedPosition('all');
    }
  }, [selectedElection]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [candidatesRes, electionsRes] = await Promise.all([
        axios.get('/api/public/candidates'),
        axios.get('/api/public/elections')
      ]);
      setCandidates(candidatesRes.data);
      setElections(electionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPositions = async (electionId) => {
    try {
      const res = await axios.get(`/api/public/elections/${electionId}/candidates`);
      // Extract unique positions from candidates
      const candidatesData = res.data.candidates || res.data || [];
      const uniquePositions = [...new Set(candidatesData.map(c => c.position).filter(Boolean))];
      setPositions(uniquePositions);
    } catch (error) {
      console.error('Error fetching positions:', error);
      setPositions([]);
    }
  };

  const fetchCandidateMaterials = async (candidateId) => {
    setMaterialsLoading(true);
    try {
      const res = await axios.get(`/api/public/candidates/${candidateId}/materials`);
      setCandidateMaterials(res.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
      setCandidateMaterials([]);
    } finally {
      setMaterialsLoading(false);
    }
  };

  const handleViewCandidate = async (candidate) => {
    setSelectedCandidate(candidate);
    fetchCandidateMaterials(candidate._id);
  };

  const handleShare = (candidate) => {
    const url = `${window.location.origin}/candidates?view=${candidate._id}`;
    if (navigator.share) {
      navigator.share({
        title: `${candidate.name} - ${candidate.position}`,
        text: `Check out ${candidate.name}'s campaign for ${candidate.position}`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.party?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesElection = selectedElection === 'all' || 
      candidate.election?._id === selectedElection;
    
    const matchesPosition = selectedPosition === 'all' || 
      candidate.position?.toLowerCase() === selectedPosition.toLowerCase();
    
    return matchesSearch && matchesElection && matchesPosition;
  });

  const getElectionStatus = (election) => {
    if (!election) return { label: 'Unknown', color: '#6b7280' };
    const now = new Date();
    const start = new Date(election.startDate);
    const end = new Date(election.endDate);
    
    if (now < start) return { label: 'Upcoming', color: '#f59e0b' };
    if (now > end) return { label: 'Ended', color: '#6b7280' };
    return { label: 'Ongoing', color: '#10b981' };
  };

  // eslint-disable-next-line no-unused-vars
  const getStatusBadgeStyle = (status) => {
    const styles = {
      approved: {
        background: isDarkTheme ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
        color: isDarkTheme ? '#6ee7b7' : '#059669',
        border: `1px solid ${isDarkTheme ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`
      },
      pending: {
        background: isDarkTheme ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
        color: isDarkTheme ? '#fcd34d' : '#d97706',
        border: `1px solid ${isDarkTheme ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'}`
      },
      rejected: {
        background: isDarkTheme ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
        color: isDarkTheme ? '#fca5a5' : '#dc2626',
        border: `1px solid ${isDarkTheme ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`
      }
    };
    return styles[status] || styles.pending;
  };
  // Theme colors
  const themeColors = {
    background: isDarkTheme ? 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)' : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    headerBg: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.95)',
    cardBg: isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.95)',
    inputBg: isDarkTheme ? '#1f2937' : '#ffffff',
    inputBorder: isDarkTheme ? '#374151' : '#d1d5db',
    text: isDarkTheme ? '#ffffff' : '#1f2937',
    textSecondary: isDarkTheme ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
    border: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    shadow: isDarkTheme ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: themeColors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="text-center" style={{ color: themeColors.text }}>
          <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem', color: '#3b82f6' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: themeColors.background,
      transition: 'background 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        background: themeColors.headerBg,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${themeColors.border}`,
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100vw',
        boxShadow: `0 2px 10px ${themeColors.shadow}`,
        transition: 'all 0.3s ease'
      }}>
        <div style={{ padding: '0 2rem' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <button 
                className="btn btn-link p-0"
                onClick={() => navigate('/')}
                style={{ color: themeColors.text }}
              >
                <FaArrowLeft size={20} />
              </button>
              <div>
                <h4 className="mb-0 fw-bold" style={{ color: themeColors.text }}>
                  <FaVoteYea className="me-2" style={{ color: '#3b82f6' }} />
                  Meet Your Candidates
                </h4>
                <small style={{ color: themeColors.textSecondary }}>
                  Learn about candidates running in campus elections
                </small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-sm"
                onClick={() => setIsDarkTheme(!isDarkTheme)}
                style={{
                  background: themeColors.cardBg,
                  border: `1px solid ${themeColors.border}`,
                  color: themeColors.text,
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {isDarkTheme ? <FaSun size={16} /> : <FaMoon size={16} />}
                <span className="d-none d-sm-inline">{isDarkTheme ? 'Light' : 'Dark'}</span>
              </button>
              <div className="d-none d-md-block">
                <span className="badge bg-primary px-3 py-2" style={{ fontSize: '0.9rem' }}>
                  {filteredCandidates.length} Candidate{filteredCandidates.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '2rem', width: '100vw' }}>
        {/* Filter Toggle Button (Mobile) */}
        <div className="d-md-none mb-3">
          <button
            className="btn w-100 d-flex align-items-center justify-content-between"
            onClick={() => setShowFilters(!showFilters)}
            style={{
              background: themeColors.cardBg,
              border: `1px solid ${themeColors.border}`,
              color: themeColors.text,
              padding: '0.75rem 1rem',
              borderRadius: '12px'
            }}
          >
            <span className="d-flex align-items-center gap-2">
              <FaSlidersH />
              Filters {filteredCandidates.length > 0 && `(${filteredCandidates.length})`}
            </span>
            <FaChevronDown 
              style={{ 
                transform: showFilters ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.3s ease'
              }} 
            />
          </button>
        </div>

        {/* Filters Row */}
        <div 
          className={`${showFilters ? 'd-block' : 'd-none'} d-md-block`}
          style={{
            animation: showFilters ? 'slideDown 0.3s ease' : 'none'
          }}
        >
          <div className="row g-3 mb-4" style={{ margin: 0 }}>
            <div className="col-12 col-md-4">
              <div className="input-group" style={{ 
                background: themeColors.inputBg,
                borderRadius: '12px',
                border: `1px solid ${themeColors.inputBorder}`,
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}>
                <span 
                  className="input-group-text border-0" 
                  style={{ 
                    background: 'transparent',
                    color: themeColors.textSecondary 
                  }}
                >
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control border-0"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    background: 'transparent',
                    color: themeColors.text,
                    boxShadow: 'none'
                  }}
                />
                <style>{`
                  input::placeholder {
                    color: ${themeColors.textSecondary} !important;
                    opacity: 0.7;
                  }
                `}</style>
              </div>
            </div>
            <div className="col-6 col-md-4">
              <select
                className="form-select"
                value={selectedElection}
                onChange={(e) => {
                  setSelectedElection(e.target.value);
                  setSearchParams(e.target.value !== 'all' ? { election: e.target.value } : {});
                }}
                style={{
                  background: themeColors.inputBg,
                  color: themeColors.text,
                  border: `1px solid ${themeColors.inputBorder}`,
                  borderRadius: '12px',
                  padding: '0.625rem 1rem',
                  transition: 'all 0.3s ease'
                }}
              >
                <option value="all">All Elections</option>
                {elections.map(election => (
                  <option key={election._id} value={election._id}>
                    {election.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-4">
              <select
                className="form-select"
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                disabled={positions.length === 0}
                style={{
                  background: themeColors.inputBg,
                  color: themeColors.text,
                  border: `1px solid ${themeColors.inputBorder}`,
                  borderRadius: '12px',
                  padding: '0.625rem 1rem',
                  opacity: positions.length === 0 ? 0.6 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                <option value="all">All Positions</option>
                {positions.map((pos, idx) => (
                  <option key={idx} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Candidates Grid */}
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-5" style={{ animation: 'fadeIn 0.5s ease' }}>
            <FaUsers size={64} style={{ color: themeColors.textSecondary, opacity: 0.3 }} className="mb-3" />
            <h5 style={{ color: themeColors.text }}>No candidates found</h5>
            <p style={{ color: themeColors.textSecondary }}>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="row g-4" style={{ margin: 0 }}>
            {filteredCandidates.map(candidate => {
              const status = getElectionStatus(candidate.election);
              return (
                <div key={candidate._id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                  <div
                    className="card h-100"
                    style={{
                      background: themeColors.cardBg,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${themeColors.border}`,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      boxShadow: themeColors.shadow
                    }}
                    onClick={() => handleViewCandidate(candidate)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = isDarkTheme 
                        ? '0 20px 40px rgba(0,0,0,0.3)' 
                        : '0 20px 40px rgba(0,0,0,0.15)';
                      e.currentTarget.style.background = isDarkTheme 
                        ? 'rgba(255,255,255,0.12)' 
                        : 'rgba(255,255,255,0.95)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = themeColors.shadow;
                      e.currentTarget.style.background = themeColors.cardBg;
                    }}
                  >
                    {/* Candidate Photo */}
                    <div style={{
                      height: '280px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      {candidate.photo ? (
                        <img
                          src={getImageUrl(candidate.photo)}
                          alt={candidate.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <span style={{
                          fontSize: '4rem',
                          color: '#fff',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {candidate.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      )}
                      {/* Election Status Badge */}
                      <span
                        className="position-absolute top-0 end-0 m-2 badge"
                        style={{ backgroundColor: status.color }}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="card-body p-3">
                      <h5 className="fw-bold mb-1" style={{ 
                        fontSize: '1.1rem',
                        color: themeColors.text 
                      }}>
                        {candidate.name}
                      </h5>
                      <p className="mb-2" style={{ 
                        color: '#3b82f6', 
                        fontWeight: '500', 
                        fontSize: '0.9rem' 
                      }}>
                        {candidate.position}
                      </p>
                      {candidate.party && (
                        <span className="badge mb-2" style={{ 
                          backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                          color: isDarkTheme ? '#93c5fd' : '#3b82f6',
                          fontSize: '0.75rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}>
                          <FaFlag size={10} />
                          {candidate.party}
                        </span>
                      )}
                      <p style={{ 
                        color: themeColors.textSecondary, 
                        fontSize: '0.85rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {candidate.description}
                      </p>
                      
                      {candidate.election && (
                        <div className="d-flex align-items-center gap-2 mt-3 pt-3" 
                          style={{ borderTop: `1px solid ${themeColors.border}` }}>
                          <FaCalendarAlt size={12} style={{ color: themeColors.textSecondary }} />
                          <small style={{ color: themeColors.textSecondary }}>
                            {candidate.election.title}
                          </small>
                        </div>
                      )}
                    </div>

                    <div className="card-footer bg-transparent border-0 p-3 pt-0">
                      <button 
                        className="btn btn-primary w-100"
                        style={{ borderRadius: '8px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewCandidate(candidate);
                        }}
                      >
                        <FaEye className="me-2" />
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div
          className="modal d-block"
          style={{
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1050,
            overflow: 'auto',
            animation: 'fadeIn 0.3s ease'
          }}
          onClick={() => setSelectedCandidate(null)}
        >
          <div
            className="modal-dialog modal-xl modal-dialog-scrollable"
            style={{ 
              maxWidth: '900px', 
              margin: '1rem auto',
              '@media (max-width: 768px)': {
                margin: '0.5rem',
                maxWidth: '100%'
              }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content"
              style={{
                background: isDarkTheme 
                  ? 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: `1px solid ${themeColors.border}`,
                borderRadius: '20px',
                boxShadow: isDarkTheme 
                  ? '0 25px 50px rgba(0,0,0,0.5)' 
                  : '0 25px 50px rgba(0,0,0,0.15)',
                animation: 'slideUp 0.3s ease'
              }}
            >
              {/* Modal Header with Photo */}
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                padding: window.innerWidth < 768 ? '1rem' : '2rem',
                borderRadius: '20px 20px 0 0',
                position: 'relative'
              }}>
                <button
                  className="btn btn-sm position-absolute"
                  style={{ 
                    top: '1rem', 
                    right: '1rem', 
                    borderRadius: '50%', 
                    width: '36px', 
                    height: '36px',
                    background: isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)',
                    color: isDarkTheme ? '#fff' : '#000',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setSelectedCandidate(null)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDarkTheme ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,1)';
                    e.currentTarget.style.transform = 'rotate(90deg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)';
                    e.currentTarget.style.transform = 'rotate(0deg)';
                  }}
                >
                  <FaTimes />
                </button>
                <div className="row align-items-center">
                  <div className="col-auto">
                    <div
                      style={{
                        width: window.innerWidth < 768 ? '80px' : '120px',
                        height: window.innerWidth < 768 ? '80px' : '120px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        border: window.innerWidth < 768 ? '3px solid rgba(255,255,255,0.3)' : '4px solid rgba(255,255,255,0.3)'
                      }}
                    >
                      {selectedCandidate.photo ? (
                        <img
                          src={getImageUrl(selectedCandidate.photo)}
                          alt={selectedCandidate.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 'bold' }}>
                          {selectedCandidate.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col">
                    <h3 className="text-white fw-bold mb-1" style={{ fontSize: window.innerWidth < 768 ? '1.25rem' : '1.75rem' }}>{selectedCandidate.name}</h3>
                    <p className="text-white mb-2" style={{ opacity: 0.9, fontSize: window.innerWidth < 768 ? '0.85rem' : '1rem' }}>
                      <FaBullhorn className="me-2" size={window.innerWidth < 768 ? 12 : 16} />
                      {selectedCandidate.position}
                    </p>
                    {selectedCandidate.party && (
                      <span className="badge bg-light text-dark" style={{ 
                        fontSize: window.innerWidth < 768 ? '0.7rem' : '0.875rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}>
                        <FaFlag size={window.innerWidth < 768 ? 8 : 10} />
                        {selectedCandidate.party}
                      </span>
                    )}
                  </div>
                  <div className="col-auto">
                    <button 
                      className="btn btn-light btn-sm"
                      onClick={() => handleShare(selectedCandidate)}
                      style={{ fontSize: window.innerWidth < 768 ? '0.75rem' : '0.875rem', padding: window.innerWidth < 768 ? '0.25rem 0.5rem' : '0.375rem 0.75rem' }}
                    >
                      <FaShare className="me-1" size={window.innerWidth < 768 ? 10 : 12} />
                      <span className="d-none d-sm-inline">Share</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-body" style={{ padding: window.innerWidth < 768 ? '1rem' : '1.5rem' }}>
                {/* Election Info */}
                {selectedCandidate.election && (
                  <div 
                    className="mb-4 p-3" 
                    style={{ 
                      background: isDarkTheme ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)', 
                      borderRadius: '12px',
                      border: `1px solid ${isDarkTheme ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'}`
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <small style={{ color: themeColors.textSecondary }}>Running In</small>
                        <h6 className="mb-0" style={{ color: themeColors.text }}>{selectedCandidate.election.title}</h6>
                      </div>
                      <span 
                        className="badge px-3 py-2"
                        style={{ backgroundColor: getElectionStatus(selectedCandidate.election).color }}
                      >
                        {getElectionStatus(selectedCandidate.election).label}
                      </span>
                    </div>
                  </div>
                )}

                {/* About */}
                <div className="mb-3">
                  <h5 className="fw-bold mb-2" style={{ color: themeColors.text, fontSize: window.innerWidth < 768 ? '1rem' : '1.25rem' }}>
                    <FaGraduationCap className="me-2" style={{ color: '#3b82f6' }} size={window.innerWidth < 768 ? 14 : 18} />
                    About
                  </h5>
                  <p style={{ color: themeColors.textSecondary, lineHeight: '1.6', fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem' }}>
                    {selectedCandidate.description || 'No description available.'}
                  </p>
                </div>

                {/* Manifesto */}
                {selectedCandidate.manifesto && (
                  <div className="mb-3">
                    <h5 className="fw-bold mb-2" style={{ color: themeColors.text, fontSize: window.innerWidth < 768 ? '1rem' : '1.25rem' }}>
                      <FaBullhorn className="me-2" style={{ color: '#3b82f6' }} size={window.innerWidth < 768 ? 14 : 18} />
                      Manifesto
                    </h5>
                    <div 
                      style={{ 
                        background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', 
                        borderRadius: window.innerWidth < 768 ? '8px' : '12px',
                        padding: window.innerWidth < 768 ? '0.875rem' : '1.5rem',
                        border: `1px solid ${themeColors.border}`
                      }}
                    >
                      <p style={{ 
                        color: themeColors.textSecondary, 
                        lineHeight: window.innerWidth < 768 ? '1.5' : '1.8',
                        whiteSpace: 'pre-wrap',
                        marginBottom: 0,
                        fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem'
                      }}>
                        {selectedCandidate.manifesto}
                      </p>
                    </div>
                  </div>
                )}

                {/* Campaign Materials */}
                <div className="mb-3">
                  <h5 className="fw-bold mb-2" style={{ color: themeColors.text, fontSize: window.innerWidth < 768 ? '1rem' : '1.25rem' }}>
                    <FaImages className="me-2" style={{ color: '#3b82f6' }} size={window.innerWidth < 768 ? 14 : 18} />
                    Campaign Materials
                  </h5>
                  {materialsLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : candidateMaterials.length > 0 ? (
                    <div className="row" style={{ gap: window.innerWidth < 768 ? '0.5rem' : '1rem', margin: 0 }}>
                      {candidateMaterials.slice(0, 6).map(material => (
                        <div key={material._id} className="col-6 col-md-4" style={{ padding: window.innerWidth < 768 ? '0' : '0.5rem' }}>
                          <div
                            style={{
                              background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              border: `1px solid ${themeColors.border}`,
                              transition: 'transform 0.2s ease',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            {material.fileType?.startsWith('image/') ? (
                              <img
                                src={getImageUrl(material.url)}
                                alt={material.title}
                                style={{ width: '100%', height: window.innerWidth < 768 ? '120px' : '180px', objectFit: 'contain', background: isDarkTheme ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)' }}
                              />
                            ) : (
                              <div 
                                style={{ 
                                  height: window.innerWidth < 768 ? '120px' : '180px', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  background: isDarkTheme ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'
                                }}
                              >
                                <FaImages size={32} style={{ color: themeColors.textSecondary, opacity: 0.5 }} />
                              </div>
                            )}
                            <div style={{ padding: window.innerWidth < 768 ? '0.375rem' : '0.5rem' }}>
                              <small style={{ 
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                color: themeColors.text,
                                fontSize: window.innerWidth < 768 ? '0.7rem' : '0.875rem'
                              }}>
                                {material.title}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: themeColors.textSecondary }}>
                      No campaign materials available.
                    </p>
                  )}
                </div>

                {/* User Info */}
                {selectedCandidate.user && (
                  <div 
                    style={{ 
                      background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', 
                      borderRadius: window.innerWidth < 768 ? '8px' : '12px',
                      border: `1px solid ${themeColors.border}`,
                      padding: window.innerWidth < 768 ? '0.75rem' : '1rem'
                    }}
                  >
                    <div className="d-flex align-items-center" style={{ gap: window.innerWidth < 768 ? '0.5rem' : '0.75rem' }}>
                      <div
                        style={{
                          width: window.innerWidth < 768 ? '40px' : '50px',
                          height: window.innerWidth < 768 ? '40px' : '50px',
                          borderRadius: '50%',
                          background: '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}
                      >
                        {selectedCandidate.user.profilePicture ? (
                          <img
                            src={getImageUrl(selectedCandidate.user.profilePicture)}
                            alt={selectedCandidate.user.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span style={{ color: '#fff', fontWeight: 'bold' }}>
                            {selectedCandidate.user.name?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="mb-0 fw-semibold" style={{ color: themeColors.text, fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem' }}>{selectedCandidate.user.name}</p>
                        {selectedCandidate.user.department && (
                          <small style={{ color: themeColors.textSecondary, fontSize: window.innerWidth < 768 ? '0.7rem' : '0.875rem' }}>
                            {selectedCandidate.user.department}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicCandidates;
