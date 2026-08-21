/**
 * Global error-handling middleware.
 *
 * notFound   — catches any unmatched route and forwards a 404 to errorHandler
 * errorHandler — central place to format ALL errors as JSON
 *
 * By centralising error formatting here, individual route/controller functions
 * only need to call next(err) — they don't have to know anything about HTTP
 * status codes or response shapes.
 */

const notFound = (req, res, next) => {
  const error = new Error(`Not Found — ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  // Mongoose validation errors deserve a 400, not the default 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Mongoose duplicate key (e.g., duplicate email on register)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      message: `A user with that ${field} already exists.`,
    });
  }

  // Mongoose validation errors → 400 with field-level detail
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join('. ') });
  }

  // CastError: invalid ObjectId (e.g., /api/trials/not-an-id)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format.' });
  }

  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    // Only expose stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
