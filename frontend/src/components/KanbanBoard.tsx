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

const COLUMNS: { status: TaskStatus; label: string; bgColor: string; borderColor: string; dotColor: string; headerBg: string }[] = [
  {
    status: 'Todo',
    label: 'Todo',
    bgColor: 'bg-gray-50/50',
    borderColor: 'border-gray-200',
    dotColor: 'bg-gray-400',
    headerBg: 'bg-gray-50',
  },
  {
    status: 'In Progress',
    label: 'In Progress',
    bgColor: 'bg-blue-50/30',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500',
    headerBg: 'bg-blue-50',
  },
  {
    status: 'Done',
    label: 'Done',
    bgColor: 'bg-green-50/30',
    borderColor: 'border-green-200',
    dotColor: 'bg-green-500',
    headerBg: 'bg-green-50',
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
                <span className={`h-2.5 w-2.5 rounded-full ${col.dotColor} ring-2 ring-white`} />
                <h3 className="font-bold text-gray-700 text-sm">{col.label}</h3>
                <span className="text-xs text-gray-500 bg-white border border-gray-200 rounded-full px-2.5 py-0.5 font-semibold shadow-sm">
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={() => setAddingToColumn(col.status)}
                className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-brand-600 hover:bg-white rounded-lg transition-all duration-150"
                title={`Add task to ${col.label}`}
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Tasks list */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              {colTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <div className="h-12 w-12 rounded-2xl bg-white border border-dashed border-gray-200 flex items-center justify-center mb-3">
                    <svg className="h-5 w-5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium">No tasks yet</p>
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
                className="w-full text-sm text-gray-500 hover:text-brand-600 hover:bg-white rounded-xl py-2.5 transition-all duration-150 flex items-center justify-center gap-1.5 border border-dashed border-gray-200 hover:border-brand-300 hover:shadow-soft"
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
