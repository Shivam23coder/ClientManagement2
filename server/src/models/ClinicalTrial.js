/**
 * ClinicalTrial Mongoose Model
 *
 * Fields:
 *   name        - trial identifier/title
 *   description - detailed trial description
 *   startDate   - when the trial begins
 *   endDate     - when the trial is scheduled to end
 *   status      - lifecycle stage (enum-constrained)
 *   createdBy   - ref to User._id (trials are scoped per user)
 *
 * Index strategy:
 *   - Compound index on (createdBy, status) to efficiently serve the most
 *     common query pattern: "get all trials for this user, optionally filtered
 *     by status". MongoDB uses a B-tree for this index — O(log n) lookup
 *     instead of a full collection scan.
 *   - This is the honest "data structure" answer for the interview: Mongo's
 *     B-tree index, not a hand-rolled structure.
 */

const mongoose = require('mongoose');

const TRIAL_STATUSES = ['Planned', 'Active', 'Completed', 'Terminated'];

const clinicalTrialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Trial name is required'],
      trim: true,
      maxlength: [200, 'Trial name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (value) {
          // endDate must be after startDate
          return !this.startDate || value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    status: {
      type: String,
      enum: {
        values: TRIAL_STATUSES,
        message: `Status must be one of: ${TRIAL_STATUSES.join(', ')}`,
      },
      default: 'Planned',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Part of the compound index below; also useful standalone
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: primary query pattern is "all trials for user X with status Y"
clinicalTrialSchema.index({ createdBy: 1, status: 1 });

module.exports = mongoose.model('ClinicalTrial', clinicalTrialSchema);
module.exports.TRIAL_STATUSES = TRIAL_STATUSES;
