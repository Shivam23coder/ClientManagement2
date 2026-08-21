/**
 * Clinical Trial Controller — full CRUD
 *
 * All operations are scoped to req.user._id so users can only see/modify
 * their own trials. This is enforced at the DB query level, not just the
 * application layer, which prevents insecure direct object reference (IDOR).
 */

const ClinicalTrial = require('../models/ClinicalTrial');

/**
 * GET /api/trials
 * Returns all trials belonging to the authenticated user.
 * Supports optional ?status= query param for filtering.
 */
const getTrials = async (req, res, next) => {
  try {
    const filter = { createdBy: req.user._id };

    // Optional status filter — hits the compound (createdBy, status) index
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const trials = await ClinicalTrial.find(filter).sort({ createdAt: -1 });
    res.json({ trials });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/trials/:id
 * Returns a single trial, scoped to the current user.
 */
const getTrialById = async (req, res, next) => {
  try {
    const trial = await ClinicalTrial.findOne({
      _id: req.params.id,
      createdBy: req.user._id, // Scope check — prevents IDOR
    });

    if (!trial) {
      return res.status(404).json({ message: 'Trial not found.' });
    }

    res.json({ trial });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/trials
 * Creates a new trial linked to the current user.
 */
const createTrial = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate, status } = req.body;

    const trial = await ClinicalTrial.create({
      name,
      description,
      startDate,
      endDate,
      status,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: 'Trial created', trial });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/trials/:id
 * Updates a trial. Only fields sent in the body are updated (partial update).
 * { new: true } returns the modified document rather than the original.
 */
const updateTrial = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate, status } = req.body;

    const trial = await ClinicalTrial.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id }, // Scope check
      { name, description, startDate, endDate, status },
      { new: true, runValidators: true } // runValidators ensures schema rules apply on update too
    );

    if (!trial) {
      return res.status(404).json({ message: 'Trial not found.' });
    }

    res.json({ message: 'Trial updated', trial });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/trials/:id
 */
const deleteTrial = async (req, res, next) => {
  try {
    const trial = await ClinicalTrial.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id, // Scope check
    });

    if (!trial) {
      return res.status(404).json({ message: 'Trial not found.' });
    }

    res.json({ message: 'Trial deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTrials, getTrialById, createTrial, updateTrial, deleteTrial };
