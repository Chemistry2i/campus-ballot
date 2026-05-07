import { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import ThemedTable from '../common/ThemedTable';

const ManageObservers = () => {
  const [observers, setObservers] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingObserver, setEditingObserver] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null); // Store ID of the observer being deleted
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organization: '',
    accessLevel: 'election-specific',
    assignedElections: []
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchObservers();
    fetchElections();
  }, []);

  const fetchObservers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/super-admin/observers', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setObservers(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch observers');
    } finally {
      setLoading(false);
    }
  };

  const fetchElections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/elections', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      // Handle different response structures
      const electionData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || response.data?.elections || []);
      setElections(electionData);
    } catch (err) {
      console.error('Failed to fetch elections:', err);
      setElections([]); // Set empty array on error
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      if (editingObserver) {
        // Update existing observer
        await axios.put(`/api/super-admin/observers/${editingObserver._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        setSuccess('Observer updated successfully');
      } else {
        // Create new observer
        await axios.post('/api/super-admin/observers', formData, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        setSuccess('Observer created successfully');
      }
      
      fetchObservers();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save observer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this observer?')) return;

    try {
      setIsDeleting(id);
      const token = localStorage.getItem('token');
      await axios.delete(`/api/super-admin/observers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setSuccess('Observer deleted successfully');
      fetchObservers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete observer');
    } finally {
      setIsDeleting(null);
    }
  };

  const openModal = (observer = null) => {
    if (observer) {
      setEditingObserver(observer);
      setFormData({
        name: observer.name,
        email: observer.email,
        password: '',
        organization: observer.observerInfo?.organization || '',
        accessLevel: observer.observerInfo?.accessLevel || 'election-specific',
        assignedElections: observer.observerInfo?.assignedElections?.map(e => e._id || e) || []
      });
    } else {
      setEditingObserver(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        organization: '',
        accessLevel: 'election-specific',
        assignedElections: []
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingObserver(null);
    setError(null);
  };

  const handleElectionToggle = (electionId) => {
    setFormData(prev => ({
      ...prev,
      assignedElections: prev.assignedElections.includes(electionId)
        ? prev.assignedElections.filter(id => id !== electionId)
        : [...prev.assignedElections, electionId]
    }));
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h2 mb-0 fw-bold text-primary">Manage Observers</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <i className="fas fa-plus me-2"></i>Add Observer
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="observers-table-font-size">
          <ThemedTable striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Organization</th>
                <th>Access Level</th>
                <th>Assigned Elections</th>
                <th>Assigned Date</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {observers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No observers found
                  </td>
                </tr>
              ) : (
                observers.map((observer) => (
                  <tr key={observer._id}>
                    <td className="fw-medium">{observer.name}</td>
                    <td>{observer.email}</td>
                    <td>{observer.observerInfo?.organization || '-'}</td>
                    <td>
                      <span className={`badge ${observer.observerInfo?.accessLevel === 'full' ? 'bg-success' : 'bg-info'}`}>
                        {observer.observerInfo?.accessLevel === 'full' ? 'Full Access' : 'Election-Specific'}
                      </span>
                    </td>
                    <td>
                      {observer.observerInfo?.accessLevel === 'full' 
                        ? <span className="text-success fw-medium">All Elections</span>
                        : observer.observerInfo?.assignedElections?.length || 0
                      }
                    </td>
                    <td>
                      {new Date(observer.observerInfo?.assignedDate).toLocaleDateString()}
                    </td>
                    <td className="text-end">
                      <button 
                        className="btn btn-sm btn-outline-primary me-2" 
                        onClick={() => openModal(observer)}
                        disabled={isDeleting !== null}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger" 
                        onClick={() => handleDelete(observer._id)}
                        disabled={isDeleting === observer._id}
                      >
                        {isDeleting === observer._id ? (
                          <FontAwesomeIcon icon={faSpinner} spin />
                        ) : (
                          <i className="fas fa-trash"></i>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </ThemedTable>
          {/* High-specificity CSS for table font size override */}
          <style>{`
            .observers-table-font-size, .observers-table-font-size * {
              font-size: .8rem !important;
            }
          `}</style>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeModal}>
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingObserver ? 'Edit Observer' : 'Add New Observer'}</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email <span className="text-danger">*</span></label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={editingObserver}
                      />
                    </div>
                  </div>

                  {!editingObserver && (
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Password <span className="text-danger">*</span></label>
                        <input
                          type="password"
                          className="form-control"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required={!editingObserver}
                          minLength="6"
                        />
                        <div className="form-text">Minimum 6 characters</div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Organization</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                          placeholder="e.g., Election Commission, Student Council"
                        />
                      </div>
                    </div>
                  )}

                  {editingObserver && (
                    <div className="mb-3">
                      <label className="form-label">Organization</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        placeholder="e.g., Election Commission, Student Council"
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Access Level <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      value={formData.accessLevel}
                      onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value })}
                      required
                    >
                      <option value="election-specific">Election-Specific</option>
                      <option value="full">Full Access</option>
                    </select>
                  </div>

                  {formData.accessLevel === 'election-specific' && (
                    <div className="mb-3">
                      <label className="form-label">Assigned Elections <span className="text-danger">*</span></label>
                      <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {!Array.isArray(elections) || elections.length === 0 ? (
                          <p className="text-muted mb-0">No elections available</p>
                        ) : (
                          elections.map((election) => (
                            <div key={election._id} className="form-check mb-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`election-${election._id}`}
                                checked={formData.assignedElections.includes(election._id)}
                                onChange={() => handleElectionToggle(election._id)}
                              />
                              <label className="form-check-label" htmlFor={`election-${election._id}`}>
                                {election.title} <span className="badge bg-secondary ms-2">{election.status}</span>
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={closeModal}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                        {editingObserver ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        {editingObserver ? 'Update Observer' : 'Create Observer'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageObservers;
