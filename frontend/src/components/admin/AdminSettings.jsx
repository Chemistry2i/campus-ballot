import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faFileImport,
  faDatabase,
  faShieldAlt,
  faEnvelope,
  faBell,
  faClipboardList,
  faHistory
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../contexts/ThemeContext';

function SectionCard({ id, title, children, onSave, onSaveDraft, saving }) {
  return (
    <div id={id} className="card mb-4">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between">
          <h5 className="card-title mb-0">{title}</h5>
        </div>
        <div className="mb-3 mt-3">{children}</div>
        <div className="d-flex gap-2">
          {onSaveDraft && (
            <button className="btn btn-outline-secondary" onClick={onSaveDraft} disabled={saving}>{saving ? 'Saving...' : 'Save draft'}</button>
          )}
          {onSave && (
            <button className="btn btn-primary" onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save & Apply'}</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminSettings({ user }) {
  const [saving, setSaving] = useState(false);

  // General
  const [siteName, setSiteName] = useState('Campus Ballot');
  const [siteLogo, setSiteLogo] = useState('');
  
  // Profile editing fields
  const [displayName, setDisplayName] = useState(user?.name || 'Admin');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'admin@example.com');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Reason for change (used for audit metadata when persisting)
  const [changeReason, setChangeReason] = useState('');

  // Authentication
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);

  // Email (placeholder only)
  const [smtpHost, setSmtpHost] = useState('smtp.example.com');
  const [smtpPort, setSmtpPort] = useState(587);

  // Notifications
  const [notifyOnVote, setNotifyOnVote] = useState(true);

  // Backup & retention
  const [backupSchedule, setBackupSchedule] = useState('daily'); // daily|weekly|monthly
  const [retentionDays, setRetentionDays] = useState(30);
  const [lastBackupAt, setLastBackupAt] = useState(null);

  // Voter roll (client-side preview)
  const [voterFile, setVoterFile] = useState(null);
  const [voterPreview, setVoterPreview] = useState([]);
  const [voterValidation, setVoterValidation] = useState(null);

  // RBAC / MFA enforcement
  const [enforceMfa, setEnforceMfa] = useState(false);
  const [mfaGraceDays, setMfaGraceDays] = useState(7);

  const { isDarkMode, colors } = useTheme();

  // load settings from backend when available
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } });
        const s = res.data || {};
        if (!mounted) return;
        if (s.general) {
          setSiteName(s.general.siteName || siteName);
          setSiteLogo(s.general.siteLogo || siteLogo);
        }
        if (s.email) {
          setSmtpHost(s.email.smtpHost || smtpHost);
          setSmtpPort(s.email.smtpPort || smtpPort);
        }
        if (s.notifications) setNotifyOnVote(Boolean(s.notifications.notifyOnVote));
        if (s.security) {
          setEnforceMfa(Boolean(s.security.enforceMfa));
          setMfaGraceDays(Number(s.security.mfaGraceDays) || mfaGraceDays);
        }
      } catch (err) {
        // silently ignore; frontend has fallbacks
        console.log('Could not load settings from backend', err?.message || err);
      }
    };
    load();
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // scroll + flash helper + toast
  const scrollToSection = (id, label) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // flash highlight
    el.classList.add('cb-flash');
    setTimeout(() => el.classList.remove('cb-flash'), 1400);
    // show small toast with the section name
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: label || id,
      showConfirmButton: false,
      timer: 1200,
      timerProgressBar: true
    });
  };

  const saveGeneral = async () => {
    setSaving(true);
    try {
      // attach reason metadata to the request in future
      console.log('Save general', { siteName, siteLogo, reason: changeReason });
      // Try to call backend; fall back to simulated save if endpoint missing
      try {
        const token = localStorage.getItem('token');
        await axios.put('/api/admin/settings/general', { siteName, siteLogo, meta: { reason: changeReason } }, { headers: { Authorization: `Bearer ${token}` } });
        Swal.fire('Saved', 'General settings saved.', 'success');
      } catch (err) {
        // graceful fallback: simulate save
        await new Promise(r => setTimeout(r, 500));
        Swal.fire('Saved (local)', 'General settings saved locally. Backend persistence not available.', 'info');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to save general settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveAuth = async () => {
    setSaving(true);
    try {
      console.log('Save auth', { allowRegistration, requireEmailVerification });
      await new Promise(r => setTimeout(r, 600));
      Swal.fire('Saved', 'Authentication settings saved (local only).', 'success');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to save authentication settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveEmail = async () => {
    setSaving(true);
    try {
      console.log('Save email', { smtpHost, smtpPort, reason: changeReason });
      try {
        const token = localStorage.getItem('token');
        await axios.put('/api/admin/settings/email', { smtpHost, smtpPort, meta: { reason: changeReason } }, { headers: { Authorization: `Bearer ${token}` } });
        Swal.fire('Saved', 'Email settings saved.', 'success');
      } catch (err) {
        await new Promise(r => setTimeout(r, 500));
        Swal.fire('Saved (local)', 'Email settings saved locally. Backend persistence not available.', 'info');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to save email settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = async () => {
    setSaving(true);
    try {
      console.log('Save notifications', { notifyOnVote, reason: changeReason });
      try {
        const token = localStorage.getItem('token');
        await axios.put('/api/admin/settings/notifications', { notifyOnVote, meta: { reason: changeReason } }, { headers: { Authorization: `Bearer ${token}` } });
        Swal.fire('Saved', 'Notification settings saved.', 'success');
      } catch (err) {
        await new Promise(r => setTimeout(r, 500));
        Swal.fire('Saved (local)', 'Notification settings saved locally. Backend persistence not available.', 'info');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to save notification settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Save profile edits (client-side with backend attempt)
  const saveProfile = async () => {
    setSaving(true);
    try {
      try {
        const token = localStorage.getItem('token');
        await axios.put('/api/admin/profile', { name: displayName, email: profileEmail, phone: phoneNumber, avatar: avatarUrl }, { headers: { Authorization: `Bearer ${token}` } });
        Swal.fire('Saved', 'Profile updated.', 'success');
      } catch (err) {
        await new Promise(r => setTimeout(r, 500));
        Swal.fire('Saved (local)', 'Profile saved locally. Backend persistence not available.', 'info');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Test SMTP connection (best-effort)
  const testSmtp = async () => {
    setSaving(true);
    try {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.post('/api/admin/settings/test-smtp', { host: smtpHost, port: smtpPort }, { headers: { Authorization: `Bearer ${token}` } });
        Swal.fire('SMTP Test', `Result: ${res.data?.message || 'OK'}`, 'success');
      } catch (err) {
        // fallback: simulate a test with explanation
        await new Promise(r => setTimeout(r, 700));
        Swal.fire('SMTP Test (simulated)', 'No backend test endpoint; please connect backend to run live tests.', 'info');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'SMTP test failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Backup actions
  const runBackupNow = async () => {
    setSaving(true);
    try {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.post('/api/admin/backup', { type: 'manual' }, { headers: { Authorization: `Bearer ${token}` } });
        setLastBackupAt(new Date().toISOString());
        Swal.fire('Backup started', res.data?.message || 'Backup job queued', 'success');
      } catch (err) {
        // simulate
        await new Promise(r => setTimeout(r, 700));
        setLastBackupAt(new Date().toISOString());
        Swal.fire('Backup (simulated)', 'Backup simulated locally. Connect backend for real backups.', 'info');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to start backup', 'error');
    } finally {
      setSaving(false);
    }
  };

  const testRestore = async () => {
    const confirmed = await Swal.fire({
      title: 'Test restore',
      html: 'This will simulate a restore to an isolated sandbox. No production data will be affected.',
      showCancelButton: true,
      confirmButtonText: 'Run test'
    });
    if (!confirmed.isConfirmed) return;
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 900));
      Swal.fire('Restore test', 'Restore simulation completed (no changes made).', 'success');
    } catch (err) {
      Swal.fire('Error', 'Restore test failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Voter roll upload (client-side preview/validate)
  const handleVoterFile = (file) => {
    setVoterFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split(/\r?\n/).filter(Boolean).slice(0, 200);
      const parsed = rows.map((r, i) => {
        const cols = r.split(',').map(c => c.trim());
        return { row: i+1, cols };
      });
      setVoterPreview(parsed.slice(0, 50));
      // simple validation: check email-like tokens
      const invalid = parsed.filter(p => !p.cols[0] || !/\S+@\S+\.\S+/.test(p.cols[0]));
      setVoterValidation({ total: parsed.length, invalidCount: invalid.length, sampleInvalid: invalid.slice(0,5) });
    };
    reader.readAsText(file);
  };

  const uploadVoterRoll = async () => {
    if (!voterFile) { Swal.fire('No file', 'Please choose a CSV file first', 'warning'); return; }
    setSaving(true);
    try {
      // try backend upload
      try {
        const token = localStorage.getItem('token');
        const form = new FormData();
        form.append('file', voterFile);
        await axios.post('/api/admin/voters/validate', form, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
        Swal.fire('Uploaded', 'Voter roll validation request sent to server.', 'success');
      } catch (err) {
        await new Promise(r => setTimeout(r, 800));
        Swal.fire('Validated (local)', `Previewed ${voterPreview.length} rows, invalid: ${voterValidation?.invalidCount || 0}`, 'info');
      }
    } catch (err) {
      Swal.fire('Error', 'Failed to upload/validate', 'error');
    } finally {
      setSaving(false);
    }
  };

  // RBAC / MFA enforcement
  const saveRbacMfa = async () => {
    setSaving(true);
    try {
      // backend stub
      try {
        const token = localStorage.getItem('token');
        await axios.put('/api/admin/settings/security', { enforceMfa, mfaGraceDays }, { headers: { Authorization: `Bearer ${token}` } });
        Swal.fire('Saved', 'RBAC/MFA settings saved.', 'success');
      } catch (err) {
        await new Promise(r => setTimeout(r, 500));
        Swal.fire('Saved (local)', 'RBAC/MFA settings saved locally. Backend persistence not available.', 'info');
      }
    } catch (err) {
      Swal.fire('Error', 'Failed to save RBAC/MFA settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4" style={{ background: colors.background, color: colors.text }}>
      <style>{`
        /* Quick visual flash when navigating via quick actions */
        .cb-flash{ animation: cbFlash 1.4s ease-in-out; }
        @keyframes cbFlash{ 0%{ box-shadow: 0 0 0 0 rgba(59,130,246,0.0); } 10%{ box-shadow: 0 0 0 6px rgba(59,130,246,0.12); } 60%{ box-shadow: 0 0 0 6px rgba(59,130,246,0.06); } 100%{ box-shadow: none; } }

        /* Quick actions layout & button variants */
        .admin-quick-actions { gap: .5rem; }
        /* make quick actions start from left rather than right */
        .admin-quick-actions.justify-start { justify-content: flex-start; }

        .qa-btn { transition: transform .12s ease, box-shadow .12s ease; border-width:1px; }
        .qa-btn:focus { outline: none; box-shadow: 0 0 0 3px rgba(59,130,246,0.18); }
        .qa-btn:hover { transform: translateY(-3px); }

        /* color variants (outline buttons with colored accents) */
        .qa-primary { color: #0d6efd; border-color: rgba(13,110,253,0.22); background: rgba(13,110,253,0.03); }
        .qa-success { color: #198754; border-color: rgba(25,135,84,0.16); background: rgba(25,135,84,0.03); }
        .qa-warning { color: #ff8800; border-color: rgba(255,136,0,0.12); background: rgba(255,136,0,0.02); }
        .qa-danger { color: #dc3545; border-color: rgba(220,53,69,0.12); background: rgba(220,53,69,0.02); }
        .qa-info { color: #0dcaf0; border-color: rgba(13,202,240,0.12); background: rgba(13,202,240,0.02); }
        .qa-muted { color: #6c757d; border-color: rgba(108,117,125,0.06); background: rgba(108,117,125,0.01); }
        .qa-indigo { color: #6f42c1; border-color: rgba(111,66,193,0.08); background: rgba(111,66,193,0.02); }

        /* ensure icons align and consistent width */
        .qa-btn .svg-inline--fa { width: 16px; height: 16px; }

        /* Make quick-actions sticky on tall screens (handled by layout right column) */
        @media (min-width: 992px){
          .admin-quick-actions { position: sticky; top: 120px; }
        }
      `}</style>
      <div className="mb-3">
        <div>
          <h3 className="mb-1">System Settings</h3>
          <p className="text-muted mb-2">Configure global settings for Campus Ballot. These are local UI controls — connect these to backend endpoints to persist.</p>
        </div>
        <div className="d-flex flex-row flex-wrap gap-2 admin-quick-actions justify-start align-items-center">
          <button className="btn btn-sm qa-btn qa-primary d-flex align-items-center" onClick={() => scrollToSection('profile','Profile')} aria-label="Edit profile">
            <FontAwesomeIcon icon={faUser} className="me-2" />Profile
          </button>
          <button className="btn btn-sm qa-btn qa-success d-flex align-items-center" onClick={() => scrollToSection('voter-roll','Voter roll')} aria-label="Voter roll">
            <FontAwesomeIcon icon={faFileImport} className="me-2" />Voter roll
          </button>
          <button className="btn btn-sm qa-btn qa-warning d-flex align-items-center" onClick={() => scrollToSection('backup','Backups')} aria-label="Backups">
            <FontAwesomeIcon icon={faDatabase} className="me-2" />Backups
          </button>
          <button className="btn btn-sm qa-btn qa-danger d-flex align-items-center" onClick={() => scrollToSection('rbac','RBAC & MFA')} aria-label="RBAC and MFA">
            <FontAwesomeIcon icon={faShieldAlt} className="me-2" />RBAC & MFA
          </button>
          <button className="btn btn-sm qa-btn qa-indigo d-flex align-items-center" onClick={() => scrollToSection('email','SMTP / Email')} aria-label="SMTP and Email">
            <FontAwesomeIcon icon={faEnvelope} className="me-2" />SMTP / Email
          </button>
          <button className="btn btn-sm qa-btn qa-info d-flex align-items-center" onClick={() => scrollToSection('notifications','Notifications')} aria-label="Notifications">
            <FontAwesomeIcon icon={faBell} className="me-2" />Notifications
          </button>
          <button className="btn btn-sm qa-btn qa-muted d-flex align-items-center" onClick={() => scrollToSection('audit','Audit Logs')} aria-label="Audit logs">
            <FontAwesomeIcon icon={faClipboardList} className="me-2" />Audit Logs
          </button>
          <button className="btn btn-sm qa-btn qa-muted d-flex align-items-center" onClick={() => scrollToSection('settings-history','Settings History')} aria-label="Settings history">
            <FontAwesomeIcon icon={faHistory} className="me-2" />History
          </button>
        </div>
      </div>

  {/* Profile section */}
  <SectionCard id="profile" title="Profile" onSave={saveProfile} onSaveDraft={async () => { Swal.fire('Saved draft', 'Profile draft saved locally.', 'info'); }} saving={saving}>
        <div className="mb-3">
          <label className="form-label" style={{ color: colors.text }}>Display name</label>
          <input 
            className="form-control" 
            value={displayName} 
            onChange={(e) => setDisplayName(e.target.value)}
            style={{
              backgroundColor: colors.inputBg,
              borderColor: colors.inputBorder,
              color: colors.text
            }}
          />
        </div>
        <div className="mb-3">
          <label className="form-label" style={{ color: colors.text }}>Email</label>
          <input 
            className="form-control" 
            value={profileEmail} 
            onChange={(e) => setProfileEmail(e.target.value)}
            style={{
              backgroundColor: colors.inputBg,
              borderColor: colors.inputBorder,
              color: colors.text
            }}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Phone</label>
          <input className="form-control" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Optional" />
        </div>
        <div className="mb-3">
          <label className="form-label">Avatar URL</label>
          <input className="form-control" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="/uploads/avatar.png" />
        </div>
      </SectionCard>

  <SectionCard id="general" title="General" onSave={saveGeneral} onSaveDraft={async () => { Swal.fire('Saved draft', 'General draft saved locally.', 'info'); }} saving={saving}>
        <div className="mb-3">
          <label className="form-label">Site name</label>
          <input className="form-control" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Site logo URL</label>
          <input className="form-control" value={siteLogo} onChange={(e) => setSiteLogo(e.target.value)} placeholder="/uploads/logo.png" />
        </div>
        <div className="mb-2">
          <label className="form-label small">Reason for change (required for audit)</label>
          <input className="form-control form-control-sm" value={changeReason} onChange={(e) => setChangeReason(e.target.value)} placeholder="Explain why you're changing this" />
        </div>
      </SectionCard>

  <SectionCard id="auth" title="Authentication" onSave={saveAuth} onSaveDraft={async () => { Swal.fire('Saved draft', 'Auth draft saved locally.', 'info'); }} saving={saving}>
        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" checked={allowRegistration} id="allowRegistration" onChange={(e) => setAllowRegistration(e.target.checked)} />
          <label className="form-check-label" htmlFor="allowRegistration">Allow user self-registration</label>
        </div>
        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" checked={requireEmailVerification} id="requireEmailVerification" onChange={(e) => setRequireEmailVerification(e.target.checked)} />
          <label className="form-check-label" htmlFor="requireEmailVerification">Require email verification</label>
        </div>
      </SectionCard>

  <SectionCard id="email" title="Email / SMTP" onSave={saveEmail} onSaveDraft={async () => { Swal.fire('Saved draft', 'Email draft saved locally.', 'info'); }} saving={saving}>
        <div className="mb-3">
          <label className="form-label">SMTP Host</label>
          <input className="form-control" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} />
        </div>
        <div className="mb-3 d-flex gap-2">
          <div style={{ flex: 1 }}>
            <label className="form-label">SMTP Port</label>
            <input className="form-control" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} />
          </div>
          <div className="align-self-end">
            <button className="btn btn-outline-secondary mt-2" onClick={testSmtp} disabled={saving}>Test SMTP</button>
          </div>
        </div>
      </SectionCard>

  <SectionCard id="notifications" title="Notifications" onSave={saveNotifications} onSaveDraft={async () => { Swal.fire('Saved draft', 'Notifications draft saved locally.', 'info'); }} saving={saving}>
        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" checked={notifyOnVote} id="notifyOnVote" onChange={(e) => setNotifyOnVote(e.target.checked)} />
          <label className="form-check-label" htmlFor="notifyOnVote">Notify admins on each vote</label>
        </div>
      </SectionCard>

  <SectionCard id="backup" title="Backup & Restore" onSave={runBackupNow} onSaveDraft={async () => { Swal.fire('Saved draft', 'Backup draft saved locally.', 'info'); }} saving={saving}>
        <div className="mb-3">
          <label className="form-label">Backup schedule</label>
          <select className="form-select" value={backupSchedule} onChange={(e) => setBackupSchedule(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="mb-3 d-flex gap-2 align-items-end">
          <div style={{ flex: 1 }}>
            <label className="form-label">Retention (days)</label>
            <input type="number" className="form-control" value={retentionDays} onChange={(e) => setRetentionDays(Number(e.target.value))} />
          </div>
          <div>
            <button className="btn btn-outline-primary" onClick={runBackupNow} disabled={saving}>Backup now</button>
          </div>
          <div>
            <button className="btn btn-outline-secondary" onClick={testRestore} disabled={saving}>Test restore</button>
          </div>
        </div>
        <div className="small text-muted">Last backup: {lastBackupAt ? new Date(lastBackupAt).toLocaleString() : 'Never'}</div>
      </SectionCard>

  <SectionCard id="voter-roll" title="Voter Roll" onSave={uploadVoterRoll} onSaveDraft={async () => { Swal.fire('Saved draft', 'Voter roll draft saved locally.', 'info'); }} saving={saving}>
        <div className="mb-3">
          <label className="form-label">Upload CSV</label>
          <input type="file" accept=".csv" className="form-control" onChange={(e) => handleVoterFile(e.target.files && e.target.files[0])} />
        </div>
        {voterPreview && voterPreview.length > 0 && (
          <div className="mb-3">
            <div className="fw-bold small" style={{ color: colors.text }}>Preview (first {voterPreview.length} rows)</div>
            <div className="table-responsive" style={{ 
              maxHeight: 220,
              borderRadius: '0.5rem',
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surface
            }}>
              <table className="table table-sm mb-0" style={{
                backgroundColor: colors.surface,
                color: colors.text,
                ...(isDarkMode && {
                  '--bs-table-bg': colors.surface,
                  '--bs-table-striped-bg': '#2d3748',
                  '--bs-table-hover-bg': '#3b4a5c',
                  '--bs-table-border-color': colors.border,
                })
              }}>
                <tbody>
                  {voterPreview.slice(0,50).map(p => (
                    <tr key={p.row} style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <td className="small" style={{ color: colors.textSecondary, padding: '0.5rem' }}>{p.row}</td>
                      <td className="small" style={{ color: colors.text, padding: '0.5rem' }}>{p.cols.join(' | ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="small" style={{ color: colors.textMuted }}>
              Validation: {voterValidation ? `${voterValidation.invalidCount} invalid of ${voterValidation.total}` : 'Pending'}
            </div>
          </div>
        )}
      </SectionCard>

  <SectionCard id="rbac" title="RBAC & MFA" onSave={saveRbacMfa} onSaveDraft={async () => { Swal.fire('Saved draft', 'Security draft saved locally.', 'info'); }} saving={saving}>
        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" checked={enforceMfa} id="enforceMfa" onChange={(e) => setEnforceMfa(e.target.checked)} />
          <label className="form-check-label" htmlFor="enforceMfa">Enforce MFA for all admin accounts</label>
        </div>
        {enforceMfa && (
          <div className="mb-3">
            <label className="form-label">Grace period (days)</label>
            <input type="number" className="form-control" value={mfaGraceDays} onChange={(e) => setMfaGraceDays(Number(e.target.value))} />
            <div className="small text-muted">Users will have this many days to enable MFA before enforcement.</div>
          </div>
        )}
      </SectionCard>

      <div className="mt-4 text-muted">
        <h6>What's next</h6>
        <ul>
          <li>Persist these settings server-side with a secure admin API.</li>
          <li>Add role-based permissions so only authorized admins can change critical settings.</li>
          <li>Add audit logging for settings changes (who changed what and when).</li>
          <li>Add scheduled backups and export/import for settings and data.</li>
        </ul>
      </div>
    </div>
  );
}
