/**
 * User Mongoose Model
 *
 * Fields:
 *   email        - unique identifier; stored lowercase for consistent lookups
 *   passwordHash - bcrypt hash of the raw password (never store plaintext)
 *   name         - display name shown in the UI
 *
 * Design note: password hashing is done in the auth controller (not a pre-save
 * hook) so the hashing cost is explicit and testable without Model coupling.
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true, // Normalise on write so lookups are always case-insensitive
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: false, // Optional for Google OAuth users
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
  },
  {
    timestamps: true, // Adds createdAt / updatedAt automatically
  }
);

// Prevent the hash from leaking in JSON responses (e.g., res.json(user))
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
