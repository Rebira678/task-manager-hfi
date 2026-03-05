import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Project, Task, TaskStatus } from '../types';
import { projectsApi } from '../api/projects';
import { tasksApi } from '../api/tasks';
import { KanbanBoard } from '../components/KanbanBoard';
import { ProjectForm } from '../components/ProjectForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Spinner } from '../components/Spinner';

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
          <p className="text-red-600 mb-4">{error || 'Project not found'}</p>
          <Link to="/" className="btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const progressPct = taskStats.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-brand-600 transition-colors font-medium">Projects</Link>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-semibold truncate">{project.title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight truncate">{project.title}</h1>
          {project.description && (
            <p className="text-gray-500 mt-2 text-base leading-relaxed">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowEdit(true)}
            className="btn-secondary"
          >
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => setShowDeleteProject(true)}
            className="btn-danger"
          >
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-gray-100 flex items-center justify-center">
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</p>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{taskStats.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-gray-100 flex items-center justify-center">
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Todo</p>
          </div>
          <p className="text-3xl font-extrabold text-gray-600">{taskStats.todo}</p>
        </div>
        <div className="bg-white rounded-2xl border border-blue-100 shadow-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider">In Progress</p>
          </div>
          <p className="text-3xl font-extrabold text-blue-600">{taskStats.inProgress}</p>
        </div>
        <div className="bg-white rounded-2xl border border-green-100 shadow-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-green-50 flex items-center justify-center">
              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-green-500 uppercase tracking-wider">Done</p>
          </div>
          <p className="text-3xl font-extrabold text-green-600">{taskStats.done}</p>
        </div>
      </div>

      {/* Progress bar */}
      {taskStats.total > 0 && (
        <div className="mb-10 bg-white rounded-2xl border border-gray-100 shadow-card p-5">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-gray-600 font-semibold">Overall Progress</span>
            <span className="text-brand-600 font-bold text-base">{progressPct}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2.5 text-xs text-gray-400">
            <span>{taskStats.done} of {taskStats.total} tasks completed</span>
            <span>{taskStats.total - taskStats.done} remaining</span>
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
        <ProjectForm
          mode="edit"
          initial={project}
          onSubmit={handleEditProject}
          onClose={() => setShowEdit(false)}
        />
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
