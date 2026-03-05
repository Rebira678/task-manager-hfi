import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DB_PATH || './data/taskmanager.db';
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initializeDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Todo' CHECK(status IN ('Todo', 'In Progress', 'Done')),
      due_date TEXT,
      priority TEXT NOT NULL DEFAULT 'Medium' CHECK(priority IN ('Low', 'Medium', 'High')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  seedDatabase();
}

function seedDatabase(): void {
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
  if (userCount > 0) return;

  const bcrypt = require('bcryptjs');
  const { v4: uuidv4 } = require('uuid');

  const passwordHash = bcrypt.hashSync('password123', 10);
  const userId = uuidv4();
  const project1Id = uuidv4();
  const project2Id = uuidv4();

  db.prepare(`
    INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)
  `).run(userId, 'demo@example.com', passwordHash);

  db.prepare(`
    INSERT INTO projects (id, user_id, title, description) VALUES (?, ?, ?, ?)
  `).run(project1Id, userId, 'Website Redesign', 'Redesign the company website with modern UI/UX principles.');

  db.prepare(`
    INSERT INTO projects (id, user_id, title, description) VALUES (?, ?, ?, ?)
  `).run(project2Id, userId, 'Mobile App Development', 'Build a cross-platform mobile application for iOS and Android.');

  const tasks = [
    { id: uuidv4(), project_id: project1Id, title: 'Design wireframes', description: 'Create wireframes for all main pages', status: 'Done', due_date: '2026-02-15', priority: 'High' },
    { id: uuidv4(), project_id: project1Id, title: 'Set up design system', description: 'Define colors, typography, and components', status: 'In Progress', due_date: '2026-03-10', priority: 'High' },
    { id: uuidv4(), project_id: project1Id, title: 'Implement homepage', description: 'Build the new homepage based on approved designs', status: 'In Progress', due_date: '2026-03-20', priority: 'Medium' },
    { id: uuidv4(), project_id: project1Id, title: 'SEO optimization', description: 'Optimize all pages for search engines', status: 'Todo', due_date: '2026-04-01', priority: 'Medium' },
    { id: uuidv4(), project_id: project1Id, title: 'Performance testing', description: 'Run Lighthouse audits and fix issues', status: 'Todo', due_date: '2026-04-10', priority: 'Low' },
    { id: uuidv4(), project_id: project2Id, title: 'Project setup', description: 'Initialize React Native project and configure CI/CD', status: 'Done', due_date: '2026-02-01', priority: 'High' },
    { id: uuidv4(), project_id: project2Id, title: 'Authentication flow', description: 'Implement login and signup screens', status: 'In Progress', due_date: '2026-03-15', priority: 'High' },
    { id: uuidv4(), project_id: project2Id, title: 'Push notifications', description: 'Integrate push notification service', status: 'Todo', due_date: '2026-04-05', priority: 'Medium' },
  ];

  const insertTask = db.prepare(`
    INSERT INTO tasks (id, project_id, title, description, status, due_date, priority) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const task of tasks) {
    insertTask.run(task.id, task.project_id, task.title, task.description, task.status, task.due_date, task.priority);
  }
}

export default db;
