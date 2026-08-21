/**
 * Auth API service functions.
 * Thin wrappers around the Axios instance — controllers for the auth domain.
 */

import api from './api';

export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const loginWithGoogleApi = (data) => api.post('/auth/google', data);
export const logoutUser = () => api.post('/auth/logout');
export const getCurrentUser = () => api.get('/auth/me');
