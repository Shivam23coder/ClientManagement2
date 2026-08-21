/**
 * Entry point for the CTMS Express server.
 * Bootstraps middleware, routes, and starts the HTTP server.
 */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const cors = require('cors');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const configurePassport = require('./config/passport');
const authRoutes = require('./routes/auth');
const trialRoutes = require('./routes/trials');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Database ────────────────────────────────────────────────────────────────
connectDB();

// ─── Passport Strategy Config ────────────────────────────────────────────────
configurePassport(passport);

// ─── Core Middleware ─────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true, // Required for session cookies to flow cross-origin
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Session (backed by MongoDB so it survives restarts) ─────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
      ttl: 24 * 60 * 60, // 1 day in seconds
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
      maxAge: 24 * 60 * 60 * 1000, // 1 day in ms
    },
  })
);

// ─── Passport ────────────────────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/api/trials', trialRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'CTMS API Server is running',
    frontend: process.env.CLIENT_URL || 'http://localhost:3000',
    endpoints: {
      health: '/health',
      auth: '/auth/*',
      trials: '/api/trials/*',
    },
  });
});

// Health-check endpoint (useful for deploy pipelines)
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  CTMS server running on http://localhost:${PORT}`);
});
