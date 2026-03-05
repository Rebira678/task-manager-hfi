import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../types';
import { projectsApi } from '../api/projects';
import { ProjectForm } from '../components/ProjectForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../context/AuthContext';

const PROJECT_COLORS = [
  'from-brand-400 to-brand-600',
  'from-violet-400 to-violet-600',
  'from-sky-400 to-sky-600',
  'from-emerald-400 to-emerald-600',
  'from-amber-400 to-amber-600',
  'from-rose-400 to-rose-600',
  'from-teal-400 to-teal-600',
  'from-fuchsia-400 to-fuchsia-600',
];

function getProjectColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PROJECT_COLORS[Math.abs(hash) % PROJECT_COLORS.length];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
}) {
  const colorGradient = getProjectColor(project.id);

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col animate-fade-in overflow-hidden dark:bg-gray-800 dark:border-gray-700">
      {/* Color strip at top */}
      <div className={`h-1.5 bg-gradient-to-r ${colorGradient}`} />

      <div className="p-6 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${colorGradient} flex items-center justify-center shrink-0 shadow-sm`}>
              <span className="text-white font-bold text-sm uppercase">{project.title[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <Link
                to={`/projects/${project.id}`}
                className="text-lg font-bold text-gray-900 hover:text-brand-600 transition-colors block truncate dark:text-white dark:hover:text-brand-400"
              >
                {project.title}
              </Link>
              {project.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed dark:text-gray-400">{project.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(project)}
              className="p-2 text-gray-400 hover:text-brand-600 rounded-xl hover:bg-brand-50 transition-all duration-150 dark:hover:bg-brand-900/30"
              title="Edit project"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(project)}
              className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all duration-150 dark:hover:bg-red-900/30 dark:hover:text-red-400"
              title="Delete project"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto dark:border-gray-700">
          <span className="text-xs text-gray-400 flex items-center gap-1.5 dark:text-gray-500">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <Link
            to={`/projects/${project.id}`}
            className="text-sm text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 transition-colors dark:text-brand-400 dark:hover:text-brand-300"
          >
            Open
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    projectsApi.list()
      .then(({ projects }) => setProjects(projects))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (title: string, description: string) => {
    const { project } = await projectsApi.create(title, description);
    setProjects(prev => [project, ...prev]);
  };

  const handleEdit = async (title: string, description: string) => {
    if (!editProject) return;
    const { project } = await projectsApi.update(editProject.id, { title, description });
    setProjects(prev => prev.map(p => p.id === project.id ? project : p));
  };

  const handleDelete = async () => {
    if (!deleteProject) return;
    setDeleting(true);
    try {
      await projectsApi.delete(deleteProject.id);
      setProjects(prev => prev.filter(p => p.id !== deleteProject.id));
      setDeleteProject(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = search.trim()
    ? projects.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      )
    : projects;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Greeting banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 p-6 sm:p-8 mb-10 shadow-glow">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-white/5 translate-y-1/2" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {getGreeting()}{user?.email ? `, ${user.email.split('@')[0]}` : ''}
          </h1>
          <p className="text-brand-200 mt-1.5 text-sm sm:text-base">
            You have {projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace.{' '}
            {projects.length === 0 ? 'Create one to get started.' : 'Keep up the momentum.'}
          </p>
        </div>
      </div>

      {/* Toolbar: search + create */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="relative w-full sm:w-80">
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="input !pl-10 !py-2.5"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded transition-colors dark:hover:text-gray-300"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button className="btn-primary shrink-0" onClick={() => setShowCreate(true)}>
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3.5 text-sm text-red-700 mb-8 flex items-center gap-2.5 animate-fade-in dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <svg className="h-4 w-4 text-red-500 shrink-0 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="inline-flex h-20 w-20 items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 rounded-3xl mb-6 dark:from-brand-900/30 dark:to-brand-800/30">
            <svg className="h-10 w-10 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 dark:text-white">No projects yet</h3>
          <p className="text-gray-500 mb-8 text-sm max-w-sm mx-auto dark:text-gray-400">Create your first project to start organizing tasks and tracking progress.</p>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Project
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <div className="inline-flex h-16 w-16 items-center justify-center bg-gray-100 rounded-2xl mb-5 dark:bg-gray-800">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1 dark:text-white">No matching projects</h3>
          <p className="text-gray-500 text-sm dark:text-gray-400">Try a different search term or <button onClick={() => setSearch('')} className="text-brand-600 hover:text-brand-700 font-semibold dark:text-brand-400">clear the filter</button>.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={setEditProject}
              onDelete={setDeleteProject}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <ProjectForm
          mode="create"
          onSubmit={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}

      {editProject && (
        <ProjectForm
          mode="edit"
          initial={editProject}
          onSubmit={handleEdit}
          onClose={() => setEditProject(null)}
        />
      )}

      {deleteProject && (
        <ConfirmDialog
          title="Delete Project"
          message={`Are you sure you want to delete "${deleteProject.title}"? All tasks in this project will also be deleted.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteProject(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
