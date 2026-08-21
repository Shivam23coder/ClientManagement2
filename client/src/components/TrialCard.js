import React from 'react';

const STATUS_LABELS = {
  Planned: 'Planned',
  Active: 'Active',
  Completed: 'Completed',
  Terminated: 'Terminated',
};

/**
 * StatusBadge — styled pill based on trial status.
 */
const StatusBadge = ({ status }) => {
  const cls = `badge badge-${status?.toLowerCase()}`;
  return <span className={cls}>{STATUS_LABELS[status] || status}</span>;
};

/**
 * TrialCard — individual card in the dashboard grid.
 * Displays trial info and Edit / Delete action buttons.
 */
const TrialCard = ({ trial, onEdit, onDelete }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <article className="trial-card">
      <div className="trial-card__header">
        <h3 className="trial-card__name">{trial.name}</h3>
        <StatusBadge status={trial.status} />
      </div>

      <p className="trial-card__description">{trial.description}</p>

      <div className="trial-card__dates">
        <div className="trial-card__date-item">
          <span className="trial-card__date-label">Start</span>
          <span className="trial-card__date-value">{formatDate(trial.startDate)}</span>
        </div>
        <div className="trial-card__date-item">
          <span className="trial-card__date-label">End</span>
          <span className="trial-card__date-value">{formatDate(trial.endDate)}</span>
        </div>
      </div>

      <div className="trial-card__actions">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onEdit(trial)}
          id={`edit-trial-${trial._id}`}
        >
          ✏️ Edit
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(trial)}
          id={`delete-trial-${trial._id}`}
        >
          🗑 Delete
        </button>
      </div>
    </article>
  );
};

export default TrialCard;
