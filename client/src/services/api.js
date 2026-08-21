/**
 * Axios instance with session cookie support.
 *
 * withCredentials: true — required so the browser sends the session cookie
 * on every request to the Express backend (even cross-origin in dev).
 *
 * baseURL — empty string in dev so CRA's proxy handles /auth and /api prefixes.
 * In production, set REACT_APP_API_URL to the deployed API base URL.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Response Interceptor ──────────────────────────────────────────────────────
// Normalise error shape so callers always get err.message (never crash on
// network errors where err.response is undefined).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message ||
      error.message ||
      'An unexpected error occurred';

    // Preserve the original error but augment with normalised message
    error.displayMessage = message;
    return Promise.reject(error);
  }
);

export default api;
