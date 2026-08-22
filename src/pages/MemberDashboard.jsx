import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getTasks } from '../api/services';
import { toast } from 'react-toastify';

const priorityBadge = (priority) => {
  const map = { low: 'bg-secondary', medium: 'bg-warning text-dark', high: 'bg-danger' };
  return map[priority] || 'bg-secondary';
};

const statusBadge = (status) => {
  const map = { todo: 'bg-secondary', 'in-progress': 'bg-primary', completed: 'bg-success' };
  return map[status] || 'bg-secondary';
};

const isOverdue = (task) =>
  task.status !== 'completed' && new Date(task.deadline) < new Date();

const MemberDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchTasks = async () => {
    try {
      const { data } = await getTasks();
      setTasks(data);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks =
    statusFilter === 'all' ? tasks : tasks.filter((t) => t.status === statusFilter);

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>My Tasks</h3>
          <select
            className="form-select w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="alert alert-info">No tasks found.</div>
        ) : (
          <div className="row g-3">
            {filteredTasks.map((task) => (
              <div className="col-md-6 col-lg-4" key={task._id}>
                <div className={`card h-100 shadow-sm ${isOverdue(task) ? 'border-danger' : ''}`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-2">
                      <span className={`badge ${priorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`badge ${statusBadge(task.status)}`}>{task.status}</span>
                    </div>
                    <h5 className="card-title">{task.title}</h5>
                    <p className="card-text text-muted small">{task.project?.title}</p>
                    <p className="mb-2 small">
                      Deadline: {new Date(task.deadline).toLocaleDateString()}
                      {isOverdue(task) && (
                        <span className="text-danger fw-bold ms-2">Overdue!</span>
                      )}
                    </p>
                    <Link to={`/member/tasks/${task._id}`} className="btn btn-sm btn-outline-primary">
                      View Task
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDashboard;