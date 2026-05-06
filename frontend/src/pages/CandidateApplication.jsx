import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { useTheme } from '../contexts/ThemeContext';
import ugandaPartiesOptions from '../utils/ugandaParties.js';

// Configure axios baseURL from environment variable
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

export default function CandidateApplication({ user, users = [] }) {
  const { isDarkMode, colors } = useTheme();
  const [form, setForm] = useState({
    user: user?._id || '',
    election: '',
    name: user?.name || '',
    photo: null,
    symbol: null,
    position: '',
    party: '',
    description: '',
    manifesto: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [elections, setElections] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const [symbolPreviewUrl, setSymbolPreviewUrl] = useState(null);
  const [validation, setValidation] = useState({});
  const [existingApplications, setExistingApplications] = useState([]);
  // Image preview refs
  const photoPreview = useRef();
  const symbolPreview = useRef();

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem('candidateApplicationDraft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setForm(prev => ({ ...prev, ...parsed }));
      } catch (err) {
        console.error('Failed to load draft:', err);
      }
    }
  }, []);

  // Auto-save draft to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      const { photo, symbol, ...formData } = form;
      localStorage.setItem('candidateApplicationDraft', JSON.stringify(formData));
    }, 1000);
    return () => clearTimeout(timer);
  }, [form]);

  // Scroll handler for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch existing applications for the user
  useEffect(() => {
    const fetchExistingApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = user?._id || form.user;
        if (!userId) return;
        
        const { data } = await axios.get(`/api/candidates?user=${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (data.candidates) {
          setExistingApplications(data.candidates.map(c => c.election?._id || c.election));
        }
      } catch (err) {
        console.error('Failed to fetch existing applications:', err);
      }
    };
    fetchExistingApplications();
  }, [user, form.user]);

  useEffect(() => {
    // Fetch elections from backend
    const fetchElections = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('/api/elections', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const allElections = data.elections || [];
        const now = new Date();
        
        // Filter elections: must not be ended, must not be active, AND user must be eligible
        const eligibleElections = allElections.filter(election => {
          // First: filter out ended elections
          if (election.endDate && new Date(election.endDate) < now) {
            return false;
          }
          
          // Second: filter out active elections (no applications during voting)
          if (election.status === 'active') {
            return false;
          }

          // GLOBAL: Always check allowedFaculties first (applies to ALL eligibility types)
          const hasFacultyRestriction = election.allowedFaculties && Array.isArray(election.allowedFaculties) && election.allowedFaculties.length > 0;
          if (hasFacultyRestriction) {
            if (!user?.faculty) return false;
            const userFacultyLower = user.faculty.toLowerCase().trim();
            const matchesFaculty = election.allowedFaculties.some(f => f.toLowerCase().trim() === userFacultyLower);
            if (!matchesFaculty) return false;
          }

          // Get eligibility type
          let eligibilityType = election.eligibility?.type;
          if (!eligibilityType) {
            if (election.scope === 'university') eligibilityType = 'university';
            else if (election.scope === 'federation') eligibilityType = 'federation';
            else eligibilityType = 'all';
          }

          // Helper: get organization IDs
          const getUserOrgId = () => {
            if (!user?.organization) return null;
            return typeof user.organization === 'object' ? user.organization._id?.toString() : user.organization?.toString();
          };
          const getUserOrgParentId = () => {
            if (!user?.organization || typeof user.organization !== 'object') return null;
            if (!user.organization.parent) return null;
            return typeof user.organization.parent === 'object' ? user.organization.parent._id?.toString() : user.organization.parent?.toString();
          };
          const getElectionOrgId = () => {
            if (!election.organization) return null;
            return typeof election.organization === 'object' ? election.organization._id?.toString() : election.organization?.toString();
          };

          const userOrgId = getUserOrgId();
          const userOrgParentId = getUserOrgParentId();
          const electionOrgId = getElectionOrgId();

          // Check based on eligibility type
          switch (eligibilityType) {
            case 'all':
              return true;

            case 'university':
              // If faculty check passed above, user is eligible
              if (hasFacultyRestriction) return true;
              // Otherwise check org
              if (election.allowedOrganizations?.length > 0) {
                const allowedOrgIds = election.allowedOrganizations.map(org =>
                  typeof org === 'object' ? org._id?.toString() : org?.toString()
                ).filter(Boolean);
                if (!userOrgId) return false;
                return allowedOrgIds.includes(userOrgId) || (userOrgParentId && allowedOrgIds.includes(userOrgParentId));
              }
              if (electionOrgId) {
                if (!userOrgId) return false;
                return userOrgId === electionOrgId || userOrgParentId === electionOrgId;
              }
              return true;

            case 'federation':
              if (hasFacultyRestriction) return true;
              if (election.allowedOrganizations?.length > 0) {
                const federationId = typeof election.allowedOrganizations[0] === 'object' 
                  ? election.allowedOrganizations[0]._id?.toString() 
                  : election.allowedOrganizations[0]?.toString();
                if (!userOrgId) return false;
                return userOrgId === federationId || userOrgParentId === federationId;
              }
              if (electionOrgId) {
                if (!userOrgId) return false;
                return userOrgId === electionOrgId || userOrgParentId === electionOrgId;
              }
              return true;

            case 'faculty':
              if (election.eligibility?.faculties?.length > 0) {
                if (!user?.faculty) return false;
                const userFacultyLower = user.faculty.toLowerCase().trim();
                return election.eligibility.faculties.some(f => f.toLowerCase().trim() === userFacultyLower);
              }
              return true;

            case 'cohort':
              if (election.eligibility?.cohorts?.length > 0) {
                if (!user?.yearOfStudy) return false;
                return election.eligibility.cohorts.includes(user.yearOfStudy.toString());
              }
              return true;

            case 'csv':
              if (election.eligibility?.whitelist?.length > 0) {
                const userEmail = user?.email?.toLowerCase().trim();
                const userStudentId = user?.studentId?.toString().trim();
                return election.eligibility.whitelist.some(entry => {
                  const entryLower = entry?.toLowerCase().trim();
                  return entryLower === userEmail || entryLower === userStudentId;
                });
              }
              return true;

            default:
              return true;
          }
        });

        setElections(eligibleElections);
      } catch (err) {
        setElections([]);
      } finally {
        setLoading(false);
      }
    };
    fetchElections();
  }, [user]);

  useEffect(() => {
    // Fetch positions for selected election
    const fetchPositions = async () => {
      if (!form.election) { setPositions([]); setLoadingPositions(false); return; }
      setLoadingPositions(true);
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`/api/elections/${form.election}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Election data:', data); // Debug log
        // Backend returns election object directly, so data.positions should work
        const positionsArray = data.positions || [];
        console.log('Positions array:', positionsArray); // Debug log
        setPositions(positionsArray.map(p => ({ value: p, label: p })));
      } catch (err) {
        console.error('Error fetching positions:', err);
        setPositions([]);
      } finally {
        setLoadingPositions(false);
      }
    };
    fetchPositions();
  }, [form.election]);

  const userOptions = Array.isArray(users) ? users.map((u) => ({
    value: u._id,
    label: `${u.name} (${u.email})`,
  })) : [];

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    
    // Handle file uploads with preview
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (name === 'photo') setPhotoPreviewUrl(reader.result);
        if (name === 'symbol') setSymbolPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setForm((prev) => ({ ...prev, [name]: file }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear validation error for this field
    setValidation(prev => ({ ...prev, [name]: '' }));
  };

  const handleUserSelect = (option) => {
    setForm((prev) => ({ ...prev, user: option ? option.value : '' }));
  };

  const handlePartySelect = (option) => {
    setForm((prev) => ({ ...prev, party: option ? option.value : '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!form.user && !user) errors.user = 'User is required';
    if (!form.election) errors.election = 'Election is required';
    
    // Check if user already applied for this election
    if (form.election && existingApplications.includes(form.election)) {
      errors.election = 'You have already submitted an application for this election';
    }
    
    if (!form.name || form.name.trim().length < 3) errors.name = 'Name must be at least 3 characters';
    if (!form.position) errors.position = 'Position is required';
    if (!form.description || form.description.trim().length < 20) errors.description = 'Description must be at least 20 characters';
    setValidation(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the validation errors before submitting.');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      const token = localStorage.getItem('token');
      await axios.post('/api/applications', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSuccess(true);
      setShowSuccessModal(true);
      localStorage.removeItem('candidateApplicationDraft');
      
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        window.history.back();
      }, 3000);
    } catch (err) {
      setError('Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <section style={{ minHeight: '100vh', background: isDarkMode ? colors.background : '#f8fafc', margin: 0, padding: 0, width: '100%' }}>
      {/* Breadcrumbs */}
      <div style={{ 
        background: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : '#ffffff',
        borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        padding: '0.75rem clamp(1rem, 3vw, 1.5rem)'
      }}>
        <div className="d-flex align-items-center gap-2 small" style={{ opacity: 0.8 }}>
          <a href="/" className="text-decoration-none" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
            <i className="fa fa-home" />
          </a>
          <i className="fa fa-angle-right" style={{ fontSize: '0.7rem' }} />
          <a href="/student-dashboard" className="text-decoration-none" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
            Dashboard
          </a>
          <i className="fa fa-angle-right" style={{ fontSize: '0.7rem' }} />
          <span style={{ color: isDarkMode ? '#60a5fa' : '#0d6efd', fontWeight: 500 }}>
            Candidate Application
          </span>
        </div>
      </div>

      {/* Hero Banner */}
      <div style={{
        background: isDarkMode 
          ? '#1e3a8a'
          : '#0d6efd',
        padding: 'clamp(3rem, 8vw, 5rem) clamp(1rem, 3vw, 1.5rem) clamp(2.5rem, 6vw, 4rem)',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        margin: 0,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        {/* Animated Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.08,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, white 2px, transparent 2px),
            radial-gradient(circle at 80% 70%, white 2px, transparent 2px),
            radial-gradient(circle at 40% 80%, white 1px, transparent 1px),
            radial-gradient(circle at 90% 20%, white 1.5px, transparent 1.5px)
          `,
          backgroundSize: '80px 80px, 100px 100px, 60px 60px, 120px 120px',
          backgroundPosition: '0 0, 40px 40px, 20px 20px, 60px 60px'
        }} />
        
        {/* Gradient Overlay Circles - Responsive sizes */}
        <div className="d-none d-md-block" style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: 'clamp(250px, 30vw, 400px)',
          height: 'clamp(250px, 30vw, 400px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }} />
        <div className="d-none d-md-block" style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-5%',
          width: 'clamp(300px, 35vw, 500px)',
          height: 'clamp(300px, 35vw, 500px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }} />
        
        <div style={{ 
          position: 'relative', 
          zIndex: 1, 
          margin: '0 auto', 
          padding: '0 clamp(1rem, 3vw, 1.5rem)',
          width: '100%'
        }}>
          <div className="text-center text-white">
            {/* Icon with animated ring - Responsive */}
            <div className="mb-3 mb-md-4" style={{ position: 'relative', display: 'inline-block' }}>
              <div className="d-none d-sm-block" style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'clamp(80px, 15vw, 100px)',
                height: 'clamp(80px, 15vw, 100px)',
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.3)',
                animation: 'pulse 2s ease-in-out infinite'
              }} />
              <div style={{
                width: 'clamp(60px, 12vw, 80px)',
                height: 'clamp(60px, 12vw, 80px)',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}>
                <i className="fa fa-user-circle" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', opacity: 1 }} />
              </div>
            </div>
            
            {/* Title with enhanced typography */}
            <h1 className="fw-bold mb-2 mb-md-3" style={{ 
              fontSize: 'clamp(1.75rem, 5vw, 3rem)', 
              letterSpacing: '-1px',
              textShadow: '0 2px 20px rgba(0,0,0,0.2)',
              lineHeight: 1.2
            }}>
              Candidate Application
            </h1>
            
            {/* Decorative line */}
            <div style={{
              width: 'clamp(60px, 10vw, 80px)',
              height: '3px',
              background: 'rgba(255,255,255,0.5)',
              margin: '0 auto clamp(1rem, 2vw, 1.5rem)',
              borderRadius: '2px'
            }} />
            
            {/* Subtitle with better styling */}
            <p className="lead mb-3 mb-md-4" style={{ 
              fontSize: 'clamp(0.95rem, 2vw, 1.2rem)', 
              opacity: 0.95, 
              maxWidth: 700, 
              margin: '0 auto clamp(1rem, 3vw, 2rem)',
              lineHeight: 1.6,
              fontWeight: 300,
              textShadow: '0 1px 10px rgba(0,0,0,0.1)'
            }}>
              Ready to make a difference? Apply to become a candidate and share your vision with the campus community.
            </p>
            
            {/* Info badges - Stack on mobile */}
            <div className="d-flex flex-column flex-sm-row flex-wrap justify-content-center gap-2 gap-sm-3">
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                padding: 'clamp(0.6rem, 1.5vw, 0.75rem) clamp(1rem, 2.5vw, 1.5rem)',
                borderRadius: '50px',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
                fontWeight: 500
              }}>
                <i className="fa fa-clock-o" />
                <span>5 min application</span>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                padding: 'clamp(0.6rem, 1.5vw, 0.75rem) clamp(1rem, 2.5vw, 1.5rem)',
                borderRadius: '50px',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
                fontWeight: 500
              }}>
                <i className="fa fa-check-circle" />
                <span>Quick approval</span>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                padding: 'clamp(0.6rem, 1.5vw, 0.75rem) clamp(1rem, 2.5vw, 1.5rem)',
                borderRadius: '50px',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
                fontWeight: 500
              }}>
                <i className="fa fa-shield" />
                <span>Secure & private</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* CSS Animation */}
        <style>{`
          @keyframes pulse {
            0%, 100% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 0.3;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.1);
              opacity: 0.5;
            }
          }
        `}</style>
      </div>

      {/* Main Form Container */}
      <div style={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        padding: 'clamp(2rem, 5vw, 3rem) clamp(1rem, 3vw, 1.5rem)',
        margin: 0
      }}>
        <div style={{ width: '100%' }}>
          <div className="row justify-content-center g-4 mx-0">
            <div className="col-12 col-lg-11 col-xl-10">
            
            {/* Progress Stepper */}
            <div className="mb-3 mb-md-4">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2 gap-md-3 flex-grow-1">
                  <div className="d-flex align-items-center gap-2">
                    <div style={{
                      width: 'clamp(32px, 5vw, 40px)',
                      height: 'clamp(32px, 5vw, 40px)',
                      borderRadius: '50%',
                      background: currentStep >= 1 ? (isDarkMode ? '#3b82f6' : '#0d6efd') : 'transparent',
                      border: `2px solid ${currentStep >= 1 ? (isDarkMode ? '#3b82f6' : '#0d6efd') : (isDarkMode ? '#4b5563' : '#cbd5e1')}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
                      fontWeight: 600,
                      color: currentStep >= 1 ? '#ffffff' : (isDarkMode ? '#9ca3af' : '#64748b'),
                      transition: 'all 0.3s ease'
                    }}>
                      {currentStep > 1 ? <i className="fa fa-check" /> : '1'}
                    </div>
                    <span className="d-none d-sm-inline fw-semibold" style={{ fontSize: 'clamp(0.8rem, 1.2vw, 0.95rem)', color: currentStep >= 1 ? (isDarkMode ? '#60a5fa' : '#0d6efd') : (isDarkMode ? '#9ca3af' : '#64748b') }}>
                      Basic Info
                    </span>
                  </div>
                  <div style={{ flex: 1, height: '2px', background: currentStep >= 2 ? (isDarkMode ? '#3b82f6' : '#0d6efd') : (isDarkMode ? '#4b5563' : '#cbd5e1'), transition: 'all 0.3s ease' }} />
                  <div className="d-flex align-items-center gap-2">
                    <div style={{
                      width: 'clamp(32px, 5vw, 40px)',
                      height: 'clamp(32px, 5vw, 40px)',
                      borderRadius: '50%',
                      background: currentStep >= 2 ? (isDarkMode ? '#3b82f6' : '#0d6efd') : 'transparent',
                      border: `2px solid ${currentStep >= 2 ? (isDarkMode ? '#3b82f6' : '#0d6efd') : (isDarkMode ? '#4b5563' : '#cbd5e1')}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
                      fontWeight: 600,
                      color: currentStep >= 2 ? '#ffffff' : (isDarkMode ? '#9ca3af' : '#64748b'),
                      transition: 'all 0.3s ease'
                    }}>
                      {currentStep > 2 ? <i className="fa fa-check" /> : '2'}
                    </div>
                    <span className="d-none d-sm-inline fw-semibold" style={{ fontSize: 'clamp(0.8rem, 1.2vw, 0.95rem)', color: currentStep >= 2 ? (isDarkMode ? '#60a5fa' : '#0d6efd') : (isDarkMode ? '#9ca3af' : '#64748b') }}>
                      Details
                    </span>
                  </div>
                  <div style={{ flex: 1, height: '2px', background: currentStep >= 3 ? (isDarkMode ? '#3b82f6' : '#0d6efd') : (isDarkMode ? '#4b5563' : '#cbd5e1'), transition: 'all 0.3s ease' }} />
                  <div className="d-flex align-items-center gap-2">
                    <div style={{
                      width: 'clamp(32px, 5vw, 40px)',
                      height: 'clamp(32px, 5vw, 40px)',
                      borderRadius: '50%',
                      background: currentStep >= 3 ? (isDarkMode ? '#3b82f6' : '#0d6efd') : 'transparent',
                      border: `2px solid ${currentStep >= 3 ? (isDarkMode ? '#3b82f6' : '#0d6efd') : (isDarkMode ? '#4b5563' : '#cbd5e1')}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
                      fontWeight: 600,
                      color: currentStep >= 3 ? '#ffffff' : (isDarkMode ? '#9ca3af' : '#64748b'),
                      transition: 'all 0.3s ease'
                    }}>
                      3
                    </div>
                    <span className="d-none d-sm-inline fw-semibold" style={{ fontSize: 'clamp(0.8rem, 1.2vw, 0.95rem)', color: currentStep >= 3 ? (isDarkMode ? '#60a5fa' : '#0d6efd') : (isDarkMode ? '#9ca3af' : '#64748b') }}>
                      Review
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="mb-3 mb-md-4 p-3 p-md-4 rounded-3" style={{
              background: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(13, 110, 253, 0.08)',
              border: `1px solid ${isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(13, 110, 253, 0.2)'}`,
              backdropFilter: 'blur(10px)'
            }}>
              <div className="d-flex align-items-start gap-2 gap-md-3">
                <div className="pt-1 d-none d-sm-block">
                  <i className="fa fa-info-circle" style={{ fontSize: 'clamp(1.2rem, 2vw, 1.5rem)', color: isDarkMode ? '#60a5fa' : '#0d6efd' }} />
                </div>
                <div>
                  <h6 className="fw-bold mb-2" style={{ color: isDarkMode ? '#60a5fa' : '#0d6efd', fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)' }}>
                    <i className="fa fa-info-circle me-2 d-sm-none" />Application Guidelines
                  </h6>
                  <p className="mb-0" style={{ lineHeight: 1.6, fontSize: 'clamp(0.85rem, 1.2vw, 0.95rem)' }}>
                    Complete all required fields marked with <span className="text-danger fw-bold">*</span>. 
                    Your application will be reviewed by the election committee. Make sure your information is accurate and your manifesto clearly communicates your goals.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="p-3 p-sm-4 p-md-5 rounded-3 rounded-md-4 shadow-lg" style={{
              background: isDarkMode ? colors.cardBackground : '#ffffff',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)'
            }}>
              {success && (
                <div className="alert alert-success d-flex align-items-center gap-2 mb-4">
                  <i className="fa fa-check-circle" />
                  <span>Application submitted successfully!</span>
                </div>
              )}
              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
                  <i className="fa fa-exclamation-circle" />
                  <span>{error}</span>
                </div>
              )}
              
              {/* Loading Skeleton */}
              {loading ? (
                <div className="row g-3 g-md-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="col-12 col-sm-6">
                      <div className="placeholder-glow">
                        <div className="placeholder col-4 mb-2" style={{ height: '1.2rem' }}></div>
                        <div className="placeholder col-12" style={{ height: '2.5rem', borderRadius: '0.375rem' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
              <form onSubmit={handleSubmit} encType="multipart/form-data" autoComplete="off">
                <div className="row g-3 g-md-4">
            {user && user.role === 'student' ? (
              <input type="hidden" name="user" value={user._id} />
            ) : (
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)' }}>User* <span className="text-muted" title="Select the user applying as candidate."><i className="fa fa-info-circle" /></span></label>
                <Select
                  options={userOptions}
                  value={userOptions.find((opt) => opt.value === form.user) || null}
                  onChange={handleUserSelect}
                  placeholder="Search or select user..."
                  isClearable
                  styles={isDarkMode ? {
                    control: (provided) => ({
                      ...provided,
                      backgroundColor: colors.cardBackground || '#2d3748',
                      color: colors.text || '#ffffff',
                      borderColor: '#555555',
                      opacity: 1,
                      boxShadow: 'none',
                      '&:hover': { borderColor: '#666666' },
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isFocused ? '#4a5568' : (colors.cardBackground || '#2d3748'),
                      color: colors.text || '#ffffff',
                      opacity: 1,
                      '&:hover': { backgroundColor: '#4a5568' },
                    }),
                    menu: (provided) => ({
                      ...provided,
                      backgroundColor: colors.cardBackground || '#2d3748',
                      border: '1px solid #555555',
                      opacity: 1,
                    }),
                    menuList: (provided) => ({ ...provided, backgroundColor: colors.cardBackground || '#2d3748', opacity: 1 }),
                    singleValue: (provided) => ({ ...provided, color: colors.text || '#ffffff', opacity: 1 }),
                    input: (provided) => ({ ...provided, color: colors.text || '#ffffff', opacity: 1 }),
                    placeholder: (provided) => ({ ...provided, color: '#aaaaaa', opacity: 1 }),
                  } : {}}
                />
              </div>
            )}
            <div className="col-12 col-sm-6">
              <label className="form-label fw-semibold" style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)' }}>Election* <span className="text-muted" title="Select the election you are applying for."><i className="fa fa-info-circle" /></span></label>
              <select
                className={`form-select ${validation.election ? 'is-invalid' : form.election ? 'is-valid' : ''}`}
                name="election"
                value={form.election}
                onChange={(e) => { 
                  handleFormChange(e); 
                  setCurrentStep(1);
                  // Check if already applied for this election
                  if (existingApplications.includes(e.target.value)) {
                    setValidation(prev => ({ ...prev, election: 'You have already submitted an application for this election' }));
                  }
                }}
                required
                disabled={elections.length === 0}
                style={isDarkMode ? { backgroundColor: colors.cardBackground, color: colors.text, borderColor: validation.election ? '#dc3545' : '#555555' } : {}}
              >
                <option value="">{elections.length === 0 ? 'No eligible elections available' : 'Select Election'}</option>
                {elections.map((e) => (
                  <option 
                    key={e._id} 
                    value={e._id}
                    disabled={existingApplications.includes(e._id)}
                  >
                    {e.title || e.name}{existingApplications.includes(e._id) ? ' (Already Applied)' : ''}
                  </option>
                ))}
              </select>
              {elections.length === 0 && (
                <div className="text-warning small mt-1">
                  <i className="fa fa-exclamation-triangle me-1" />
                  No elections available for applications. All ongoing elections have voting in progress. Check back when new elections open.
                </div>
              )}
              {validation.election && <div className="invalid-feedback d-block small">{validation.election}</div>}
              {form.election && !validation.election && existingApplications.includes(form.election) && (
                <div className="text-warning small mt-1">
                  <i className="fa fa-exclamation-triangle me-1" />
                  You cannot apply twice for the same election
                </div>
              )}
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label fw-semibold" style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)' }}>Name*</label>
              <input
                className={`form-control ${validation.name ? 'is-invalid' : form.name && form.name.length >= 3 ? 'is-valid' : ''}`}
                name="name"
                value={form.name}
                onChange={handleFormChange}
                required
                maxLength={60}
                placeholder="Full name"
                style={isDarkMode ? { backgroundColor: colors.cardBackground, color: colors.text, borderColor: validation.name ? '#dc3545' : '#555555' } : {}}
              />
              {validation.name && <div className="invalid-feedback d-block small">{validation.name}</div>}
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label fw-semibold" style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)' }}>Photo <span className="text-muted" title="Upload a clear photo."><i className="fa fa-info-circle" /></span></label>
              <input
                type="file"
                className="form-control bg-primary text-white"
                style={{ border: 'none' }}
                name="photo"
                accept="image/*"
                onChange={handleFormChange}
              />
              {photoPreviewUrl && (
                <div className="mt-2">
                  <img src={photoPreviewUrl} alt="Photo Preview" className="rounded border" style={{ width: 80, height: 80, objectFit: 'cover', display: 'block' }} />
                </div>
              )}
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label fw-semibold" style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)' }}>Position* <span className="text-muted" title="Select the position you are applying for."><i className="fa fa-info-circle" /></span></label>
              {loadingPositions ? (
                <div className="placeholder-glow">
                  <div className="placeholder col-12" style={{ height: '2.5rem', borderRadius: '0.375rem' }}></div>
                </div>
              ) : (
              <select
                className={`form-select ${validation.position ? 'is-invalid' : form.position ? 'is-valid' : ''}`}
                name="position"
                value={form.position}
                onChange={(e) => { handleFormChange(e); setCurrentStep(2); }}
                required
                disabled={!positions.length}
                style={isDarkMode ? { backgroundColor: colors.cardBackground, color: colors.text, borderColor: validation.position ? '#dc3545' : '#555555' } : {}}
              >
                <option value="">{positions.length ? 'Select Position' : 'No positions found for selected election'}</option>
                {positions.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              )}
              {validation.position && <div className="invalid-feedback d-block small">{validation.position}</div>}
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label fw-semibold" style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)' }}>Symbol (Photo) <span className="text-muted" title="Upload a party symbol or logo."><i className="fa fa-info-circle" /></span></label>
              <input
                type="file"
                className="form-control bg-primary text-white"
                style={{ border: 'none' }}
                name="symbol"
                accept="image/*"
                onChange={handleFormChange}
              />
              {symbolPreviewUrl && (
                <div className="mt-2">
                  <img src={symbolPreviewUrl} alt="Symbol Preview" className="rounded border" style={{ width: 80, height: 80, objectFit: 'cover', display: 'block' }} />
                </div>
              )}
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label fw-semibold" style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)' }}>Party <span className="text-muted" title="Select or enter your party."><i className="fa fa-info-circle" /></span></label>
              <Select
                options={ugandaPartiesOptions}
                value={ugandaPartiesOptions.find((opt) => opt.value === form.party) || null}
                onChange={handlePartySelect}
                placeholder="Search or select party..."
                isClearable
                styles={isDarkMode ? {
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: colors.cardBackground || '#2d3748',
                    color: colors.text || '#ffffff',
                    borderColor: '#555555',
                    opacity: 1,
                    boxShadow: 'none',
                    '&:hover': { borderColor: '#666666' },
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? '#4a5568' : (colors.cardBackground || '#2d3748'),
                    color: colors.text || '#ffffff',
                    opacity: 1,
                    '&:hover': { backgroundColor: '#4a5568' },
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: colors.cardBackground || '#2d3748',
                    border: '1px solid #555555',
                    opacity: 1,
                  }),
                  menuList: (provided) => ({ ...provided, backgroundColor: colors.cardBackground || '#2d3748', opacity: 1 }),
                  singleValue: (provided) => ({ ...provided, color: colors.text || '#ffffff', opacity: 1 }),
                  input: (provided) => ({ ...provided, color: colors.text || '#ffffff', opacity: 1 }),
                  placeholder: (provided) => ({ ...provided, color: '#aaaaaa', opacity: 1 }),
                } : {}}
              />
            </div>
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label fw-semibold mb-0" style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)' }}>Description* <span className="text-muted" title="Short description about you."><i className="fa fa-info-circle" /></span></label>
                <small className={`${form.description.length > 200 ? 'text-danger' : form.description.length > 150 ? 'text-warning' : 'text-muted'}`}>
                  {form.description.length}/200
                </small>
              </div>
              <textarea
                className={`form-control ${validation.description ? 'is-invalid' : form.description && form.description.length >= 20 ? 'is-valid' : ''}`}
                name="description"
                value={form.description}
                onChange={(e) => { handleFormChange(e); if (e.target.value.length >= 20) setCurrentStep(3); }}
                rows={2}
                required
                maxLength={200}
                placeholder="Brief description (min 20 chars, max 200 chars)"
                style={isDarkMode ? { backgroundColor: colors.cardBackground, color: colors.text, borderColor: validation.description ? '#dc3545' : '#555555' } : {}}
              />
              {validation.description && <div className="invalid-feedback d-block small">{validation.description}</div>}
              {form.description && form.description.length < 20 && (
                <small className="text-muted d-block mt-1">
                  {20 - form.description.length} more character{20 - form.description.length !== 1 ? 's' : ''} needed
                </small>
              )}
            </div>
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label fw-semibold mb-0" style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)' }}>Manifesto <span className="text-muted" title="Your campaign promises or goals."><i className="fa fa-info-circle" /></span></label>
                <small className={`${form.manifesto.length > 1000 ? 'text-danger' : form.manifesto.length > 800 ? 'text-warning' : 'text-muted'}`}>
                  {form.manifesto.length}/1000
                </small>
              </div>
              <textarea
                className="form-control"
                name="manifesto"
                value={form.manifesto}
                onChange={handleFormChange}
                rows={3}
                maxLength={1000}
                placeholder="Your manifesto (max 1000 chars)"
                style={isDarkMode ? { backgroundColor: colors.cardBackground, color: colors.text, borderColor: '#555555' } : {}}
              />
            </div>
                </div>
                
                <div className="mt-3 mt-md-4 pt-3 d-flex flex-column flex-sm-row justify-content-center gap-2 gap-sm-3 border-top" style={{
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                }}>
                  <button 
                    className="btn btn-outline-secondary py-2" 
                    type="button" 
                    onClick={() => window.history.back()}
                    style={{ fontWeight: 500, fontSize: 'clamp(0.9rem, 1.2vw, 1rem)', padding: 'clamp(0.5rem, 1vw, 0.75rem) clamp(1.5rem, 3vw, 3rem)' }}
                  >
                    <i className="fa fa-arrow-left me-2" />
                    <span className="d-none d-sm-inline">Cancel</span>
                    <span className="d-sm-none">Back</span>
                  </button>
                  <button 
                    className="btn btn-primary py-2 shadow-sm" 
                    type="submit" 
                    disabled={submitting}
                    style={{ fontWeight: 500, fontSize: 'clamp(0.9rem, 1.2vw, 1rem)', padding: 'clamp(0.5rem, 1vw, 0.75rem) clamp(1.5rem, 3vw, 3rem)' }}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fa fa-paper-plane me-2" />
                        Submit Application
                      </>
                    )}
                  </button>
                </div>
              </form>
              )}
            </div>

            {/* Help Card */}
            <div className="mt-3 mt-md-4 p-3 p-md-4 rounded-3 text-center" style={{
              background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              border: `1px dashed ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
            }}>
              <p className="mb-2" style={{ opacity: 0.8, fontSize: 'clamp(0.85rem, 1.2vw, 0.95rem)' }}>
                <i className="fa fa-question-circle me-2" />
                Need help with your application?
              </p>
              <a 
                href="/contact" 
                className="text-decoration-none fw-semibold"
                style={{ color: isDarkMode ? '#60a5fa' : '#0d6efd' }}
              >
                Contact Support
              </a>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
        borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        padding: 'clamp(2rem, 4vw, 3rem) clamp(1rem, 3vw, 1.5rem)',
        marginTop: 'auto'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="row g-4">
            {/* About Section */}
            <div className="col-12 col-md-4">
              <h5 className="fw-bold mb-3" style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>
                <i className="fa fa-graduation-cap me-2" style={{ color: isDarkMode ? '#60a5fa' : '#0d6efd' }} />
                Campus Ballot
              </h5>
              <p className="small mb-0" style={{ opacity: 0.8, lineHeight: 1.6 }}>
                Empowering students to shape their campus future through transparent and secure democratic elections.
              </p>
            </div>

            {/* Quick Links */}
            <div className="col-6 col-md-4">
              <h6 className="fw-bold mb-3" style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1rem)' }}>Quick Links</h6>
              <ul className="list-unstyled small" style={{ lineHeight: 2 }}>
                <li><a href="/" className="text-decoration-none" style={{ color: isDarkMode ? '#94a3b8' : '#64748b', transition: 'color 0.2s' }}>
                  <i className="fa fa-home me-2" style={{ width: 16 }} />Home
                </a></li>
                <li><a href="/elections" className="text-decoration-none" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                  <i className="fa fa-calendar me-2" style={{ width: 16 }} />Elections
                </a></li>
                <li><a href="/results" className="text-decoration-none" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                  <i className="fa fa-bar-chart me-2" style={{ width: 16 }} />Results
                </a></li>
                <li><a href="/contact" className="text-decoration-none" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                  <i className="fa fa-envelope me-2" style={{ width: 16 }} />Contact
                </a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="col-6 col-md-4">
              <h6 className="fw-bold mb-3" style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1rem)' }}>Need Help?</h6>
              <ul className="list-unstyled small" style={{ lineHeight: 2 }}>
                <li><a href="/faq" className="text-decoration-none" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                  <i className="fa fa-question-circle me-2" style={{ width: 16 }} />FAQs
                </a></li>
                <li><a href="/guidelines" className="text-decoration-none" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                  <i className="fa fa-book me-2" style={{ width: 16 }} />Guidelines
                </a></li>
                <li><a href="/support" className="text-decoration-none" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                  <i className="fa fa-life-ring me-2" style={{ width: 16 }} />Support
                </a></li>
                <li><a href="/privacy" className="text-decoration-none" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                  <i className="fa fa-shield me-2" style={{ width: 16 }} />Privacy Policy
                </a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <p className="small mb-0" style={{ opacity: 0.7 }}>
                © {new Date().getFullYear()} Campus Ballot. All rights reserved.
              </p>
              <div className="d-flex gap-3">
                <a href="#" className="text-decoration-none" style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '1.2rem' }}>
                  <i className="fa fa-facebook-square" />
                </a>
                <a href="#" className="text-decoration-none" style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '1.2rem' }}>
                  <i className="fa fa-twitter-square" />
                </a>
                <a href="#" className="text-decoration-none" style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '1.2rem' }}>
                  <i className="fa fa-instagram" />
                </a>
                <a href="#" className="text-decoration-none" style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '1.2rem' }}>
                  <i className="fa fa-linkedin-square" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </section>

    {/* Success Modal */}
    {showSuccessModal && (
      <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 9999 }} onClick={() => setShowSuccessModal(false)}>
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 'min(90vw, 500px)' }}>
          <div className="modal-content" style={{ 
            background: isDarkMode ? colors.cardBackground : '#ffffff',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : 'none',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }} onClick={e => e.stopPropagation()}>
            <div className="modal-body text-center p-4 p-md-5">
              <div className="mb-4">
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  animation: 'scaleIn 0.5s ease-out',
                  boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)'
                }}>
                  <i className="fa fa-check" style={{ fontSize: '3rem', color: '#ffffff' }} />
                </div>
              </div>
              <h3 className="fw-bold mb-3" style={{ 
                color: isDarkMode ? colors.text : '#1f2937',
                fontSize: '1.5rem'
              }}>
                Application Submitted!
              </h3>
              <p className="mb-4" style={{ 
                color: isDarkMode ? '#94a3b8' : '#6b7280', 
                fontSize: '1rem',
                lineHeight: 1.6,
                maxWidth: '400px',
                margin: '0 auto 1.5rem'
              }}>
                Your candidate application has been successfully submitted and is now under review by the election committee.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <button 
                  className="btn btn-primary btn-lg"
                  style={{ 
                    padding: '0.75rem 2rem',
                    fontSize: '1rem',
                    borderRadius: '0.5rem'
                  }}
                  onClick={() => { setShowSuccessModal(false); window.history.back(); }}
                >
                  <i className="fa fa-home me-2" />
                  Go to Dashboard
                </button>
                <button 
                  className="btn btn-outline-secondary btn-lg"
                  style={{ 
                    padding: '0.75rem 2rem',
                    fontSize: '1rem',
                    borderRadius: '0.5rem'
                  }}
                  onClick={() => setShowSuccessModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Back to Top Button */}
    {showBackToTop && (
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: isDarkMode ? '#3b82f6' : '#0d6efd',
          border: 'none',
          color: '#ffffff',
          fontSize: '1.2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          animation: 'fadeInUp 0.3s ease-out'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        <i className="fa fa-arrow-up" />
      </button>
    )}

    {/* Additional CSS Animations */}
    <style>{`
      @keyframes scaleIn {
        0% {
          transform: scale(0);
          opacity: 0;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
      
      @keyframes fadeInUp {
        0% {
          transform: translateY(20px);
          opacity: 0;
        }
        100% {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      .placeholder {
        background: ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
        animation: placeholder-glow 2s ease-in-out infinite;
      }
      
      @keyframes placeholder-glow {
        50% {
          opacity: 0.5;
        }
      }
    `}</style>
    </>
  );
}
