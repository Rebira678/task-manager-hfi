export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Done';
  due_date: string | null;
  priority: 'Low' | 'Medium' | 'High';
  created_at: string;
}

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}
