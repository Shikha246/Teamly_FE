import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
    <h2>403 — Unauthorized</h2>
    <p className="text-muted">You don't have permission to view this page.</p>
    <Link to="/login" className="btn btn-primary">Back to Login</Link>
  </div>
);

export default Unauthorized;