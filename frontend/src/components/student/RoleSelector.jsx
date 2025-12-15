import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { FaUserTie, FaUsers, FaCheckCircle } from 'react-icons/fa';

const RoleSelector = ({ user, onRoleChange }) => {
  const { isDarkMode, colors } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const hasRole = (role) => {
    return user?.additionalRoles?.includes(role);
  };

  const registerAsCandidate = async () => {
    const result = await Swal.fire({
      title: 'Register as Candidate',
      html: `
        <div class="text-start">
          <div class="mb-3">
            <label class="form-label fw-semibold">Position</label>
            <input id="position" class="form-control" placeholder="e.g., Student Body President" />
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Manifesto</label>
            <textarea id="manifesto" class="form-control" rows="4" placeholder="Your campaign promises and vision..."></textarea>
          </div>
          <p class="text-muted small">Your registration will require admin approval.</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Register',
      preConfirm: () => {
        const position = document.getElementById('position').value;
        const manifesto = document.getElementById('manifesto').value;
        if (!position || !manifesto) {
          Swal.showValidationMessage('Please fill all fields');
          return false;
        }
        return { position, manifesto };
      }
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post('/api/user/register-as-candidate', {
          electionId: null, // Can be set later
          position: result.value.position,
          manifesto: result.value.manifesto
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Update user in localStorage
        const updatedUser = { ...user, ...response.data.user };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        onRoleChange(updatedUser);

        Swal.fire('Success!', 'You are now registered as a candidate. Awaiting approval.', 'success');
        navigate('/candidate');
      } catch (error) {
        console.error('Error registering as candidate:', error);
        Swal.fire('Error', error.response?.data?.message || 'Failed to register', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const registerAsAgent = async () => {
    Swal.fire({
      title: 'Register as Campaign Agent',
      text: 'Contact a candidate to get assigned as their campaign agent.',
      icon: 'info',
      confirmButtonText: 'OK'
    });
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3" style={{ color: colors.text }}>
              Choose Your Role
            </h2>
            <p className="text-muted">
              As a student, you can register as a candidate or become a campaign agent
            </p>
          </div>

          <div className="row g-4">
            {/* Candidate Card */}
            <div className="col-md-6">
              <div
                className="card h-100"
                style={{
                  background: isDarkMode ? colors.surface : '#fff',
                  border: `2px solid ${hasRole('candidate') ? '#10b981' : colors.border}`,
                  borderRadius: '16px'
                }}
              >
                <div className="card-body p-4 text-center">
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: hasRole('candidate') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem'
                    }}
                  >
                    <FaUserTie size={40} color={hasRole('candidate') ? '#10b981' : '#3b82f6'} />
                  </div>
                  
                  <h4 className="fw-bold mb-3" style={{ color: colors.text }}>
                    Candidate
                  </h4>
                  
                  <p className="text-muted mb-4">
                    Run for student elections, share your manifesto, and engage with voters
                  </p>

                  <ul className="list-unstyled text-start mb-4">
                    <li className="mb-2">
                      <FaCheckCircle className="text-success me-2" />
                      Create campaign profile
                    </li>
                    <li className="mb-2">
                      <FaCheckCircle className="text-success me-2" />
                      Manage campaign team
                    </li>
                    <li className="mb-2">
                      <FaCheckCircle className="text-success me-2" />
                      View election statistics
                    </li>
                    <li className="mb-2">
                      <FaCheckCircle className="text-success me-2" />
                      Engage with voters
                    </li>
                  </ul>

                  {hasRole('candidate') ? (
                    <button className="btn btn-success w-100" disabled>
                      <FaCheckCircle className="me-2" />
                      Already a Candidate
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary w-100"
                      onClick={registerAsCandidate}
                      disabled={loading}
                    >
                      {loading ? 'Registering...' : 'Register as Candidate'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Agent Card */}
            <div className="col-md-6">
              <div
                className="card h-100"
                style={{
                  background: isDarkMode ? colors.surface : '#fff',
                  border: `2px solid ${hasRole('agent') ? '#10b981' : colors.border}`,
                  borderRadius: '16px'
                }}
              >
                <div className="card-body p-4 text-center">
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: hasRole('agent') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem'
                    }}
                  >
                    <FaUsers size={40} color={hasRole('agent') ? '#10b981' : '#8b5cf6'} />
                  </div>
                  
                  <h4 className="fw-bold mb-3" style={{ color: colors.text }}>
                    Campaign Agent
                  </h4>
                  
                  <p className="text-muted mb-4">
                    Support a candidate's campaign and help manage outreach activities
                  </p>

                  <ul className="list-unstyled text-start mb-4">
                    <li className="mb-2">
                      <FaCheckCircle className="text-success me-2" />
                      Manage campaign tasks
                    </li>
                    <li className="mb-2">
                      <FaCheckCircle className="text-success me-2" />
                      Track voter outreach
                    </li>
                    <li className="mb-2">
                      <FaCheckCircle className="text-success me-2" />
                      Organize events
                    </li>
                    <li className="mb-2">
                      <FaCheckCircle className="text-success me-2" />
                      Support candidate
                    </li>
                  </ul>

                  {hasRole('agent') ? (
                    <button className="btn btn-success w-100" disabled>
                      <FaCheckCircle className="me-2" />
                      Already an Agent
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary w-100"
                      onClick={registerAsAgent}
                      disabled={loading}
                    >
                      Register as Agent
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Current Roles Display */}
          {user?.additionalRoles && user.additionalRoles.length > 0 && (
            <div className="mt-5 text-center">
              <div
                className="alert d-inline-block"
                style={{
                  background: isDarkMode ? colors.surface : '#f0fdf4',
                  border: '1px solid #86efac',
                  color: colors.text
                }}
              >
                <strong>Your Current Roles:</strong> {user.role}
                {user.additionalRoles.map(role => ` + ${role}`).join('')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
