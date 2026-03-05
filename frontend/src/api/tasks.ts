import { api } from './client';
import { Task, TaskPriority, TaskStatus } from '../types';

export const tasksApi = {
  list: (projectId: string) =>
    api.get<{ tasks: Task[] }>(`/projects/${projectId}/tasks`),

  create: (
    projectId: string,
    data: { title: string; description: string; status: TaskStatus; due_date: string | null; priority: TaskPriority }
  ) => api.post<{ task: Task }>(`/projects/${projectId}/tasks`, data),

  update: (
    projectId: string,
    taskId: string,
    data: Partial<{ title: string; description: string; status: TaskStatus; due_date: string | null; priority: TaskPriority }>
  ) => api.put<{ task: Task }>(`/projects/${projectId}/tasks/${taskId}`, data),

  delete: (projectId: string, taskId: string) =>
    api.delete<{ message: string }>(`/projects/${projectId}/tasks/${taskId}`),
};
