import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  getProjectById,
  getProjectProgress,
  addMembersToProject,
  getAllUsers,
  getTasks,
  createTask,
} from '../api/services';
import { toast } from 'react-toastify';

const priorityBadge = (priority) => {
  const map = { low: 'bg-secondary', medium: 'bg-warning text-dark', high: 'bg-danger' };
  return map[priority] || 'bg-secondary';
};

const statusBadge = (status) => {
  const map = { todo: 'bg-secondary', 'in-progress': 'bg-primary', completed: 'bg-success' };
  return map[status] || 'bg-secondary';
};

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [progress, setProgress] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    deadline: '',
  });
  const [taskErrors, setTaskErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    try {
      const [projectRes, progressRes, tasksRes, usersRes] = await Promise.all([
        getProjectById(id),
        getProjectProgress(id),
        getTasks({ project: id }),
        getAllUsers(),
      ]);
      setProject(projectRes.data);
      setProgress(progressRes.data);
      setTasks(tasksRes.data);
      setAllUsers(usersRes.data.filter((u) => u.role === 'member'));
    } catch (error) {
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) {
      toast.error('Select at least one member');
      return;
    }
    try {
      await addMembersToProject(id, selectedMembers);
      toast.success('Members added!');
      setShowAddMember(false);
      setSelectedMembers([]);
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add members');
    }
  };

  const validateTask = () => {
    const errs = {};
    if (!taskForm.title.trim()) errs.title = 'Task title is required';
    if (!taskForm.assignedTo) errs.assignedTo = 'Assign this task to a member';
    if (!taskForm.deadline) errs.deadline = 'Deadline is required';
    else if (new Date(taskForm.deadline) < new Date().setHours(0, 0, 0, 0)) {
      errs.deadline = 'Deadline cannot be in the past';
    }
    setTaskErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!validateTask()) return;

    setSubmitting(true);
    try {
      await createTask({ ...taskForm, project: id });
      toast.success('Task created!');
      setTaskForm({ title: '', description: '', assignedTo: '', priority: 'medium', deadline: '' });
      setShowTaskModal(false);
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" />
        </div>
      </div>
    );
  }

  if (!project) return null;

  const projectMemberIds = project.members.map((m) => m._id);
  const unassignedUsers = allUsers.filter((u) => !projectMemberIds.includes(u._id));

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <Link to="/admin/dashboard" className="btn btn-sm btn-outline-secondary mb-3">
          &larr; Back to Projects
        </Link>

        <h3>{project.title}</h3>
        <p className="text-muted">{project.description}</p>

        {/* Progress Bar */}
        {progress && (
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <strong>Progress: {progress.percentComplete}%</strong>
                <span className="text-muted small">
                  {progress.completed}/{progress.totalTasks} tasks completed
                  {progress.overdue > 0 && (
                    <span className="text-danger ms-2">({progress.overdue} overdue)</span>
                  )}
                </span>
              </div>
              <div className="progress" style={{ height: '10px' }}>
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${progress.percentComplete}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="row">
          {/* Members panel */}
          <div className="col-md-4 mb-4">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span>Project Members</span>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setShowAddMember(true)}
                >
                  + Add
                </button>
              </div>
              <ul className="list-group list-group-flush">
                {project.members.length === 0 && (
                  <li className="list-group-item text-muted">No members yet</li>
                )}
                {project.members.map((m) => (
                  <li className="list-group-item d-flex justify-content-between" key={m._id}>
                    {m.name} <span className="text-muted small">{m.email}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tasks panel */}
          <div className="col-md-8 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Tasks</h5>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowTaskModal(true)}
                disabled={project.members.length === 0}
                title={project.members.length === 0 ? 'Add a member first' : ''}
              >
                + Create Task
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="alert alert-info">No tasks yet.</div>
            ) : (
              <table className="table table-sm table-hover align-middle">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Assigned To</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <tr key={t._id}>
                      <td>{t.title}</td>
                      <td>{t.assignedTo?.name}</td>
                      <td>
                        <span className={`badge ${priorityBadge(t.priority)}`}>{t.priority}</span>
                      </td>
                      <td>
                        <span className={`badge ${statusBadge(t.status)}`}>{t.status}</span>
                      </td>
                      <td>{new Date(t.deadline).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Members to Project</h5>
                <button className="btn-close" onClick={() => setShowAddMember(false)} />
              </div>
              <div className="modal-body">
                {unassignedUsers.length === 0 ? (
                  <p className="text-muted">All team members are already in this project.</p>
                ) : (
                  unassignedUsers.map((u) => (
                    <div className="form-check" key={u._id}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={u._id}
                        checked={selectedMembers.includes(u._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMembers([...selectedMembers, u._id]);
                          } else {
                            setSelectedMembers(selectedMembers.filter((id) => id !== u._id));
                          }
                        }}
                      />
                      <label className="form-check-label" htmlFor={u._id}>
                        {u.name} ({u.email})
                      </label>
                    </div>
                  ))
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAddMember(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleAddMembers}>
                  Add Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Task</h5>
                <button className="btn-close" onClick={() => setShowTaskModal(false)} />
              </div>
              <form onSubmit={handleCreateTask}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      className={`form-control ${taskErrors.title ? 'is-invalid' : ''}`}
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    />
                    {taskErrors.title && <div className="invalid-feedback">{taskErrors.title}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Assign To</label>
                    <select
                      className={`form-select ${taskErrors.assignedTo ? 'is-invalid' : ''}`}
                      value={taskForm.assignedTo}
                      onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                    >
                      <option value="">Select member...</option>
                      {project.members.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    {taskErrors.assignedTo && (
                      <div className="invalid-feedback">{taskErrors.assignedTo}</div>
                    )}
                  </div>
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label">Priority</label>
                      <select
                        className="form-select"
                        value={taskForm.priority}
                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label">Deadline</label>
                      <input
                        type="date"
                        className={`form-control ${taskErrors.deadline ? 'is-invalid' : ''}`}
                        value={taskForm.deadline}
                        onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                      />
                      {taskErrors.deadline && (
                        <div className="invalid-feedback">{taskErrors.deadline}</div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowTaskModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Task'}
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

export default ProjectDetail;