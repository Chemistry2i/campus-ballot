import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import { useTheme } from '../../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import {
  FaTasks,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaCalendar,
  FaUser,
  FaFilter,
  FaSearch
} from 'react-icons/fa';
import Swal from 'sweetalert2';

const TaskManagement = () => {
  const { isDarkMode, colors } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignedTo: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchAgents();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/tasks/candidate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/candidates/agents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Candidate agents response:', response.data);
      
      // Handle different response formats
      let agentsList = [];
      if (Array.isArray(response.data)) {
        agentsList = response.data;
      } else if (response.data.agents && Array.isArray(response.data.agents)) {
        agentsList = response.data.agents;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        agentsList = response.data.data;
      }
      
      console.log('Processed agents list:', agentsList);
      setAgents(agentsList);
    } catch (err) {
      console.error('Error fetching agents:', err);
      if (err.response) {
        console.error('Error response:', err.response.status, err.response.data);
      }
      setAgents([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      
      console.log('Submitting task with data:', formData);
      console.log('Assigned agents:', formData.assignedTo);
      
      if (editingTask) {
        await axios.put(`/api/tasks/${editingTask._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Task Updated!',
          text: 'Task has been updated successfully',
          background: colors.surface,
          color: colors.text
        });
      } else {
        const response = await axios.post('/api/tasks', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Task creation response:', response.data);
        
        Swal.fire({
          icon: 'success',
          title: 'Task Created!',
          text: 'Task has been created successfully',
          background: colors.surface,
          color: colors.text
        });
      }

      fetchTasks();
      handleCloseModal();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to save task',
        background: colors.surface,
        color: colors.text
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (taskId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      background: colors.surface,
      color: colors.text
    });

    if (result.isConfirmed) {
      try {
        setIsDeletingId(taskId);
        const token = localStorage.getItem('token');
        await axios.delete(`/api/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Task has been deleted.',
          background: colors.surface,
          color: colors.text
        });

        fetchTasks();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete task',
          background: colors.surface,
          color: colors.text
        });
      } finally {
        setIsDeletingId(null);
      }
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate.split('T')[0],
      assignedTo: task.assignedTo.map(a => a._id)
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      assignedTo: []
    });
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: { bg: '#ef4444', text: 'High' },
      medium: { bg: '#f59e0b', text: 'Medium' },
      low: { bg: '#10b981', text: 'Low' }
    };
    const config = colors[priority] || colors.medium;
    
    return (
      <span
        className="badge"
        style={{
          backgroundColor: `${config.bg}20`,
          color: config.bg,
          padding: '0.35rem 0.7rem',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 600
        }}
      >
        {config.text}
      </span>
    );
  };

  const getStatusBadge = (task) => {
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
    
    const configs = {
      pending: { bg: '#6b7280', text: 'Pending', icon: FaClock },
      'in-progress': { bg: '#3b82f6', text: 'In Progress', icon: FaClock },
      completed: { bg: '#10b981', text: 'Completed', icon: FaCheckCircle },
      overdue: { bg: '#ef4444', text: 'Overdue', icon: FaExclamationTriangle }
    };
    
    const config = isOverdue ? configs.overdue : configs[task.status] || configs.pending;
    const Icon = config.icon;
    
    return (
      <span
        className="badge d-flex align-items-center gap-1"
        style={{
          backgroundColor: `${config.bg}20`,
          color: config.bg,
          padding: '0.35rem 0.7rem',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 600
        }}
      >
        <Icon size={12} />
        {config.text}
      </span>
    );
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  // Task statistics
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: colors.text }}>
            <FaTasks className="me-2" />
            Task Management
          </h3>
          <p className="text-muted mb-0">Assign and monitor tasks for your campaign agents</p>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <FaPlus />
          New Task
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-body p-3">
              <small className="text-muted d-block mb-1">Total Tasks</small>
              <h4 className="mb-0 fw-bold" style={{ color: '#3b82f6' }}>{stats.total}</h4>
            </div>
          </div>
        </div>
        <div className="col-6 col-md">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-body p-3">
              <small className="text-muted d-block mb-1">Pending</small>
              <h4 className="mb-0 fw-bold" style={{ color: '#6b7280' }}>{stats.pending}</h4>
            </div>
          </div>
        </div>
        <div className="col-6 col-md">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-body p-3">
              <small className="text-muted d-block mb-1">In Progress</small>
              <h4 className="mb-0 fw-bold" style={{ color: '#3b82f6' }}>{stats.inProgress}</h4>
            </div>
          </div>
        </div>
        <div className="col-6 col-md">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-body p-3">
              <small className="text-muted d-block mb-1">Completed</small>
              <h4 className="mb-0 fw-bold" style={{ color: '#10b981' }}>{stats.completed}</h4>
            </div>
          </div>
        </div>
        <div className="col-6 col-md">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-body p-3">
              <small className="text-muted d-block mb-1">Overdue</small>
              <h4 className="mb-0 fw-bold" style={{ color: '#ef4444' }}>{stats.overdue}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="input-group">
            <span className="input-group-text" style={{ background: colors.surface, borderColor: colors.border }}>
              <FaSearch style={{ color: colors.text }} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: colors.surface,
                borderColor: colors.border,
                color: colors.text
              }}
            />
          </div>
        </div>
        <div className="col-6 col-md-4">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              background: colors.surface,
              borderColor: colors.border,
              color: colors.text
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="col-6 col-md-4">
          <select
            className="form-select"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{
              background: colors.surface,
              borderColor: colors.border,
              color: colors.text
            }}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="row g-3">
        {filteredTasks.length === 0 ? (
          <div className="col-12">
            <div
              className="card"
              style={{
                background: isDarkMode ? colors.surface : '#fff',
                border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
                borderRadius: '12px'
              }}
            >
              <div className="card-body text-center py-5">
                <FaTasks size={60} style={{ color: colors.textSecondary, opacity: 0.3 }} />
                <p className="mt-3 text-muted">No tasks found</p>
                <button
                  className="btn btn-primary mt-2"
                  onClick={() => setShowModal(true)}
                >
                  Create Your First Task
                </button>
              </div>
            </div>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task._id} className="col-12 col-lg-6">
              <div
                className="card h-100"
                style={{
                  background: isDarkMode ? colors.surface : '#fff',
                  border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
                  borderRadius: '12px'
                }}
              >
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="mb-0 fw-bold" style={{ color: colors.text }}>{task.title}</h6>
                    <div className="d-flex gap-2">
                      {getPriorityBadge(task.priority)}
                      {getStatusBadge(task)}
                    </div>
                  </div>
                  
                  <p className="text-muted small mb-3">{task.description}</p>
                  
                  <div className="d-flex flex-wrap gap-3 mb-3">
                    <small className="text-muted">
                      <FaCalendar className="me-1" />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </small>
                    {task.assignedTo.length > 0 && (
                      <small className="text-muted">
                        <FaUser className="me-1" />
                        {task.assignedTo.length} agent{task.assignedTo.length > 1 ? 's' : ''}
                      </small>
                    )}
                  </div>

                  {task.assignedTo.length > 0 && (
                    <div className="mb-3">
                      <small className="text-muted d-block mb-1">Assigned to:</small>
                      <div className="d-flex flex-wrap gap-1">
                        {task.assignedTo.map((agent) => (
                          <span
                            key={agent._id}
                            className="badge"
                            style={{
                              backgroundColor: `${colors.primary}20`,
                              color: colors.primary,
                              padding: '0.25rem 0.5rem',
                              borderRadius: '8px',
                              fontSize: '0.7rem'
                            }}
                          >
                            {agent.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleEdit(task)}
                      disabled={isDeletingId === task._id}
                    >
                      <FaEdit className="me-1" />
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(task._id)}
                      disabled={isDeletingId === task._id}
                      style={{
                        opacity: isDeletingId === task._id ? 0.6 : 1,
                        cursor: isDeletingId === task._id ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isDeletingId === task._id ? (
                        <><FontAwesomeIcon icon={faSpinner} spin className="me-1" />Deleting</>
                      ) : (
                        <><FaTrash className="me-1" />Delete</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => e.target.className.includes('modal') && handleCloseModal()}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`
              }}
            >
              <div className="modal-header" style={{ borderColor: colors.border }}>
                <h5 className="modal-title" style={{ color: colors.text }}>
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  style={{ filter: isDarkMode ? 'invert(1)' : 'none' }}
                ></button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label" style={{ color: colors.text }}>
                      Task Title *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      style={{
                        background: colors.background,
                        borderColor: colors.border,
                        color: colors.text
                      }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={{ color: colors.text }}>
                      Description *
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      style={{
                        background: colors.background,
                        borderColor: colors.border,
                        color: colors.text
                      }}
                    ></textarea>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label" style={{ color: colors.text }}>
                        Priority *
                      </label>
                      <select
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        style={{
                          background: colors.background,
                          borderColor: colors.border,
                          color: colors.text
                        }}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label" style={{ color: colors.text }}>
                        Due Date *
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        style={{
                          background: colors.background,
                          borderColor: colors.border,
                          color: colors.text
                        }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label" style={{ color: colors.text }}>
                      Assign to Agents (Optional)
                    </label>
                    {agents.length === 0 ? (
                      <div>
                        <p className="text-muted small">No agents available. Add agents first.</p>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-primary"
                          onClick={fetchAgents}
                        >
                          Refresh Agents
                        </button>
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-2">
                        {agents.map((agent) => {
                          const agentUserId = agent.user?._id || agent._id || agent.userId;
                          const agentName = agent.user?.name || agent.name || 'Unknown Agent';
                          const agentRole = agent.agentRole || agent.role || 'Agent';
                          
                          return (
                            <div key={agent._id || agent.userId} className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`agent-${agentUserId}`}
                                checked={formData.assignedTo.includes(agentUserId)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      assignedTo: [...formData.assignedTo, agentUserId]
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      assignedTo: formData.assignedTo.filter(id => id !== agentUserId)
                                    });
                                  }
                                }}
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`agent-${agentUserId}`}
                                style={{ color: colors.text }}
                              >
                                {agentName} ({agentRole})
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer" style={{ borderColor: colors.border }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    style={{
                      opacity: isSubmitting ? 0.6 : 1,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    style={{
                      opacity: isSubmitting ? 0.7 : 1,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                        {editingTask ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingTask ? 'Update Task' : 'Create Task'
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

export default TaskManagement;
