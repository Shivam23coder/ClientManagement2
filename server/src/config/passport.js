/**
 * Passport.js configuration — Local Strategy.
 *
 * Strategy: email + password (bcrypt comparison).
 * serializeUser / deserializeUser handle session persistence:
 *   - serialize: store only the user's _id in the session (minimal footprint)
 *   - deserialize: re-fetch the full user document per request using that id
 */

const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const configurePassport = (passport) => {
  // ── Local Strategy ────────────────────────────────────────────────────────
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' }, // Override default 'username' field
      async (email, password, done) => {
        try {
          // 1. Look up user by email (case-insensitive via the model transform)
          const user = await User.findOne({ email: email.toLowerCase() });
          if (!user) {
            return done(null, false, { message: 'Invalid email or password.' });
          }

          // 2. Compare submitted password against stored bcrypt hash
          const isMatch = await bcrypt.compare(password, user.passwordHash);
          if (!isMatch) {
            return done(null, false, { message: 'Invalid email or password.' });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // ── Session Serialization ─────────────────────────────────────────────────
  // Only the user ID is stored in the session cookie (reduces session size)
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Re-hydrate the full user object from the DB on each authenticated request
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-passwordHash');
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

module.exports = configurePassport;
