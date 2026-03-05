import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';
import { requireAuth } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { Task, Project } from '../types';

const router = Router({ mergeParams: true });

router.use(requireAuth);

function getProjectForUser(projectId: string, userId: string): Project | undefined {
  return db
    .prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?')
    .get(projectId, userId) as Project | undefined;
}

const VALID_STATUSES = ['Todo', 'In Progress', 'Done'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High'];

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = getProjectForUser(req.params.projectId, req.session.userId!);
    if (!project) {
      return next(createError('Project not found', 404));
    }

    const tasks = db
      .prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC')
      .all(req.params.projectId) as Task[];

    res.json({ tasks });
  } catch (err) {
    next(err);
  }
});

router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = getProjectForUser(req.params.projectId, req.session.userId!);
    if (!project) {
      return next(createError('Project not found', 404));
    }

    const { title, description, status, due_date, priority } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return next(createError('Task title is required', 400));
    }
    if (title.trim().length > 200) {
      return next(createError('Task title must be 200 characters or fewer', 400));
    }
    if (status && !VALID_STATUSES.includes(status)) {
      return next(createError(`Status must be one of: ${VALID_STATUSES.join(', ')}`, 400));
    }
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return next(createError(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`, 400));
    }
    if (due_date && isNaN(Date.parse(due_date))) {
      return next(createError('Invalid due date format', 400));
    }

    const id = uuidv4();
    db.prepare(
      'INSERT INTO tasks (id, project_id, title, description, status, due_date, priority) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      id,
      req.params.projectId,
      title.trim(),
      (description || '').trim(),
      status || 'Todo',
      due_date || null,
      priority || 'Medium'
    );

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task;
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
});

router.put('/:taskId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = getProjectForUser(req.params.projectId, req.session.userId!);
    if (!project) {
      return next(createError('Project not found', 404));
    }

    const task = db
      .prepare('SELECT * FROM tasks WHERE id = ? AND project_id = ?')
      .get(req.params.taskId, req.params.projectId) as Task | undefined;

    if (!task) {
      return next(createError('Task not found', 404));
    }

    const { title, description, status, due_date, priority } = req.body;

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return next(createError('Task title cannot be empty', 400));
      }
      if (title.trim().length > 200) {
        return next(createError('Task title must be 200 characters or fewer', 400));
      }
    }
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return next(createError(`Status must be one of: ${VALID_STATUSES.join(', ')}`, 400));
    }
    if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
      return next(createError(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`, 400));
    }
    if (due_date !== undefined && due_date !== null && due_date !== '' && isNaN(Date.parse(due_date))) {
      return next(createError('Invalid due date format', 400));
    }

    const newTitle = title !== undefined ? title.trim() : task.title;
    const newDescription = description !== undefined ? description.trim() : task.description;
    const newStatus = status !== undefined ? status : task.status;
    const newDueDate = due_date !== undefined ? (due_date || null) : task.due_date;
    const newPriority = priority !== undefined ? priority : task.priority;

    db.prepare(
      'UPDATE tasks SET title = ?, description = ?, status = ?, due_date = ?, priority = ? WHERE id = ?'
    ).run(newTitle, newDescription, newStatus, newDueDate, newPriority, req.params.taskId);

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.taskId) as Task;
    res.json({ task: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/:taskId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = getProjectForUser(req.params.projectId, req.session.userId!);
    if (!project) {
      return next(createError('Project not found', 404));
    }

    const task = db
      .prepare('SELECT * FROM tasks WHERE id = ? AND project_id = ?')
      .get(req.params.taskId, req.params.projectId) as Task | undefined;

    if (!task) {
      return next(createError('Task not found', 404));
    }

    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.taskId);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
