import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useTheme } from '../../../contexts/ThemeContext';
import { FaUser, FaHeart, FaReply, FaCheckCircle, FaClock } from 'react-icons/fa';

const QuestionsSection = ({ questions, onRefresh }) => {
  const { isDarkMode, colors } = useTheme();
  const [filter, setFilter] = useState('all');

  const handleAnswer = async (questionId) => {
    const result = await Swal.fire({
      title: 'Answer Question',
      html: `<textarea id="answer" class="form-control" rows="4" placeholder="Type your answer..." style="border-radius: 8px;"></textarea>`,
      showCancelButton: true,
      confirmButtonText: 'Submit Answer',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded',
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-secondary'
      },
      buttonsStyling: false,
      didOpen: (popup) => {
        popup.style.borderRadius = '8px';
      },
      preConfirm: () => {
        const answer = document.getElementById('answer').value;
        if (!answer || !answer.trim()) {
          Swal.showValidationMessage('Please provide an answer');
          return false;
        }
        return answer.trim();
      }
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`/api/candidate/engagement/questions/${questionId}/answer`, {
          answer: result.value
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Answer submitted successfully!',
          customClass: {
            popup: 'rounded'
          },
          didOpen: (popup) => {
            popup.style.borderRadius = '8px';
          }
        });
        onRefresh();
      } catch (error) {
        console.error('Error submitting answer:', error);
        const errorMsg = error.response?.data?.message || 'Failed to submit answer. Please try again.';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg,
          customClass: {
            popup: 'rounded'
          },
          didOpen: (popup) => {
            popup.style.borderRadius = '8px';
          }
        });
      }
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (filter === 'all') return true;
    return q.status === filter;
  });

  return (
    <>
      {/* Filter */}
      <div className="mb-3">
        <div className="btn-group">
          <button
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilter('all')}
          >
            All ({questions.length})
          </button>
          <button
            className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({questions.filter(q => q.status === 'pending').length})
          </button>
          <button
            className={`btn btn-sm ${filter === 'answered' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilter('answered')}
          >
            Answered ({questions.filter(q => q.status === 'answered').length})
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="row g-3">
        {filteredQuestions.length === 0 ? (
          <div className="col-12">
            <div className="text-center py-5">
              <FaClock size={48} className="text-muted mb-3 opacity-50" />
              <h5 className="text-muted">No questions yet</h5>
            </div>
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <div key={question._id} className="col-12">
              <div
                className="card"
                style={{
                  background: isDarkMode ? colors.surface : '#fff',
                  border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
                  borderRadius: '12px'
                }}
              >
                <div className="card-body p-4">
                  {/* Question Header */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex gap-2">
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 'bold'
                        }}
                      >
                        {question.voterName.charAt(0)}
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1" style={{ color: colors.text }}>
                          {question.voterName}
                        </h6>
                        <small className="text-muted">
                          {new Date(question.createdAt).toLocaleString()}
                        </small>
                      </div>
                    </div>
                    <span
                      className={`badge ${question.status === 'answered' ? 'bg-success' : 'bg-warning'}`}
                    >
                      {question.status === 'answered' ? (
                        <><FaCheckCircle className="me-1" /> Answered</>
                      ) : (
                        <><FaClock className="me-1" /> Pending</>
                      )}
                    </span>
                  </div>

                  {/* Question */}
                  <div className="mb-3">
                    <p className="mb-2" style={{ color: colors.text, fontSize: '1.05rem' }}>
                      {question.question}
                    </p>
                  </div>

                  {/* Answer */}
                  {question.answer && (
                    <div
                      className="p-3 mb-3"
                      style={{
                        background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
                        borderLeft: '3px solid #10b981',
                        borderRadius: '8px'
                      }}
                    >
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <FaReply className="text-success" />
                        <strong className="text-success">Your Answer</strong>
                        <small className="text-muted ms-auto">
                          {new Date(question.answeredAt).toLocaleString()}
                        </small>
                      </div>
                      <p className="mb-0" style={{ color: colors.text }}>
                        {question.answer}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-3">
                      <button className="btn btn-sm btn-link text-muted">
                        <FaHeart className="me-1" /> {question.likes}
                      </button>
                    </div>
                    {question.status === 'pending' && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleAnswer(question._id)}
                      >
                        <FaReply className="me-1" /> Answer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default QuestionsSection;
