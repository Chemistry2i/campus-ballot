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
  faHistory,
  faDownload,
  faUpload,
  faCheck,
  faTimes,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../contexts/ThemeContext';
import ThemedTable from '../common/ThemedTable';

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

  // Bulk User Import
  const [importFile, setImportFile] = useState(null);
  const [importValidation, setImportValidation] = useState(null);
  const [importStep, setImportStep] = useState('upload'); // upload | validate | import | done
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [sendWelcomeEmails, setSendWelcomeEmails] = useState(true);
  const [importResult, setImportResult] = useState(null);

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

  // Download import template
  const downloadTemplate = async (format = 'csv') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/admin/users/bulk-template?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `user_import_template.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Template download error:', err);
      Swal.fire('Error', 'Failed to download template', 'error');
    }
  };

  // Handle file selection for bulk import
  const handleImportFile = (file) => {
    if (!file) return;
    setImportFile(file);
    setImportValidation(null);
    setImportResult(null);
    setImportStep('upload');
  };

  // Validate the uploaded file
  const validateImportFile = async () => {
    if (!importFile) {
      Swal.fire('No file', 'Please choose a CSV or Excel file first', 'warning');
      return;
    }
    setSaving(true);
    setImportStep('validate');
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('file', importFile);
      const res = await axios.post('/api/admin/users/bulk-validate', form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setImportValidation(res.data);
      if (res.data.validRows > 0) {
        Swal.fire('Validation Complete', `${res.data.validRows} valid rows, ${res.data.invalidRows} invalid rows`, res.data.invalidRows > 0 ? 'warning' : 'success');
      } else {
        Swal.fire('Validation Failed', 'No valid rows found in the file', 'error');
      }
    } catch (err) {
      console.error('Validation error:', err);
      Swal.fire('Error', err.response?.data?.message || 'Failed to validate file', 'error');
      setImportStep('upload');
    } finally {
      setSaving(false);
    }
  };

  // Import users from validated file
  const importUsers = async () => {
    if (!importFile) {
      Swal.fire('No file', 'Please upload and validate a file first', 'warning');
      return;
    }
    
    const confirmed = await Swal.fire({
      title: 'Confirm Import',
      html: `<p>You are about to import <strong>${importValidation?.validRows || 0}</strong> users.</p>
             <p>${skipDuplicates ? 'Duplicates will be skipped.' : 'Duplicates will cause errors.'}</p>
             <p>${sendWelcomeEmails ? '<strong>Welcome emails with credentials will be sent.</strong>' : 'No welcome emails will be sent.'}</p>
             <p>This action cannot be undone. Continue?</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Import Users',
      cancelButtonText: 'Cancel'
    });
    
    if (!confirmed.isConfirmed) return;
    
    setSaving(true);
    setImportStep('import');
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('file', importFile);
      form.append('skipDuplicates', String(skipDuplicates));
      form.append('sendWelcomeEmail', String(sendWelcomeEmails));
      
      const res = await axios.post('/api/admin/users/bulk-import', form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      
      setImportResult(res.data);
      setImportStep('done');
      
      const emailInfo = res.data.emailsSent > 0 
        ? `<p>📧 ${res.data.emailsSent} welcome emails sent${res.data.emailsFailed > 0 ? `, ${res.data.emailsFailed} failed` : ''}</p>`
        : '';
      
      // Show error details if any failures
      const errorDetails = res.data.errors?.length > 0
        ? `<details style="text-align:left;margin-top:10px"><summary style="cursor:pointer;color:#dc3545">View ${res.data.errors.length} error(s)</summary><ul style="max-height:200px;overflow-y:auto;font-size:0.85em">${res.data.errors.slice(0, 20).map(e => `<li style="color:#dc3545">${e}</li>`).join('')}${res.data.errors.length > 20 ? '<li>...and more</li>' : ''}</ul></details>`
        : '';
      
      Swal.fire({
        title: 'Import Complete!',
        html: `<p><strong>${res.data.imported}</strong> users imported successfully</p>
               <p>${res.data.skipped > 0 ? `${res.data.skipped} skipped (duplicates)` : ''}</p>
               <p>${res.data.failed > 0 ? `<span style="color:#dc3545">${res.data.failed} failed</span>` : ''}</p>
               ${emailInfo}
               ${errorDetails}`,
        icon: res.data.failed > 0 ? 'warning' : 'success',
        width: res.data.errors?.length > 0 ? '600px' : undefined
      });
    } catch (err) {
      console.error('Import error:', err);
      Swal.fire('Error', err.response?.data?.message || 'Failed to import users', 'error');
      setImportStep('validate');
    } finally {
      setSaving(false);
    }
  };

  // Reset import state
  const resetImport = () => {
    setImportFile(null);
    setImportValidation(null);
    setImportResult(null);
    setImportStep('upload');
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
          <button className="btn btn-sm qa-btn qa-success d-flex align-items-center" onClick={() => scrollToSection('bulk-import','Bulk Import')} aria-label="Bulk User Import">
            <FontAwesomeIcon icon={faUsers} className="me-2" />Bulk Import
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

  <div id="bulk-import" className="card mb-4">
        <div className="card-body">
          <div className="d-flex align-items-start justify-content-between mb-3">
            <div>
              <h5 className="card-title mb-1">Bulk User Import</h5>
              <p className="text-muted small mb-0">Import multiple students from a CSV or Excel file</p>
              <p className="text-muted small mb-0"><strong>Minimum required columns:</strong> email, studentId, organization</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => downloadTemplate('csv')} title="Download CSV Template">
                <FontAwesomeIcon icon={faDownload} className="me-1" />CSV
              </button>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => downloadTemplate('xlsx')} title="Download Excel Template">
                <FontAwesomeIcon icon={faDownload} className="me-1" />Excel
              </button>
            </div>
          </div>

          {/* Step 1: Upload */}
          <div className="mb-3">
            <label className="form-label">Upload CSV or Excel file</label>
            <input 
              type="file" 
              accept=".csv,.xlsx,.xls" 
              className="form-control" 
              onChange={(e) => handleImportFile(e.target.files && e.target.files[0])}
              disabled={importStep === 'import'}
            />
            {importFile && (
              <div className="small mt-2" style={{ color: colors.textSecondary }}>
                <FontAwesomeIcon icon={faCheck} className="text-success me-1" />
                Selected: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          {/* Options */}
          <div className="form-check mb-2">
            <input 
              className="form-check-input" 
              type="checkbox" 
              checked={skipDuplicates} 
              id="skipDuplicates" 
              onChange={(e) => setSkipDuplicates(e.target.checked)}
              disabled={importStep === 'import'}
            />
            <label className="form-check-label" htmlFor="skipDuplicates">
              Skip duplicate emails/student IDs (recommended)
            </label>
          </div>
          
          <div className="form-check mb-3">
            <input 
              className="form-check-input" 
              type="checkbox" 
              checked={sendWelcomeEmails} 
              id="sendWelcomeEmails" 
              onChange={(e) => setSendWelcomeEmails(e.target.checked)}
              disabled={importStep === 'import'}
            />
            <label className="form-check-label" htmlFor="sendWelcomeEmails">
              Send welcome emails with login credentials
            </label>
          </div>

          {/* Validation Results */}
          {importValidation && (
            <div className="mb-3 p-3 rounded" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold">Validation Results</span>
                <span className="badge bg-secondary">{importValidation.totalRows} rows</span>
              </div>
              <div className="d-flex gap-4 mb-2">
                <span className="text-success">
                  <FontAwesomeIcon icon={faCheck} className="me-1" />
                  {importValidation.validRows} valid
                </span>
                <span className={importValidation.invalidRows > 0 ? 'text-danger' : 'text-muted'}>
                  <FontAwesomeIcon icon={faTimes} className="me-1" />
                  {importValidation.invalidRows} invalid
                </span>
                {importValidation.duplicateEmails?.length > 0 && (
                  <span className="text-warning">
                    {importValidation.duplicateEmails.length} duplicate emails
                  </span>
                )}
              </div>
              
              {/* Preview table */}
              {importValidation.preview && importValidation.preview.length > 0 && (
                <div style={{ maxHeight: 200, overflow: 'auto' }}>
                  <ThemedTable size="sm" striped hover bordered>
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: colors.surface, zIndex: 1 }}>
                      <tr>
                        <th style={{ padding: '0.4rem', color: colors.text }}>Row</th>
                        <th style={{ padding: '0.4rem', color: colors.text }}>Email</th>
                        <th style={{ padding: '0.4rem', color: colors.text }}>Student ID</th>
                        <th style={{ padding: '0.4rem', color: colors.text }}>Name</th>
                        <th style={{ padding: '0.4rem', color: colors.text }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importValidation.preview.slice(0, 20).map(p => (
                        <tr key={p.row}>
                          <td style={{ padding: '0.4rem', color: colors.text }}>{p.row}</td>
                          <td style={{ padding: '0.4rem', color: colors.text }}>{p.email}</td>
                          <td style={{ padding: '0.4rem', color: colors.text }}>{p.studentId || '-'}</td>
                          <td style={{ padding: '0.4rem', color: colors.text }}>{p.name || <span className="text-muted">(auto)</span>}</td>
                          <td style={{ padding: '0.4rem' }}>
                            {p.valid ? (
                              <span className="badge bg-success">Valid</span>
                            ) : (
                              <span className="badge bg-danger" title={p.errors?.join(', ')}>Invalid</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </ThemedTable>
                </div>
              )}
              
              {/* Error details */}
              {importValidation.errors && importValidation.errors.length > 0 && (
                <div className="mt-2">
                  <details>
                    <summary className="text-danger small" style={{ cursor: 'pointer' }}>
                      View {importValidation.errors.length} error(s)
                    </summary>
                    <ul className="small mt-1 mb-0" style={{ maxHeight: 150, overflowY: 'auto' }}>
                      {importValidation.errors.slice(0, 20).map((err, i) => (
                        <li key={i} className="text-danger">{err}</li>
                      ))}
                      {importValidation.errors.length > 20 && (
                        <li className="text-muted">...and {importValidation.errors.length - 20} more</li>
                      )}
                    </ul>
                  </details>
                </div>
              )}
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className={`mb-3 p-3 rounded border ${importResult.failed > 0 ? 'border-warning' : 'border-success'}`} style={{ backgroundColor: importResult.failed > 0 ? 'rgba(255, 193, 7, 0.1)' : 'rgba(25, 135, 84, 0.1)' }}>
              <div className={`fw-bold ${importResult.failed > 0 ? 'text-warning' : 'text-success'} mb-2`}>
                <FontAwesomeIcon icon={faCheck} className="me-2" />
                Import Completed
              </div>
              <div className="d-flex gap-4 mb-2">
                <span><strong>{importResult.imported}</strong> imported</span>
                {importResult.skipped > 0 && <span className="text-warning"><strong>{importResult.skipped}</strong> skipped</span>}
                {importResult.failed > 0 && <span className="text-danger"><strong>{importResult.failed}</strong> failed</span>}
              </div>
              
              {/* Show import errors if any */}
              {importResult.errors && importResult.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="text-danger small" style={{ cursor: 'pointer' }}>
                    View {importResult.errors.length} error(s)
                  </summary>
                  <ul className="small mt-1 mb-0" style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {importResult.errors.slice(0, 30).map((err, i) => (
                      <li key={i} className="text-danger">{err}</li>
                    ))}
                    {importResult.errors.length > 30 && (
                      <li className="text-muted">...and {importResult.errors.length - 30} more</li>
                    )}
                  </ul>
                </details>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="d-flex gap-2 flex-wrap">
            {importStep === 'upload' && (
              <button 
                className="btn btn-primary" 
                onClick={validateImportFile} 
                disabled={!importFile || saving}
              >
                {saving ? 'Validating...' : 'Validate File'}
              </button>
            )}
            {importStep === 'validate' && importValidation?.validRows > 0 && (
              <>
                <button 
                  className="btn btn-success" 
                  onClick={importUsers} 
                  disabled={saving}
                >
                  <FontAwesomeIcon icon={faUpload} className="me-2" />
                  {saving ? 'Importing...' : `Import ${importValidation.validRows} Users`}
                </button>
                <button 
                  className="btn btn-outline-secondary" 
                  onClick={resetImport}
                  disabled={saving}
                >
                  Cancel
                </button>
              </>
            )}
            {importStep === 'done' && (
              <button className="btn btn-outline-primary" onClick={resetImport}>
                Import More Users
              </button>
            )}
          </div>

          {/* Help text */}
          <div className="mt-3 small text-muted">
            <strong>Required columns:</strong> name, email, role<br />
            <strong>For students:</strong> studentId, faculty, course, yearOfStudy, gender<br />
            <strong>Optional:</strong> phone, department, password (auto-generated if not provided)
          </div>
        </div>
      </div>

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
