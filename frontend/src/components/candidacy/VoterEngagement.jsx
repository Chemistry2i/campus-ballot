import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import Swal from 'sweetalert2';
import { useTheme } from '../../contexts/ThemeContext';
import { FaComments, FaExternalLinkAlt } from 'react-icons/fa';
import Loader from '../common/Loader';
import EngagementStats from './engagement/EngagementStats';
import QuestionsSection from './engagement/QuestionsSection';
import AnnouncementsSection from './engagement/AnnouncementsSection';
import MessagesSection from './engagement/MessagesSection';

// Fallback local loader component
const LocalLoader = ({ message = 'Loading...' }) => {
  const { colors } = useTheme();
  return (
    <div 
      className="d-flex flex-column justify-content-center align-items-center" 
      style={{ 
        minHeight: '60vh',
        width: '100%',
        padding: '2rem',
        color: colors.text
      }}
    >
      <div 
        className="spinner-border text-primary mb-3" 
        role="status"
        style={{
          width: '1.5rem',
          height: '1.5rem'
        }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mb-0" style={{ 
        color: colors.textSecondary,
        fontSize: '0.9rem'
      }}>
        {message}
      </p>
    </div>
  );
};

const VoterEngagement = () => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState('questions');

  useEffect(() => {
    fetchEngagementData();
  }, []);

  const fetchEngagementData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/candidate/engagement', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(response.data.questions || []);
      setAnnouncements(response.data.announcements || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching engagement data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load engagement data. Please try again later.'
      });
      setQuestions([]);
      setAnnouncements([]);
      setLoading(false);
    }
  };

  const stats = {
    totalQuestions: questions.length,
    answeredQuestions: questions.filter(q => q.status === 'answered').length,
    pendingQuestions: questions.filter(q => q.status === 'pending').length,
    totalViews: announcements.reduce((sum, a) => sum + a.views, 0),
    totalLikes: [...questions, ...announcements].reduce((sum, item) => sum + item.likes, 0),
    totalComments: announcements.reduce((sum, a) => sum + a.comments, 0)
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '1.5rem', maxWidth: '100%', overflow: 'hidden' }}>
        <LocalLoader message="Loading engagement data..." />
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ padding: '1.5rem', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div className="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        <div>
          <h4 className="fw-bold mb-2" style={{ color: colors.text, fontSize: '1.25rem' }}>
            <FaComments className="me-2" style={{ color: '#3b82f6' }} />
            Voter Engagement
          </h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Interact with voters and share your vision</p>
        </div>
        <a 
          href="/candidates" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-outline-primary d-flex align-items-center gap-2"
          style={{
            borderRadius: '8px',
            fontWeight: '500'
          }}
        >
          <FaExternalLinkAlt size={14} />
          View Public Profile
        </a>
      </div>

      {/* Stats */}
      <EngagementStats stats={stats} />

      {/* Tabs */}
      <div className="mb-4">
        <ul className="nav nav-pills" style={{ gap: '0.5rem' }}>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'questions' ? 'active' : ''}`}
              onClick={() => setActiveTab('questions')}
              style={{ marginRight: '0.5rem' }}
            >
              Q&A ({questions.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'announcements' ? 'active' : ''}`}
              onClick={() => setActiveTab('announcements')}
              style={{ marginRight: '0.5rem' }}
            >
              Announcements ({announcements.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              Messages
            </button>
          </li>
        </ul>
      </div>

      {/* Content */}
      {activeTab === 'questions' && (
        <QuestionsSection
          questions={questions}
          onRefresh={fetchEngagementData}
        />
      )}
      {activeTab === 'announcements' && (
        <AnnouncementsSection
          announcements={announcements}
          onRefresh={fetchEngagementData}
        />
      )}
      {activeTab === 'messages' && <MessagesSection />}
    </div>
  );
};

export default VoterEngagement;
