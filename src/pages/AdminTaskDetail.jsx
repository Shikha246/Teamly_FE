import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getTaskById, updateTask } from '../api/services';
import { toast } from 'react-toastify';

const priorityBadge = (priority) => {
  const map = { low: 'bg-secondary', medium: 'bg-warning text-dark', high: 'bg-danger' };
  return map[priority] || 'bg-secondary';
};

const statusBadge = (status) => {
  const map = { todo: 'bg-secondary', 'in-progress': 'bg-primary', completed: 'bg-success' };
  return map[status] || 'bg-secondary';
};

const AdminTaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ priority: '', deadline: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchTask = async () => {
    try {
      const { data } = await getTaskById(id);
      setTask(data);
      setForm({
        priority: data.priority,
        deadline: new Date(data.deadline).toISOString().split('T')[0],
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load task');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const validate = () => {
    const errs = {};
    if (!form.deadline) errs.deadline = 'Deadline is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await updateTask(id, form);
      toast.success('Task updated!');
      setEditMode(false);
      fetchTask();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update task');
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

  if (!task) return null;

  return (
    <div>
      <Navbar />
      <div className="container mt-4" style={{ maxWidth: '800px' }}>
        <button className="btn btn-sm btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
          &larr; Back
        </button>

        <div className="card mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h4>{task.title}</h4>
              <div className="d-flex gap-2">
                <span className={`badge ${priorityBadge(task.priority)}`}>{task.priority}</span>
                <span className={`badge ${statusBadge(task.status)}`}>{task.status}</span>
              </div>
            </div>
            <p className="text-muted">{task.description || 'No description provided.'}</p>
            <p className="mb-1"><strong>Project:</strong> {task.project?.title}</p>
            <p className="mb-1"><strong>Assigned To:</strong> {task.assignedTo?.name}</p>
            <p className="mb-3">
              <strong>Current Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}
            </p>

            {!editMode ? (
              <button className="btn btn-outline-primary btn-sm" onClick={() => setEditMode(true)}>
                Edit Priority / Deadline
              </button>
            ) : (
              <form onSubmit={handleSave} className="border rounded p-3 bg-light">
                <div className="row">
                  <div className="col-6 mb-3">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-select"
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
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
                      className={`form-control ${errors.deadline ? 'is-invalid' : ''}`}
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    />
                    {errors.deadline && <div className="invalid-feedback">{errors.deadline}</div>}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Deadline History — the part that was missing */}
        <div className="card mb-4">
          <div className="card-header">Deadline History</div>
          {task.deadlineHistory && task.deadlineHistory.length > 0 ? (
            <ul className="list-group list-group-flush">
              {task.deadlineHistory
                .slice()
                .reverse()
                .map((h, idx) => (
                  <li className="list-group-item" key={idx}>
                    <div className="d-flex justify-content-between">
                      <span>
                        <span className="text-danger text-decoration-line-through">
                          {new Date(h.previousDeadline).toLocaleDateString()}
                        </span>
                        {' → '}
                        <span className="text-success fw-bold">
                          {new Date(h.updatedDeadline).toLocaleDateString()}
                        </span>
                      </span>
                      <span className="text-muted small">
                        by {h.changedBy?.name} on {new Date(h.changedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <div className="card-body text-muted">
              No deadline changes yet. Edit the deadline above to see history appear here.
            </div>
          )}
        </div>

        {/* Comments (read-only view for admin) */}
        <div className="card">
          <div className="card-header">Comments & Progress Updates</div>
          <div className="card-body">
            {task.comments && task.comments.length > 0 ? (
              <ul className="list-group list-group-flush">
                {task.comments.map((c, idx) => (
                  <li className="list-group-item" key={idx}>
                    <div className="d-flex justify-content-between">
                      <strong>{c.author?.name}</strong>
                      <span className="text-muted small">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mb-0">{c.text}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted mb-0">No comments yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTaskDetail;