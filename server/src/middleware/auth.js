/**
 * Authentication middleware.
 *
 * isAuthenticated — gate any route that requires a logged-in user.
 * Passport sets req.isAuthenticated() to true when a valid session exists.
 */

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized. Please log in.' });
};

module.exports = { isAuthenticated };
