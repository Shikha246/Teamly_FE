import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getTaskById, updateTaskStatus, addComment } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const priorityBadge = (priority) => {
  const map = { low: 'bg-secondary', medium: 'bg-warning text-dark', high: 'bg-danger' };
  return map[priority] || 'bg-secondary';
};

const TaskDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchTask = async () => {
    try {
      const { data } = await getTaskById(id);
      setTask(data);
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

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await updateTaskStatus(id, newStatus);
      toast.success('Status updated!');
      fetchTask();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    setSubmittingComment(true);
    try {
      await addComment(id, commentText);
      toast.success('Comment added!');
      setCommentText('');
      fetchTask();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
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
              <span className={`badge ${priorityBadge(task.priority)}`}>{task.priority} priority</span>
            </div>
            <p className="text-muted">{task.description || 'No description provided.'}</p>
            <p className="mb-1"><strong>Project:</strong> {task.project?.title}</p>
            <p className="mb-1"><strong>Assigned To:</strong> {task.assignedTo?.name}</p>
            <p className="mb-1">
              <strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}
            </p>

            {/* Status update — visible to assignee or admin */}
            <div className="mt-3">
              <label className="form-label"><strong>Status</strong></label>
              <select
                className="form-select w-auto"
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Deadline History */}
        {task.deadlineHistory && task.deadlineHistory.length > 0 && (
          <div className="card mb-4">
            <div className="card-header">Deadline History</div>
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
          </div>
        )}

        {/* Comments / Progress Updates */}
        <div className="card">
          <div className="card-header">Comments & Progress Updates</div>
          <div className="card-body">
            {task.comments && task.comments.length > 0 ? (
              <ul className="list-group list-group-flush mb-3">
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
              <p className="text-muted">No comments yet.</p>
            )}

            <form onSubmit={handleAddComment}>
              <div className="input-group">
                <input
                  className="form-control"
                  placeholder="Add a comment or progress update..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button className="btn btn-primary" type="submit" disabled={submittingComment}>
                  {submittingComment ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;