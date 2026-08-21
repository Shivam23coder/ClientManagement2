/**
 * Clinical Trial Routes
 * All routes protected by isAuthenticated middleware.
 *
 * GET    /api/trials          — list all trials for the current user
 * GET    /api/trials/:id      — get a single trial
 * POST   /api/trials          — create a trial
 * PUT    /api/trials/:id      — update a trial
 * DELETE /api/trials/:id      — delete a trial
 */

const express = require('express');
const {
  getTrials,
  getTrialById,
  createTrial,
  updateTrial,
  deleteTrial,
} = require('../controllers/trialController');
const { isAuthenticated } = require('../middleware/auth');
const { trialRules, validate } = require('../middleware/validate');

const router = express.Router();

// Apply isAuthenticated to every trial route
router.use(isAuthenticated);

router.get('/', getTrials);
router.get('/:id', getTrialById);
router.post('/', trialRules, validate, createTrial);
router.put('/:id', trialRules, validate, updateTrial);
router.delete('/:id', deleteTrial);

module.exports = router;
