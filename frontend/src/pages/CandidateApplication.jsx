import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { useTheme } from '../contexts/ThemeContext';
import ugandaPartiesOptions from '../utils/ugandaParties.js';


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
  // Image preview refs
  const photoPreview = useRef();
  const symbolPreview = useRef();

  useEffect(() => {
    // Fetch elections from backend
    const fetchElections = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/elections', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setElections(data.elections || []);
      } catch (err) {
        setElections([]);
      }
    };
    fetchElections();
  }, []);

  useEffect(() => {
    // Fetch positions for selected election
    const fetchPositions = async () => {
      if (!form.election) { setPositions([]); return; }
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/elections/${form.election}`,
          { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        setPositions((data.positions || data.election?.positions || []).map(p => ({ value: p, label: p })));
      } catch (err) {
        setPositions([]);
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
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleUserSelect = (option) => {
    setForm((prev) => ({ ...prev, user: option ? option.value : '' }));
  };

  const handlePartySelect = (option) => {
    setForm((prev) => ({ ...prev, party: option ? option.value : '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      const token = localStorage.getItem('token');
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (!res.ok) throw new Error('Failed to submit');
      setSuccess(true);
    } catch (err) {
      setError('Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-5" style={{ minHeight: '100vh', background: isDarkMode ? colors.background : '#f8fafc' }}>
      <div className="container" style={{ maxWidth: 700 }}>
        <h2 className="fw-bold mb-2 text-center" style={{ letterSpacing: 0.5 }}>Candidate Application</h2>
        <div className="mb-4 text-center text-muted" style={{ fontSize: '1.08rem' }}>
          Fill in the details below to apply as a candidate. All fields marked <span className="text-danger">*</span> are required.
        </div>
        {success && <div className="alert alert-success w-100 mx-auto" style={{maxWidth: 500}}>Application submitted!</div>}
        {error && <div className="alert alert-danger w-100 mx-auto" style={{maxWidth: 500}}>{error}</div>}
        <form onSubmit={handleSubmit} encType="multipart/form-data" autoComplete="off" className="p-0">
          <div className="row g-4 justify-content-center">
            {user && user.role === 'student' ? (
              <input type="hidden" name="user" value={user._id} />
            ) : (
              <div className="col-md-6">
                <label className="form-label fw-semibold">User* <span className="text-muted" title="Select the user applying as candidate."><i className="fa fa-info-circle" /></span></label>
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
            <div className="col-md-6">
              <label className="form-label fw-semibold">Election* <span className="text-muted" title="Select the election you are applying for."><i className="fa fa-info-circle" /></span></label>
              <select
                className="form-select"
                name="election"
                value={form.election}
                onChange={handleFormChange}
                required
                style={isDarkMode ? { backgroundColor: colors.cardBackground, color: colors.text, borderColor: '#555555' } : {}}
              >
                <option value="">Select Election</option>
                {elections.map((e) => (
                  <option key={e._id} value={e._id}>{e.title || e.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Name*</label>
              <input
                className="form-control"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                required
                maxLength={60}
                placeholder="Full name"
                style={isDarkMode ? { backgroundColor: colors.cardBackground, color: colors.text, borderColor: '#555555' } : {}}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Photo <span className="text-muted" title="Upload a clear photo."><i className="fa fa-info-circle" /></span></label>
              <input
                type="file"
                className="form-control bg-primary text-white"
                style={{ border: 'none' }}
                name="photo"
                accept="image/*"
                onChange={handleFormChange}
              />
              {form.photo && (
                <img ref={photoPreview} alt="Preview" className="mt-2 rounded border" style={{ width: 60, height: 60, objectFit: 'cover', display: 'block' }} />
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Position* <span className="text-muted" title="Select the position you are applying for."><i className="fa fa-info-circle" /></span></label>
              <select
                className="form-select"
                name="position"
                value={form.position}
                onChange={handleFormChange}
                required
                disabled={!positions.length}
                style={isDarkMode ? { backgroundColor: colors.cardBackground, color: colors.text, borderColor: '#555555' } : {}}
              >
                <option value="">{positions.length ? 'Select Position' : 'No positions found for selected election'}</option>
                {positions.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Symbol (Photo) <span className="text-muted" title="Upload a party symbol or logo."><i className="fa fa-info-circle" /></span></label>
              <input
                type="file"
                className="form-control bg-primary text-white"
                style={{ border: 'none' }}
                name="symbol"
                accept="image/*"
                onChange={handleFormChange}
              />
              {form.symbol && (
                <img ref={symbolPreview} alt="Preview" className="mt-2 rounded border" style={{ width: 60, height: 60, objectFit: 'cover', display: 'block' }} />
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Party <span className="text-muted" title="Select or enter your party."><i className="fa fa-info-circle" /></span></label>
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
            <div className="col-md-12">
              <label className="form-label fw-semibold">Description* <span className="text-muted" title="Short description about you."><i className="fa fa-info-circle" /></span></label>
              <textarea
                className="form-control"
                name="description"
                value={form.description}
                onChange={handleFormChange}
                rows={2}
                required
                maxLength={200}
                placeholder="Brief description (max 200 chars)"
                style={isDarkMode ? { backgroundColor: colors.cardBackground, color: colors.text, borderColor: '#555555' } : {}}
              />
            </div>
            <div className="col-md-12">
              <label className="form-label fw-semibold">Manifesto <span className="text-muted" title="Your campaign promises or goals."><i className="fa fa-info-circle" /></span></label>
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
          <div className="mt-4 d-flex justify-content-center gap-3">
            <button className="btn btn-secondary px-4" type="button" onClick={() => window.history.back()}>
              Cancel
            </button>
            <button className="btn btn-primary px-4" type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Create Candidate'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
