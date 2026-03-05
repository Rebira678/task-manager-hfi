import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Project, Task, TaskStatus } from '../types';
import { projectsApi } from '../api/projects';
import { tasksApi } from '../api/tasks';
import { KanbanBoard } from '../components/KanbanBoard';
import { ProjectForm } from '../components/ProjectForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Spinner } from '../components/Spinner';

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    let start = 0;
    const duration = 500;
    const step = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <>{display}</>;
}

export function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteProject, setShowDeleteProject] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      projectsApi.get(id),
      tasksApi.list(id),
    ])
      .then(([{ project }, { tasks }]) => {
        setProject(project);
        setTasks(tasks);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEditProject = async (title: string, description: string) => {
    if (!project) return;
    const { project: updated } = await projectsApi.update(project.id, { title, description });
    setProject(updated);
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    setDeletingProject(true);
    try {
      await projectsApi.delete(project.id);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      setDeletingProject(false);
      setShowDeleteProject(false);
    }
  };

  const handleCreateTask = async (data: {
    title: string;
    description: string;
    status: TaskStatus;
    due_date: string | null;
    priority: Task['priority'];
  }) => {
    if (!id) return;
    const { task } = await tasksApi.create(id, data);
    setTasks(prev => [task, ...prev]);
  };

  const handleUpdateTask = async (taskId: string, data: Partial<Task>) => {
    if (!id) return;
    const { task } = await tasksApi.update(id, taskId, data);
    setTasks(prev => prev.map(t => t.id === task.id ? task : t));
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!id) return;
    await tasksApi.delete(id, taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const taskStats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'Done').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    todo: tasks.filter(t => t.status === 'Todo').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20">
          <p className="text-red-600 mb-4 dark:text-red-400">{error || 'Project not found'}</p>
          <Link to="/" className="btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const progressPct = taskStats.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0;

  const STAT_CARDS = [
    {
      label: 'Total',
      value: taskStats.total,
      iconBg: 'bg-brand-50 dark:bg-brand-900/30',
      iconColor: 'text-brand-500',
      valueBg: 'text-gray-900 dark:text-white',
      borderColor: 'border-brand-100 dark:border-brand-800',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      label: 'Todo',
      value: taskStats.todo,
      iconBg: 'bg-gray-100 dark:bg-gray-700',
      iconColor: 'text-gray-500',
      valueBg: 'text-gray-600 dark:text-gray-300',
      borderColor: 'border-gray-100 dark:border-gray-700',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: 'In Progress',
      value: taskStats.inProgress,
      iconBg: 'bg-blue-50 dark:bg-blue-900/30',
      iconColor: 'text-blue-500',
      valueBg: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-100 dark:border-blue-800',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      label: 'Done',
      value: taskStats.done,
      iconBg: 'bg-green-50 dark:bg-green-900/30',
      iconColor: 'text-green-500',
      valueBg: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-100 dark:border-green-800',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8 dark:text-gray-500">
        <Link to="/" className="hover:text-brand-600 transition-colors font-medium flex items-center gap-1.5 dark:hover:text-brand-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Projects
        </Link>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-semibold truncate dark:text-white">{project.title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight truncate dark:text-white">{project.title}</h1>
          {project.description && (
            <p className="text-gray-500 mt-2 text-base leading-relaxed dark:text-gray-400">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setShowEdit(true)} className="btn-secondary">
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button onClick={() => setShowDeleteProject(true)} className="btn-danger">
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(stat => (
          <div key={stat.label} className={`bg-white rounded-2xl border ${stat.borderColor} shadow-card p-5 hover:shadow-card-hover transition-all duration-300 dark:bg-gray-800`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`h-8 w-8 rounded-xl ${stat.iconBg} flex items-center justify-center ${stat.iconColor}`}>
                {stat.icon}
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider dark:text-gray-500">{stat.label}</p>
            </div>
            <p className={`text-3xl font-extrabold ${stat.valueBg}`}>
              <AnimatedNumber value={stat.value} />
            </p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {taskStats.total > 0 && (
        <div className="mb-10 bg-white rounded-2xl border border-gray-100 shadow-card p-5 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-gray-600 font-semibold flex items-center gap-2 dark:text-gray-300">
              <svg className="h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Overall Progress
            </span>
            <span className={`font-bold text-base ${progressPct === 100 ? 'text-green-600 dark:text-green-400' : 'text-brand-600 dark:text-brand-400'}`}>{progressPct}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-700">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                progressPct === 100
                  ? 'bg-gradient-to-r from-green-400 to-green-500'
                  : 'bg-gradient-to-r from-brand-400 to-brand-600'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2.5 text-xs text-gray-400 dark:text-gray-500">
            <span>{taskStats.done} of {taskStats.total} tasks completed</span>
            {progressPct === 100 ? (
              <span className="text-green-600 font-semibold flex items-center gap-1 dark:text-green-400">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                All done!
              </span>
            ) : (
              <span>{taskStats.total - taskStats.done} remaining</span>
            )}
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <KanbanBoard
        tasks={tasks}
        onCreateTask={handleCreateTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
      />

      {showEdit && (
        <ProjectForm mode="edit" initial={project} onSubmit={handleEditProject} onClose={() => setShowEdit(false)} />
      )}

      {showDeleteProject && (
        <ConfirmDialog
          title="Delete Project"
          message={`Are you sure you want to delete "${project.title}"? All tasks will also be deleted.`}
          onConfirm={handleDeleteProject}
          onCancel={() => setShowDeleteProject(false)}
          loading={deletingProject}
        />
      )}
    </div>
  );
}
