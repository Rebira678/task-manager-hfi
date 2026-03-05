import { api } from './client';
import { Project } from '../types';

export const projectsApi = {
  list: () => api.get<{ projects: Project[] }>('/projects'),

  get: (id: string) => api.get<{ project: Project }>(`/projects/${id}`),

  create: (title: string, description: string) =>
    api.post<{ project: Project }>('/projects', { title, description }),

  update: (id: string, data: Partial<Pick<Project, 'title' | 'description'>>) =>
    api.put<{ project: Project }>(`/projects/${id}`, data),

  delete: (id: string) => api.delete<{ message: string }>(`/projects/${id}`),
};
