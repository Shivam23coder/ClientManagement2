/**
 * Clinical Trial API service functions.
 */

import api from './api';

export const fetchTrials = (status) => {
  const params = status ? { status } : {};
  return api.get('/api/trials', { params });
};

export const fetchTrialById = (id) => api.get(`/api/trials/${id}`);
export const createTrial = (data) => api.post('/api/trials', data);
export const updateTrial = (id, data) => api.put(`/api/trials/${id}`, data);
export const deleteTrial = (id) => api.delete(`/api/trials/${id}`);
