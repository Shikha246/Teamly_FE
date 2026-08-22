import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
    <h2>404 — Page Not Found</h2>
    <Link to="/" className="btn btn-primary mt-3">Go Home</Link>
  </div>
);

export default NotFound;