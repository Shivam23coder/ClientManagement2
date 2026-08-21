import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const RegisterPage = () => {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
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
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.displayMessage || 'Registration failed. Please try again.');
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
            <div className="auth-icon">✨</div>
            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle">Start managing your clinical trials today</p>
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
              text="signup_with"
            />
          </div>

          <div className="divider">or register with email</div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="register-name" className="form-label">
                Full name <span className="required">*</span>
              </label>
              <input
                id="register-name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Dr. Jane Smith"
              />
              {errors.name && <span className="form-error">⚠ {errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="register-email" className="form-label">
                Email address <span className="required">*</span>
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="you@institution.org"
              />
              {errors.email && <span className="form-error">⚠ {errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="register-password" className="form-label">
                Password <span className="required">*</span>
              </label>
              <input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Minimum 6 characters"
              />
              {errors.password && <span className="form-error">⚠ {errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="register-confirm" className="form-label">
                Confirm password <span className="required">*</span>
              </label>
              <input
                id="register-confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                value={form.confirm}
                onChange={handleChange}
                className={`form-input ${errors.confirm ? 'error' : ''}`}
                placeholder="••••••••"
              />
              {errors.confirm && <span className="form-error">⚠ {errors.confirm}</span>}
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading || googleLoading}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm" />
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <Link to="/login" id="register-login-link">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
