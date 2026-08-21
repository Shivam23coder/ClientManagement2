/**
 * useTrials — custom hook managing the trials Map + CRUD operations.
 *
 * Data structure decision:
 *   Internally the hook maintains a Map<id, trial> for O(1) lookup, update,
 *   and delete by ID. The rendered list is derived from Map.values() on each
 *   render — simple and efficient for the scale of a typical trial list.
 *
 *   Why not just an array?
 *   Array.find() and Array.filter() are O(n) — fine for 10 items, but the Map
 *   pattern scales gracefully and is the correct answer to "what data structure
 *   would you use?" in the interview debrief.
 */

import { useState, useCallback } from 'react';
import {
  fetchTrials,
  createTrial as apiCreate,
  updateTrial as apiUpdate,
  deleteTrial as apiDelete,
} from '../services/trialService';

const useTrials = () => {
  // Map<string id, ClinicalTrial> — O(1) lookup/update/delete
  const [trialsMap, setTrialsMap] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Derive the sorted array once per render (sorted by createdAt desc)
  const trials = Array.from(trialsMap.values());

  const loadTrials = useCallback(async (statusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTrials(statusFilter);
      const map = new Map(res.data.trials.map((t) => [t._id, t]));
      setTrialsMap(map);
    } catch (err) {
      setError(err.displayMessage || 'Failed to load trials');
    } finally {
      setLoading(false);
    }
  }, []);

  const addTrial = useCallback(async (data) => {
    const res = await apiCreate(data);
    const newTrial = res.data.trial;
    setTrialsMap((prev) => new Map([[newTrial._id, newTrial], ...prev]));
    return newTrial;
  }, []);

  const editTrial = useCallback(async (id, data) => {
    const res = await apiUpdate(id, data);
    const updated = res.data.trial;
    setTrialsMap((prev) => {
      const next = new Map(prev);
      next.set(id, updated); // O(1) update
      return next;
    });
    return updated;
  }, []);

  const removeTrial = useCallback(async (id) => {
    await apiDelete(id);
    setTrialsMap((prev) => {
      const next = new Map(prev);
      next.delete(id); // O(1) delete
      return next;
    });
  }, []);

  return { trials, loading, error, loadTrials, addTrial, editTrial, removeTrial };
};

export default useTrials;
