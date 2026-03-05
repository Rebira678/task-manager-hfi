import { api } from './client';
import { User } from '../types';

export const authApi = {
  register: (email: string, password: string) =>
    api.post<{ user: User }>('/auth/register', { email, password }),

  login: (email: string, password: string) =>
    api.post<{ user: User }>('/auth/login', { email, password }),

  logout: () => api.post<{ message: string }>('/auth/logout', {}),

  me: () => api.get<{ user: User }>('/auth/me'),
};
