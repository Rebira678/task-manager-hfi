import { useState } from 'react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { Modal } from './Modal';

interface TaskFormProps {
  initial?: Partial<Task>;
  initialStatus?: TaskStatus;
  onSubmit: (data: {
    title: string;
    description: string;
    status: TaskStatus;
    due_date: string | null;
    priority: TaskPriority;
  }) => Promise<void>;
  onClose: () => void;
  mode: 'create' | 'edit';
}

const STATUSES: TaskStatus[] = ['Todo', 'In Progress', 'Done'];
const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High'];

export function TaskForm({ initial, initialStatus, onSubmit, onClose, mode }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [status, setStatus] = useState<TaskStatus>(initial?.status || initialStatus || 'Todo');
  const [dueDate, setDueDate] = useState(initial?.due_date || '');
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority || 'Medium');
  const [errors, setErrors] = useState<{ title?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs: { title?: string } = {};
    if (!title.trim()) errs.title = 'Title is required';
    else if (title.trim().length > 200) errs.title = 'Title must be 200 characters or fewer';
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
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        status,
        due_date: dueDate || null,
        priority,
      });
      onClose();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={mode === 'create' ? 'New Task' : 'Edit Task'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {apiError && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <svg className="h-4 w-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {apiError}
          </div>
        )}
        <div>
          <label className="label" htmlFor="task-title">Title *</label>
          <input
            id="task-title"
            className="input"
            value={title}
            onChange={e => { setTitle(e.target.value); setErrors({}); }}
            placeholder="e.g. Implement login page"
            maxLength={200}
            autoFocus
          />
          {errors.title && <p className="error-text">{errors.title}</p>}
        </div>
        <div>
          <label className="label" htmlFor="task-desc">Description</label>
          <textarea
            id="task-desc"
            className="input resize-none"
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Add more details about this task..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="task-status">Status</label>
            <select
              id="task-status"
              className="input"
              value={status}
              onChange={e => setStatus(e.target.value as TaskStatus)}
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              className="input"
              value={priority}
              onChange={e => setPriority(e.target.value as TaskPriority)}
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="task-due">Due Date</label>
          <input
            id="task-due"
            type="date"
            className="input"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
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
            ) : (mode === 'create' ? 'Create Task' : 'Save Changes')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
