import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link
        className="navbar-brand"
        to={user?.role === 'admin' ? '/admin/dashboard' : '/member/dashboard'}
      >
        Teamly
      </Link>
      <div className="ms-auto d-flex align-items-center gap-3">
        <span className="text-light small">
          {user?.name} <span className="badge bg-secondary text-uppercase">{user?.role}</span>
        </span>
        <button className="btn btn-outline-light btn-sm" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;