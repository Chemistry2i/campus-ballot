import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Troubleshooting topics
const troubleshootingTopics = [
  {
    title: 'Cannot add a new candidate',
    content: 'Ensure all required candidate fields are filled. If the problem persists, check your internet connection or contact support.',
    category: 'Candidates'
  },
  {
    title: 'Results not visible to users',
    content: 'Make sure you have published the results. Only published results are visible. Go to Results > Publish Results.',
    category: 'Results'
  },
  {
    title: 'Unable to delete logs',
    content: 'Only super admins can delete logs. If you need a log removed, contact a super admin or support.',
    category: 'Logs'
  },
  {
    title: 'Email notifications not received',
    content: 'Check your spam folder. If still not received, verify the email address in your profile and try again.',
    category: 'Support'
  },
  {
    title: 'Page not loading or errors',
    content: 'Try refreshing the page or clearing your browser cache. If the issue continues, contact support.',
    category: 'General'
  }
];

const helpTopics = [
  {
    title: 'How do I add a new candidate?',
    content: 'Go to Candidates > Add Candidate. Fill in the required details and save. The candidate will appear in the active election.',
    category: 'Candidates'
  },
  {
    title: 'How do I publish election results?',
    content: 'Navigate to Results and click Publish Results. Only published results are visible to users.',
    category: 'Results'
  },
  {
    title: 'Can I delete logs?',
    content: 'Admins can view student logs but only super admins can delete logs for security reasons.',
    category: 'Logs'
  },
  {
    title: 'How do I contact support?',
    content: 'Use the contact form below or email campusballot-support@example.com.',
    category: 'Support'
  },
  {
    title: 'How do I suggest improvements?',
    content: 'Use the feedback button below to send your suggestions directly to our team.',
    category: 'Support'
  }
];

