# CTMS — Clinical Trial Management System

A full-stack MERN application for managing clinical trials. Users authenticate via Passport.js sessions and perform full CRUD on trial records scoped to their account.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Setup & Run Instructions](#setup--run-instructions)
5. [API Reference](#api-reference)
6. [Architecture & Design Decisions](#architecture--design-decisions)
7. [Data Structure Decision](#data-structure-decision)
8. [Security Considerations](#security-considerations)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Create React App) |
| HTTP Client | Axios (with session cookie support) |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Authentication | Passport.js + Firebase Authentication (Google OAuth) |
| Session Store | MongoDB (via connect-mongo) |
| Validation | express-validator (server) + inline (client) |

---

## Project Structure

```
ProcDNA/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js          # MongoDB connection
│   │   │   └── passport.js    # Passport Local Strategy + serialize/deserialize
│   │   ├── controllers/
│   │   │   ├── authController.js    # register, login, logout, me
│   │   │   └── trialController.js   # CRUD for ClinicalTrial
│   │   ├── middleware/
│   │   │   ├── auth.js         # isAuthenticated guard
│   │   │   ├── errorHandler.js # Central error formatter
│   │   │   └── validate.js     # express-validator rule sets
│   │   ├── models/
│   │   │   ├── User.js          # { name, email, passwordHash }
│   │   │   └── ClinicalTrial.js # { name, description, startDate, endDate, status, createdBy }
│   │   ├── routes/
│   │   │   ├── auth.js     # /auth/*
│   │   │   └── trials.js   # /api/trials/*
│   │   └── index.js        # Express entry point
│   ├── .env                # Environment variables (gitignored)
│   └── package.json
│
└── client/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Modal.js      # Generic modal + TrialModal + DeleteModal
    │   │   ├── Navbar.js     # Sticky glassmorphism nav
    │   │   ├── Spinner.js    # Loading indicator
    │   │   ├── TrialCard.js  # Card with status badge + actions
    │   │   └── TrialForm.js  # Shared create/edit form
    │   ├── context/
    │   │   └── AuthContext.js  # Global auth state + session restoration
    │   ├── hooks/
    │   │   └── useTrials.js    # Map-backed CRUD state
    │   ├── pages/
    │   │   ├── DashboardPage.js
    │   │   ├── LoginPage.js
    │   │   └── RegisterPage.js
    │   ├── services/
    │   │   ├── api.js            # Axios instance (withCredentials)
    │   │   ├── authService.js    # Auth API calls
    │   │   └── trialService.js   # Trial API calls
    │   ├── App.js        # Router + route guards
    │   └── index.css     # Design system (tokens, components, animations)
    └── package.json
```

---

## Prerequisites

- **Node.js** v18+ and **npm** v9+
- **MongoDB** running locally on `mongodb://localhost:27017`
  - Install: https://www.mongodb.com/docs/manual/installation/
  - Or use **MongoDB Atlas** (free tier) — update `MONGODB_URI` in `.env`

---

## Setup & Run Instructions

### 1. Clone and navigate

```bash
git clone <repo-url>
cd ProcDNA
```

### 2. Set up the server

```bash
cd server
npm install
```

The `.env` file is included for development convenience (pre-filled with defaults). For production, copy `.env.example` and set your own values:

```bash
cp .env.example .env
# Edit .env — especially SESSION_SECRET and MONGODB_URI
```

Start the backend:

```bash
npm run dev     # Development (nodemon — auto-restart on changes)
# or
npm start       # Production
```

The API server starts at **http://localhost:5000**.

### 3. Set up the client

```bash
cd ../client
npm install
npm start
```

The React app starts at **http://localhost:3000**.  
The `"proxy": "http://localhost:5000"` field in `client/package.json` forwards all `/auth` and `/api` requests to Express automatically in development.

### 4. Open the app

Navigate to **http://localhost:3000**, register an account, and start managing trials.

---

## API Reference

All `/api/trials` routes require an active session (set `withCredentials: true` in Axios).

### Auth

| Method | Path | Description | Body |
|--------|------|-------------|------|
| POST | `/auth/register` | Create account + auto-login | `{ name, email, password }` |
| POST | `/auth/login` | Authenticate | `{ email, password }` |
| POST | `/auth/logout` | Destroy session | — |
| GET | `/auth/me` | Get current user | — |

### Trials (Protected)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/trials` | List trials (optional `?status=Active`) |
| GET | `/api/trials/:id` | Get single trial |
| POST | `/api/trials` | Create trial |
| PUT | `/api/trials/:id` | Update trial |
| DELETE | `/api/trials/:id` | Delete trial |

**Trial body schema:**
```json
{
  "name": "Phase III Cardiovascular Study",
  "description": "Double-blind RCT evaluating...",
  "startDate": "2025-01-15",
  "endDate": "2026-12-31",
  "status": "Active"
}
```

**Status enum:** `Planned | Active | Completed | Terminated`

---

## Architecture & Design Decisions

### Sessions vs JWT

I chose **Passport.js sessions backed by MongoDB** (connect-mongo) over JWTs for the following reasons:

| Concern | Sessions | JWT |
|---------|----------|-----|
| Revocation | Immediate (delete from store) | Requires token blacklist or short TTL |
| Server state | Stateful (small session record in Mongo) | Stateless |
| Complexity | Lower for a monolith | Better for microservices / mobile |
| Security | httpOnly cookie (XSS-resistant) | Usually localStorage (XSS risk) |

For a clinical trial application with a single Express server, the stateful session model is the simpler, more secure choice. If this were to scale to multiple API servers, a Redis session store (or JWT with refresh tokens) would be the natural evolution.

### IDOR Protection

Every database query that reads, updates, or deletes a trial includes `{ createdBy: req.user._id }` in the filter. This is not just application-layer scoping — it is enforced **at the query level** so a user cannot access another user's trial even if they guess the ObjectId. This pattern prevents Insecure Direct Object Reference (IDOR) vulnerabilities.

### Error Handling

A central `errorHandler` middleware maps all Express/Mongoose errors to consistent JSON:
- `11000` (duplicate key) → 409
- `ValidationError` → 400 with field messages
- `CastError` (bad ObjectId) → 400
- Everything else → 500

Controllers just call `next(err)` — no HTTP concern in business logic.

### Validation: Two Layers

- **Server**: `express-validator` rule sets in middleware — the authoritative source of truth. Malformed requests are rejected at the middleware layer before touching controllers or the DB.
- **Client**: Inline React validation provides immediate UX feedback without a round-trip. This is a UX feature, not a security feature.

### React State Management

No external state library (Redux, Zustand) is used. The app is small enough that:
- `AuthContext` handles auth state globally
- `useTrials` hook manages trial state locally in the Dashboard
- Modal state is lifted to `DashboardPage` so the parent controls all async mutations

---

## Data Structure Decision

The `useTrials` hook maintains trial state as a **`Map<id, trial>`** internally:

```js
// O(1) update
setTrialsMap(prev => {
  const next = new Map(prev);
  next.set(id, updated);
  return next;
});

// O(1) delete
next.delete(id);
```

An array would require `Array.find()` / `Array.filter()` — O(n) — on every edit or delete. The Map pattern is O(1) for all keyed operations. The displayable array is derived from `Map.values()` at render time.

On the **database** side, the real data structure story is MongoDB's **B-tree index** on `{ createdBy: 1, status: 1 }`. This compound index makes the common query pattern — "give me all trials for user X, optionally filtered by status" — an O(log n) index scan instead of a full collection scan.

---

## Security Considerations

- Passwords are hashed with **bcrypt at cost factor 12** (~250ms per hash — slow enough to resist brute-force, fast enough for UX)
- Session cookies are **httpOnly** (not accessible from JavaScript) and **secure** in production (HTTPS only)
- CORS is configured to only allow the specific client origin with credentials
- `passwordHash` is stripped from all JSON responses via Mongoose's `toJSON` override
- Input is validated and sanitised on both client and server

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Express server port |
| `MONGODB_URI` | `mongodb://localhost:27017/ctms` | MongoDB connection string |
| `SESSION_SECRET` | *(set in .env)* | Secret for signing session cookies — **change in production** |
| `NODE_ENV` | `development` | Enables stack traces in error responses |
| `CLIENT_URL` | `http://localhost:3000` | CORS allowed origin |
