import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaUser, 
  FaCamera, 
  FaSave, 
  FaEdit,
  FaGraduationCap,
  FaBullhorn,
  FaLink,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin
} from 'react-icons/fa';

const CampaignProfile = () => {
  const { isDarkMode, colors } = useTheme();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    yearOfStudy: '',
    studentId: '',
    bio: '',
    manifesto: '',
    campaignPromises: ['', '', ''],
    qualifications: ['', ''],
    achievements: ['', ''],
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      website: ''
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/candidate/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData(response.data);
      setProfileImage(response.data.profileImage);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Load from localStorage as fallback
      const savedProfile = localStorage.getItem('candidateProfile');
      if (savedProfile) {
        const data = JSON.parse(savedProfile);
        setFormData(data);
        setProfileImage(data.profileImage);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [name]: value
      }
    }));
  };

  const handleArrayInputChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Error', 'Image size should be less than 5MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setFormData(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/candidate/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Save to localStorage as backup
      localStorage.setItem('candidateProfile', JSON.stringify(formData));

      Swal.fire('Success', 'Profile updated successfully!', 'success');
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire('Error', 'Failed to update profile. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '1.5rem', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div className="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        <div className="flex-grow-1">
          <h4 className="fw-bold mb-2" style={{ color: colors.text, fontSize: '1.25rem' }}>
            <FaUser className="me-2" style={{ color: '#3b82f6' }} />
            Campaign Profile
          </h4>
          <p className="text-muted mb-0">Manage your campaign profile and information</p>
        </div>
        <button
          className={`btn ${editing ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => setEditing(!editing)}
          style={{
            backgroundColor: editing ? colors.cardBackground : '#0d6efd',
            borderColor: editing ? colors.border : '#0d6efd',
            color: editing ? colors.text : '#fff',
            fontWeight: '500'
          }}
        >
          <FaEdit className="me-2" />
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* Profile Picture Section */}
          <div className="col-12 col-lg-4">
            <div
              className="card sticky-top"
              style={{
                background: isDarkMode ? colors.surface : '#fff',
                border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
                borderRadius: '12px',
                top: '20px'
              }}
            >
              <div className="card-body text-center p-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  disabled={!editing}
                />
                <div className="position-relative d-inline-block mb-3">
                  <div
                    className="rounded-circle mx-auto"
                    style={{
                      width: '150px',
                      height: '150px',
                      backgroundImage: profileImage ? `url(${profileImage})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      color: '#fff',
                      fontWeight: 'bold',
                      cursor: editing ? 'pointer' : 'default',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onClick={() => editing && fileInputRef.current?.click()}
                  >
                    {!profileImage && (formData.name ? formData.name.split(' ').map(n => n[0]).join('') : 'CN')}
                    {editing && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: 'rgba(0,0,0,0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.3s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                      >
                        <FaCamera size={32} color="#fff" />
                      </div>
                    )}
                  </div>
                </div>
                <h4 className="fw-bold mb-1" style={{ color: colors.text }}>
                  {formData.name || 'Your Name'}
                </h4>
                <p className="text-muted mb-2">{formData.department || 'Your Department'}</p>
                <p className="text-muted small">{formData.studentId || 'Student ID'}</p>
              </div>
            </div>
          </div>

          {/* Profile Form Section */}
          <div className="col-12 col-lg-8">
            {/* Basic Information */}
            <div
              className="card mb-4"
              style={{
                background: isDarkMode ? colors.surface : '#fff',
                border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
                borderRadius: '12px'
              }}
            >
              <div className="card-header" style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa', borderBottom: `1px solid ${colors.border}` }}>
                <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>
                  <FaGraduationCap className="me-2" />
                  Basic Information
                </h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: colors.text }}>Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!editing}
                      required
                      style={{
                        background: isDarkMode ? colors.surfaceHover : '#fff',
                        color: colors.text,
                        border: `1px solid ${colors.border}`
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: colors.text }}>Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!editing}
                      required
                      style={{
                        background: isDarkMode ? colors.surfaceHover : '#fff',
                        color: colors.text,
                        border: `1px solid ${colors.border}`
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: colors.text }}>Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!editing}
                      style={{
                        background: isDarkMode ? colors.surfaceHover : '#fff',
                        color: colors.text,
                        border: `1px solid ${colors.border}`
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: colors.text }}>Student ID *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      disabled={!editing}
                      required
                      style={{
                        background: isDarkMode ? colors.surfaceHover : '#fff',
                        color: colors.text,
                        border: `1px solid ${colors.border}`
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: colors.text }}>Department *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      disabled={!editing}
                      required
                      style={{
                        background: isDarkMode ? colors.surfaceHover : '#fff',
                        color: colors.text,
                        border: `1px solid ${colors.border}`
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: colors.text }}>Year of Study *</label>
                    <select
                      className="form-select"
                      name="yearOfStudy"
                      value={formData.yearOfStudy}
                      onChange={handleInputChange}
                      disabled={!editing}
                      required
                      style={{
                        background: isDarkMode ? colors.surfaceHover : '#fff',
                        color: colors.text,
                        border: `1px solid ${colors.border}`
                      }}
                    >
                      <option value="">Select Year</option>
                      <option value="1">First Year</option>
                      <option value="2">Second Year</option>
                      <option value="3">Third Year</option>
                      <option value="4">Fourth Year</option>
                      <option value="5">Fifth Year</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold" style={{ color: colors.text }}>Biography</label>
                    <textarea
                      className="form-control"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!editing}
                      rows="4"
                      placeholder="Tell voters about yourself..."
                      style={{
                        background: isDarkMode ? colors.surfaceHover : '#fff',
                        color: colors.text,
                        border: `1px solid ${colors.border}`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Information */}
            <div
              className="card mb-4"
              style={{
                background: isDarkMode ? colors.surface : '#fff',
                border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
                borderRadius: '12px'
              }}
            >
              <div className="card-header" style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa', borderBottom: `1px solid ${colors.border}` }}>
                <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>
                  <FaBullhorn className="me-2" />
                  Campaign Information
                </h5>
              </div>
              <div className="card-body p-4">
                <div className="mb-4">
                  <label className="form-label fw-semibold" style={{ color: colors.text }}>Campaign Manifesto</label>
                  <textarea
                    className="form-control"
                    name="manifesto"
                    value={formData.manifesto}
                    onChange={handleInputChange}
                    disabled={!editing}
                    rows="6"
                    placeholder="Your vision and manifesto..."
                    style={{
                      background: isDarkMode ? colors.surfaceHover : '#fff',
                      color: colors.text,
                      border: `1px solid ${colors.border}`
                    }}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold mb-2" style={{ color: colors.text }}>Campaign Promises</label>
                  {formData.campaignPromises.map((promise, index) => (
                    <div key={index} className="d-flex gap-2 mb-2">
                      <input
                        type="text"
                        className="form-control"
                        value={promise}
                        onChange={(e) => handleArrayInputChange('campaignPromises', index, e.target.value)}
                        disabled={!editing}
                        placeholder={`Promise ${index + 1}`}
                        style={{
                          background: isDarkMode ? colors.surfaceHover : '#fff',
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}
                      />
                      {editing && formData.campaignPromises.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => removeArrayItem('campaignPromises', index)}
                          style={{
                            backgroundColor: '#dc3545',
                            borderColor: '#dc3545',
                            color: '#fff',
                            fontWeight: 'bold'
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {editing && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary mt-2"
                      onClick={() => addArrayItem('campaignPromises')}
                      style={{
                        color: '#0d6efd',
                        borderColor: '#0d6efd',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#0d6efd';
                        e.target.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#0d6efd';
                      }}
                    >
                      + Add Promise
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold mb-2" style={{ color: colors.text }}>Qualifications</label>
                  {formData.qualifications.map((qual, index) => (
                    <div key={index} className="d-flex gap-2 mb-2">
                      <input
                        type="text"
                        className="form-control"
                        value={qual}
                        onChange={(e) => handleArrayInputChange('qualifications', index, e.target.value)}
                        disabled={!editing}
                        placeholder={`Qualification ${index + 1}`}
                        style={{
                          background: isDarkMode ? colors.surfaceHover : '#fff',
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}
                      />
                      {editing && formData.qualifications.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => removeArrayItem('qualifications', index)}
                          style={{
                            backgroundColor: '#dc3545',
                            borderColor: '#dc3545',
                            color: '#fff',
                            fontWeight: 'bold'
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {editing && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary mt-2"
                      onClick={() => addArrayItem('qualifications')}
                      style={{
                        color: '#0d6efd',
                        borderColor: '#0d6efd',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#0d6efd';
                        e.target.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#0d6efd';
                      }}
                    >
                      + Add Qualification
                    </button>
                  )}
                </div>

                <div>
                  <label className="form-label fw-semibold mb-2" style={{ color: colors.text }}>Achievements</label>
                  {formData.achievements.map((achievement, index) => (
                    <div key={index} className="d-flex gap-2 mb-2">
                      <input
                        type="text"
                        className="form-control"
                        value={achievement}
                        onChange={(e) => handleArrayInputChange('achievements', index, e.target.value)}
                        disabled={!editing}
                        placeholder={`Achievement ${index + 1}`}
                        style={{
                          background: isDarkMode ? colors.surfaceHover : '#fff',
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}
                      />
                      {editing && formData.achievements.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => removeArrayItem('achievements', index)}
                          style={{
                            backgroundColor: '#dc3545',
                            borderColor: '#dc3545',
                            color: '#fff',
                            fontWeight: 'bold'
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {editing && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary mt-2"
                      onClick={() => addArrayItem('achievements')}
                      style={{
                        color: '#0d6efd',
                        borderColor: '#0d6efd',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#0d6efd';
                        e.target.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#0d6efd';
                      }}
                    >
                      + Add Achievement
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div
              className="card mb-4"
              style={{
                background: isDarkMode ? colors.surface : '#fff',
                border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
                borderRadius: '12px'
              }}
            >
              <div className="card-header" style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa', borderBottom: `1px solid ${colors.border}` }}>
                <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>
                  <FaLink className="me-2" />
                  Social Media Links
                </h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: colors.text }}>
                      <FaFacebook className="me-2" />Facebook
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      name="facebook"
                      value={formData.socialMedia.facebook}
                      onChange={handleSocialMediaChange}
                      disabled={!editing}
                      placeholder="https://facebook.com/..."
                      style={{
                        background: isDarkMode ? colors.surfaceHover : '#fff',
                        color: colors.text,
                        border: `1px solid ${colors.border}`
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: colors.text }}>
                      <FaTwitter className="me-2" />Twitter/X
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      name="twitter"
                      value={formData.socialMedia.twitter}
                      onChange={handleSocialMediaChange}
                      disabled={!editing}
                      placeholder="https://twitter.com/..."
                      style={{
                        background: isDarkMode ? colors.surfaceHover : '#fff',
                        color: colors.text,
                        border: `1px solid ${colors.border}`
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: colors.text }}>
                      <FaInstagram className="me-2" />Instagram
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      name="instagram"
                      value={formData.socialMedia.instagram}
                      onChange={handleSocialMediaChange}
                      disabled={!editing}
                      placeholder="https://instagram.com/..."
                      style={{
                        background: isDarkMode ? colors.surfaceHover : '#fff',
                        color: colors.text,
                        border: `1px solid ${colors.border}`
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: colors.text }}>
                      <FaLinkedin className="me-2" />LinkedIn
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      name="linkedin"
                      value={formData.socialMedia.linkedin}
                      onChange={handleSocialMediaChange}
                      disabled={!editing}
                      placeholder="https://linkedin.com/in/..."
                      style={{
                        background: isDarkMode ? colors.surfaceHover : '#fff',
                        color: colors.text,
                        border: `1px solid ${colors.border}`
                      }}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold" style={{ color: colors.text }}>
                      <FaLink className="me-2" />Personal Website
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      name="website"
                      value={formData.socialMedia.website}
                      onChange={handleSocialMediaChange}
                      disabled={!editing}
                      placeholder="https://yourwebsite.com"
                      style={{
                        background: isDarkMode ? colors.surfaceHover : '#fff',
                        color: colors.text,
                        border: `1px solid ${colors.border}`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            {editing && (
              <div className="text-end">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg px-5"
                  disabled={loading}
                  style={{
                    backgroundColor: '#0d6efd',
                    borderColor: '#0d6efd',
                    color: '#fff',
                    fontWeight: '500'
                  }}
                >
                  <FaSave className="me-2" />
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CampaignProfile;