function Help() {
  const { isDarkMode, colors } = useTheme();
  const logoUrl = '/logo.png';

  // FAQ search/filter
  const [faqSearch, setFaqSearch] = useState('');
  const [faqCategory, setFaqCategory] = useState('All');
  const [expandedFaqs, setExpandedFaqs] = useState(helpTopics.map((_, i) => false));
  const [faqFeedback, setFaqFeedback] = useState(Array(helpTopics.length).fill(null));

  // Troubleshooting search/filter
  const [trblSearch, setTrblSearch] = useState('');
  const [trblCategory, setTrblCategory] = useState('All');
  const [expandedTrbls, setExpandedTrbls] = useState(troubleshootingTopics.map((_, i) => false));

  // Category icons
  const categoryIcons = {
    Candidates: <i className="fa-solid fa-user-plus me-1" />,
    Results: <i className="fa-solid fa-chart-bar me-1" />,
    Logs: <i className="fa-solid fa-file-lines me-1" />,
    Support: <i className="fa-solid fa-headset me-1" />,
    All: <i className="fa-solid fa-list me-1" />
    , General: <i className="fa-solid fa-circle-info me-1" />
  };

  // FAQ counts per category
  const categoryCounts = helpTopics.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});

  // Troubleshooting counts per category
  const trblCategoryCounts = troubleshootingTopics.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});

  // Highlight search matches
  function highlight(text, search) {
    if (!search) return text;
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <mark key={i} style={{ background: '#fde68a', color: '#b45309', padding: 0 }}>{part}</mark> : part
    );
  }

  // Filter by category and search
  const filteredTopics = helpTopics
    .map((t, idx) => ({ ...t, idx }))
    .filter(t =>
      (faqCategory === 'All' || t.category === faqCategory) &&
      (t.title.toLowerCase().includes(faqSearch.toLowerCase()) ||
        t.content.toLowerCase().includes(faqSearch.toLowerCase()))
    );

  // Troubleshooting filter
  const filteredTrbls = troubleshootingTopics
    .map((t, idx) => ({ ...t, idx }))
    .filter(t =>
      (trblCategory === 'All' || t.category === trblCategory) &&
      (t.title.toLowerCase().includes(trblSearch.toLowerCase()) ||
        t.content.toLowerCase().includes(trblSearch.toLowerCase()))
    );

  // Expand/collapse all
  function expandAllFaqs() {
    setExpandedFaqs(filteredTopics.map(() => true));
  }
  function collapseAllFaqs() {
    setExpandedFaqs(filteredTopics.map(() => false));
  }

  // Expand/collapse all for troubleshooting
  function expandAllTrbls() {
    setExpandedTrbls(filteredTrbls.map(() => true));
  }
  function collapseAllTrbls() {
    setExpandedTrbls(filteredTrbls.map(() => false));
  }

  // Contact form state
  const [form, setForm] = useState({ name: '', email: '', message: '', file: null });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Live chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'support', text: 'Hi! How can we help you today?' }
  ]);

  function handleFormChange(e) {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);
    // Simple validation
    if (!form.name || !form.email || !form.message) {
      setFormError('Please fill in all fields.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    // Simulate file size check
    if (form.file && form.file.size > 2 * 1024 * 1024) {
      setFormError('File size must be less than 2MB.');
      return;
    }
    setFormSuccess(true);
    setForm({ name: '', email: '', message: '', file: null });
  }

  function handleChatSend(e) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(msgs => [...msgs, { sender: 'user', text: chatInput }]);
    setTimeout(() => {
      setChatMessages(msgs => [...msgs, { sender: 'support', text: 'Thank you for your message! Our team will reply soon.' }]);
    }, 1000);
    setChatInput('');
  }

  return (
    <div className="container py-4" style={{ color: colors.text }}>
      <div className="d-flex align-items-center mb-3 gap-3">
        <img src={logoUrl} alt="Concept Crashers Logo" style={{ width: 48, height: 48, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
        <span className="fw-bold fs-4" style={{ color: colors.primary }}>Concept Crashers</span>
      </div>
      <h3 className="mb-4 fw-bold" style={{ color: colors.primary }}>Admin Help & Support</h3>

      {/* Downloadable Admin Guide */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="fw-bold mb-0" style={{ color: colors.primary }}>
            <i className="fa-solid fa-file-pdf me-2" />Download Admin Guide
          </h5>
          <a
            href="/admin-guide.pdf"
            className="btn btn-outline-danger"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 500 }}
          >
            <i className="fa-solid fa-download me-2" />Download PDF
          </a>
        </div>
        <div className="mt-2 text-muted" style={{ fontSize: '0.95em' }}>
          Comprehensive manual for all admin features and troubleshooting.
        </div>
      </div>

      {/* Video/GIF Tutorials Section */}
      <div className="mb-5">
        <h5 className="fw-bold mb-3" style={{ color: colors.primary }}>
          <i className="fa-solid fa-video me-2" />Quick Video Tutorials
        </h5>
        <div className="row g-3">
          <div className="col-md-4">
            <div className="card h-100" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
              <div className="card-body">
                <h6 className="fw-bold mb-2">Add a New Candidate</h6>
                <video controls width="100%" poster="/public/tutorials/add-candidate-thumb.jpg" style={{ borderRadius: 8 }}>
                  <source src="/public/tutorials/add-candidate.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="mt-2 text-muted" style={{ fontSize: '0.95em' }}>Step-by-step guide to adding a candidate.</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
              <div className="card-body">
                <h6 className="fw-bold mb-2">Publish Election Results</h6>
                <video controls width="100%" poster="/public/tutorials/publish-results-thumb.jpg" style={{ borderRadius: 8 }}>
                  <source src="/public/tutorials/publish-results.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="mt-2 text-muted" style={{ fontSize: '0.95em' }}>How to publish and share results with users.</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
              <div className="card-body">
                <h6 className="fw-bold mb-2">Create an Election</h6>
                <video controls width="100%" poster="/public/tutorials/create-election-thumb.jpg" style={{ borderRadius: 8 }}>
                  <source src="/public/tutorials/create-election.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="mt-2 text-muted" style={{ fontSize: '0.95em' }}>How to set up a new election event.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Troubleshooting Section */}
      <div className="mb-5">
        <h5 className="fw-bold mb-3" style={{ color: colors.primary }}>
          <i className="fa-solid fa-circle-exclamation me-2" />Troubleshooting
        </h5>
        <div className="mb-3 d-flex gap-2 flex-wrap align-items-center">
          <input
            type="text"
            className="form-control"
            style={{ backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.inputBorder, maxWidth: 260 }}
            placeholder="Search Troubleshooting..."
            value={trblSearch}
            onChange={e => setTrblSearch(e.target.value)}
          />
          <select
            className="form-select"
            style={{ backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.inputBorder, maxWidth: 220 }}
            value={trblCategory}
            onChange={e => setTrblCategory(e.target.value)}
          >
            <option value="All">All Categories ({troubleshootingTopics.length})</option>
            {[...new Set(troubleshootingTopics.map(t => t.category))].map(cat => (
              <option key={cat} value={cat}>
                {cat} ({trblCategoryCounts[cat]})
              </option>
            ))}
          </select>
          <button className="btn btn-outline-primary btn-sm" type="button" onClick={expandAllTrbls}>Expand All</button>
          <button className="btn btn-outline-secondary btn-sm" type="button" onClick={collapseAllTrbls}>Collapse All</button>
        </div>
        <div className="accordion mb-4" id="trblAccordion">
          {filteredTrbls.length === 0 ? (
            <div className="text-muted p-3">No troubleshooting tips match your search.</div>
          ) : filteredTrbls.map((topic, i) => (
            <div key={topic.idx}>
              <div className="accordion-item" style={{ backgroundColor: colors.cardBg, borderColor: colors.border, transition: 'all 0.3s' }}>
                <h2 className="accordion-header" id={`trblHeading${topic.idx}`}> 
                  <button
                    className="accordion-button"
                    type="button"
                    aria-expanded={expandedTrbls[i]}
                    aria-controls={`trblCollapse${topic.idx}`}
                    style={{ backgroundColor: colors.surface, color: colors.text, transition: 'all 0.3s' }}
                    onClick={() => setExpandedTrbls(expandedTrbls => expandedTrbls.map((v, idx) => idx === i ? !v : v))}
                  >
                    <span className="me-2">{highlight(topic.title, trblSearch)}</span>
                    <span className="badge bg-primary ms-2">
                      {categoryIcons[topic.category] || null}
                      {topic.category}
                    </span>
                  </button>
                </h2>
                <div
                  id={`trblCollapse${topic.idx}`}
                  className={`accordion-collapse${expandedTrbls[i] ? ' show' : ''}`}
                  aria-labelledby={`trblHeading${topic.idx}`}
                  style={{ transition: 'all 0.3s', overflow: expandedTrbls[i] ? 'visible' : 'hidden', maxHeight: expandedTrbls[i] ? '500px' : '0' }}
                >
                  <div className="accordion-body" style={{ color: colors.textSecondary }}>
                    <div>{highlight(topic.content, trblSearch)}</div>
                  </div>
                </div>
              </div>
              {/* Divider for dark mode */}
              {i < filteredTrbls.length - 1 && (
                <div style={{ height: '2px', background: isDarkMode ? colors.border : '#e5e7eb', margin: '0.5rem 0' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Search & Category Filter */}
      <div className="mb-3 d-flex gap-2 flex-wrap align-items-center">
        <input
          type="text"
          className="form-control"
          style={{ backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.inputBorder, maxWidth: 260 }}
          placeholder="Search FAQs..."
          value={faqSearch}
          onChange={e => setFaqSearch(e.target.value)}
        />
        <select
          className="form-select"
          style={{ backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.inputBorder, maxWidth: 220 }}
          value={faqCategory}
          onChange={e => setFaqCategory(e.target.value)}
        >
          <option value="All">All Categories ({helpTopics.length})</option>
          {[...new Set(helpTopics.map(t => t.category))].map(cat => (
             <option key={cat} value={cat}>
               {cat} ({categoryCounts[cat]})
             </option>
          ))}
        </select>
        <button className="btn btn-outline-primary btn-sm" type="button" onClick={expandAllFaqs}>Expand All</button>
        <button className="btn btn-outline-secondary btn-sm" type="button" onClick={collapseAllFaqs}>Collapse All</button>
      </div>

      <div className="accordion mb-4" id="helpAccordion">
        {filteredTopics.length === 0 ? (
          <div className="text-muted p-3">No FAQs match your search.</div>
        ) : filteredTopics.map((topic, i) => (
          <div key={topic.idx}>
            <div className="accordion-item" style={{ backgroundColor: colors.cardBg, borderColor: colors.border, transition: 'all 0.3s' }}>
              <h2 className="accordion-header" id={`heading${topic.idx}`}> 
                <button
                  className="accordion-button"
                  type="button"
                  aria-expanded={expandedFaqs[i]}
                  aria-controls={`collapse${topic.idx}`}
                  style={{ backgroundColor: colors.surface, color: colors.text, transition: 'all 0.3s' }}
                  onClick={() => setExpandedFaqs(expandedFaqs => expandedFaqs.map((v, idx) => idx === i ? !v : v))}
                >
                  <span className="me-2">{highlight(topic.title, faqSearch)}</span>
                  <span className="badge bg-primary ms-2">
                    {categoryIcons[topic.category] || null}
                    {topic.category}
                  </span>
                </button>
              </h2>
              <div
                id={`collapse${topic.idx}`}
                className={`accordion-collapse${expandedFaqs[i] ? ' show' : ''}`}
                aria-labelledby={`heading${topic.idx}`}
                style={{ transition: 'all 0.3s', overflow: expandedFaqs[i] ? 'visible' : 'hidden', maxHeight: expandedFaqs[i] ? '500px' : '0' }}
              >
                <div className="accordion-body" style={{ color: colors.textSecondary }}>
                  <div>{highlight(topic.content, faqSearch)}</div>
                  <div className="mt-2">
                    <span className="me-2">Was this helpful?</span>
                    <button
                      className={`btn btn-sm me-1 ${faqFeedback[topic.idx] === true ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={() => setFaqFeedback(fb => fb.map((v, idx) => idx === topic.idx ? true : v))}
                    >Yes</button>
                    <button
                      className={`btn btn-sm ${faqFeedback[topic.idx] === false ? 'btn-danger' : 'btn-outline-danger'}`}
                      onClick={() => setFaqFeedback(fb => fb.map((v, idx) => idx === topic.idx ? false : v))}
                    >No</button>
                    {faqFeedback[topic.idx] === true && <span className="ms-2 text-success">Thank you for your feedback!</span>}
                    {faqFeedback[topic.idx] === false && <span className="ms-2 text-danger">We appreciate your feedback!</span>}
                  </div>
                </div>
              </div>
            </div>
            {/* Divider for dark mode */}
            {i < filteredTopics.length - 1 && (
              <div style={{ height: '2px', background: isDarkMode ? colors.border : '#e5e7eb', margin: '0.5rem 0' }} />
            )}
          </div>
        ))}
      </div>

      {/* Quick Links to Admin Actions */}
      <div className="mb-3">
        <h6 className="fw-bold" style={{ color: colors.primary }}>Quick Links</h6>
        <div className="d-flex gap-3 flex-wrap">
          <a href="/admin/candidates" className="btn btn-outline-primary btn-sm">Manage Candidates</a>
          <a href="/admin/results" className="btn btn-outline-success btn-sm">Publish Results</a>
          <a href="/admin/logs" className="btn btn-outline-info btn-sm">View Logs</a>
        </div>
      </div>

      {/* Contact Form */}
      <div className="mb-3">
        <h6 className="fw-bold" style={{ color: colors.primary }}>Contact Support</h6>
        <form style={{ width: '100%' }} onSubmit={handleFormSubmit}>
          <div className="mb-2">
            <input type="text" name="name" className="form-control" placeholder="Your Name" value={form.name} onChange={handleFormChange} required style={{ backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.inputBorder }} />
          </div>
          <div className="mb-2">
            <input type="email" name="email" className="form-control" placeholder="Your Email" value={form.email} onChange={handleFormChange} required style={{ backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.inputBorder }} />
          </div>
          <div className="mb-2">
            <textarea name="message" className="form-control" rows={4} placeholder="Your Message" value={form.message} onChange={handleFormChange} required style={{ backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.inputBorder }} />
          </div>
          <div className="mb-2">
            <input type="file" name="file" className="form-control" accept=".jpg,.png,.pdf,.doc,.docx,.txt" onChange={handleFormChange} style={{ backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.inputBorder }} />
            <small className="text-muted">Optional. Max size 2MB.</small>
          </div>
          {formError && <div className="alert alert-danger py-1 mb-2">{formError}</div>}
          {formSuccess && <div className="alert alert-success py-1 mb-2">Message sent successfully!</div>}
          <button type="submit" className="btn btn-primary w-100">Send Message</button>
        </form>
      </div>

      {/* Feedback Button */}
      <div className="mb-3">
        <h6 className="fw-bold" style={{ color: colors.primary }}>Suggest Improvements</h6>
        <button className="btn btn-warning w-100" onClick={() => alert('Thank you for your feedback!')}>Send Feedback</button>
      </div>

      {/* Live Chat Widget */}
      <div className="mb-3">
        <h6 className="fw-bold" style={{ color: colors.primary }}>Live Chat</h6>
        <button className="btn btn-outline-info mb-2" onClick={() => setChatOpen(open => !open)}>
          {chatOpen ? 'Close Chat' : 'Open Chat'}
        </button>
        {chatOpen && (
          <div className="card" style={{ backgroundColor: colors.cardBg, borderColor: colors.border, maxWidth: 400 }}>
            <div className="card-body" style={{ maxHeight: 220, overflowY: 'auto', backgroundColor: colors.surface }}>
              {chatMessages.map((msg, i) => (
                <div key={i} className={`mb-2 text-${msg.sender === 'user' ? 'end' : 'start'}`}> 
                  <span className={`badge bg-${msg.sender === 'user' ? 'primary' : 'info'}`}>{msg.text}</span>
                </div>
              ))}
            </div>
            <form className="p-2 border-top" onSubmit={handleChatSend} style={{ backgroundColor: colors.surface }}>
              <div className="input-group">
                <input type="text" className="form-control" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type your message..." style={{ backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.inputBorder }} />
                <button type="submit" className="btn btn-info">Send</button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="mt-5 text-muted" style={{ color: colors.textMuted }}>
        <small>For further assistance, contact campusballot-support@example.com</small>
      </div>
    </div>
  );
}

export default Help;
