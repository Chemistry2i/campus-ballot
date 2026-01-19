import "./swal-zindex-override.css";
import "../styles/animations.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance";
import Swal from "sweetalert2";
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../hooks/useToast';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import ToastContainer from '../components/common/ToastContainer';
import { SkeletonCard, SkeletonRow } from '../components/common/LoadingSkeleton';
import QuickActionsWidget from '../components/student/QuickActionsWidget';
import AnalyticsChart from '../components/student/AnalyticsChart';
import ElectionCalendar from '../components/student/ElectionCalendar';
import AchievementsBadges from '../components/student/AchievementsBadges';
import ShareButton from '../components/student/ShareButton';
import ReminderSystem from '../components/student/ReminderSystem';
import CandidateComparison from '../components/student/CandidateComparison';
import KeyboardShortcutsModal from '../components/student/KeyboardShortcutsModal';
import RoleSwitcher from '../components/common/RoleSwitcher';
import { generateVoteReceipt, generateVerificationCode } from '../utils/pdfGenerator';

// Set axios base URL
axios.defaults.baseURL = "https://api.campusballot.tech";
import {
  FaSignOutAlt,
  FaUserCircle,
  FaVoteYea,
  FaCheckCircle,
  FaUserGraduate,
  FaEnvelope,
  FaIdBadge,
  FaPoll,
  FaUsers,
  FaChartBar,
  FaClock,
  FaCalendarAlt,
  FaEye,
  FaInfoCircle,
  FaHistory,
  FaTrophy,
  FaSearch,
  FaFilter,
  FaBell,
  FaTrash,
  FaNewspaper,
  FaUserEdit,
  FaLock,
  FaUnlock,
  FaStar,
  FaThumbsUp,
  FaShareAlt,
  FaDownload,
  FaExclamationTriangle,
  FaPlay,
  FaStop,
  FaEdit,
  FaSave,
  FaCog,
  FaFileAlt,
  FaBars,
  FaTimes,
  FaHome,
  FaArrowUp,
  FaUser,
  FaCircle
} from "react-icons/fa";
import { FaMoon, FaSun } from "react-icons/fa";
import useSocket from '../hooks/useSocket';
import getImageUrl from '../utils/getImageUrl';
import ElectionCard from '../components/student/ElectionCard';

