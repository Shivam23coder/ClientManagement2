import React from 'react';
import TrialForm from './TrialForm';

/**
 * Modal — generic dialog wrapper.
 * Closes on overlay click (not on inner content click via stopPropagation).
 */
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close dialog"
            id="modal-close-btn"
          >
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

/**
 * TrialModal — wraps the generic Modal with TrialForm for create/edit.
 */
export const TrialModal = ({ isOpen, onClose, onSubmit, initialData, loading }) => {
  const isEdit = !!initialData?._id;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? '✏️ Edit Trial' : '➕ New Clinical Trial'}
    >
      <TrialForm
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onClose}
        submitLabel={isEdit ? 'Save Changes' : 'Create Trial'}
        loading={loading}
      />
    </Modal>
  );
};

/**
 * DeleteModal — confirmation dialog before deleting a trial.
 */
export const DeleteModal = ({ isOpen, onClose, onConfirm, trialName, loading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Delete Trial">
    <div className="delete-confirm">
      <div className="delete-confirm__icon">🗑️</div>
      <h3 className="delete-confirm__title">Are you sure?</h3>
      <p className="delete-confirm__text">
        You're about to permanently delete{' '}
        <strong style={{ color: 'var(--clr-text-100)' }}>{trialName}</strong>. This action
        cannot be undone.
      </p>
    </div>
    <div className="modal-footer">
      <button
        className="btn btn-secondary"
        onClick={onClose}
        disabled={loading}
        id="delete-cancel-btn"
      >
        Cancel
      </button>
      <button
        className="btn btn-danger"
        onClick={onConfirm}
        disabled={loading}
        id="delete-confirm-btn"
      >
        {loading ? (
          <>
            <span className="spinner spinner-sm" />
            Deleting…
          </>
        ) : (
          '🗑 Delete Trial'
        )}
      </button>
    </div>
  </Modal>
);

export default Modal;
