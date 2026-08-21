import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { GoogleLogin } from '@react-oauth/google';

/**
 * LoginPage
 *
 * Client-side validation runs before submitting so we give immediate
 * feedback without a round-trip. Server-side validation is the safety net.
 */
const LoginPage = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.displayMessage || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setApiError('');
    try {
      await loginWithGoogle({ credential: credentialResponse.credential });
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.displayMessage || err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <main className="auth-page page-enter">
      <div className="auth-card">
        <div className="card card-body">
          <div className="auth-header">
            <div className="auth-icon">🔐</div>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your CTMS account</p>
          </div>

          {apiError && (
            <div className="alert alert-error" role="alert" style={{ marginBottom: '16px' }}>
              <span>⚠</span>
              <span>{apiError}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setApiError('Google sign-in failed. Please try again.')}
              theme="filled_black"
              shape="pill"
              text="signin_with"
            />
          </div>

          <div className="divider">or sign in with password</div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">
                Email address <span className="required">*</span>
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
              />
              {errors.email && <span className="form-error">⚠ {errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">
                Password <span className="required">*</span>
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
              />
              {errors.password && <span className="form-error">⚠ {errors.password}</span>}
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading || googleLoading}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register" id="login-register-link">
              Create one free
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
