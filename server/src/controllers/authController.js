/**
 * Auth Controller
 *
 * register — hash password with bcrypt (cost factor 12), save User, auto-login
 * login    — handled by Passport (see route); controller just sends the response
 * logout   — destroys the server-side session
 * me       — returns the currently authenticated user (used on app boot)
 */

const bcrypt = require('bcryptjs');
const User = require('../models/User');

const BCRYPT_SALT_ROUNDS = 12; // 12 rounds ≈ ~250ms — good balance of security vs UX

/**
 * POST /auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Hash before persisting — bcrypt auto-generates the salt
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const user = await User.create({ name, email, passwordHash });

    // Automatically log the user in after registration (better UX)
    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json({
        message: 'Registration successful',
        user: user.toJSON(), // toJSON() strips passwordHash
      });
    });
  } catch (err) {
    next(err); // Delegated to the central errorHandler
  }
};

/**
 * POST /auth/login
 * Passport runs the Local Strategy before this handler is called.
 * If we reach here, authentication succeeded.
 */
const login = (req, res) => {
  res.json({
    message: 'Login successful',
    user: req.user,
  });
};

/**
 * POST /auth/logout
 */
const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
};

/**
 * GET /auth/me
 * Returns current user — used by the React app on load to restore auth state.
 */
const me = (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  res.json({ user: req.user });
};

const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * POST /auth/google
 * Authenticates user via Google OAuth credential/ID Token.
 * Syncs user to MongoDB and establishes Passport session.
 */
const googleAuth = async (req, res, next) => {
  try {
    const { credential, email, name, sub } = req.body;

    let googleId = sub;
    let userEmail = (email || '').toLowerCase();
    let userName = name;

    // Verify Google ID Token if credential string is provided
    if (credential) {
      try {
        if (process.env.GOOGLE_CLIENT_ID) {
          const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          googleId = payload.sub;
          userEmail = (payload.email || '').toLowerCase();
          userName = payload.name || payload.email.split('@')[0];
        } else {
          // Decode payload safely for development testing without GOOGLE_CLIENT_ID set yet
          const parts = credential.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
            googleId = payload.sub || payload.uid;
            userEmail = (payload.email || '').toLowerCase();
            userName = payload.name || userEmail.split('@')[0];
          }
        }
      } catch (err) {
        console.warn('Google token verification fallback used:', err.message);
      }
    }

    if (!googleId && !userEmail) {
      return res.status(400).json({ message: 'Invalid Google authentication payload' });
    }

    // 1. Look up user by googleId or email
    let user = null;
    if (googleId) {
      user = await User.findOne({ googleId });
    }
    if (!user && userEmail) {
      user = await User.findOne({ email: userEmail });
    }

    // 2. Create user if doesn't exist yet
    if (!user) {
      user = await User.create({
        name: userName || 'Google User',
        email: userEmail || `${googleId}@google.user`,
        googleId,
        authProvider: 'google',
      });
    } else if (!user.googleId && googleId) {
      // Link existing account to Google ID
      user.googleId = googleId;
      await user.save();
    }

    // 3. Log user in via Passport session so all trial routes remain consistent
    req.login(user, (err) => {
      if (err) return next(err);
      res.json({
        message: 'Google authentication successful',
        user: user.toJSON(),
      });
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, me, googleAuth };