function StudentDashboard({ user }) {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { toasts, removeToast, success, error, info, warning } = useToast();
  const [elections, setElections] = useState([]);
  const [myVotes, setMyVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState(null);
  const [showElectionDetails, setShowElectionDetails] = useState(false);
  const [showElectionModal, setShowElectionModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [markingReadIds, setMarkingReadIds] = useState([]);
  const [deletingNotificationIds, setDeletingNotificationIds] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false); // for mobile sidebar toggle
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [comparisonCandidates, setComparisonCandidates] = useState([]);
  const [electionStats, setElectionStats] = useState({
    total: 0,
    participated: 0,
    upcoming: 0,
    completed: 0
  });
  
  // Enhanced modal states
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [selectedCandidateForVoting, setSelectedCandidateForVoting] = useState(null);
  const [votingStep, setVotingStep] = useState(1); // 1: candidate review, 2: confirmation, 3: success
  const [voteVerificationCode, setVoteVerificationCode] = useState(null);
  const [showCandidateComparison, setShowCandidateComparison] = useState(false);
  const [comparisonMode, setComparisonMode] = useState('side-by-side'); // 'side-by-side' or 'table'
  const [selectedCandidatesForComparison, setSelectedCandidatesForComparison] = useState([]);
  
  // Auto-refresh functionality
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds default
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Receipt management
  const [savedReceipts, setSavedReceipts] = useState([]);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const token = localStorage.getItem("token");
  const { socketRef } = useSocket();

  useEffect(() => {
    fetchElections();
    fetchMyVotes();
    fetchNotifications();
    loadReceipts();
    
    // Debug localStorage on load
    console.log('All localStorage voteReceipts:', JSON.parse(localStorage.getItem('voteReceipts') || '[]'));
    console.log('Current user:', user);
    // setup socket listeners for real-time notifications
    let socketCleanup;
    const attachSocket = () => {
      const s = socketRef.current;
      if (!s) return false;

      // join rooms
      try { s.emit('join', 'students'); } catch (e) {}
      if (user?._id) try { s.emit('join', user._id); } catch (e) {}

      const onNew = (notification) => {
        // add notification if it targets students/all
        if (notification.targetAudience === 'students' || notification.targetAudience === 'all') {
          setNotifications(prev => [notification, ...(prev || [])]);
        }
      };
      const onDeleted = ({ notificationId }) => setNotifications(prev => (prev||[]).filter(n => n._id !== notificationId));
      const onRead = ({ notificationId, userId }) => setNotifications(prev => (prev||[]).map(n => n._id === notificationId ? { ...n, readBy: [...(n.readBy||[]), userId] } : n));

      s.on('notification:new', onNew);
      s.on('notification:deleted', onDeleted);
      s.on('notification:read', onRead);

      socketCleanup = () => {
        try { s.off('notification:new', onNew); s.off('notification:deleted', onDeleted); s.off('notification:read', onRead); } catch (e) {}
      };

      return true;
    };

    // try immediate attach, otherwise poll for socket
    if (!attachSocket()) {
      const iv = setInterval(() => {
        if (attachSocket()) clearInterval(iv);
      }, 200);
    }
    // eslint-disable-next-line
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    let interval;
    if (isAutoRefresh) {
      interval = setInterval(() => {
        fetchElections();
        fetchMyVotes();
        fetchNotifications();
        setLastRefresh(new Date());
      }, refreshInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh, refreshInterval]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: 'd', ctrl: true, callback: () => setActiveView('dashboard') },
    { key: 'e', ctrl: true, callback: () => setActiveView('elections') },
    { key: 'v', ctrl: true, callback: () => setActiveView('my-votes') },
    { key: 'n', ctrl: true, callback: () => setActiveView('notifications') },
    { key: 'p', ctrl: true, callback: () => setActiveView('profile') },
    { key: 'h', ctrl: true, callback: () => setActiveView('history') },
    { key: 'r', ctrl: true, callback: () => refreshData() },
    { key: '?', ctrl: false, callback: () => setShowKeyboardShortcuts(true) },
    { key: 'Escape', ctrl: false, callback: () => {
      setShowElectionModal(false);
      setShowProfile(false);
      setShowNotificationModal(false);
      setShowKeyboardShortcuts(false);
      setShowComparisonModal(false);
    }}
  ]);

  const refreshData = () => {
    fetchElections();
    fetchMyVotes();
    fetchNotifications();
    setLastRefresh(new Date());
  };

  const fetchElections = async () => {
  setLoading(true);
  try {
    const res = await axios.get("/api/elections?withCandidates=true", {
      headers: { Authorization: `Bearer ${token}` },
    });
    //  my backend returns { elections: [...] }
    setElections(Array.isArray(res.data.elections) ? res.data.elections : []);
    calculateElectionStats(Array.isArray(res.data.elections) ? res.data.elections : []);
  } catch (err) {
    Swal.fire("Error", "Failed to load elections", "error");
  } finally {
    setLoading(false);
  }
};

  // Check if user is eligible for an election based on all criteria
  const isUserEligibleForElection = (election) => {
    if (!election || !user) return false;

    // Check faculty eligibility
    const hasFacultyRestriction = election.allowedFaculties && Array.isArray(election.allowedFaculties) && election.allowedFaculties.length > 0;
    if (hasFacultyRestriction && user.faculty && !election.allowedFaculties.includes(user.faculty)) {
      return false;
    }

    // Check specific eligibility criteria if they exist
    if (election.eligibility) {
      // Check faculty from eligibility object
      if (election.eligibility.faculty && election.eligibility.faculty !== null && election.eligibility.faculty !== '') {
        if (user.faculty !== election.eligibility.faculty) {
          return false;
        }
      }

      // Check year of study
      if (election.eligibility.yearOfStudy && election.eligibility.yearOfStudy !== null && election.eligibility.yearOfStudy !== '') {
        if (user.yearOfStudy !== election.eligibility.yearOfStudy) {
          return false;
        }
      }

      // Check course
      if (election.eligibility.course && election.eligibility.course !== null && election.eligibility.course !== '') {
        if (user.course !== election.eligibility.course) {
          return false;
        }
      }

      // Check minimum GPA if applicable
      if (election.eligibility.minimunmGPA && election.eligibility.minimunmGPA > 0) {
        if (user.gpa && user.gpa < election.eligibility.minimunmGPA) {
          return false;
        }
      }
    }

    return true;
  };

  const calculateElectionStats = (electionsData) => {
    const now = new Date();
    
    // Filter to only include elections user is eligible for
    const eligibleElections = electionsData.filter(election => isUserEligibleForElection(election));
    
    const stats = {
      total: eligibleElections.length,
      participated: myVotes.length,
      upcoming: eligibleElections.filter(e => new Date(e.startDate) > now).length,
      completed: eligibleElections.filter(e => new Date(e.endDate) < now).length
    };
    setElectionStats(stats);
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const markNotificationAsRead = async (id) => {
    if (!id) return;
    try {
      setMarkingReadIds(prev => [...prev, id]);
      const res = await axios.put(`/api/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      // update local list quickly
      setNotifications(prev => (prev || []).map(n => n._id === id ? { ...n, readBy: [...(n.readBy||[]), user?._id] } : n));
      if (selectedNotification && (selectedNotification._id === id || selectedNotification.id === id)) {
        setSelectedNotification(prev => prev ? { ...prev, readBy: [...(prev.readBy||[]), user?._id] } : prev);
      }
      // optional toast
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Marked as read' });
    } catch (err) {
      console.error('Failed to mark notification as read', err);
      Swal.fire('Error', 'Failed to mark notification as read', 'error');
    } finally {
      setMarkingReadIds(prev => prev.filter(i => i !== id));
    }
  };

  const deleteNotification = async (id) => {
    if (!id) return;
    const result = await Swal.fire({
      title: 'Delete notification?',
      text: 'This will permanently remove the notification.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#d33'
    });
    if (!result.isConfirmed) return;
    try {
      setDeletingNotificationIds(prev => [...prev, id]);
      const token = localStorage.getItem('token');
      await axios.delete(`/api/notifications/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => (prev || []).filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to delete notification', err);
      Swal.fire('Error', 'Failed to delete notification', 'error');
    } finally {
      setDeletingNotificationIds(prev => prev.filter(x => x !== id));
      // if modal open for this id, close it
      if (selectedNotification && selectedNotification._id === id) {
        setShowNotificationModal(false);
        setSelectedNotification(null);
      }
    }
  };

  const fetchMyVotes = async () => {
    try {
      const res = await axios.get("/api/votes/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyVotes(res.data);
    } catch (err) {
      console.error("Failed to fetch votes:", err);
    }
  };

  const loadReceipts = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('voteReceipts') || '[]');
      const userReceipts = saved.filter(receipt => receipt.userId === (user._id || user.id));
      setSavedReceipts(userReceipts);
      console.log('Loaded receipts:', userReceipts.length, userReceipts);
    } catch (err) {
      console.error("Failed to load receipts:", err);
      setSavedReceipts([]);
    }
  };

  // Determine election status robustly (handles missing/invalid dates)
  const getElectionStatus = (election) => {
    const now = new Date();
    const startDate = election.startDate ? new Date(election.startDate) : null;
    const endDate = election.endDate ? new Date(election.endDate) : null;

    const validStart = startDate && !isNaN(startDate.getTime());
    const validEnd = endDate && !isNaN(endDate.getTime());

    // If both dates valid, use them
    if (validStart && validEnd) {
      if (now < startDate) return { status: 'upcoming', color: 'warning', icon: FaClock };
      if (now >= startDate && now <= endDate) return { status: 'active', color: 'success', icon: FaPlay };
      return { status: 'completed', color: 'secondary', icon: FaStop };
    }

    // If only start is valid
    if (validStart && !validEnd) {
      if (now < startDate) return { status: 'upcoming', color: 'warning', icon: FaClock };
      return { status: 'active', color: 'success', icon: FaPlay };
    }

    // If only end is valid
    if (!validStart && validEnd) {
      if (now > endDate) return { status: 'completed', color: 'secondary', icon: FaStop };
      return { status: 'active', color: 'success', icon: FaPlay };
    }

    // No valid dates: treat as upcoming by default
    return { status: 'upcoming', color: 'warning', icon: FaClock };
  };

  const filteredElections = elections.filter((election) => {
    const matchesSearch = (election.title || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         (election.description || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesStatus = statusFilter === "all" || getElectionStatus(election).status === statusFilter;
    
    // Faculty eligibility check - only show elections user is eligible for
    // If election has faculty restrictions, user MUST be in that list
    const hasRestrictions = election.allowedFaculties && Array.isArray(election.allowedFaculties) && election.allowedFaculties.length > 0;
    const isEligibleByFaculty = hasRestrictions 
      ? (user?.faculty && election.allowedFaculties.includes(user.faculty))
      : true; // No restrictions = everyone can see it
    
    console.log('Election:', election.title, 'hasRestrictions:', hasRestrictions, 'allowedFaculties:', election.allowedFaculties, 'userFaculty:', user?.faculty, 'isEligible:', isEligibleByFaculty);
    
    return matchesSearch && matchesStatus && isEligibleByFaculty;
  });



  const formatTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff < 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return "Ending soon";
  };

  const openElectionDetails = (election) => {
    setSelectedElection(election);
    setShowElectionModal(true);
  };

  const openProfileEdit = () => {
    setShowProfile(true);
  };

  const handleVote = async (electionId, candidateId, position, fallbackPosition, skipConfirmation = false, candidateData = null, electionData = null) => {
    // If this is called from the confirmation modal, skip the SweetAlert
    if (!skipConfirmation) {
      const result = await Swal.fire({
        title: 'Confirm Your Vote',
        text: 'Are you sure you want to cast this vote? This action cannot be undone.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, Cast Vote',
        cancelButtonText: 'Cancel'
      });

      if (!result.isConfirmed) return false;
    }

    try {
      // Better position resolution with more fallbacks
      let finalPosition = position || fallbackPosition;
      
      // If still no position, try to get it from the election/candidate data
      if (!finalPosition) {
        const election = elections.find(e => (e._id || e.id) === electionId);
        const candidate = election?.candidates?.find(c => (c._id || c.id) === candidateId);
        
        finalPosition = candidate?.position || 
                       candidate?.role || 
                       candidate?.post ||
                       (Array.isArray(election?.positions) && election.positions[0]) ||
                       "General";
      }
      
      // Additional fallback: if we have selectedCandidateForVoting, use its position
      if (!finalPosition && selectedCandidateForVoting) {
        finalPosition = selectedCandidateForVoting.position || 
                       selectedCandidateForVoting.role || 
                       selectedCandidateForVoting.post;
      }
      
      // Additional fallback: if we have selectedElection, try its positions
      if (!finalPosition && selectedElection) {
        finalPosition = Array.isArray(selectedElection.positions) && selectedElection.positions[0];
      }
      
      console.log('Voting with:', { 
        electionId, 
        candidateId, 
        position, 
        fallbackPosition, 
        finalPosition,
        detectedFrom: position ? 'candidate.position' : fallbackPosition ? 'election.positions' : 'fallback',
        selectedCandidateForVotingPosition: selectedCandidateForVoting?.position,
        selectedElectionPositions: selectedElection?.positions,
        candidateObject: selectedCandidateForVoting,
        electionObject: selectedElection
      });
      
      console.log('Selected Election:', selectedElection);
      console.log('Selected Candidate:', selectedCandidateForVoting);
      console.log('Election candidates:', elections.find(e => (e._id || e.id) === electionId)?.candidates);
      
      // If still no position, try to find it from the actual candidate in the election
      if (!finalPosition) {
        const currentElection = elections.find(e => (e._id || e.id) === electionId);
        const currentCandidate = currentElection?.candidates?.find(c => (c._id || c.id) === candidateId);
        
        if (currentCandidate?.position) {
          finalPosition = currentCandidate.position;
          console.log('Found position from election candidate:', finalPosition);
        }
      }
      
      // Validate that we have the required data
      if (!electionId) {
        Swal.fire({
          title: 'Error',
          text: 'Election ID is missing. Please try again.',
          icon: 'error',
        });
        return false;
      }
      
      if (!candidateId) {
        Swal.fire({
          title: 'Error',
          text: 'Candidate ID is missing. Please try again.',
          icon: 'error',
        });
        return false;
      }
      
      if (!finalPosition) {
        Swal.fire({
          title: 'Error',
          text: 'No position found for this candidate. Please contact admin or check election setup.',
          icon: 'error',
        });
        return false;
      }
      
      await axios.post(
        `/api/votes`,
        { electionId: electionId, candidateId: candidateId, position: finalPosition },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return true; // Vote successful
      
    } catch (error) {
      console.error('Voting error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to cast vote. Please try again.';
      
      // Handle specific error cases
      if (errorMessage.includes('already voted')) {
        // Refresh vote data to ensure UI is updated
        fetchMyVotes();
        fetchElections();
        
        Swal.fire({
          title: 'Already Voted',
          text: 'You have already cast your vote for this position in this election. Each voter can only vote once per position.',
          icon: 'warning',
          confirmButtonText: 'View My Votes',
          showCancelButton: true,
          cancelButtonText: 'OK'
        }).then((result) => {
          if (result.isConfirmed) {
            // Navigate to my votes section
            setActiveView('my-votes');
          }
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
        });
      }
      return false;
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartBar, badge: null },
    { id: 'elections', label: 'Elections', icon: FaPoll, badge: electionStats.total },
    { id: 'my-votes', label: 'My Votes', icon: FaVoteYea, badge: myVotes.length },
    { id: 'receipts', label: 'Receipts', icon: FaFileAlt, badge: savedReceipts.length },
    { id: 'notifications', label: 'Notifications', icon: FaBell, badge: notifications.filter(n => !n.read).length },
    { id: 'profile', label: 'Profile', icon: FaUserCircle, badge: null },
    { id: 'history', label: 'History', icon: FaHistory, badge: null },
  ];

  const renderActiveView = () => {
    switch(activeView) {
      case 'dashboard':
        return renderDashboardView();
      case 'elections':
        return renderElectionsView();
      case 'my-votes':
        return renderMyVotesView();
      case 'receipts':
        return renderReceiptsView();
      case 'notifications':
        return renderNotificationsView();
      case 'profile':
        return renderProfileView();
      case 'history':
        return renderHistoryView();
      default:
        return renderDashboardView();
    }
  };

  function renderDashboardView() { return (
    <div style={{ width: "100%", maxWidth: "100%", overflowX: "hidden", margin: 0, padding: window.innerWidth <= 768 ? '0 0.75rem' : '0 1rem' }}>
      {/* Welcome Banner */}
      <div 
        className="mb-4 rounded shadow-sm"
        style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
            : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: '#fff',
          borderRadius: '12px',
          padding: window.innerWidth <= 768 ? '1.5rem 2rem' : '2.5rem 3.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}
      >
        <div className="d-flex align-items-center justify-content-between flex-wrap">
          <div>
            <h2 className="mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋</h2>
            <p className="mb-0 opacity-90">
              {elections.length > 0 && getElectionStatus(elections[0])?.status === 'active' 
                ? 'An election is currently active. Cast your vote now!' 
                : 'Stay tuned for upcoming elections. Check back soon!'}
            </p>
          </div>
          {user?.profilePicture && (
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid rgba(255,255,255,0.3)'
              }}
              className="d-none d-md-block"
            >
              <img 
                src={user.profilePicture.startsWith('http') ? user.profilePicture : `/uploads/${user.profilePicture}`} 
                alt={user?.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards - 8 cards in single row */}
      <div className="row g-2 g-md-3 mb-4">
        {[
          { icon: <FaPoll className="text-primary" size={20} />, value: electionStats.total, label: 'Elections', color: 'primary' },
          { icon: <FaCheckCircle className="text-success" size={20} />, value: electionStats.participated, label: 'Voted', color: 'success' },
          { icon: <FaClock className="text-warning" size={20} />, value: electionStats.upcoming, label: 'Upcoming', color: 'warning' },
          { icon: <FaTrophy className="text-secondary" size={20} />, value: electionStats.completed, label: 'Complete', color: 'secondary' },
          { icon: <FaVoteYea className="text-primary" size={20} />, value: myVotes.length, label: 'My Votes', color: 'primary' },
          { icon: <FaBell className="text-primary" size={20} />, value: notifications.length, label: 'Notifications', color: 'primary' },
          { icon: <FaBell className="text-warning" size={20} />, value: notifications.filter(n => !n.read).length, label: 'Unread', color: 'warning' },
          { icon: <FaTrophy className="text-success" size={20} />, value: `${Math.min(100, Math.round((electionStats.participated / Math.max(electionStats.total, 1)) * 100))}%`, label: 'Engagement', color: 'success' }
        ].map((c, i) => {
          // determine soft bg and border based on semantic color and dark mode
          let bg = isDarkMode ? '#2d3748' : '#f1f3f5';
          let border = isDarkMode ? colors.border : '#e9ecef';
          if (c.color === 'primary') { bg = isDarkMode ? '#1e3c72' : '#e7f1ff'; border = isDarkMode ? '#2563eb' : '#cfe3ff'; }
          if (c.color === 'success') { bg = isDarkMode ? '#1b4332' : '#e9f7ee'; border = isDarkMode ? '#22c55e' : '#d5efda'; }
          if (c.color === 'warning') { bg = isDarkMode ? '#78350f' : '#fff4e5'; border = isDarkMode ? '#eab308' : '#ffe6b8'; }
          if (c.color === 'secondary') { bg = isDarkMode ? '#2d3748' : '#f1f3f5'; border = isDarkMode ? colors.border : '#e9ecef'; }

          return (
            <div key={i} className="col-6 col-sm-4 col-md-3 col-lg-3 col-xl-1-5">
              <div 
                className="card h-100 stat-card-hover" 
                style={{ 
                  borderRadius: '12px', 
                  border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
                  background: isDarkMode ? colors.surface : '#fff',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  padding: '10px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="card-body p-2 d-flex flex-column align-items-center justify-content-center text-center">
                  <div 
                    className="d-flex align-items-center justify-content-center mb-2" 
                    style={{ 
                      width: window.innerWidth <= 768 ? '35px' : '44px', 
                      height: window.innerWidth <= 768 ? '35px' : '44px', 
                      borderRadius: '50%',
                      backgroundColor: bg, 
                      border: `1px solid ${border}`,
                      color: isDarkMode ? '#fff' : 'inherit'
                    }}
                  >
                    {React.cloneElement(c.icon, { size: window.innerWidth <= 768 ? 16 : 20 })}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h5 className="fw-bold mb-1" style={{ 
                      color: isDarkMode ? colors.text : 'inherit', 
                      fontSize: window.innerWidth <= 768 ? '1.2rem' : '1.25rem' 
                    }}>{c.value}</h5>
                    <p style={{ 
                      color: isDarkMode ? colors.textSecondary : '#6c757d', 
                      fontSize: window.innerWidth <= 768 ? '0.7rem' : '0.75rem' 
                    }} className="mb-0 text-truncate">{c.label}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Elections Quick View */}
      <div 
        className="card border-0 shadow-sm mb-4" 
        style={{ 
          borderRadius: '12px', 
          maxWidth: "100%", 
          overflowX: "hidden",
          background: isDarkMode ? colors.surface : '#fff',
          border: `1px solid ${isDarkMode ? colors.border : '#e0e0e0'}`,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          // border:'red'
        }}
      >
        <div 
          className="card-header border-0 py-3"
          style={{
            background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
            borderBottom: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`
          }}
        >
          <h4 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: isDarkMode ? colors.text : 'inherit' }}>
            <FaPoll className="text-primary" /> Recent Elections
          </h4>
        </div>
        <div className="card-body p-2">
          <div className="table-responsive">
            {filteredElections.slice(0, 3).map((election) => {
              const { status, color, icon: StatusIcon } = getElectionStatus(election);
              const voted = myVotes.some((v) => v.election === (election._id || election.id));
              
              return (
                <div key={election._id} className="d-flex align-items-center justify-content-between py-3 px-2 border-bottom flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: 0 }}>
                    <div className={`bg-${color} bg-opacity-10 rounded-2 p-2 flex-shrink-0`} style={{width:50,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <StatusIcon className={`text-${color}`} size={20} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="fw-semibold text-truncate" style={{ maxWidth: "200px" }} title={election.title}>
                        {election.title}
                      </div>
                      <small className="text-muted">{formatTimeRemaining(election.endDate)}</small>
                    </div>
                  </div>
                  <div className="d-flex gap-2 flex-shrink-0">
                    {voted && <span className="badge bg-success">Voted</span>}
                    <span className={`badge bg-${color}`} style={{display:'grid', placeItems: 'center'}}>{status}</span>
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => openElectionDetails(election)}
                    >
                      <FaEye />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-3">
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={() => setActiveView('elections')}
            >
              View All Elections
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      <AnalyticsChart myVotes={myVotes} electionStats={electionStats} />

      {/* Row with Calendar and Achievements */}
      <div className="row g-3 mb-4">
        <div className="col-lg-7">
          <ElectionCalendar 
            elections={elections} 
            onElectionClick={(election) => openElectionDetails(election)} 
          />
        </div>
        <div className="col-lg-5">
          <AchievementsBadges myVotes={myVotes} electionStats={electionStats} />
        </div>
      </div>

      {/* Reminder System */}
      <ReminderSystem elections={elections.filter(e => getElectionStatus(e).status === 'upcoming')} />
    </div>
  ); }

  function renderElectionsView() { return (
    <div className="card shadow-sm border-0" style={{ borderRadius: '12px', width: "100%", maxWidth: "100%", overflowX: "hidden", margin: 0, background: isDarkMode ? colors.surface : '#fff', borderColor: isDarkMode ? colors.border : '#e9ecef', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div className="card-header border-0 py-3" 
           style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px', background: isDarkMode ? colors.surfaceHover : '#fff', color: isDarkMode ? colors.text : undefined, borderBottom: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}` }}>
        <div className="row align-items-center g-2">
          {/* Title Row */}
          <div className="col-12 mb-2">
            <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
              <FaPoll className="text-primary" /> All Elections
            </h4>
          </div>
          
          {/* Controls Row - Full Width */}
          <div className="col-12">
            <div className="row g-2 align-items-center">
              {/* Auto-refresh controls */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="d-flex align-items-center gap-2 w-100">
                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="autoRefresh"
                      checked={isAutoRefresh}
                      onChange={(e) => setIsAutoRefresh(e.target.checked)}
                    />
                    <label className="form-check-label small text-nowrap" htmlFor="autoRefresh" style={{ color: isDarkMode ? colors.text : undefined }}>
                      Auto
                    </label>
                  </div>
                  <select
                    className="form-select form-select-sm flex-grow-1"
                    style={{ background: isDarkMode ? colors.inputBg : '#fff', borderColor: isDarkMode ? colors.border : '#dee2e6', color: isDarkMode ? colors.text : undefined }}
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                    disabled={!isAutoRefresh}
                  >
                    <option value={10000}>10s</option>
                    <option value={30000}>30s</option>
                    <option value={60000}>1m</option>
                  </select>
                  <button
                    className="btn btn-sm"
                    onClick={refreshData}
                    title="Refresh now"
                    style={{ background: isDarkMode ? colors.primary : '#0d6efd', color: '#fff', border: 'none' }}
                  >
                    <FaCog className={loading ? 'fa-spin' : ''} />
                  </button>
                </div>
              </div>
              
              {/* Search - Takes more space like in the image */}
              <div className="col-12 col-sm-6 col-lg-6">
                <div className="input-group">
                  <span className="input-group-text border-end-0" style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa', borderColor: isDarkMode ? colors.border : '#dee2e6', color: isDarkMode ? colors.textMuted : undefined }}>
                    <FaSearch className="text-muted" size={12} />
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-sm border-start-0"
                    placeholder="Search elections..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ background: isDarkMode ? colors.inputBg : '#fff', borderColor: isDarkMode ? colors.border : '#dee2e6', color: isDarkMode ? colors.text : undefined }}
                  />
                </div>
              </div>

              {/* Filter - Spans remaining space */}
              <div className="col-12 col-lg-3">
                <select 
                  className="form-select form-select-sm w-100" 
                  style={{ background: isDarkMode ? colors.inputBg : '#fff', borderColor: isDarkMode ? colors.border : '#dee2e6', color: isDarkMode ? colors.text : undefined }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Elections</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card-body p-3 p-md-4" style={{ minHeight: '400px', background: isDarkMode ? colors.surface : '#fff', color: isDarkMode ? colors.text : undefined }}>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <p className="text-muted">Loading elections...</p>
          </div>
        ) : filteredElections.length === 0 ? (
          <div className="text-center py-5">
            <FaNewspaper size={48} className="text-muted mb-3" />
            <h4 className="text-muted">No elections found</h4>
            <p className="text-muted">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'No elections available at the moment'}
            </p>
          </div>
        ) : (
          <div className="row g-3">
            {filteredElections.map((election) => (
              <ElectionCard
                key={election._id || election.id}
                election={election}
                user={user}
                myVotes={myVotes}
                handleVote={handleVote}
                openElectionDetails={openElectionDetails}
                getElectionStatus={getElectionStatus}
                formatTimeRemaining={formatTimeRemaining}
                setSelectedElection={setSelectedElection}
                setSelectedCandidateForVoting={setSelectedCandidateForVoting}
                setShowVotingModal={setShowVotingModal}
                setVotingStep={setVotingStep}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  ); }

  function renderMyVotesView() { return (
    <div className="card shadow-sm border-0" style={{ borderRadius: '12px', background: isDarkMode ? colors.surface : '#fff', borderColor: isDarkMode ? colors.border : '#e9ecef', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div className="card-header d-flex align-items-center justify-content-between"
           style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px', background: isDarkMode ? colors.success : '#198754', color: '#fff', borderBottom: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}` }}>
        <span className="d-flex align-items-center gap-2">
          <FaVoteYea /> My Voting History
        </span>
        <span className="badge bg-white text-success">{myVotes.length}</span>
      </div>
      <div className="card-body p-4" style={{ background: isDarkMode ? colors.surface : '#fff', color: isDarkMode ? colors.text : undefined }}>
        {myVotes.length === 0 ? (
          <div className="text-center py-5">
            <FaExclamationTriangle className="mb-3 text-muted" size={48} />
            <h3 className="text-muted">No votes cast yet</h3>
            <p className="text-muted">Start participating in elections to see your voting history here.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setActiveView('elections')}
            >
              <FaPoll className="me-2" />
              Browse Elections
            </button>
          </div>
        ) : (
          <div className="row g-3">
            {myVotes.map((vote, index) => (
              <div className="col-md-6 col-lg-4" key={vote._id || index}>
                <div className="card border shadow-sm h-100" style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                        <FaCheckCircle className="text-success" size={20} />
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-bold">
                          {typeof vote.electionTitle === 'string' ? vote.electionTitle :
                            (typeof vote.election === 'string' ? vote.election :
                              (vote.election && typeof vote.election === 'object') ?
                                (vote.election.title || vote.election.name || vote.election._id || 'Unknown Election')
                                : 'Unknown Election')}
                        </div>
                        <small className="text-muted">
                          {vote.createdAt ? new Date(vote.createdAt).toLocaleDateString() : 'Recently voted'}
                        </small>
                      </div>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted">Vote Status:</small>
                      <div className="fw-semibold text-success">
                        <FaCheckCircle className="me-1" size={14} />
                        Vote Successfully Cast
                      </div>
                      {vote._id && (
                        <div className="mt-2">
                          <small className="text-muted d-block">Verification ID:</small>
                          <code className="text-muted" style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
                            {vote._id.slice(-8).toUpperCase()}
                          </code>
                        </div>
                      )}
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="badge bg-success">
                        <FaLock className="me-1" size={10} />
                        Private
                      </span>
                      <small className="text-muted">
                        <FaClock className="me-1" />
                        {vote.createdAt ? new Date(vote.createdAt).toLocaleTimeString() : 'N/A'}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  ); }

  function renderReceiptsView() { return (
    <div className="card shadow-sm border-0" style={{ borderRadius: '12px', background: isDarkMode ? colors.surface : '#fff', borderColor: isDarkMode ? colors.border : '#e9ecef', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div className="card-header d-flex align-items-center justify-content-between"
           style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', borderBottom: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}` }}>
        <span className="d-flex align-items-center gap-2">
          <FaFileAlt /> Vote Receipts
        </span>
        <span className="badge bg-white text-success">{savedReceipts.length}</span>
      </div>
      <div className="card-body p-4" style={{ background: isDarkMode ? colors.surface : '#fff', color: isDarkMode ? colors.text : undefined }}>
        {savedReceipts.length === 0 ? (
          <div className="text-center py-5">
            <FaFileAlt className="mb-3 text-muted" size={48} />
            <h3 className="text-muted">No receipts available</h3>
            <p className="text-muted">Vote receipts will appear here after you cast your votes.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setActiveView('elections')}
            >
              <FaPoll className="me-2" />
              Browse Elections
            </button>
          </div>
        ) : (
          <div className="row g-3">
            {savedReceipts
              .sort((a, b) => new Date(b.votedAt) - new Date(a.votedAt))
              .map((receipt, index) => (
              <div className="col-md-6 col-lg-4" key={receipt.id || index}>
                <div 
                  className="card border h-100 receipt-card"
                  style={{ 
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: isDarkMode ? colors.surfaceHover : '#fff'
                  }}
                  onClick={() => {
                    setSelectedReceipt(receipt);
                    setShowReceiptModal(true);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
                  }}
                >
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center mb-3">
                      <div 
                        className="rounded-circle p-2 me-3"
                        style={{ background: 'rgba(16, 185, 129, 0.1)' }}
                      >
                        <FaCheckCircle className="text-success" size={20} />
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-bold text-truncate" title={receipt.election?.title || 'Unknown Election'}>
                          {receipt.election?.title || 'Unknown Election'}
                        </div>
                        <small className="text-muted">
                          {new Date(receipt.votedAt).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <small className="text-muted d-block">Verification Code</small>
                      <code className="bg-light px-2 py-1 rounded small" style={{ color: '#0d6efd', fontFamily: 'monospace' }}>
                        {receipt.verificationCode}
                      </code>
                    </div>
                    
                    <div className="d-flex gap-2 mt-3">
                      <button 
                        className="btn btn-outline-primary btn-sm flex-grow-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          generateVoteReceipt(receipt);
                        }}
                      >
                        <FaDownload className="me-1" />
                        Print
                      </button>
                      <button 
                        className="btn btn-outline-success btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(receipt.verificationCode);
                          success('Verification code copied to clipboard!');
                        }}
                      >
                        <FaStar className="me-1" />
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  ); }

  function renderNotificationsView() { return (
    <div className="card shadow-sm border-0" style={{ borderRadius: '12px', background: isDarkMode ? colors.surface : '#fff', borderColor: isDarkMode ? colors.border : '#e9ecef', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div className="card-header d-flex align-items-center justify-content-between"
           style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px', background: isDarkMode ? colors.primary : '#0d6efd', color: '#fff', borderBottom: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}` }}>
        <span className="d-flex align-items-center gap-2">
          <FaBell /> Notifications
        </span>
        <span className="badge bg-white text-primary">{notifications.length}</span>
      </div>
            <div className="card-body p-4" style={{ background: isDarkMode ? colors.surface : '#fff', color: isDarkMode ? colors.text : undefined }}>
        {notifications.length === 0 ? (
          <div className="text-center py-5">
            <FaBell className="mb-3 text-muted" size={48} />
            <h4 className="text-muted">No notifications</h4>
            <p className="text-muted">You'll see important updates and announcements here.</p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {notifications.map((notification, index) => (
              <div
                key={notification._id || index}
                className={`list-group-item border border-1 mb-2`}
                style={{ background: isDarkMode ? (notification.read ? colors.surface : colors.surfaceHover) : (notification.read ? '#ffffff' : '#f1f3f5'), color: isDarkMode ? colors.text : undefined, borderColor: isDarkMode ? colors.border : '#e9ecef' }}
              >
                <div className="d-flex align-items-start gap-3">
                  <div style={{ width: 44, height: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }} className={`bg-${notification.type === 'success' ? 'success' : 'info'} bg-opacity-10`}>
                    {notification.type === 'success' ? (
                      <FaCheckCircle className="text-success" size={18} />
                    ) : (
                      <FaInfoCircle className="text-info" size={18} />
                    )}
                  </div>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="fw-semibold text-truncate" style={{ maxWidth: 420 }}>
                      {typeof notification.title === 'string' ? notification.title :
                        (notification.title && typeof notification.title === 'object' && (notification.title.text || notification.title.value)) ? (notification.title.text || notification.title.value) :
                        (notification.title ? '[Invalid notification]' : 'Notification')}
                    </div>
                    <p className="text-muted mb-1 small text-truncate" style={{ maxWidth: 420 }}>
                      {typeof notification.message === 'string' ? notification.message :
                        (typeof notification.content === 'string' ? notification.content :
                          (notification.message && typeof notification.message === 'object' && (notification.message.text || notification.message.value)) ? (notification.message.text || notification.message.value) :
                          (notification.content && typeof notification.content === 'object' && (notification.content.text || notification.content.value)) ? (notification.content.text || notification.content.value) :
                          '[Invalid message]')}
                    </p>
                    <small className="text-muted">
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : 'Recently'}
                    </small>
                  </div>
                    <div className="d-flex flex-column gap-2 align-items-end">
                      {!notification.read && (
                        <span className="badge bg-primary">New</span>
                      )}
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center"
                          onClick={() => {
                            setSelectedNotification(notification);
                            setShowNotificationModal(true);
                          }}
                          style={{ minWidth: 44 }}
                        >
                          <FaEye className="me-0 me-sm-2" />
                          <span className="d-none d-sm-inline">View</span>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
                          onClick={() => deleteNotification(notification._id)}
                          disabled={deletingNotificationIds.includes(notification._id)}
                          style={{ minWidth: 44 }}
                        >
                          {deletingNotificationIds.includes(notification._id) ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : (
                            <><FaTrash className="me-0 me-sm-2" /><span className="d-none d-sm-inline">Delete</span></>
                          )}
                        </button>
                      </div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  ); }

  function renderProfileView() { return (
    <div className="row g-4" style={{ width: "100%", maxWidth: "100%", overflowX: "hidden", margin: 0, marginTop: -50, color: isDarkMode ? colors.text : undefined }}>
      {/* Profile Information Section */}
      <div className="col-lg-4 col-md-5">
        <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '12px', background: isDarkMode ? colors.surface : '#fff', borderColor: isDarkMode ? colors.border : '#e9ecef', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div className="card-header text-center py-4"
               style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px', background: isDarkMode ? colors.primary : '#0d6efd', color: '#fff', borderBottom: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}` }}>
            {/* Profile Picture Section */}
            <div className="mb-3" style={{display: 'flex',
                justifyContent: 'center', // Centers children horizontally
                alignItems: 'center',     // Centers children vertically
            }}>
              <img
                src={(function(){ const s = getImageUrl(user?.profilePicture || "/default-avatar.png"); return s; })()}
                alt={user?.name}
                style={{
                  width: 100,
                  height: 100,
                  objectFit: "cover",
                  borderRadius: "50%",
                  border: "3px solid white"
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <FaUserCircle 
                size={100} 
                className="text-white" 
                style={{ display: 'none' }}
              />
            </div>

            {/* Basic Info */}
            <h4 className="fw-bold mb-1 text-white">{user?.name}</h4>
            <p className="mb-2 text-white-50">{user?.email}</p>
            
            {/* Role Badge */}
            <span className="badge bg-white text-secondary px-3 py-2">
              <FaUserGraduate className="me-2" /> {user?.role}
            </span>
          </div>
          
          <div className="card-body p-4" style={{ background: isDarkMode ? colors.surface : '#fff', color: isDarkMode ? colors.text : undefined }}>
            {/* Quick Stats */}
            <div className="row g-2 mb-4">
              <div className="col-4 text-center">
                <div className="rounded p-3" style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa', color: isDarkMode ? colors.text : undefined }}>
                  <div className="fw-bold h5 mb-0">{myVotes.length}</div>
                  <small className="text-muted">Votes</small>
                </div>
              </div>
              <div className="col-4 text-center">
                <div className="rounded p-3" style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa', color: isDarkMode ? colors.text : undefined }}>
                  <div className="fw-bold h5 mb-0">{electionStats.participated}</div>
                  <small className="text-muted">Elections</small>
                </div>
              </div>
              <div className="col-4 text-center">
                <div className="rounded p-3" style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa', color: isDarkMode ? colors.text : undefined }}>
                  <div className="fw-bold h5 mb-0">{notifications.length}</div>
                  <small className="text-muted">Alerts</small>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-grid gap-2">
              <button 
                className="btn btn-primary btn-lg fw-semibold"
                onClick={() => setShowProfile(true)}
                style={{ borderRadius: "10px" }}
              >
                <FaUserEdit className="me-2" /> Edit Profile
              </button>
              <div className="row g-2">
                <div className="col-6">
                  <button 
                    className="btn btn-outline-primary w-100"
                    style={{ borderRadius: "8px" }}
                  >
                    <FaLock className="me-1" /> Security
                  </button>
                </div>
                <div className="col-6">
                  <button 
                    className="btn btn-outline-primary w-100"
                    style={{ borderRadius: "8px" }}
                    onClick={() => setActiveView('history')}
                  >
                    <FaHistory className="me-1" /> Activity
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information Section */}
      <div className="col-lg-8 col-md-7">
        <div className="row g-4">
          {/* Personal Information Card */}
          <div className="col-12">
            <div className="card shadow-sm border-0" style={{ borderRadius: '12px', background: isDarkMode ? colors.surface : '#fff', borderColor: isDarkMode ? colors.border : '#e9ecef', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div className="card-header border-0 py-3"
                   style={{ 
                     borderTopLeftRadius: '12px', 
                     borderTopRightRadius: '12px',
                     background: isDarkMode ? colors.primary : '#0d6efd',
                     color: '#fff',
                     borderBottom: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`
                   }}>
                <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <FaUser /> Personal Information
                </h4>
              </div>
              <div className="card-body p-4" style={{ background: isDarkMode ? colors.surface : '#fff', color: isDarkMode ? colors.text : undefined }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted">
                      <FaUser className="me-2" />Full Name
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={user?.name || ''} 
                      readOnly 
                      style={{ backgroundColor: "#f8f9fa" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted">
                      <FaEnvelope className="me-2" />Email Address
                    </label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={user?.email || ''} 
                      readOnly 
                      style={{ backgroundColor: "#f8f9fa" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted">
                      <FaIdBadge className="me-2" />Student ID
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={user?.studentId || 'N/A'} 
                      readOnly 
                      style={{ backgroundColor: "#f8f9fa" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted">
                      <FaUsers className="me-2" />Department
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={user?.department || 'N/A'} 
                      readOnly 
                      style={{ backgroundColor: "#f8f9fa" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted">
                      <FaBell className="me-2" />Phone Number
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={user?.phone || 'Not provided'} 
                      readOnly 
                      style={{ backgroundColor: "#f8f9fa" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-muted">
                      <FaCalendarAlt className="me-2" />Member Since
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'} 
                      readOnly 
                      style={{ backgroundColor: "#f8f9fa" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="col-12">
            <div className="card shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div className="card-header border-0 py-3 bg-primary text-white"
                   style={{ 
                     borderTopLeftRadius: '12px', 
                     borderTopRightRadius: '12px'
                   }}>
                <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <FaHistory /> Recent Activity
                </h4>
              </div>
              <div className="card-body p-4">
                {myVotes.length > 0 ? (
                  <div className="timeline">
                    {myVotes.slice(0, 5).map((vote, index) => (
                      <div className="d-flex gap-3 mb-4" key={vote._id || index}>
                        <div className="bg-success rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                             style={{ width: '40px', height: '40px' }}>
                          <FaCheckCircle className="text-white" size={16} />
                        </div>
                        <div className="flex-grow-1">
                          <div className="rounded p-3 border" style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa', color: isDarkMode ? colors.text : undefined, borderColor: isDarkMode ? colors.border : '#e9ecef' }}>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <span className="fw-bold text-primary">Election Vote</span>
                                <span className="badge bg-success ms-2">Completed</span>
                              </div>
                              <small className="text-muted fw-semibold">
                                {vote.createdAt ? new Date(vote.createdAt).toLocaleDateString() : 'Recently'}
                              </small>
                            </div>
                            <h6 className="mb-2 text-dark">
                              {typeof vote.electionTitle === 'string' ? vote.electionTitle :
                                (typeof vote.election === 'string' ? vote.election :
                                  (vote.election && typeof vote.election === 'object') ?
                                    (vote.election.title || vote.election.name || vote.election._id || 'Unknown Election')
                                    : 'Unknown Election')}
                            </h6>
                            <p className="mb-0 text-muted">
                              <strong>Voted for:</strong> {typeof vote.candidateName === 'string' ? vote.candidateName :
                                (typeof vote.candidate === 'string' ? vote.candidate :
                                  (vote.candidate && typeof vote.candidate === 'object') ?
                                    (vote.candidate.name || vote.candidate.fullName || vote.candidate._id || 'Unknown Candidate')
                                    : 'Unknown Candidate')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <FaHistory className="text-muted mb-3" size={48} />
                    <h4 className="text-muted mb-2">No Activity Yet</h4>
                    <p className="text-muted mb-4">Start participating in elections to see your voting history here!</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setActiveView('elections')}
                    >
                      <FaPoll className="me-2" />
                      Browse Elections
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
              </div>
        </div>
      </div>
    );
  }
  function renderHistoryView() { return (
      <div className="card shadow-sm border-0" style={{ borderRadius: '12px', background: isDarkMode ? colors.surface : '#fff', borderColor: isDarkMode ? colors.border : '#e9ecef', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div className="card-header d-flex align-items-center justify-content-between"
             style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px', background: isDarkMode ? colors.primary : '#0d6efd', color: '#fff', borderBottom: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}` }}>
          <span className="d-flex align-items-center gap-2">
            <FaHistory /> Activity History
          </span>
        </div>
        <div className="card-body p-4" style={{ background: isDarkMode ? colors.surface : '#fff', color: isDarkMode ? colors.text : undefined }}>
          <div className="timeline">
            {myVotes.map((vote, index) => (
              <div className="timeline-item d-flex gap-3 mb-4" key={vote._id || index}>
                <div className="timeline-marker bg-success rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                  <FaVoteYea className="text-white" size={16} />
                </div>
                <div className="timeline-content flex-grow-1">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="fw-bold mb-0">Vote Cast</h6>
                        <small className="text-muted">
                          {vote.createdAt ? new Date(vote.createdAt).toLocaleDateString() : 'Recently'}
                        </small>
                      </div>
                      <p className="mb-1">Voted in: <strong>{typeof vote.electionTitle === 'string' ? vote.electionTitle :
                        (typeof vote.election === 'string' ? vote.election :
                          (vote.election && typeof vote.election === 'object') ?
                            (vote.election.title || vote.election.name || vote.election._id || 'Unknown Election')
                            : 'Unknown Election')}</strong></p>
                      <p className="mb-0 text-muted">Candidate: Confidential</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {myVotes.length === 0 && (
              <div className="text-center py-5">
                <FaHistory className="mb-3 text-muted" size={48} />
                <h4 className="text-muted">No activity yet</h4>
                <p className="text-muted">Your voting activity will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    ); }

  return (
    <>
      <style>
        {`
          @media (min-width: 1200px) {
            .col-xl-1-5 {
              flex: 0 0 auto;
              width: 12.5%;
            }
          }
          .stat-card-hover {
            transition: transform 0.18s ease, box-shadow 0.18s ease;
          }
          .stat-card-hover:hover {
            transform: translateY(-6px);
            box-shadow: 0 12px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.06);
          }
        `}
      </style>
      <div
        className="min-vh-100"
        style={{
          background: isDarkMode ? colors.background : "#f8f9fa",
          width: "100vw",
          minHeight: "100vh",
          overflowX: "hidden",
          margin: 0,
          padding: 0,
          color: isDarkMode ? colors.text : 'inherit',
          transition: 'background-color 0.3s ease, color 0.3s ease'
        }}
      >
      {/* Top Navigation */}
      <nav
        className="navbar navbar-expand-lg shadow-sm"
        style={{
          width: "100%",
          margin: 0,
          padding: '0.6rem 1rem',
          height: '72px',
          alignItems: 'center',
          background: isDarkMode ? colors.surface : '#0d6efd',
          borderBottom: `1px solid ${isDarkMode ? colors.border : '#0d6efd'}`,
          color: isDarkMode ? colors.text : '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}
      >
        <div className="container-fluid" style={{ maxWidth: "100%", padding: "0 0.5rem", margin: 0 }}>
          <span className="navbar-brand d-flex align-items-center gap-2">
            {/* Hamburger menu for mobile */}
            <button
              className="btn btn-sm me-2 d-lg-none"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar menu"
              style={{
                background: isDarkMode ? colors.surfaceHover : 'rgba(255,255,255,0.2)',
                color: isDarkMode ? colors.text : '#fff',
                border: `1px solid ${isDarkMode ? colors.border : 'rgba(255,255,255,0.3)'}`,
              }}
            >
              <FaBars />
            </button>
            <FaUserGraduate size={22} className="text-white" />
            <span className="fw-bold d-none d-md-inline text-white" style={{ fontSize: '1.2rem' }}>Student Portal</span>
            <span className="fw-bold d-md-none text-white" style={{ fontSize: '1rem' }}>Portal</span>
          </span>
          
          {/* User Actions */}
          <div
            className="d-flex align-items-center gap-2"
            style={{
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              rowGap: '0.35rem',
              maxWidth: '75vw'
            }}
          >
            {/* Role Switcher (only shows for student-candidates) */}
            <RoleSwitcher user={user} isDarkMode={isDarkMode} colors={colors} />

            {/* Theme Toggle */}
            <button
              className="btn btn-sm"
              onClick={toggleTheme}
              style={{
                background: isDarkMode ? colors.surfaceHover : 'rgba(255,255,255,0.2)',
                color: isDarkMode ? colors.primary : '#fff',
                border: `1px solid ${isDarkMode ? colors.border : 'rgba(255,255,255,0.3)'}`,
                transition: 'all 0.2s ease'
              }}
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
            </button>

            {/* Notifications */}
            <div className="dropdown">
              <button 
                className="btn btn-sm"
                style={{
                  background: isDarkMode ? colors.surfaceHover : 'rgba(255,255,255,0.2)',
                  color: isDarkMode ? colors.text : '#fff',
                  border: `1px solid ${isDarkMode ? colors.border : 'rgba(255,255,255,0.3)'}`,
                  position: 'relative'
                }}
                data-bs-toggle="dropdown"
              >
                <FaBell />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger z-3">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              <ul className="dropdown-menu dropdown-menu-end p-0" style={{ background: isDarkMode ? colors.surface : '#fff', borderColor: isDarkMode ? colors.border : '#dee2e6', minWidth: '280px', maxWidth: '320px', borderRadius: '5px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                <li className="dropdown-header px-3 pt-2 pb-1" style={{ color: isDarkMode ? colors.textSecondary : '#6c757d', fontWeight: 700, fontSize: '0.97rem', letterSpacing: '0.2px' }}>Recent Notifications</li>
                {notifications.length === 0 && (
                  <li className="text-center text-muted small py-3">No notifications</li>
                )}
                {notifications.slice(0, 3).map((notif, index) => {
                  // Icon and color for type
                  let icon = <FaInfoCircle className="text-info" size={16} />;
                  let bg = notif.read ? (isDarkMode ? colors.surface : '#fff') : (isDarkMode ? 'rgba(16,185,129,0.08)' : '#e6f7f1');
                  let border = notif.read ? 'none' : (isDarkMode ? '1px solid #10b981' : '1px solid #10b98122');
                  if (notif.type === 'success') icon = <FaCheckCircle className="text-success" size={16} />;
                  if (notif.type === 'alert' || notif.type === 'warning') icon = <FaExclamationTriangle className="text-warning" size={16} />;
                  if (notif.type === 'error') icon = <FaTimes className="text-danger" size={16} />;
                  return (
                    <li key={index} className="px-2 py-1" style={{ background: bg, borderBottom: '1px solid ' + (isDarkMode ? colors.border : '#f1f3f5'), borderLeft: border, borderRight: border, borderTop: border, borderRadius: '8px', margin: '0.3rem 0.3rem 0 0.3rem', boxShadow: notif.read ? 'none' : '0 2px 8px rgba(16,185,129,0.06)' }}>
                      <button
                        className="d-flex align-items-center gap-3 w-100 border-0 bg-transparent p-0"
                        style={{ cursor: 'pointer', textAlign: 'left' }}
                        onClick={() => {
                          setSelectedNotification(notif);
                          setShowNotificationModal(true);
                        }}
                        onMouseEnter={e => e.currentTarget.parentNode.style.background = isDarkMode ? colors.surfaceHover : '#f8f9fa'}
                        onMouseLeave={e => e.currentTarget.parentNode.style.background = bg}
                      >
                        <span style={{ flexShrink: 0 }}>{icon}</span>
                        <span className="flex-grow-1" style={{ minWidth: 0 }}>
                          <span className="fw-semibold text-truncate d-block" style={{ maxWidth: 140, fontSize: '0.95rem', color: isDarkMode ? colors.text : '#222' }}>{typeof notif.title === 'string' ? notif.title : 'Notification'}</span>
                            <span className="d-block text-muted small text-truncate" style={{ maxWidth: 140 }}>{typeof notif.message === 'string' ? notif.message : (notif.content || '')}</span>
                        </span>
                        <span className="d-flex flex-column align-items-end ms-2" style={{ minWidth: 48 }}>
                          <span className="small text-muted" style={{ fontSize: '0.72rem' }}>{notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                          {!notif.read && <span className="badge bg-primary mt-1" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>New</span>}
                        </span>
                      </button>
                    </li>
                  );
                })}
                <li><hr className="dropdown-divider my-1" style={{ borderColor: isDarkMode ? colors.border : '#dee2e6' }} /></li>
                <li className="px-2 pb-2 pt-1">
                  <button
                    className="btn btn-primary w-100 rounded-3 fw-semibold"
                    style={{ fontSize: '0.93rem', boxShadow: '0 2px 8px rgba(59,130,246,0.06)', padding: '0.4rem 0' }}
                    onClick={() => setActiveView('notifications')}
                  >
                    View All Notifications
                  </button>
                </li>
              </ul>
            </div>

            {/* Profile Dropdown */}
            <div className="dropdown">
              <button 
                className="btn btn-sm d-flex align-items-center gap-2"
                style={{
                  background: isDarkMode ? colors.surfaceHover : 'rgba(255,255,255,0.2)',
                  color: isDarkMode ? colors.text : '#fff',
                  border: `1px solid ${isDarkMode ? colors.border : 'rgba(255,255,255,0.3)'}`,
                  whiteSpace: 'nowrap'
                }}
                data-bs-toggle="dropdown"
              >
                <FaUserCircle /> 
                <span className="d-none d-md-inline">{user?.name?.split(' ')[0]}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end" style={{ background: isDarkMode ? colors.surface : '#fff', borderColor: isDarkMode ? colors.border : '#dee2e6' }}>
                <li>
                  <button className="dropdown-item" onClick={() => setActiveView('profile')}
                    style={{ color: isDarkMode ? colors.text : '#212529', background: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? colors.surfaceHover : '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <FaUserEdit className="me-2" /> View Profile
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => setShowProfile(true)}
                    style={{ color: isDarkMode ? colors.text : '#212529', background: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? colors.surfaceHover : '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <FaUserEdit className="me-2" /> Edit Profile
                  </button>
                </li>
                <li><hr className="dropdown-divider" style={{ borderColor: isDarkMode ? colors.border : '#dee2e6' }} /></li>
                <li>
                  <button 
                    className="dropdown-item"
                    style={{ color: '#dc3545', background: 'transparent' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = isDarkMode ? colors.surfaceHover : '#f8f9fa'; }}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => {
                      localStorage.removeItem("token");
                      navigate("/login");
                    }}
                  >
                    <FaSignOutAlt className="me-2" /> Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            // background: 'rgba(0,0,0,0.5)',
            zIndex: 1999,
            display: 'block'
          }}
          className="d-lg-none"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <div
        style={{
          width: sidebarOpen ? '320px' : '0',
          background: isDarkMode ? colors.surface : '#fff',
          borderRight: `1px solid ${colors.border}`,
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          position: 'fixed',
          height: '100vh',
          zIndex: 2000,
          left: 0,
          top: 0,
          display: 'none'
        }}
        className="d-lg-none"
      >
        <div style={{ padding: '1rem' }}>
          <div className="d-flex align-items-center justify-content-end mb-3">
            <button
              className="btn btn-sm"
              onClick={() => setSidebarOpen(false)}
              style={{ 
                color: colors.text,
                background: 'transparent',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FaTimes size={14} />
            </button>
          </div>
          
          {/* Mobile Profile Section */}
          
          {/* Mobile Menu Items */}
          <nav>
            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setSidebarOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.5rem 0.6rem',
                    marginBottom: '0.2rem',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    border: 'none',
                    background: activeView === item.id ? colors.primary : 'transparent',
                    color: activeView === item.id ? '#fff' : colors.text,
                    transition: 'all 0.2s',
                    fontSize: '0.8rem'
                  }}
                >
                  <span className="d-flex align-items-center gap-2">
                    <IconComponent size={16} />
                    {item.label}
                  </span>
                  {item.badge !== null && typeof item.badge !== 'object' && item.badge > 0 && (
                    <span className="badge rounded-pill"
                      style={{
                        background: activeView === item.id ? '#fff' : colors.primary,
                        color: activeView === item.id ? colors.primary : '#fff',
                        fontSize: '0.65rem'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

  <div className="d-flex" style={{ width: "100%", maxWidth: "100%", margin: 0, padding: 0, height: "calc(100vh - 72px)" }}>
        {/* Sidebar for large screens */}
        <div className="shadow-sm border-end d-none d-lg-block"
             style={{
               width: '280px',
               minWidth: '280px',
               maxWidth: '280px',
               height: '100%',
               flexShrink: 0,
               overflowX: 'hidden',
               margin: 0,
               padding: 0,
               background: isDarkMode ? colors.surface : '#fff',
               borderColor: isDarkMode ? colors.border : '#dee2e6',
             }}>
          <div style={{ padding: '1.5rem' }}>
            {/* Student Profile Section */}
            <div style={{
              marginBottom: '1rem',
              padding: '1rem',
              background: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
              borderRadius: '12px',
              border: `1px solid rgba(59, 130, 246, 0.2)`
            }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: user?.profilePicture ? 'transparent' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '2rem',
                  margin: '0 auto 1rem',
                  overflow: 'hidden',
                  border: `3px solid rgba(59, 130, 246, 0.3)`,
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                }}
              >
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture.startsWith('http') ? user.profilePicture : `/uploads/${user.profilePicture}`} 
                    alt={user?.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span style={{ display: user?.profilePicture ? 'none' : 'flex' }}>
                  {user?.name?.charAt(0) || 'S'}
                </span>
              </div>
              <div className="text-center">
                <div className="fw-bold" style={{ color: colors.text, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                  {user?.name || 'Student'}
                </div>
                <div style={{ 
                  fontSize: '0.85rem', 
                  color: '#3b82f6',
                  fontWeight: '500',
                  marginBottom: '0.25rem'
                }}>
                  🎓 Student
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.textSecondary }}>
                  {user?.email}
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div style={{
              marginBottom: '0.75rem',
              padding: '0.75rem',
              background: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
              borderRadius: '8px',
              border: `1px solid rgba(16, 185, 129, 0.2)`
            }}>
              <div className="text-center">
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#10b981',
                  fontWeight: '600',
                  marginBottom: '0.25rem'
                }}>
                  🟢 Voting Enabled
                </div>
                <div style={{ fontSize: '0.7rem', color: colors.textSecondary }}>
                  Ready to participate in elections
                </div>
              </div>
            </div>
            {/* Menu Items */}
            <nav>
              {sidebarItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      marginBottom: '0.3rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      border: 'none',
                      background: activeView === item.id ? colors.primary : 'transparent',
                      color: activeView === item.id ? '#fff' : colors.text,
                      transition: 'all 0.2s',
                      fontSize: '0.85rem'
                    }}
                    onMouseEnter={(e) => {
                      if (activeView !== item.id) {
                        e.currentTarget.style.background = colors.sidebarHover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeView !== item.id) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <span className="d-flex align-items-center gap-2">
                      <IconComponent size={16} />
                      {item.label}
                    </span>
                    {item.badge !== null && typeof item.badge !== 'object' && item.badge > 0 && (
                      <span className="badge rounded-pill"
                        style={{
                          background: activeView === item.id ? '#fff' : colors.primary,
                          color: activeView === item.id ? colors.primary : '#fff',
                          fontSize: '0.7rem'
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
          {/* Sidebar Footer */}
          <div style={{ 
            marginTop: '0.5em', 
            paddingTop: '0.5rem', 
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
            paddingBottom: '1.5rem',
            borderTop: `1px solid ${colors.border}`,
            zIndex: 2000
          }}>
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              marginBottom: '0.75rem' 
            }}>
              <button
                className="btn btn-sm flex-fill"
                onClick={toggleTheme}
                style={{
                  background: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                  color: isDarkMode ? '#f59e0b' : '#3b82f6',
                  border: `1px solid ${isDarkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                  borderRadius: '6px',
                  padding: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
              >
                {isDarkMode ? <FaSun className="me-1" /> : <FaMoon className="me-1" />}
                {isDarkMode ? 'Light' : 'Dark'}
              </button>
              <button
                className="btn btn-sm flex-fill"
                style={{
                  background: 'rgba(220, 53, 69, 0.1)',
                  color: '#dc3545',
                  border: '1px solid rgba(220, 53, 69, 0.3)',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dc3545';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(220, 53, 69, 0.1)';
                  e.currentTarget.style.color = '#dc3545';
                }}
                onClick={async () => {
                  const result = await Swal.fire({
                    title: 'Are you sure?',
                    text: 'You will be logged out of your account.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#dc3545',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: 'Yes, logout',
                    cancelButtonText: 'Cancel',
                    background: colors.surface,
                    color: colors.text
                  });
                  if (result.isConfirmed) {
                    localStorage.removeItem('token');
                    navigate('/login');
                  }
                }}
              >
                <FaSignOutAlt className="me-1" />
                Logout
              </button>
            </div>
            <div className="text-center" style={{ 
              color: colors.textMuted, 
              fontSize: '0.7rem',
              lineHeight: '1.2'
            }}>
              Campus Ballot • Student Portal
            </div>
          </div>
        </div>
        {/* Sidebar for mobile screens */}
        <div
          className={`shadow-sm border-end position-fixed top-0 start-0 h-100 d-lg-none${sidebarOpen ? '' : ' d-none'}`}
          style={{
            // display: 'none',
            width: '80vw',
            maxWidth: '320px',
            zIndex: 2000,
            transition: 'transform 0.3s',
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            boxShadow: sidebarOpen ? '2px 0 16px rgba(0,0,0,0.08)' : 'none',
            background: isDarkMode ? colors.surface : '#fff',
            borderColor: isDarkMode ? colors.border : '#dee2e6',
          }}
        >
          <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="text-uppercase small fw-bold mb-0" style={{ color: isDarkMode ? colors.textSecondary : '#6c757d' }}>Navigation</h6>
              <button 
                className="btn btn-outline-secondary btn-sm" 
                onClick={() => setSidebarOpen(false)} 
                aria-label="Close sidebar menu"
                style={{
                  borderColor: isDarkMode ? colors.border : '#dee2e6',
                  color: isDarkMode ? colors.text : 'inherit'
                }}
              >
                <FaTimes />
              </button>
            </div>
            
            {/* Enhanced Profile Section */}
            <div style={{
            marginBottom: '0.75rem',
            padding: '0.75rem',
            background: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            borderRadius: '8px',
            border: `1px solid rgba(59, 130, 246, 0.2)`
          }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: user?.profilePicture ? 'transparent' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '1.3rem',
                margin: '0 auto 0.5rem',
                overflow: 'hidden',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)'
              }}
            >
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture.startsWith('http') ? user.profilePicture : `/uploads/${user.profilePicture}`} 
                  alt={user?.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <span style={{ display: user?.profilePicture ? 'none' : 'flex' }}>
                {user?.name?.charAt(0) || 'S'}
              </span>
            </div>
            <div className="text-center">
              <div className="fw-bold" style={{ 
                color: colors.text, 
                fontSize: '0.85rem', 
                marginBottom: '0.2rem',
                lineHeight: '1.1'
              }}>
                {user?.name || 'Student'}
              </div>
              <div style={{ 
                fontSize: '0.7rem', 
                color: '#3b82f6',
                fontWeight: '500',
                marginBottom: '0.2rem'
              }}>
                🎓 Student
              </div>
              <div style={{ 
                fontSize: '0.65rem', 
                color: colors.textSecondary,
                wordBreak: 'break-word',
                lineHeight: '1.1'
              }}>
                {user?.email}
              </div>
            </div>
          </div>

          {/* Status Section */}
            <div style={{
              marginBottom: '0.75rem',
              padding: '0.75rem',
              background: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
              borderRadius: '8px',
              border: `1px solid rgba(16, 185, 129, 0.2)`
            }}>
              <div className="text-center">
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#10b981',
                  fontWeight: '600',
                  marginBottom: '0.25rem'
                }}>
                  🟢 Voting Enabled
                </div>
                <div style={{ fontSize: '0.7rem', color: colors.textSecondary }}>
                  Ready to participate in elections
                </div>
              </div>
            </div>
          
            <nav className="nav flex-column">
              {sidebarItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`nav-link btn btn-link text-start border-0 rounded d-flex align-items-center justify-content-between`}
                    onClick={() => {
                      setActiveView(item.id);
                      setSidebarOpen(false);
                    }}
                    style={{ 
                      textDecoration: 'none',
                      background: activeView === item.id ? colors.primary : 'transparent',
                      color: activeView === item.id ? '#fff' : isDarkMode ? colors.text : '#212529',
                      transition: 'all 0.2s ease',
                      padding: '0.45rem 0.6rem',
                      fontSize: '0.85rem',
                      borderRadius: '8px',
                      marginBottom: '0.35rem'
                    }}
                    onMouseEnter={(e) => {
                      if (activeView !== item.id) {
                        e.currentTarget.style.background = isDarkMode ? colors.surfaceHover : '#f8f9fa';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeView !== item.id) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <span className="d-flex align-items-center gap-2">
                      <IconComponent size={16} />
                      {item.label}
                    </span>
                    {item.badge !== null && typeof item.badge !== 'object' && item.badge > 0 && (
                      <span className={`badge rounded-pill`}
                        style={{
                          background: activeView === item.id ? '#fff' : colors.primary,
                          color: activeView === item.id ? colors.primary : '#fff'
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            {/* Mobile Sidebar Logout Button */}
            <div className="mt-1 pt-1" style={{ borderTop: `1px solid ${isDarkMode ? colors.border : '#dee2e6'}` }}>
              {/* Sidebar Footer */}
<div style={{ 
  // marginTop: '1rem', 
  padding: '1rem 1.5rem 1.5rem', // Shorthand for top, sides, bottom
  // borderTop: `1px solid ${colors.border}`,
  // zIndex: 2000,
  position: 'relative' // Essential for zIndex to function
}}>
  <div className="d-flex" style={{ gap: '0.5rem', marginBottom: '0.75rem' }}>
    <button
      className="btn btn-sm flex-fill d-flex align-items-center justify-content-center"
      onClick={toggleTheme}
      style={{
        background: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
        color: isDarkMode ? '#f59e0b' : '#3b82f6',
        border: `1px solid ${isDarkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
        borderRadius: '6px',
        padding: '0.5rem',
        fontSize: '0.75rem',
        fontWeight: '500'
      }}
    >
      {isDarkMode ? <FaSun className="me-1" /> : <FaMoon className="me-1" />}
      {isDarkMode ? 'Light' : 'Dark'}
    </button>
    <button
      className="btn btn-sm flex-fill d-flex align-items-center justify-content-center"
      style={{
        background: 'rgba(220, 53, 69, 0.1)',
        color: '#dc3545',
        border: '1px solid rgba(220, 53, 69, 0.3)',
        borderRadius: '6px',
        padding: '0.5rem',
        fontSize: '0.75rem',
        fontWeight: '500'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#dc3545';
        e.currentTarget.style.color = '#fff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(220, 53, 69, 0.1)';
        e.currentTarget.style.color = '#dc3545';
      }}
      onClick={async () => {
        const result = await Swal.fire({
          title: 'Are you sure?',
          text: 'You will be logged out of your account.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#dc3545',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Yes, logout',
          background: colors.surface,
          color: colors.text,
         
        });
        if (result.isConfirmed) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }}
    >
      <FaSignOutAlt className="me-1" />
      Logout
    </button>
  </div>
  <div className="text-center" style={{ 
    color: colors.textMuted, 
    fontSize: '0.7rem',
    lineHeight: '1.2'
  }}>
    Campus Ballot • Student Portal
  </div>
</div>

            </div>
          </div>
        </div>
        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ background: 'rgba(0,0,0,0.2)', zIndex: 1999 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-grow-1 p-2 p-md-3" style={{ 
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden",
          overflowY: "auto",
          minWidth: 0,
          height: "100%",
          margin: 0,
          WebkitOverflowScrolling: 'touch'
        }}>
          {/* Breadcrumb */}
          {/* <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <button 
                  className="btn btn-link p-0 text-decoration-none"
                  onClick={() => setActiveView('dashboard')}
                >
                  Dashboard
                </button>
              </li>
              {activeView !== 'dashboard' && (
                <li className="breadcrumb-item active" aria-current="page">
                  {sidebarItems.find(item => item.id === activeView)?.label}
                </li>
              )}
            </ol>
          </nav> */}

          {/* Page Header */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-md-center mb-4" style={{ marginLeft: window.innerWidth <= 768 ? '0.75rem' : '1rem', marginRight: window.innerWidth <= 768 ? '0.75rem' : '1rem' }}>
            {/* <div>
              {/* <h4 className="fw-bold mb-1">
                {sidebarItems.find(item => item.id === activeView)?.label || 'Dashboard'}
              </h4> */}
              {/* <p className="text-muted mb-0">
                {activeView === 'dashboard' && 'Welcome to your student portal dashboard'}
                {activeView === 'elections' && 'Browse and participate in elections'}
                {activeView === 'my-votes' && 'View your voting history'}
                {activeView === 'notifications' && 'Stay updated with important announcements'}
                {activeView === 'profile' && 'Manage your profile information'}
                {activeView === 'history' && 'Track your activity timeline'}
              </p> 
            </div> */}
            {activeView === 'dashboard' && (
              <div className="d-flex gap-2 mt-2 mt-md-0" style={{ marginRight: window.innerWidth <= 768 ? '0.75rem' : '1rem' }}>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={refreshData}
                  disabled={loading}
                >
                  <FaCog className={loading ? 'fa-spin me-1' : 'me-1'} />
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setActiveView('elections')}
                >
                  <FaPoll className="me-1" />
                  View Elections
                </button>
              </div>
            )}
          </div>

          {/* Dynamic Content */}
          {renderActiveView()}
        </div>
      </div>

      {/* Enhanced Election Details Modal */}
      {selectedElection && showElectionModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050, padding: window.innerWidth <= 768 ? '0.25rem' : '1rem' }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable" style={{ margin: window.innerWidth <= 768 ? '0.25rem auto' : '1rem auto', maxWidth: window.innerWidth <= 768 ? 'calc(100% - 0.5rem)' : undefined }}>
            <style>
              {`
                .modal-dialog-scrollable .modal-body::-webkit-scrollbar {
                  width: 6px;
                }
                .modal-dialog-scrollable .modal-body::-webkit-scrollbar-track {
                  background: ${isDarkMode ? colors.surface : '#f1f1f1'};
                  border-radius: 10px;
                }
                .modal-dialog-scrollable .modal-body::-webkit-scrollbar-thumb {
                  background: ${isDarkMode ? colors.border : '#888'};
                  border-radius: 10px;
                }
                .modal-dialog-scrollable .modal-body::-webkit-scrollbar-thumb:hover {
                  background: ${isDarkMode ? colors.textSecondary : '#555'};
                }
                /* Firefox */
                .modal-dialog-scrollable .modal-body {
                  scrollbar-width: thin;
                  scrollbar-color: ${isDarkMode ? colors.border : '#888'} ${isDarkMode ? colors.surface : '#f1f1f1'};
                }
              `}
            </style>
            <div className={`modal-content border-0 shadow-lg`} style={{ background: isDarkMode ? colors.surface : '#fff', color: isDarkMode ? colors.text : 'inherit', borderRadius: '4px' }}>
              <div className={`modal-header border-bottom`} style={{ borderColor: isDarkMode ? colors.border : '#dee2e6', background: isDarkMode ? colors.surfaceHover : '#f8f9fa', padding: '1rem 1.5rem' }}>
                <div className="d-flex align-items-center gap-3">
                  <div className={`rounded-circle d-flex align-items-center justify-content-center`} style={{ width: 48, height: 48, background: isDarkMode ? colors.primary + '20' : 'rgba(59, 130, 246, 0.1)' }}>
                    <FaPoll className="text-primary" size={20} />
                  </div>
                  <div>
                    <h4 className="modal-title mb-0 fw-bold" style={{ fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.5rem' }}>{selectedElection.title}</h4>
                    <small className="text-muted" style={{ fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.875rem' }}>Election Details & Voting</small>
                  </div>
                </div>
                <button 
                  className="btn-close" 
                  onClick={() => {
                    setShowElectionModal(false);
                    setSelectedElection(null);
                    setSelectedCandidatesForComparison([]);
                    setShowCandidateComparison(false);
                  }}
                ></button>
              </div>
              <div className="modal-body p-0">
                {(() => {
                  const { status, color, icon: StatusIcon } = getElectionStatus(selectedElection);
                  const voted = myVotes.some((v) => v.election === selectedElection._id);
                  const approvedCandidates = (selectedElection.candidates || []).filter(
                    (c) => c.status === "approved"
                  );

                  return (
                    <div>
                      {/* Election Header */}
                      <div className={`border-bottom`} style={{ borderColor: isDarkMode ? colors.border : '#dee2e6', background: isDarkMode ? colors.surface : '#fff', padding: window.innerWidth <= 768 ? '1rem' : '1.5rem' }}>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="flex-grow-1">
                            <div className="d-flex flex-wrap gap-2 mb-3">
                              <span className={`badge bg-${color} d-flex align-items-center gap-1 px-2 py-1`} style={{ fontSize: window.innerWidth <= 768 ? '0.7rem' : '0.8rem' }}>
                                <StatusIcon size={12} />
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </span>
                              {voted && (
                                <span className="badge bg-success d-flex align-items-center gap-1 px-2 py-1" style={{ fontSize: window.innerWidth <= 768 ? '0.7rem' : '0.8rem' }}>
                                  <FaCheckCircle size={12} />
                                  Voted
                                </span>
                              )}
                              {selectedElection.positions && Array.isArray(selectedElection.positions) && (
                                <span className="badge bg-info d-flex align-items-center gap-1 px-2 py-1" style={{ fontSize: window.innerWidth <= 768 ? '0.7rem' : '0.8rem' }}>
                                  <FaUsers size={12} />
                                  {selectedElection.positions.length} Position{selectedElection.positions.length > 1 ? 's' : ''}
                                </span>
                              )}
                              <span className="badge bg-secondary d-flex align-items-center gap-1 px-2 py-1" style={{ fontSize: window.innerWidth <= 768 ? '0.7rem' : '0.8rem' }}>
                                <FaUsers size={12} />
                                {approvedCandidates.length} Candidate{approvedCandidates.length > 1 ? 's' : ''}
                              </span>
                            </div>
                            <p className={`mb-3`} style={{ color: isDarkMode ? colors.textSecondary : '#6c757d', fontSize: window.innerWidth <= 768 ? '0.85rem' : '0.95rem', lineHeight: 1.5 }}>{selectedElection.description}</p>
                          </div>
                        </div>
                        
                        {/* Election Details Table */}
                        <div className={`card border mb-4`} style={{ borderColor: isDarkMode ? colors.border : '#e9ecef', background: isDarkMode ? colors.surfaceHover : '#f8f9fa', borderRadius: '4px' }}>
                          <div className="card-body" style={{ padding: window.innerWidth <= 768 ? '0.75rem' : '1rem' }}>
                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem', color: isDarkMode ? colors.text : 'inherit' }}>
                              <FaInfoCircle className="text-primary" size={16} />
                              Election Information
                            </h6>
                            <div className="table-responsive">
                              <table className={`table table-sm mb-0`} style={{ background: isDarkMode ? colors.surface : '#fff', borderRadius: '4px', overflow: 'hidden' }}>
                                <thead style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa' }}>
                                  <tr>
                                    <th className="border-0" style={{ fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.8rem', padding: '0.5rem', color: isDarkMode ? '#f9fafb' : 'inherit' }}>
                                      <FaCalendarAlt className="text-primary me-1" size={12} />
                                      Starts
                                    </th>
                                    <th className="border-0" style={{ fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.8rem', padding: '0.5rem', color: isDarkMode ? '#f9fafb' : 'inherit' }}>
                                      <FaClock className="text-warning me-1" size={12} />
                                      Ends
                                    </th>
                                    <th className="border-0" style={{ fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.8rem', padding: '0.5rem', color: isDarkMode ? '#f9fafb' : 'inherit' }}>
                                      <FaPoll className="text-success me-1" size={12} />
                                      Status
                                    </th>
                                    <th className="border-0" style={{ fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.8rem', padding: '0.5rem', display: window.innerWidth <= 768 ? 'none' : 'table-cell', color: isDarkMode ? '#f9fafb' : 'inherit' }}>
                                      <FaUsers className="text-info me-1" size={12} />
                                      Turnout
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td className="border-0" style={{ fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.85rem', padding: '0.5rem', color: isDarkMode ? '#e5e7eb' : 'inherit' }}>
                                      <div className="fw-semibold" style={{ color: isDarkMode ? '#f9fafb' : 'inherit' }}>{new Date(selectedElection.startDate).toLocaleDateString()}</div>
                                      <small style={{ color: isDarkMode ? '#9ca3af' : '#6c757d', fontSize: window.innerWidth <= 768 ? '0.65rem' : '0.7rem' }}>
                                        {new Date(selectedElection.startDate).toLocaleTimeString()}
                                      </small>
                                    </td>
                                    <td className="border-0" style={{ fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.85rem', padding: '0.5rem', color: isDarkMode ? '#e5e7eb' : 'inherit' }}>
                                      <div className="fw-semibold" style={{ color: isDarkMode ? '#f9fafb' : 'inherit' }}>{new Date(selectedElection.endDate).toLocaleDateString()}</div>
                                      <small style={{ color: isDarkMode ? '#9ca3af' : '#6c757d', fontSize: window.innerWidth <= 768 ? '0.65rem' : '0.7rem' }}>
                                        {formatTimeRemaining(selectedElection.endDate)}
                                      </small>
                                    </td>
                                    <td className="border-0" style={{ fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.85rem', padding: '0.5rem', color: isDarkMode ? '#e5e7eb' : 'inherit' }}>
                                      <span className={`badge bg-${color}`} style={{ fontSize: window.innerWidth <= 768 ? '0.7rem' : '0.75rem' }}>
                                        <StatusIcon size={10} className="me-1" />
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                      </span>
                                      <div>
                                        <small style={{ color: isDarkMode ? '#9ca3af' : '#6c757d', fontSize: window.innerWidth <= 768 ? '0.65rem' : '0.7rem' }}>
                                          {status === 'active' ? 'Voting open' : status === 'upcoming' ? 'Not started' : 'Completed'}
                                        </small>
                                      </div>
                                    </td>
                                    <td className="border-0" style={{ fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.85rem', padding: '0.5rem', display: window.innerWidth <= 768 ? 'none' : 'table-cell', color: isDarkMode ? '#e5e7eb' : 'inherit' }}>
                                      <div className="fw-semibold text-primary">{selectedElection.totalVotes || 0}</div>
                                      <small style={{ color: isDarkMode ? '#9ca3af' : '#6c757d', fontSize: window.innerWidth <= 768 ? '0.65rem' : '0.7rem' }}>
                                        votes cast
                                      </small>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                        
                        {/* Candidate Comparison Toggle */}
                        {approvedCandidates.length > 1 && (
                          <div className="d-flex flex-wrap gap-2 mb-3">
                            <button
                              className={`btn btn-sm ${showCandidateComparison ? 'btn-primary' : 'btn-outline-primary'}`}
                              onClick={() => setShowCandidateComparison(!showCandidateComparison)}
                              style={{ fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.8rem' }}
                            >
                              <FaEye className="me-1" />
                              {showCandidateComparison ? 'Hide' : 'Show'} Comparison
                            </button>
                            {showCandidateComparison && (
                              <div className="btn-group" role="group">
                                <button
                                  className={`btn btn-sm ${comparisonMode === 'side-by-side' ? 'btn-primary' : 'btn-outline-primary'}`}
                                  onClick={() => setComparisonMode('side-by-side')}
                                  style={{ fontSize: window.innerWidth <= 768 ? '0.7rem' : '0.75rem' }}
                                >
                                  Side by Side
                                </button>
                                <button
                                  className={`btn btn-sm ${comparisonMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
                                  onClick={() => setComparisonMode('table')}
                                  style={{ fontSize: window.innerWidth <= 768 ? '0.7rem' : '0.75rem' }}
                                >
                                  Table View
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Candidates Section */}
                      <div style={{ padding: window.innerWidth <= 768 ? '1rem' : '1.5rem' }}>
                        {showCandidateComparison && approvedCandidates.length > 1 ? (
                          // Comparison View
                          comparisonMode === 'side-by-side' ? (
                            <div className="row g-3">
                              {approvedCandidates.map((candidate, idx) => (
                                <div className="col-lg-6" key={candidate._id || candidate.id}>
                                  <div className={`card border h-100 position-relative`} 
                                       style={{ 
                                         borderRadius: '4px', 
                                         background: voted ? (isDarkMode ? colors.surfaceHover : '#f8f9fa') : (isDarkMode ? colors.surface : 'white'),
                                         borderColor: selectedCandidatesForComparison.includes(candidate._id) ? '#007bff' : (isDarkMode ? colors.border : '#dee2e6'),
                                         borderWidth: selectedCandidatesForComparison.includes(candidate._id) ? '2px' : '1px'
                                       }}>
                                    <div className="card-body" style={{ padding: window.innerWidth <= 768 ? '1rem' : '1.5rem' }}>
                                      <div className="d-flex align-items-start gap-2 mb-3">
                                        <div className="position-relative">
                                          <img
                                            src={getImageUrl(candidate.photo || "/default-avatar.png")}
                                            alt={candidate.name}
                                            style={{
                                              width: window.innerWidth <= 768 ? 50 : 70,
                                              height: window.innerWidth <= 768 ? 50 : 70,
                                              objectFit: "cover",
                                              borderRadius: "50%",
                                              border: "2px solid #e5e7eb",
                                            }}
                                          />
                                          <span className="position-absolute top-0 start-0 translate-middle badge rounded-pill bg-primary" style={{ fontSize: window.innerWidth <= 768 ? '0.6rem' : '0.7rem' }}>
                                            #{idx + 1}
                                          </span>
                                        </div>
                                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                          <h5 className="fw-bold mb-2 d-flex align-items-center gap-2" style={{ fontSize: window.innerWidth <= 768 ? '0.9rem' : '1.1rem' }}>
                                            <span className="text-truncate" title={candidate.name}>{candidate.name}</span>
                                            {candidate.position && (
                                              <span className="badge bg-success" style={{ fontSize: window.innerWidth <= 768 ? '0.6rem' : '0.7rem' }}>{candidate.position}</span>
                                            )}
                                          </h5>
                                          <div className="d-flex align-items-center gap-2 mb-2">
                                            {candidate.symbol && (
                                              <img src={getImageUrl(candidate.symbol)} alt={`${candidate.party || 'Party'} symbol`} 
                                                   style={{ width: window.innerWidth <= 768 ? 24 : 32, height: window.innerWidth <= 768 ? 24 : 32, objectFit: 'contain', borderRadius: 4 }} />
                                            )}
                                            <div>
                                              <div className="fw-semibold" style={{ fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem' }}>{candidate.party || 'Independent'}</div>
                                              <small className="text-muted" style={{ fontSize: window.innerWidth <= 768 ? '0.65rem' : '0.75rem' }}>Party Affiliation</small>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Candidate Details */}
                                      {candidate.manifesto && (
                                        <div className="mb-3">
                                          <h6 className="fw-semibold mb-2 d-flex align-items-center gap-2" style={{ fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem' }}>
                                            <FaFileAlt className="text-primary" size={window.innerWidth <= 768 ? 12 : 14} />
                                            Manifesto
                                          </h6>
                                          <div className={`p-2 rounded`} style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa', fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.85rem', lineHeight: 1.4 }}>
                                            {candidate.manifesto.length > (window.innerWidth <= 768 ? 100 : 200) ? (
                                              <>
                                                {candidate.manifesto.slice(0, window.innerWidth <= 768 ? 100 : 200)}...
                                                <button className="btn btn-link p-0 ms-1 text-decoration-none" style={{ fontSize: window.innerWidth <= 768 ? '0.7rem' : '0.8rem' }}>
                                                  Read more
                                                </button>
                                              </>
                                            ) : candidate.manifesto}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Vote Stats */}
                                      {typeof candidate.votes === "number" && (
                                        <div className="mb-3">
                                          <h6 className="fw-semibold mb-2 d-flex align-items-center gap-2" style={{ fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem' }}>
                                            <FaChartBar className="text-success" size={window.innerWidth <= 768 ? 12 : 14} />
                                            Current Standing
                                          </h6>
                                          <div className="d-flex align-items-center gap-3">
                                            <div className="progress flex-grow-1" style={{ height: window.innerWidth <= 768 ? '8px' : '12px' }}>
                                              <div 
                                                className="progress-bar bg-gradient"
                                                style={{ 
                                                  width: `${Math.min((candidate.votes / Math.max(...approvedCandidates.map(c => c.votes || 0), 1)) * 100, 100)}%`,
                                                  background: 'linear-gradient(45deg, #007bff, #0056b3)'
                                                }}
                                              ></div>
                                            </div>
                                            <div className="text-end">
                                              <div className="fw-bold text-primary" style={{ fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem' }}>{candidate.votes}</div>
                                              <small className="text-muted" style={{ fontSize: window.innerWidth <= 768 ? '0.65rem' : '0.75rem' }}>votes</small>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Action Buttons */}
                                      <div className="d-grid gap-2">
                                        {voted ? (
                                          <button className="btn btn-success disabled" style={{ fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem' }}>
                                            <FaCheckCircle className="me-2" /> You Voted
                                          </button>
                                        ) : status === 'active' ? (
                                          <button
                                            className="btn btn-primary"
                                            onClick={() => {
                                              setSelectedCandidateForVoting(candidate);
                                              setVotingStep(1);
                                              setShowVotingModal(true);
                                            }}
                                            style={{ fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem' }}
                                          >
                                            <FaVoteYea className="me-2" /> Vote for {candidate.name}
                                          </button>
                                        ) : (
                                          <button className="btn btn-secondary disabled" style={{ fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem' }}>
                                            <FaLock className="me-2" /> 
                                            {status === 'upcoming' ? 'Not Started' : 'Election Ended'}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            // Table Comparison View
                            <div className="table-responsive">
                              <table className={`table table-hover`} style={{ background: isDarkMode ? colors.surface : '#fff' }}>
                                <thead className={`table-light`} style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa' }}>
                                  <tr>
                                    <th width="5%">#</th>
                                    <th width="25%">Candidate</th>
                                    <th width="15%">Party</th>
                                    <th width="35%">Manifesto</th>
                                    <th width="10%">Votes</th>
                                    <th width="10%">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {approvedCandidates.map((candidate, idx) => (
                                    <tr key={candidate._id || candidate.id}>
                                      <td>
                                        <span className="badge bg-primary">#{idx + 1}</span>
                                      </td>
                                      <td>
                                        <div className="d-flex align-items-center gap-2">
                                          <img
                                            src={getImageUrl(candidate.photo || "/default-avatar.png")}
                                            alt={candidate.name}
                                            style={{ width: 40, height: 40, objectFit: "cover", borderRadius: "50%" }}
                                          />
                                          <div>
                                            <div className="fw-semibold">{candidate.name}</div>
                                            {candidate.position && (
                                              <small className="badge bg-success">{candidate.position}</small>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                      <td>
                                        <div className="d-flex align-items-center gap-2">
                                          {candidate.symbol && (
                                            <img src={getImageUrl(candidate.symbol)} alt="symbol" 
                                                 style={{ width: 24, height: 24, objectFit: 'contain' }} />
                                          )}
                                          <span>{candidate.party || 'Independent'}</span>
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ fontSize: '0.85rem' }}>
                                          {candidate.manifesto ? (
                                            candidate.manifesto.length > 100 ? 
                                            `${candidate.manifesto.slice(0, 100)}...` : candidate.manifesto
                                          ) : (
                                            <em className="text-muted">No manifesto provided</em>
                                          )}
                                        </div>
                                      </td>
                                      <td>
                                        {typeof candidate.votes === "number" ? (
                                          <div className="text-center">
                                            <div className="fw-bold text-primary">{candidate.votes}</div>
                                            <small className="text-muted">votes</small>
                                          </div>
                                        ) : (
                                          <span className="text-muted">-</span>
                                        )}
                                      </td>
                                      <td>
                                        {voted ? (
                                          <button className="btn btn-sm btn-success disabled">
                                            <FaCheckCircle />
                                          </button>
                                        ) : status === 'active' ? (
                                          <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => {
                                              setSelectedCandidateForVoting(candidate);
                                              setVotingStep(1);
                                              setShowVotingModal(true);
                                            }}
                                            title={`Vote for ${candidate.name}`}
                                          >
                                            <FaVoteYea />
                                          </button>
                                        ) : (
                                          <button className="btn btn-sm btn-secondary disabled">
                                            <FaLock />
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )
                        ) : (
                          // Regular Card View
                          approvedCandidates.length > 0 ? (
                            <div className="row g-4">
                              {approvedCandidates.map((candidate, idx) => (
                                <div className="col-lg-6" key={candidate._id || candidate.id}>
                                  <div className={`card border h-100`} 
                                       style={{ 
                                         borderRadius: '12px', 
                                         background: voted ? (isDarkMode ? colors.surfaceHover : '#f8f9fa') : (isDarkMode ? colors.surface : 'white'),
                                         borderColor: isDarkMode ? colors.border : '#dee2e6',
                                         transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                                       }}
                                       onMouseEnter={(e) => {
                                         if (!voted && status === 'active') {
                                           e.currentTarget.style.transform = 'translateY(-2px)';
                                           e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                                         }
                                       }}
                                       onMouseLeave={(e) => {
                                         e.currentTarget.style.transform = 'none';
                                         e.currentTarget.style.boxShadow = 'none';
                                       }}>
                                    <div className="card-body p-4">
                                      <div className="d-flex align-items-center gap-3 mb-3">
                                        <div className="position-relative">
                                          <img
                                            src={getImageUrl(candidate.photo || "/default-avatar.png")}
                                            alt={candidate.name}
                                            style={{
                                              width: 70,
                                              height: 70,
                                              objectFit: "cover",
                                              borderRadius: "50%",
                                              border: "3px solid #e5e7eb",
                                            }}
                                          />
                                          <span className="position-absolute bottom-0 end-0 badge bg-primary rounded-pill">
                                            #{idx + 1}
                                          </span>
                                        </div>
                                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                          <h5 className="fw-bold mb-1 text-truncate" title={candidate.name}>
                                            {candidate.name}
                                            {candidate.position && (
                                              <span className="badge bg-success ms-2" style={{ fontSize: '0.7rem' }}>{candidate.position}</span>
                                            )}
                                          </h5>
                                          <div className="d-flex align-items-center gap-2 mb-1">
                                            {candidate.symbol && (
                                              <img src={getImageUrl(candidate.symbol)} alt={`${candidate.party || 'Party'} symbol`} 
                                                   style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 4 }} />
                                            )}
                                            <span className="text-muted">{candidate.party || 'Independent'}</span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {candidate.manifesto && (
                                        <div className={`p-3 mb-3 rounded`} style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                          <strong className="text-primary">Manifesto:</strong>
                                          <div className="mt-1">
                                            {candidate.manifesto.length > 150 ? (
                                              `${candidate.manifesto.slice(0, 150)}...`
                                            ) : candidate.manifesto}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {typeof candidate.votes === "number" && (
                                        <div className="mb-3">
                                          <div className="d-flex justify-content-between align-items-center mb-1">
                                            <small className="text-muted fw-semibold">Current Votes</small>
                                            <strong className="text-primary">{candidate.votes}</strong>
                                          </div>
                                          <div className="progress" style={{ height: '8px' }}>
                                            <div 
                                              className="progress-bar bg-primary"
                                              style={{ 
                                                width: `${Math.min((candidate.votes / Math.max(...approvedCandidates.map(c => c.votes || 0), 1)) * 100, 100)}%`
                                              }}
                                            ></div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      <div className="d-grid">
                                        {voted ? (
                                          <button className="btn btn-success disabled">
                                            <FaCheckCircle className="me-2" /> You Voted
                                          </button>
                                        ) : status === 'active' ? (
                                          <button
                                            className="btn btn-primary"
                                            onClick={() => {
                                              setSelectedCandidateForVoting(candidate);
                                              setVotingStep(1);
                                              setShowVotingModal(true);
                                            }}
                                          >
                                            <FaVoteYea className="me-2" /> Vote for {candidate.name}
                                          </button>
                                        ) : (
                                          <button className="btn btn-secondary disabled">
                                            <FaLock className="me-2" /> 
                                            {status === 'upcoming' ? 'Not Started' : 'Election Ended'}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-5">
                              <div className={`mx-auto mb-4 rounded-circle d-flex align-items-center justify-content-center`} 
                                   style={{ width: 80, height: 80, background: isDarkMode ? colors.surfaceHover : '#f8f9fa' }}>
                                <FaUsers className="text-muted" size={32} />
                              </div>
                              <h5 className="fw-bold mb-2">No Candidates Yet</h5>
                              <p className="text-muted">Candidates will appear here once they are approved for this election.</p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className={`modal-footer border-top d-flex justify-content-between`} style={{ borderColor: isDarkMode ? colors.border : '#dee2e6', background: isDarkMode ? colors.surfaceHover : '#f8f9fa', padding: window.innerWidth <= 768 ? '0.5rem 0.75rem' : '1rem' }}>
                <div>
                  {selectedElection && getElectionStatus(selectedElection).status === 'active' && 
                   !myVotes.some((v) => v.election === selectedElection._id) && (
                    <small className="text-success d-flex align-items-center gap-1" style={{ fontSize: window.innerWidth <= 768 ? '0.7rem' : '0.875rem' }}>
                      <FaUnlock size={window.innerWidth <= 768 ? 10 : 12} />
                      Voting is currently open
                    </small>
                  )}
                </div>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-secondary"
                    style={{ padding: window.innerWidth <= 768 ? '0.35rem 0.75rem' : undefined, fontSize: window.innerWidth <= 768 ? '0.8rem' : undefined }}
                    onClick={() => {
                      setShowElectionModal(false);
                      setSelectedElection(null);
                      setSelectedCandidatesForComparison([]);
                      setShowCandidateComparison(false);
                    }}
                  >
                    Close
                  </button>
                  {selectedElection && getElectionStatus(selectedElection).status === 'active' && 
                   !myVotes.some((v) => v.election === selectedElection._id) && (
                    <button 
                      className="btn btn-primary d-flex align-items-center gap-2"
                      style={{ padding: window.innerWidth <= 768 ? '0.35rem 0.75rem' : undefined, fontSize: window.innerWidth <= 768 ? '0.8rem' : undefined }}
                      onClick={() => {
                        setShowElectionModal(false);
                        setActiveView('elections');
                      }}
                    >
                      <FaVoteYea size={window.innerWidth <= 768 ? 12 : undefined} />
                      Go to Elections Page
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Voting Modal */}
      {showVotingModal && selectedCandidateForVoting && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060, padding: '1rem' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered" style={{ margin: '1rem auto' }}>
            <div className={`modal-content border-0 shadow-lg`} style={{ background: isDarkMode ? colors.surface : '#fff', color: isDarkMode ? colors.text : 'inherit', borderRadius: '4px' }}>
              {votingStep === 1 && (
                // Step 1: Candidate Review
                <>
                  <div className={`modal-header border-bottom`} style={{ borderColor: isDarkMode ? colors.border : '#dee2e6', background: isDarkMode ? colors.surfaceHover : '#f8f9fa', padding: '1rem 1.5rem' }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className={`rounded-circle d-flex align-items-center justify-content-center`} style={{ width: 40, height: 40, background: 'rgba(59, 130, 246, 0.1)' }}>
                        <FaVoteYea className="text-primary" size={16} />
                      </div>
                      <div>
                        <h4 className="modal-title mb-0 fw-bold" style={{ fontSize: window.innerWidth <= 768 ? '1rem' : '1.25rem' }}>Confirm Your Choice</h4>
                        <small className="text-muted" style={{ fontSize: window.innerWidth <= 768 ? '0.7rem' : '0.8rem' }}>Review candidate details before voting</small>
                      </div>
                    </div>
                    <button 
                      className="btn-close" 
                      onClick={() => {
                        setShowVotingModal(false);
                        setSelectedCandidateForVoting(null);
                        setVotingStep(1);
                      }}
                    ></button>
                  </div>
                  <div className="modal-body" style={{ padding: window.innerWidth <= 768 ? '1.5rem' : '2rem' }}>
                    {/* Candidate Details */}
                    <div className="text-center mb-4">
                      <img
                        src={getImageUrl(selectedCandidateForVoting.photo || "/default-avatar.png")}
                        alt={selectedCandidateForVoting.name}
                        style={{
                          width: window.innerWidth <= 768 ? 80 : 120,
                          height: window.innerWidth <= 768 ? 80 : 120,
                          objectFit: "cover",
                          borderRadius: "50%",
                          border: "4px solid #007bff",
                          boxShadow: '0 4px 20px rgba(0, 123, 255, 0.3)'
                        }}
                      />
                      <h3 className="fw-bold mt-3 mb-1" style={{ fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.5rem' }}>{selectedCandidateForVoting.name}</h3>
                      <p className="text-primary mb-0" style={{ fontSize: window.innerWidth <= 768 ? '0.85rem' : '1rem' }}>{selectedCandidateForVoting.party || 'Independent'}</p>
                      {selectedCandidateForVoting.position && (
                        <span className="badge bg-success mt-2" style={{ fontSize: window.innerWidth <= 768 ? '0.7rem' : '0.8rem' }}>{selectedCandidateForVoting.position}</span>
                      )}
                    </div>
                    
                    {/* Election Info */}
                    <div className={`alert d-flex align-items-center gap-3`} style={{ background: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem' }}>
                      <FaInfoCircle className="text-primary" size={window.innerWidth <= 768 ? 16 : 20} />
                      <div>
                        <div className="fw-semibold" style={{ fontSize: window.innerWidth <= 768 ? '0.85rem' : '0.95rem' }}>Election: {selectedElection.title}</div>
                        <small className="text-muted" style={{ fontSize: window.innerWidth <= 768 ? '0.7rem' : '0.8rem' }}>You are about to cast your vote for this candidate</small>
                      </div>
                    </div>
                    
                    {/* Candidate Manifesto */}
                    {selectedCandidateForVoting.manifesto && (
                      <div className="mb-4">
                        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontSize: window.innerWidth <= 768 ? '0.95rem' : '1.1rem' }}>
                          <FaFileAlt className="text-primary" size={window.innerWidth <= 768 ? 14 : 16} />
                          Candidate Manifesto
                        </h5>
                        <div className={`p-3 rounded`} style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa', border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}` }}>
                          <p className="mb-0" style={{ lineHeight: 1.6, fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem' }}>{selectedCandidateForVoting.manifesto}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Warning Notice */}
                    <div className={`alert alert-warning d-flex align-items-center gap-3`} style={{ background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)', fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.85rem' }}>
                      <FaExclamationTriangle className="text-warning" size={window.innerWidth <= 768 ? 14 : 16} />
                      <div>
                        <strong>Important:</strong> Once you cast your vote, it cannot be changed or withdrawn. Please review your choice carefully.
                      </div>
                    </div>
                  </div>
                  <div className={`modal-footer border-top justify-content-between`} style={{ borderColor: isDarkMode ? colors.border : '#dee2e6', background: isDarkMode ? colors.surfaceHover : '#f8f9fa' }}>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowVotingModal(false);
                        setSelectedCandidateForVoting(null);
                        setVotingStep(1);
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-primary btn-lg px-4"
                      onClick={() => setVotingStep(2)}
                    >
                      <FaVoteYea className="me-2" />
                      Proceed to Vote
                    </button>
                  </div>
                </>
              )}
              
              {votingStep === 2 && (
                // Step 2: Final Confirmation
                <>
                  <div className={`modal-header border-bottom`} style={{ borderColor: isDarkMode ? colors.border : '#dee2e6', background: isDarkMode ? colors.surfaceHover : '#f8f9fa' }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className={`rounded-circle d-flex align-items-center justify-content-center`} style={{ width: 48, height: 48, background: 'rgba(220, 53, 69, 0.1)' }}>
                        <FaExclamationTriangle className="text-danger" size={20} />
                      </div>
                      <div>
                        <h4 className="modal-title mb-0 fw-bold text-danger">Final Confirmation</h4>
                        <small className="text-muted">This action cannot be undone</small>
                      </div>
                    </div>
                    <button 
                      className="btn-close" 
                      onClick={() => {
                        setShowVotingModal(false);
                        setSelectedCandidateForVoting(null);
                        setVotingStep(1);
                      }}
                    ></button>
                  </div>
                  <div className="modal-body p-4 text-center">
                    <div className="mb-4">
                      <FaVoteYea className="text-primary mb-3" size={64} />
                      <h3 className="fw-bold">Cast Your Vote</h3>
                      <p className="text-muted mb-0">Are you absolutely sure you want to vote for:</p>
                    </div>
                    
                    <div className={`p-4 rounded border`} style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa', borderColor: isDarkMode ? colors.border : '#e9ecef' }}>
                      <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
                        <img
                          src={getImageUrl(selectedCandidateForVoting.photo || "/default-avatar.png")}
                          alt={selectedCandidateForVoting.name}
                          style={{
                            width: 50,
                            height: 50,
                            objectFit: "cover",
                            borderRadius: "50%"
                          }}
                        />
                        <div className="text-start">
                          <h5 className="fw-bold mb-1">{selectedCandidateForVoting.name}</h5>
                          <p className="text-muted mb-0">{selectedCandidateForVoting.party || 'Independent'}</p>
                        </div>
                      </div>
                      <small className="text-muted">For: {selectedElection.title}</small>
                    </div>
                    
                    <div className="alert alert-danger mt-4 d-flex align-items-center gap-3">
                      <FaLock className="text-danger" />
                      <div className="text-start">
                        <strong>Final Warning:</strong> After confirmation, your vote will be permanently recorded and cannot be changed.
                      </div>
                    </div>
                  </div>
                  <div className={`modal-footer border-top justify-content-between`} style={{ borderColor: isDarkMode ? colors.border : '#dee2e6', background: isDarkMode ? colors.surfaceHover : '#f8f9fa' }}>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setVotingStep(1)}
                    >
                      <FaArrowUp className="me-2" />
                      Go Back
                    </button>
                    <button 
                      className="btn btn-danger btn-lg px-4"
                      onClick={async () => {
                        try {
                          // First show SweetAlert confirmation
                          const result = await Swal.fire({
                            title: 'Final Confirmation',
                            text: 'Are you absolutely sure you want to cast this vote? This action cannot be undone.',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#dc3545',
                            cancelButtonColor: '#6b7280',
                            confirmButtonText: 'Yes, Cast My Vote!',
                            cancelButtonText: 'Cancel'
                          });

                          if (!result.isConfirmed) return;

                          // Generate verification code
                          const verificationCode = generateVerificationCode();
                          setVoteVerificationCode(verificationCode);

                          // Cast the vote
                          const voteSuccessful = await handleVote(
                            selectedElection._id || selectedElection.id,
                            selectedCandidateForVoting._id || selectedCandidateForVoting.id,
                            selectedCandidateForVoting.position,
                            Array.isArray(selectedElection.positions) && selectedElection.positions.length === 1 ? selectedElection.positions[0] : undefined,
                            true // Skip confirmation in handleVote since we already confirmed
                          );
                          
                          if (voteSuccessful) {
                            // Store receipt data
                            const receiptData = {
                              id: Date.now().toString(),
                              election: selectedElection,
                              candidate: selectedCandidateForVoting,
                              votedAt: new Date().toISOString(),
                              verificationCode: verificationCode,
                              userId: user._id || user.id
                            };
                            
                            // Save to localStorage
                            const existingReceipts = JSON.parse(localStorage.getItem('voteReceipts') || '[]');
                            existingReceipts.push(receiptData);
                            localStorage.setItem('voteReceipts', JSON.stringify(existingReceipts));
                            
                            // Refresh receipts list
                            loadReceipts();
                            
                            // Show success modal
                            setVotingStep(3);
                            // Close the election modal if it's open
                            setShowElectionModal(false);
                            // Refresh data
                            fetchElections();
                            fetchMyVotes();
                          } else {
                            // If voting failed, stay on confirmation step
                            setVotingStep(2);
                          }
                        } catch (error) {
                          console.error('Voting failed:', error);
                          setVotingStep(2); // Go back to confirmation step
                        }
                      }}
                    >
                      <FaCheckCircle className="me-2" />
                      Confirm Vote
                    </button>
                  </div>
                </>
              )}
              
              {votingStep === 3 && (
                // Step 3: Success
                <>
                  <div className={`modal-header border-bottom`} style={{ borderColor: isDarkMode ? colors.border : '#dee2e6', background: isDarkMode ? colors.surfaceHover : '#f8f9fa' }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className={`rounded-circle d-flex align-items-center justify-content-center`} style={{ width: 48, height: 48, background: 'rgba(34, 197, 94, 0.1)' }}>
                        <FaCheckCircle className="text-success" size={20} />
                      </div>
                      <div>
                        <h4 className="modal-title mb-0 fw-bold text-success">Vote Submitted!</h4>
                        <small className="text-muted">Your vote has been recorded</small>
                      </div>
                    </div>
                    <button 
                      className="btn-close" 
                      onClick={() => {
                        setShowVotingModal(false);
                        setSelectedCandidateForVoting(null);
                        setVotingStep(1);
                      }}
                    ></button>
                  </div>
                  <div className="modal-body p-4 text-center">
                    <div className="mb-4">
                      <div className={`mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3`} 
                           style={{ width: 100, height: 100, background: 'rgba(34, 197, 94, 0.1)' }}>
                        <FaCheckCircle className="text-success" size={48} />
                      </div>
                      <h3 className="fw-bold text-success">Vote Recorded Successfully!</h3>
                      <p className="text-muted">Thank you for participating in the democratic process.</p>
                    </div>

                    {/* Verification Code Section */}
                    <div className={`p-4 rounded border mb-4`} style={{ background: isDarkMode ? 'rgba(13, 110, 253, 0.05)' : '#f8f9fa', borderColor: isDarkMode ? colors.border : '#e9ecef' }}>
                      <h5 className="fw-bold mb-2 text-primary">Verification Code</h5>
                      <div 
                        className="fs-4 fw-bold text-primary font-monospace mb-2"
                        style={{ letterSpacing: '2px' }}
                      >
                        {voteVerificationCode}
                      </div>
                      <small className="text-muted">Save this code for your records. You can use it to verify your vote.</small>
                    </div>
                    
                    <div className={`p-4 rounded border`} style={{ background: isDarkMode ? 'rgba(34, 197, 94, 0.05)' : 'rgba(34, 197, 94, 0.05)', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
                      <h5 className="fw-bold mb-2">Your Vote Summary</h5>
                      <div className="d-flex align-items-center justify-content-center gap-3">
                        <img
                          src={getImageUrl(selectedCandidateForVoting.photo || "/default-avatar.png")}
                          alt={selectedCandidateForVoting.name}
                          style={{
                            width: 50,
                            height: 50,
                            objectFit: "cover",
                            borderRadius: "50%"
                          }}
                        />
                        <div className="text-start">
                          <div className="fw-bold">{selectedCandidateForVoting.name}</div>
                          <div className="text-muted">{selectedCandidateForVoting.party || 'Independent'}</div>
                        </div>
                      </div>
                      <small className="text-muted d-block mt-2">Election: {selectedElection.title}</small>
                    </div>
                  </div>
                  <div className={`modal-footer border-top justify-content-between`} style={{ borderColor: isDarkMode ? colors.border : '#dee2e6', background: isDarkMode ? colors.surfaceHover : '#f8f9fa' }}>
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => {
                        generateVoteReceipt({
                          election: selectedElection,
                          candidate: selectedCandidateForVoting,
                          votedAt: new Date(),
                          verificationCode: voteVerificationCode
                        });
                      }}
                    >
                      <FaDownload className="me-2" />
                      Print Receipt
                    </button>
                    <button 
                      className="btn btn-success"
                      onClick={() => {
                        setShowVotingModal(false);
                        setSelectedCandidateForVoting(null);
                        setVotingStep(1);
                        setVoteVerificationCode(null);
                        setActiveView('my-votes');
                      }}
                    >
                      <FaEye className="me-2" />
                      View My Votes
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notification Details Modal */}
      {selectedNotification && showNotificationModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100 }}>
          <div className="modal-dialog" style={{ margin: '2rem auto', maxWidth: 400, width: '95vw' }}>
            <div className={`modal-content border-0 shadow-sm`} style={{ background: isDarkMode ? colors.surface : '#fff', borderRadius: '6px', padding: '0.5rem 0.5rem 0.5rem 0.5rem', minWidth: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              <div className="modal-header px-2 py-2" style={{ borderBottom: '1px solid #e5e7eb', background: isDarkMode ? colors.surfaceHover : '#f6f8fa', color: isDarkMode ? colors.text : '#222', borderTopLeftRadius: '6px', borderTopRightRadius: '6px' }}>
                <h6 className="modal-title d-flex align-items-center gap-2 mb-0" style={{ fontSize: '1rem', fontWeight: 600, color: isDarkMode ? colors.text : '#222' }}>
                  <span className="d-flex align-items-center justify-content-center" style={{ background: '#f1f3f6', borderRadius: '50%', width: 28, height: 28 }}>
                    <FaBell className="text-info" size={16} />
                  </span>
                  Notification Details
                </h6>
                <button 
                  className="btn-close" 
                  onMouseOver={e => e.currentTarget.style.opacity = 0.7}
                  onMouseOut={e => e.currentTarget.style.opacity = 1}
                  onClick={() => {
                    setShowNotificationModal(false);
                    setSelectedNotification(null);
                  }}
                  style={{ marginLeft: 'auto', transition: 'opacity 0.2s' }}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body px-2 py-2" style={{ minWidth: 0 }}>
                <div className="d-flex flex-row align-items-center gap-2 mb-2" style={{ minWidth: 0 }}>
                  <div className="d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, background: '#f1f3f6', borderRadius: '50%' }}>
                    <FaInfoCircle className={selectedNotification.type === 'success' ? 'text-success' : 'text-info'} size={18} />
                  </div>
                  <div className="flex-grow-1 text-start" style={{ minWidth: 0 }}>
                    <div className="fw-bold mb-0" style={{ fontSize: '1rem', wordBreak: 'break-word', color: isDarkMode ? colors.text : '#222' }}>{selectedNotification.title || 'Notification'}</div>
                    <div className="d-flex flex-wrap gap-1 justify-content-start mb-1">
                      <span className={`badge bg-${selectedNotification.type === 'success' ? 'success' : 'info'}`}>{selectedNotification.type === 'success' ? 'Success' : 'Info'}</span>
                      {!selectedNotification.read && (
                        <span className="badge bg-primary">New</span>
                      )}
                    </div>
                  </div>
                </div>
                <hr className="my-2" style={{ borderColor: '#e5e7eb', opacity: 0.7 }} />
                <div className="mb-2 text-start">
                  <div className="fw-semibold mb-1" style={{ fontSize: '0.95rem', color: isDarkMode ? colors.text : '#444' }}>Message:</div>
                  <div className="text-muted mb-0" style={{ fontSize: '0.95rem', wordBreak: 'break-word' }}>{selectedNotification.message || selectedNotification.content || 'No message content available.'}</div>
                </div>
                <div className="d-flex flex-row gap-2 justify-content-start mb-1">
                  <div className="text-start" style={{ minWidth: 0 }}>
                    <small className="text-muted">Date:</small>
                    <div className="fw-semibold"
                      style={{ fontSize: window.innerWidth <= 600 ? '0.80rem' : '0.95rem', color: isDarkMode ? colors.text : '#444' }}>
                      {selectedNotification.createdAt ? new Date(selectedNotification.createdAt).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>
                  <div className="text-start" style={{ minWidth: 0 }}>
                    <small className="text-muted">Time:</small>
                    <div className="fw-semibold"
                      style={{ fontSize: window.innerWidth <= 600 ? '0.80rem' : '0.95rem', color: isDarkMode ? colors.text : '#444' }}>
                      {selectedNotification.createdAt ? new Date(selectedNotification.createdAt).toLocaleTimeString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Profile Edit Modal */}
      {showProfile && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg" style={{ margin: '1rem auto' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <FaUserEdit className="text-primary" />
                  Edit Profile
                </h5>
                <button className="btn-close" onClick={() => setShowProfile(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-4">
                  <div className="col-md-4 text-center">
                    <div className="position-relative d-inline-block mb-3">
                      <FaUserCircle size={100} className="text-primary" />
                      <button className="btn btn-sm btn-primary rounded-circle position-absolute bottom-0 end-0">
                        <FaEdit size={12} />
                      </button>
                    </div>
                    <h5 className="fw-bold">{user?.name}</h5>
                    <p className="text-muted">{user?.role}</p>
                  </div>
                  <div className="col-md-8">
                    <form>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Full Name <span className="text-danger">*</span></label>
                          <input 
                            type="text" 
                            className="form-control" 
                            defaultValue={user?.name}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Email Address <span className="text-danger">*</span></label>
                          <input 
                            type="email" 
                            className="form-control" 
                            defaultValue={user?.email}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Student ID</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            defaultValue={user?.studentId}
                            readOnly
                          />
                          <small className="text-muted">Student ID cannot be changed</small>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Department</label>
                          <select className="form-select" defaultValue={user?.department}>
                            <option value="">Select Department</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Business">Business</option>
                            <option value="Arts">Arts</option>
                            <option value="Science">Science</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Phone Number</label>
                          <input 
                            type="tel" 
                            className="form-control" 
                            defaultValue={user?.phone}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Year of Study</label>
                          <select className="form-select" defaultValue={user?.yearOfStudy}>
                            <option value="">Select Year</option>
                            <option value="1">First Year</option>
                            <option value="2">Second Year</option>
                            <option value="3">Third Year</option>
                            <option value="4">Fourth Year</option>
                            <option value="5+">Graduate/PhD</option>
                          </select>
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-semibold">Bio</label>
                          <textarea 
                            className="form-control" 
                            rows="3"
                            defaultValue={user?.bio}
                            placeholder="Tell us about yourself..."
                          ></textarea>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowProfile(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary">
                  <FaSave className="me-2" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Quick Actions Widget */}
      <QuickActionsWidget 
        activeElections={elections.filter(e => {
          const status = getElectionStatus(e);
          return status.status === 'active' && isUserEligibleForElection(e);
        })}
        onNavigate={(action) => {
          if (action === 'apply') {
            navigate('/candidate-application');
          } else if (action === 'candidates') {
            navigate('/candidates');
          } else if (action === 'elections') {
            setActiveView('elections');
          } else if (action === 'history') {
            setActiveView('history');
          } else {
            setActiveView(action);
          }
        }}
        onVote={(election) => {
          setSelectedElection(election);
          setActiveView('elections');
        }}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal 
        isOpen={showKeyboardShortcuts} 
        onClose={() => setShowKeyboardShortcuts(false)} 
      />

      {/* Candidate Comparison Modal */}
      {showComparisonModal && selectedElection && (
        <CandidateComparison 
          candidates={selectedElection.candidates || []}
          onClose={() => setShowComparisonModal(false)}
        />
      )}

      {/* Receipt Details Modal */}
      {selectedReceipt && showReceiptModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
          <div className="modal-dialog modal-lg" style={{ margin: '1rem auto' }}>
            <div className={`modal-content border border-1`} style={{ 
              background: isDarkMode ? colors.surface : '#ffffff',
              borderColor: isDarkMode ? colors.border : '#dee2e6'
            }}>
              <div className={`modal-header border-bottom`} style={{ 
                borderColor: isDarkMode ? colors.border : '#dee2e6',
                background: 'linear-gradient(135deg, #10b981, #059669)'
              }}>
                <h5 className="modal-title d-flex align-items-center gap-2 text-white">
                  <FaFileAlt />
                  Vote Receipt Details
                </h5>
                <button 
                  className="btn-close btn-close-white" 
                  onClick={() => {
                    setShowReceiptModal(false);
                    setSelectedReceipt(null);
                  }}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="text-center mb-4">
                  <div 
                    className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3"
                    style={{ width: 80, height: 80, background: 'rgba(16, 185, 129, 0.1)' }}
                  >
                    <FaCheckCircle className="text-success" size={36} />
                  </div>
                  <h4 className="fw-bold text-success">Vote Successfully Recorded</h4>
                  <p className="text-muted">Official receipt from Campus Ballot System</p>
                </div>

                <div className={`p-4 rounded border mb-4`} style={{ 
                  background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
                  borderColor: isDarkMode ? colors.border : '#e9ecef'
                }}>
                  <h5 className="fw-bold mb-3">Election Details</h5>
                  <div className="row">
                    <div className="col-sm-4 text-muted">Election:</div>
                    <div className="col-sm-8 fw-semibold">{selectedReceipt.election?.title || 'Unknown Election'}</div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-sm-4 text-muted">Candidate ID:</div>
                    <div className="col-sm-8">
                      <code className="bg-light px-2 py-1 rounded">
                        {(selectedReceipt.candidate?._id || selectedReceipt.candidate?.id || 'N/A').substring(0, 8)}****
                      </code>
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-sm-4 text-muted">Position:</div>
                    <div className="col-sm-8">{selectedReceipt.candidate?.position || selectedReceipt.candidate?.role || 'General'}</div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-sm-4 text-muted">Date & Time:</div>
                    <div className="col-sm-8">{new Date(selectedReceipt.votedAt).toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short'
                    })}</div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-sm-4 text-muted">Election Type:</div>
                    <div className="col-sm-8">{selectedReceipt.election?.type || 'General Election'}</div>
                  </div>
                </div>

                <div className={`p-4 rounded border text-center`} style={{
                  background: 'linear-gradient(135deg, #fff3cd, #ffeaa7)',
                  borderColor: '#ffc107'
                }}>
                  <h5 className="fw-bold mb-2" style={{ color: '#856404' }}>🔐 Verification Code</h5>
                  <div 
                    className="fs-3 fw-bold text-primary font-monospace mb-2 p-3 rounded bg-white border-2"
                    style={{ 
                      letterSpacing: '3px',
                      border: '2px dashed #0d6efd',
                      fontFamily: 'Courier New, monospace'
                    }}
                  >
                    {selectedReceipt.verificationCode}
                  </div>
                  <small style={{ color: '#856404' }}>
                    <strong>Important:</strong> Save this verification code for your records. 
                    You can use it to verify your vote in the system.
                  </small>
                </div>
              </div>
              <div className={`modal-footer border-top`} style={{ 
                borderColor: isDarkMode ? colors.border : '#dee2e6',
                background: isDarkMode ? colors.surfaceHover : '#f8f9fa'
              }}>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedReceipt.verificationCode);
                    success('Verification code copied to clipboard!');
                  }}
                >
                  <FaStar className="me-2" />
                  Copy Code
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => generateVoteReceipt(selectedReceipt)}
                >
                  <FaDownload className="me-2" />
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

export default StudentDashboard;
