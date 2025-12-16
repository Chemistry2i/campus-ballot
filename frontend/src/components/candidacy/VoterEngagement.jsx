import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useTheme } from '../../contexts/ThemeContext';
import { FaComments } from 'react-icons/fa';
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
      setQuestions(response.data.questions);
      setAnnouncements(response.data.announcements);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching engagement data:', error);
      // Fallback dummy data
      setQuestions([
        {
          _id: '1',
          voterName: 'John Doe',
          question: 'What are your plans for improving campus infrastructure?',
          answer: 'I plan to work with the administration to renovate the library and add more study spaces.',
          status: 'answered',
          likes: 23,
          createdAt: '2025-01-10T10:30:00',
          answeredAt: '2025-01-10T14:20:00'
        },
        {
          _id: '2',
          voterName: 'Jane Smith',
          question: 'How will you address student mental health?',
          answer: '',
          status: 'pending',
          likes: 15,
          createdAt: '2025-01-12T09:15:00'
        },
        {
          _id: '3',
          voterName: 'Mike Johnson',
          question: 'What is your stance on increasing student activities budget?',
          answer: 'I strongly support increasing the budget to provide more diverse activities for all students.',
          status: 'answered',
          likes: 31,
          createdAt: '2025-01-11T16:45:00',
          answeredAt: '2025-01-11T18:30:00'
        }
      ]);
      setAnnouncements([
        {
          _id: '1',
          title: 'Town Hall Meeting - Jan 20th',
          message: 'Join me for a town hall discussion where we can talk about campus issues. Refreshments will be provided!',
          views: 156,
          likes: 45,
          comments: 12,
          createdAt: '2025-01-08T10:00:00'
        },
        {
          _id: '2',
          title: 'Campaign Promise: Free WiFi',
          message: 'I am committed to working with the university to provide free high-speed WiFi across all campus buildings.',
          views: 234,
          likes: 89,
          comments: 23,
          createdAt: '2025-01-10T14:30:00'
        }
      ]);
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
      <div className="mb-4">
        <h4 className="fw-bold mb-2" style={{ color: colors.text, fontSize: '1.25rem' }}>
          <FaComments className="me-2" style={{ color: '#3b82f6' }} />
          Voter Engagement
        </h4>
        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Interact with voters and share your vision</p>
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
