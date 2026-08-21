/**
 * Validation middleware using express-validator.
 *
 * Reusable rule sets for auth and trial endpoints.
 * The `validate` function runs after the rules and short-circuits with a 422
 * if any rule fails — keeping controller logic free of validation boilerplate.
 */

const { body, validationResult } = require('express-validator');

/**
 * Reads express-validator results and returns a 422 with all errors if any failed.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Auth Validation Rules ─────────────────────────────────────────────────────

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name is too long'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ── Trial Validation Rules ────────────────────────────────────────────────────

const trialRules = [
  body('name').trim().notEmpty().withMessage('Trial name is required').isLength({ max: 200 }).withMessage('Name too long'),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 2000 }).withMessage('Description too long'),
  body('startDate').isISO8601().withMessage('Start date must be a valid date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(['Planned', 'Active', 'Completed', 'Terminated'])
    .withMessage('Invalid status value'),
];

module.exports = { validate, registerRules, loginRules, trialRules };
