import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Select from 'react-select';

function CreateElection({ onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startAmPm, setStartAmPm] = useState('AM');
  const [endAmPm, setEndAmPm] = useState('AM');
  const [positions, setPositions] = useState([
    { name: "", seats: 1, method: "fptp" }
  ]);
  const [eligibilityType, setEligibilityType] = useState("all");
  const [faculties, setFaculties] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [whitelistFile, setWhitelistFile] = useState(null);
  const [autoPublish, setAutoPublish] = useState(false);
  const [saveDraft, setSaveDraft] = useState(false);
  const [loading, setLoading] = useState(false);

  const timezone = useMemo(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch(e){ return 'UTC'; }
  }, []);

  const [availableFaculties, setAvailableFaculties] = useState([]);
  const [availableCohorts, setAvailableCohorts] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchMeta = async () => {
      try {
        // Try a meta endpoint; fallback gracefully if not present
        const resFac = await axios.get('/api/meta/faculties').catch(() => null);
        const resCoh = await axios.get('/api/meta/cohorts').catch(() => null);
        if (!mounted) return;
        if (resFac && Array.isArray(resFac.data)) setAvailableFaculties(resFac.data);
        if (resCoh && Array.isArray(resCoh.data)) setAvailableCohorts(resCoh.data);
        // fallback: if none available, provide small sensible defaults
        if ((!resFac || !Array.isArray(resFac.data) || resFac.data.length === 0) && availableFaculties.length === 0) {
          setAvailableFaculties(['Engineering','Science','Business','Arts']);
        }
        if ((!resCoh || !Array.isArray(resCoh.data) || resCoh.data.length === 0) && availableCohorts.length === 0) {
          setAvailableCohorts(['2025','2024','2023','2022']);
        }
      } catch (err) {
        console.warn('Failed to fetch faculties/cohorts meta, falling back to defaults', err);
        if (mounted) {
          if (availableFaculties.length === 0) setAvailableFaculties(['Engineering','Science','Business','Arts']);
          if (availableCohorts.length === 0) setAvailableCohorts(['2025','2024','2023','2022']);
        }
      }
    };
    fetchMeta();
    return () => { mounted = false };
  }, []);

  const addPosition = () => setPositions(prev => [...prev, { name: "", seats: 1, method: "fptp" }]);
  const removePosition = (idx) => setPositions(prev => prev.filter((_,i) => i !== idx));
  const updatePosition = (idx, field, value) => setPositions(prev => prev.map((p,i) => i===idx ? { ...p, [field]: value } : p));

  const parseCsvFile = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve([]);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          // take first column as identifier (email or id)
          const values = lines.map(l => l.split(',')[0].trim());
          resolve(values);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  };

  const validate = async () => {
    if (!title) return 'Title is required';
    if (!startDate || !endDate) return 'Start and end date/time are required';
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s) || isNaN(e)) return 'Invalid date/time';
    if (e <= s) return 'End date/time must be after start date/time';
    if (!positions || positions.length === 0) return 'At least one position is required';
    const names = positions.map(p => (p.name || '').trim()).filter(Boolean);
    if (names.length !== positions.length) return 'All positions must have a name';
    const unique = new Set(names.map(n => n.toLowerCase()));
    if (unique.size !== names.length) return 'Position names must be unique';
    if (eligibilityType === 'csv' && !whitelistFile) return 'Please upload a whitelist CSV for CSV eligibility';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = await validate();
    if (error) return Swal.fire('Validation', error, 'warning');

    // parse whitelist if provided
    let whitelist = [];
    if (eligibilityType === 'csv' && whitelistFile) {
      try {
        whitelist = await parseCsvFile(whitelistFile);
      } catch (err) {
        console.error('CSV parse error', err);
        return Swal.fire('Error', 'Failed to parse CSV whitelist file', 'error');
      }
    }

    // Prepare summary for confirmation
    const summaryHtml = `
      <strong>${escapeHtml(title)}</strong><br/>
      <small class="text-muted">${escapeHtml(description || '')}</small><hr/>
      <div><strong>When:</strong> ${escapeHtml(startDate)} to ${escapeHtml(endDate)} (${escapeHtml(timezone)})</div>
      <div><strong>Positions:</strong> ${positions.map(p => escapeHtml(p.name)).join(', ')}</div>
      <div><strong>Eligibility:</strong> ${escapeHtml(eligibilityType)}</div>
      <div><strong>Auto-publish:</strong> ${autoPublish ? 'Yes' : 'No'}</div>
    `;

    const confirm = await Swal.fire({
      title: 'Create Election?',
      html: summaryHtml,
      showCancelButton: true,
      confirmButtonText: saveDraft ? 'Save Draft' : (autoPublish ? 'Create & Publish' : 'Create'),
      preConfirm: () => true
    });
    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // helper: merge datetime-local value and AM/PM into an ISO string
      const toIsoWithAmPm = (dtLocal, ampm) => {
        // dtLocal expected format: 'YYYY-MM-DDTHH:MM' or 'YYYY-MM-DDTHH:MM:SS'
        if (!dtLocal) return null;
        // split date and time
        const [datePart, timePartRaw] = dtLocal.split('T');
        if (!datePart || !timePartRaw) return null;
        // keep only HH:MM
        const [hourStr, minuteStr] = timePartRaw.split(':');
        let hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10) || 0;
        if (isNaN(hour)) hour = 0;
        // Adjust hour based on AM/PM
        if (ampm === 'PM' && hour < 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        // Build a Date using local time then convert to ISO
        const dateObj = new Date(datePart + 'T' + String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0') + ':00');
        return dateObj.toISOString();
      };

      const payload = {
        title,
        description,
        startDate: toIsoWithAmPm(startDate, startAmPm),
        endDate: toIsoWithAmPm(endDate, endAmPm),
        timezone,
    // The Election model expects positions as an array of strings. Send names only to match schema.
    positions: positions.map(p => (p.name || '').trim()),
        eligibility: {
          type: eligibilityType,
          faculties: eligibilityType === 'faculty' ? faculties : undefined,
          cohorts: eligibilityType === 'cohort' ? cohorts : undefined,
          whitelist: whitelist.length ? whitelist : undefined
        },
        autoPublish: !!autoPublish,
        draft: !!saveDraft
      };

      await axios.post('/api/elections', payload, { headers: { Authorization: `Bearer ${token}` } });
      Swal.fire('Success', saveDraft ? 'Draft saved' : 'Election created', 'success');
  // reset form
  setTitle(''); setDescription(''); setStartDate(''); setStartAmPm('AM'); setEndDate(''); setEndAmPm('AM'); setPositions([{ name: '', seats: 1, method: 'fptp' }]);
  setEligibilityType('all'); setFaculties([]); setCohorts([]); setWhitelistFile(null); setAutoPublish(false); setSaveDraft(false);
      if (onCreated) onCreated();
    } catch (err) {
      console.error('Create election failed', err);
      Swal.fire('Error', err?.response?.data?.message || 'Failed to create election', 'error');
    } finally {
      setLoading(false);
    }
  };

  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        <h5 className="card-title mb-3 fw-bold">Create New Election</h5>
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Election Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Short Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small">Start Date & Time</label>
            <div className="d-flex gap-2">
              <input type="datetime-local" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} required />
              <select className="form-select" style={{maxWidth: '110px'}} value={startAmPm} onChange={e => setStartAmPm(e.target.value)}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label small">End Date & Time</label>
            <div className="d-flex gap-2">
              <input type="datetime-local" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} required />
              <select className="form-select" style={{maxWidth: '110px'}} value={endAmPm} onChange={e => setEndAmPm(e.target.value)}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          <div className="col-12">
            <label className="form-label small">Positions</label>
            {positions.map((p, idx) => (
              <div key={idx} className="d-flex gap-2 mb-2">
                <input className="form-control" placeholder="Position name" value={p.name} onChange={e => updatePosition(idx, 'name', e.target.value)} />
                <input className="form-control" style={{maxWidth: '110px'}} type="number" min={1} value={p.seats} onChange={e => updatePosition(idx, 'seats', e.target.value)} />
                <select className="form-select" style={{maxWidth: '180px'}} value={p.method} onChange={e => updatePosition(idx, 'method', e.target.value)}>
                  <option value="fptp">First-past-the-post</option>
                  <option value="approval">Approval</option>
                  <option value="ranked">Ranked-choice</option>
                </select>
                <button type="button" className="btn btn-outline-danger" onClick={() => removePosition(idx)} disabled={positions.length === 1}>Remove</button>
              </div>
            ))}
            <button type="button" className="btn btn-primary p-0" onClick={addPosition}>+ Add position</button>
          </div>

          <div className="col-md-6">
            <label className="form-label small">Eligibility</label>
            <select className="form-select" value={eligibilityType} onChange={e => setEligibilityType(e.target.value)}>
              <option value="all">All registered students</option>
              <option value="faculty">Faculty / Department</option>
              <option value="cohort">Cohort / Year</option>
              <option value="csv">Whitelist CSV upload</option>
            </select>
          </div>
            {eligibilityType === 'faculty' && (
              <div className="col-md-6">
                <label className="form-label small">Select Faculties</label>
                <Select
                  isMulti
                  isSearchable
                  options={availableFaculties.map(f => ({ value: f, label: f }))}
                  value={faculties.map(f => ({ value: f, label: f }))}
                  onChange={vals => setFaculties(vals ? vals.map(v => v.value) : [])}
                  classNamePrefix="react-select"
                />
              </div>
            )}
            {eligibilityType === 'cohort' && (
              <div className="col-md-6">
                <label className="form-label small">Select Cohorts / Years</label>
                <Select
                  isMulti
                  isSearchable
                  options={availableCohorts.map(c => ({ value: c, label: c }))}
                  value={cohorts.map(c => ({ value: c, label: c }))}
                  onChange={vals => setCohorts(vals ? vals.map(v => v.value) : [])}
                  classNamePrefix="react-select"
                />
              </div>
            )}
          {eligibilityType === 'csv' && (
            <div className="col-12">
              <input type="file" accept=".csv,text/csv" className="form-control" onChange={e => setWhitelistFile(e.target.files?.[0] || null)} />
            </div>
          )}

          <div className="col-md-4 d-flex align-items-center">
            <div className="form-check me-3">
              <input id="autoPublish" className="form-check-input" type="checkbox" checked={autoPublish} onChange={e => setAutoPublish(e.target.checked)} />
              <label className="form-check-label" htmlFor="autoPublish">Auto-publish results</label>
            </div>
          </div>
          <div className="col-md-4 d-flex align-items-center">
            <div className="form-check me-3">
              <input id="saveDraft" className="form-check-input" type="checkbox" checked={saveDraft} onChange={e => setSaveDraft(e.target.checked)} />
              <label className="form-check-label" htmlFor="saveDraft">Save as draft</label>
            </div>
          </div>
          <div className="col-md-4">
            <div className="text-muted small">Timezone: {timezone}</div>
          </div>

          <div className="col-12">
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-secondary" onClick={() => {
                setTitle(''); setDescription(''); setStartDate(''); setStartAmPm('AM'); setEndDate(''); setEndAmPm('AM'); setPositions([{ name: '', seats: 1, method: 'fptp' }]);
                setEligibilityType('all'); setFaculties([]); setCohorts([]); setWhitelistFile(null); setAutoPublish(false); setSaveDraft(false);
              }}>Reset</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : (saveDraft ? 'Save Draft' : (autoPublish ? 'Create & Publish' : 'Create'))}</button>
            </div>
          </div>
        </form>

        {/* Preview removed per request */}
      </div>
    </div>
  );
}

export default CreateElection;
