/**
 * Auth Routes
 *
 * POST /auth/register  — create account + auto login
 * POST /auth/login     — passport local strategy
 * POST /auth/logout    — destroy session
 * GET  /auth/me        — return current user (used by React on app boot)
 */

const express = require('express');
const passport = require('passport');
const { register, login, logout, me, googleAuth } = require('../controllers/authController');
const { registerRules, loginRules, validate } = require('../middleware/validate');

const router = express.Router();

router.post('/register', registerRules, validate, register);

// passport.authenticate runs the LocalStrategy synchronously before the handler
router.post(
  '/login',
  loginRules,
  validate,
  passport.authenticate('local', {
    failureMessage: true, // Stores failure message in session (used by done(null,false,{message}))
  }),
  login
);

router.post('/google', googleAuth);
router.post('/logout', logout);
router.get('/me', me);

module.exports = router;
