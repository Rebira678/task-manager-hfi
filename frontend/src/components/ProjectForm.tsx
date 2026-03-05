import { useState } from 'react';
import { Project } from '../types';
import { Modal } from './Modal';

interface ProjectFormProps {
  initial?: Pick<Project, 'title' | 'description'>;
  onSubmit: (title: string, description: string) => Promise<void>;
  onClose: () => void;
  mode: 'create' | 'edit';
}

export function ProjectForm({ initial, onSubmit, onClose, mode }: ProjectFormProps) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [errors, setErrors] = useState<{ title?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs: { title?: string } = {};
    if (!title.trim()) errs.title = 'Title is required';
    else if (title.trim().length > 100) errs.title = 'Title must be 100 characters or fewer';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    setApiError('');
    try {
      await onSubmit(title.trim(), description.trim());
      onClose();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={mode === 'create' ? 'New Project' : 'Edit Project'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {apiError && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 flex items-center gap-2 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            <svg className="h-4 w-4 text-red-500 shrink-0 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {apiError}
          </div>
        )}
        <div>
          <label className="label" htmlFor="project-title">Title *</label>
          <input
            id="project-title"
            className="input"
            value={title}
            onChange={e => { setTitle(e.target.value); setErrors({}); }}
            placeholder="e.g. Website Redesign"
            maxLength={100}
            autoFocus
          />
          {errors.title && <p className="error-text">{errors.title}</p>}
        </div>
        <div>
          <label className="label" htmlFor="project-desc">Description</label>
          <textarea
            id="project-desc"
            className="input resize-none"
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What is this project about?"
          />
        </div>
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {mode === 'create' ? 'Creating...' : 'Saving...'}
              </span>
            ) : (mode === 'create' ? 'Create Project' : 'Save Changes')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
