import { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import { TaskForm } from './TaskForm';

interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: string, data: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

const PRIORITY_STYLES: Record<Task['priority'], { bg: string; text: string; dot: string; border: string }> = {
  Low: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', border: 'border-l-gray-300' },
  Medium: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', border: 'border-l-amber-400' },
  High: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', border: 'border-l-red-400' },
};

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(dateStr: string | null, status: TaskStatus): boolean {
  if (!dateStr || status === 'Done') return false;
  return new Date(dateStr + 'T00:00:00') < new Date(new Date().toDateString());
}

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setUpdatingStatus(true);
    try {
      await onUpdate(task.id, { status: newStatus });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  const overdue = isOverdue(task.due_date, task.status);
  const priorityStyle = PRIORITY_STYLES[task.priority];

  return (
    <>
      <div className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-card transition-all duration-200 group border-l-[3px] ${priorityStyle.border} ${overdue ? 'ring-1 ring-red-200' : ''}`}>
        <div className="p-4">
          {/* Header: title + actions */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className={`text-sm font-semibold leading-snug flex-1 ${task.status === 'Done' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</h4>
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() => setShowEdit(true)}
                className="p-1.5 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-all duration-150"
                title="Edit task"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all duration-150"
                title="Delete task"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{task.description}</p>
          )}

          {/* Tags: priority + due date */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${priorityStyle.bg} ${priorityStyle.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${priorityStyle.dot}`} />
              {task.priority}
            </span>

            {task.due_date && (
              <span className={`inline-flex items-center gap-1 text-xs font-medium ${overdue ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded-lg' : 'text-gray-500'}`}>
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {overdue ? 'Overdue \u00b7 ' : ''}{formatDate(task.due_date)}
              </span>
            )}
          </div>

          {/* Status selector */}
          <div className="mt-3 pt-3 border-t border-gray-50">
            <select
              value={task.status}
              onChange={e => handleStatusChange(e.target.value as TaskStatus)}
              disabled={updatingStatus}
              className="w-full text-xs font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 cursor-pointer disabled:opacity-50 transition-all duration-150"
            >
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
        </div>
      </div>

      {showEdit && (
        <TaskForm
          mode="edit"
          initial={task}
          onSubmit={async (data) => { await onUpdate(task.id, data); }}
          onClose={() => setShowEdit(false)}
        />
      )}

      {showConfirm && (
        <ConfirmDialog
          title="Delete Task"
          message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
          loading={deleting}
        />
      )}
    </>
  );
}
