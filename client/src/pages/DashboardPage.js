import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import useTrials from '../hooks/useTrials';
import TrialCard from '../components/TrialCard';
import { TrialModal, DeleteModal } from '../components/Modal';
import Spinner from '../components/Spinner';

const FILTERS = ['All', 'Planned', 'Active', 'Completed', 'Terminated'];

/**
 * DashboardPage — main authenticated view.
 *
 * Orchestrates:
 *  - Loading trials (with optional status filter)
 *  - Stats derived from the full trial list
 *  - Create / Edit modal
 *  - Delete confirmation modal
 *
 * State lifting: modal state lives here (not inside child components)
 * so the parent owns all async operations and can update the Map cleanly.
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const { trials, loading, error, loadTrials, addTrial, editTrial, removeTrial } = useTrials();

  const [activeFilter, setActiveFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState(null); // null = create mode
  const [actionLoading, setActionLoading] = useState(false);

  // Load trials whenever filter changes
  useEffect(() => {
    loadTrials(activeFilter === 'All' ? undefined : activeFilter);
  }, [activeFilter, loadTrials]);

  // ── Stats (derived from current trial list) ─────────────────────────────
  const stats = {
    total: trials.length,
    active: trials.filter((t) => t.status === 'Active').length,
    completed: trials.filter((t) => t.status === 'Completed').length,
    terminated: trials.filter((t) => t.status === 'Terminated').length,
  };

  // ── Handlers ─────────────────────────────────────────────────────────────

  const openCreateModal = () => {
    setSelectedTrial(null);
    setModalOpen(true);
  };

  const openEditModal = (trial) => {
    setSelectedTrial(trial);
    setModalOpen(true);
  };

  const openDeleteModal = (trial) => {
    setSelectedTrial(trial);
    setDeleteModalOpen(true);
  };

  const handleTrialSubmit = useCallback(
    async (formData) => {
      setActionLoading(true);
      try {
        if (selectedTrial?._id) {
          await editTrial(selectedTrial._id, formData);
        } else {
          await addTrial(formData);
        }
        setModalOpen(false);
        setSelectedTrial(null);
      } finally {
        setActionLoading(false);
      }
    },
    [selectedTrial, addTrial, editTrial]
  );

  const handleDelete = useCallback(async () => {
    if (!selectedTrial) return;
    setActionLoading(true);
    try {
      await removeTrial(selectedTrial._id);
      setDeleteModalOpen(false);
      setSelectedTrial(null);
    } finally {
      setActionLoading(false);
    }
  }, [selectedTrial, removeTrial]);

  return (
    <main className="dashboard page-enter">
      <div className="container">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="dashboard-header">
          <div className="dashboard-title-block">
            <p className="dashboard-greeting">Clinical Trial Management</p>
            <h1 className="dashboard-title">
              Welcome, {user?.name?.split(' ')[0]} 👋
            </h1>
          </div>
          <button
            id="create-trial-btn"
            className="btn btn-primary"
            onClick={openCreateModal}
          >
            ＋ New Trial
          </button>
        </div>

        {/* ── Stats Row ─────────────────────────────────────────────────── */}
        <div className="stats-row">
          <div className="stat-card" onClick={() => setActiveFilter('All')} style={{ cursor: 'pointer' }}>
            <span className="stat-label">Total Trials</span>
            <span className="stat-value teal">{stats.total}</span>
          </div>
          <div className="stat-card" onClick={() => setActiveFilter('Active')} style={{ cursor: 'pointer' }}>
            <span className="stat-label">Active</span>
            <span className="stat-value indigo">{stats.active}</span>
          </div>
          <div className="stat-card" onClick={() => setActiveFilter('Completed')} style={{ cursor: 'pointer' }}>
            <span className="stat-label">Completed</span>
            <span className="stat-value green">{stats.completed}</span>
          </div>
          <div className="stat-card" onClick={() => setActiveFilter('Terminated')} style={{ cursor: 'pointer' }}>
            <span className="stat-label">Terminated</span>
            <span className="stat-value red">{stats.terminated}</span>
          </div>
        </div>

        {/* ── Filter Bar ────────────────────────────────────────────────── */}
        <div className="filter-bar">
          <span className="filter-label">Filter:</span>
          {FILTERS.map((f) => (
            <button
              key={f}
              id={`filter-${f.toLowerCase()}`}
              className={`filter-btn ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ── Content ───────────────────────────────────────────────────── */}
        {loading && <Spinner text="Loading trials…" />}

        {error && (
          <div className="alert alert-error" role="alert">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && trials.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">🧪</div>
            <h2 className="empty-state__title">No trials found</h2>
            <p className="empty-state__text">
              {activeFilter === 'All'
                ? "You haven't created any clinical trials yet. Click \"+ New Trial\" to get started."
                : `No trials with status "${activeFilter}". Try a different filter or create a new trial.`}
            </p>
            <button className="btn btn-primary" onClick={openCreateModal} id="empty-create-btn">
              ＋ Create First Trial
            </button>
          </div>
        )}

        {!loading && trials.length > 0 && (
          <div className="trials-grid">
            {trials.map((trial) => (
              <TrialCard
                key={trial._id}
                trial={trial}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <TrialModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedTrial(null); }}
        onSubmit={handleTrialSubmit}
        initialData={selectedTrial}
        loading={actionLoading}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setSelectedTrial(null); }}
        onConfirm={handleDelete}
        trialName={selectedTrial?.name}
        loading={actionLoading}
      />
    </main>
  );
};

export default DashboardPage;
