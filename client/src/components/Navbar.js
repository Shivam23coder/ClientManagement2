import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      // logout errors are non-critical — navigate anyway
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar__inner">
          <Link to="/" className="navbar__brand">
            <div className="navbar__logo">⚕</div>
            <span className="navbar__title">
              CT<span>MS</span>
            </span>
          </Link>

          <div className="navbar__actions">
            {user ? (
              <>
                <span className="navbar__user">
                  Welcome, <strong>{user.name}</strong>
                </span>
                <button
                  id="navbar-logout-btn"
                  className="btn btn-secondary btn-sm"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm" id="navbar-login-link">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" id="navbar-register-link">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
