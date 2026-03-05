import { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, data: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onCreateTask: (data: {
    title: string;
    description: string;
    status: TaskStatus;
    due_date: string | null;
    priority: Task['priority'];
  }) => Promise<void>;
}

const COLUMNS: { status: TaskStatus; label: string; bgColor: string; borderColor: string; dotColor: string; headerBg: string; emptyIcon: string }[] = [
  {
    status: 'Todo',
    label: 'Todo',
    bgColor: 'bg-gray-50/50 dark:bg-gray-800/50',
    borderColor: 'border-gray-200 dark:border-gray-700',
    dotColor: 'bg-gray-400',
    headerBg: 'bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-800/50',
    emptyIcon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  {
    status: 'In Progress',
    label: 'In Progress',
    bgColor: 'bg-blue-50/30 dark:bg-blue-900/10',
    borderColor: 'border-blue-200 dark:border-blue-800',
    dotColor: 'bg-blue-500',
    headerBg: 'bg-gradient-to-r from-blue-50 to-blue-100/30 dark:from-blue-900/20 dark:to-blue-900/10',
    emptyIcon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    status: 'Done',
    label: 'Done',
    bgColor: 'bg-green-50/30 dark:bg-green-900/10',
    borderColor: 'border-green-200 dark:border-green-800',
    dotColor: 'bg-green-500',
    headerBg: 'bg-gradient-to-r from-green-50 to-green-100/30 dark:from-green-900/20 dark:to-green-900/10',
    emptyIcon: 'M5 13l4 4L19 7',
  },
];

export function KanbanBoard({ tasks, onUpdateTask, onDeleteTask, onCreateTask }: KanbanBoardProps) {
  const [addingToColumn, setAddingToColumn] = useState<TaskStatus | null>(null);

  const tasksByStatus = (status: TaskStatus) => tasks.filter(t => t.status === status);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {COLUMNS.map(col => {
        const colTasks = tasksByStatus(col.status);
        return (
          <div key={col.status} className={`rounded-2xl border ${col.borderColor} ${col.bgColor} flex flex-col min-h-[420px]`}>
            {/* Column header */}
            <div className={`flex items-center justify-between px-4 py-3.5 rounded-t-2xl ${col.headerBg}`}>
              <div className="flex items-center gap-2.5">
                <span className={`h-2.5 w-2.5 rounded-full ${col.dotColor} ring-2 ring-white dark:ring-gray-800`} />
                <h3 className="font-bold text-gray-700 text-sm dark:text-gray-200">{col.label}</h3>
                <span className="text-xs text-gray-500 bg-white border border-gray-200 rounded-full px-2.5 py-0.5 font-semibold shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400">
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={() => setAddingToColumn(col.status)}
                className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-brand-600 hover:bg-white rounded-lg transition-all duration-150 hover:shadow-sm dark:hover:bg-gray-700 dark:hover:text-brand-400"
                title={`Add task to ${col.label}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Tasks list */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              {colTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-500">
                  <div className="h-14 w-14 rounded-2xl bg-white border-2 border-dashed border-gray-200 flex items-center justify-center mb-3 dark:bg-gray-800 dark:border-gray-600">
                    <svg className="h-6 w-6 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={col.emptyIcon} />
                    </svg>
                  </div>
                  <p className="text-xs font-medium mb-1">No tasks yet</p>
                  <p className="text-[11px] text-gray-300 dark:text-gray-600">Click + to add one</p>
                </div>
              ) : (
                colTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={onUpdateTask}
                    onDelete={onDeleteTask}
                  />
                ))
              )}
            </div>

            {/* Add task footer */}
            <div className="p-3">
              <button
                onClick={() => setAddingToColumn(col.status)}
                className="w-full text-sm text-gray-500 hover:text-brand-600 hover:bg-white rounded-xl py-2.5 transition-all duration-150 flex items-center justify-center gap-1.5 border border-dashed border-gray-200 hover:border-brand-300 hover:shadow-soft dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-800 dark:hover:border-brand-500 dark:hover:text-brand-400"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add task
              </button>
            </div>
          </div>
        );
      })}

      {addingToColumn && (
        <TaskForm
          mode="create"
          initialStatus={addingToColumn}
          onSubmit={onCreateTask}
          onClose={() => setAddingToColumn(null)}
        />
      )}
    </div>
  );
}
