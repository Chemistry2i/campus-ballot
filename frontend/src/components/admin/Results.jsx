import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import useSocket from '../../hooks/useSocket';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Results({ user }) {
  const { socketRef } = useSocket();
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState(null);
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unpublished, setUnpublished] = useState(false); // true when 403 returned

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/elections', { headers: { Authorization: `Bearer ${token}` } });
      // API may return either an array or an object { elections, total, page }
      const payload = res.data;
      if (Array.isArray(payload)) {
        setElections(payload);
      } else if (payload && Array.isArray(payload.elections)) {
        setElections(payload.elections);
      } else if (payload && Array.isArray(payload.elections?.docs)) {
        // some paginated responses may nest docs
        setElections(payload.elections.docs);
      } else {
        console.warn('Unexpected elections payload shape, coercing to empty array', payload);
        setElections([]);
      }
    } catch (err) {
      console.error('Failed to load elections', err);
      Swal.fire('Error', 'Failed to load elections', 'error');
    }
  };

  const loadResults = async (electionId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      setSelectedElectionId(electionId);
      const res = await axios.get(`/api/elections/${electionId}/results`, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedElection(res.data.election || null);
      setResults(res.data.results || []);
      setUnpublished(false);
    } catch (err) {
      console.error('Failed to load results', err);
      if (err.response?.status === 403) {
        setUnpublished(true);
        setResults([]);
        Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Results not published yet' });
      } else {
        Swal.fire('Error', 'Failed to load results', 'error');
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const publishResults = async () => {
    if (!selectedElectionId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`/api/elections/${selectedElectionId}/publish-results`, {}, { headers: { Authorization: `Bearer ${token}` } });
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Results published' });
      // refresh results
      await loadResults(selectedElectionId);
      // also mark unpublished false
      setUnpublished(false);
    } catch (err) {
      console.error('Failed to publish results', err);
      Swal.fire('Error', 'Failed to publish results', 'error');
    }
  };

  const exportResultsCSV = () => {
    try {
      const rows = [['Candidate','Votes']];
      results.forEach(r => rows.push([`"${r.name || ''}"`, r.votes || 0]));
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = typeof selectedElection === 'string' && selectedElection.length > 0 ? selectedElection : (selectedElection?.title || 'results');
      a.download = `${filename}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Export failed', err);
      Swal.fire('Error', 'Failed to export results', 'error');
    }
  };

  // Listen for server-side published events and refresh when relevant
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;
    const onPublished = (payload) => {
      try {
        // payload = { id: electionId }
        if (payload && payload.id && payload.id.toString() === String(selectedElectionId)) {
          Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'Results were published — refreshing' });
          loadResults(selectedElectionId);
        }
      } catch (e) {
        console.error('Error handling election:results:published', e);
      }
    };

    socket.on('election:results:published', onPublished);
    return () => {
      socket.off('election:results:published', onPublished);
    };
  }, [socketRef, selectedElectionId]);

  return (
    <div className="container-fluid">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Election Results</h4>
          <div>
            <select className="form-select me-2 d-inline-block" style={{width: '280px'}} onChange={e => loadResults(e.target.value)}>
              <option value="">Select an election...</option>
              {Array.isArray(elections) && elections.length > 0 ? (
                elections.map(el => {
                  const id = el._id || el.id || el;
                  const label = el.title || el.name || (typeof el === 'string' ? el : `Election ${id}`);
                  return (
                    <option key={id} value={id}>{label}</option>
                  );
                })
              ) : null}
            </select>
            <button className="btn btn-outline-secondary btn-sm" onClick={exportResultsCSV} disabled={!results.length}>Export CSV</button>
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">Loading results...</div>
          ) : unpublished ? (
            <div className="text-center py-4">
              <div className="mb-3 text-warning">Results are not published for this election.</div>
              {user?.role === 'admin' && (
                <button className="btn btn-primary btn-sm" onClick={publishResults}>Publish Results</button>
              )}
            </div>
          ) : results && results.length ? (
            <>
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <div>
                  <strong>{selectedElection || 'Results'}</strong>
                </div>
                <div>
                  {user?.role === 'admin' && (
                    <button className="btn btn-outline-secondary btn-sm me-2" onClick={publishResults}>Ensure Published</button>
                  )}
                  <button className="btn btn-outline-secondary btn-sm" onClick={exportResultsCSV} disabled={!results.length}>Export CSV</button>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Candidate</th>
                          <th>Votes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map(r => (
                          <tr key={r._id || r.id || r.name}>
                            <td>{r.name}</td>
                            <td>{r.votes || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card p-3">
                    <Bar
                      data={{
                        labels: results.map(r => r.name || 'Unknown'),
                        datasets: [
                          {
                            label: 'Votes',
                            data: results.map(r => r.votes || 0),
                            backgroundColor: 'rgba(54, 162, 235, 0.7)'
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } }
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-muted">Select an election to view published results.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Results;
