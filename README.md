# TaskFlow — Project Task Manager

A full-stack project and task management application with a Kanban-style board.

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, TailwindCSS, React Router
**Backend:** Node.js, TypeScript, Express, SQLite (better-sqlite3), express-session

## Project Structure

```
task-manager/
├── backend/
│   ├── src/
│   │   ├── db/          # Database setup, migrations, seed data
│   │   ├── middleware/  # Auth guard, error handler
│   │   ├── routes/      # auth, projects, tasks
│   │   ├── types/       # Shared TypeScript types
│   │   └── index.ts     # Express app entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/         # API client and resource modules
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # AuthContext (session state)
│   │   ├── pages/       # Login, Register, Dashboard, Project
│   │   ├── types/       # Shared TypeScript types
│   │   └── App.tsx      # Router and layout
│   └── package.json
├── package.json         # Root scripts (installs + runs both)
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 8 or higher

### 1. Install dependencies

From the project root:

```bash
npm install
```

This installs dependencies for both frontend and backend.

### 2. Configure environment variables

The backend ships with a ready-to-use `.env` file for local development. If you want to customize it:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```
PORT=3001
SESSION_SECRET=your-very-secret-session-key-change-in-production
NODE_ENV=development
DB_PATH=./data/taskmanager.db
```

### 3. Start the application

```bash
npm run dev
```

This starts both servers concurrently:
- **Backend** at `http://localhost:3001`
- **Frontend** at `http://localhost:5173`

Open your browser at **http://localhost:5173**.

### Demo account

A demo account and seed data are created automatically on first run:

| Email | Password |
|---|---|
| demo@example.com | password123 |

## API Reference

### Authentication

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Get current user |

### Projects

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

### Tasks

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects/:pid/tasks` | List tasks |
| POST | `/api/projects/:pid/tasks` | Create task |
| PUT | `/api/projects/:pid/tasks/:id` | Update task |
| DELETE | `/api/projects/:pid/tasks/:id` | Delete task |

## Features

- **Authentication** — Register/login with email and password (bcrypt-hashed), cookie-based sessions
- **Projects** — Create, edit, delete projects with title and description
- **Tasks** — Create, edit, delete tasks with title, description, status, priority, and due date
- **Kanban Board** — Tasks displayed in Todo / In Progress / Done columns
- **Progress tracking** — Completion percentage and stats per project
- **Overdue indicators** — Tasks with past due dates are highlighted in red
- **Form validation** — Client-side and server-side validation with error messages
- **Loading states** — Spinners and disabled states during async operations
