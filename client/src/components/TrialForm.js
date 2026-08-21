import React, { useState } from 'react';

const STATUSES = ['Planned', 'Active', 'Completed', 'Terminated'];

const today = () => new Date().toISOString().split('T')[0];

const defaultForm = {
  name: '',
  description: '',
  startDate: today(),
  endDate: '',
  status: 'Planned',
};

/**
 * TrialForm — shared form for both create and edit.
 *
 * Props:
 *   initialData  — pre-filled values for edit mode
 *   onSubmit     — async (formData) => void
 *   onCancel     — () => void
 *   submitLabel  — button text
 *   loading      — external loading state
 */
const TrialForm = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save Trial',
  loading = false,
}) => {
  const data = initialData || defaultForm;
  const [form, setForm] = useState({
    ...defaultForm,
    ...data,
    // Normalise dates from ISO string to date input format
    startDate: data.startDate
      ? data.startDate.split('T')[0]
      : today(),
    endDate: data.endDate
      ? data.endDate.split('T')[0]
      : '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Trial name is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.startDate) errs.startDate = 'Start date is required';
    if (!form.endDate) errs.endDate = 'End date is required';
    else if (form.endDate <= form.startDate)
      errs.endDate = 'End date must be after start date';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setApiError('');
    try {
      await onSubmit(form);
    } catch (err) {
      setApiError(err.displayMessage || 'An error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {apiError && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }} role="alert">
          <span>⚠</span>
          <span>{apiError}</span>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="trial-name" className="form-label">
          Trial Name <span className="required">*</span>
        </label>
        <input
          id="trial-name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          className={`form-input ${errors.name ? 'error' : ''}`}
          placeholder="e.g. Phase III Cardiovascular Study"
        />
        {errors.name && <span className="form-error">⚠ {errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="trial-description" className="form-label">
          Description <span className="required">*</span>
        </label>
        <textarea
          id="trial-description"
          name="description"
          value={form.description}
          onChange={handleChange}
          className={`form-textarea ${errors.description ? 'error' : ''}`}
          placeholder="Describe the clinical trial objectives, methodology, and target population…"
          rows={4}
        />
        {errors.description && <span className="form-error">⚠ {errors.description}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="trial-start-date" className="form-label">
            Start Date <span className="required">*</span>
          </label>
          <input
            id="trial-start-date"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            className={`form-input ${errors.startDate ? 'error' : ''}`}
          />
          {errors.startDate && <span className="form-error">⚠ {errors.startDate}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="trial-end-date" className="form-label">
            End Date <span className="required">*</span>
          </label>
          <input
            id="trial-end-date"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            min={form.startDate}
            className={`form-input ${errors.endDate ? 'error' : ''}`}
          />
          {errors.endDate && <span className="form-error">⚠ {errors.endDate}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="trial-status" className="form-label">
          Status
        </label>
        <select
          id="trial-status"
          name="status"
          value={form.status}
          onChange={handleChange}
          className="form-select"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="modal-footer" style={{ padding: 0, paddingTop: '8px' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
          id="trial-form-cancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          id="trial-form-submit"
        >
          {loading ? (
            <>
              <span className="spinner spinner-sm" />
              Saving…
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
};

export default TrialForm;
