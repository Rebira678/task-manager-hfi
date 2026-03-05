import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';
import { requireAuth } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { Project } from '../types';

const router = Router();

router.use(requireAuth);

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = db
      .prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC')
      .all(req.session.userId) as Project[];
    res.json({ projects });
  } catch (err) {
    next(err);
  }
});

router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return next(createError('Project title is required', 400));
    }
    if (title.trim().length > 100) {
      return next(createError('Project title must be 100 characters or fewer', 400));
    }

    const id = uuidv4();
    db.prepare('INSERT INTO projects (id, user_id, title, description) VALUES (?, ?, ?, ?)').run(
      id,
      req.session.userId,
      title.trim(),
      (description || '').trim()
    );

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project;
    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = db
      .prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.session.userId) as Project | undefined;

    if (!project) {
      return next(createError('Project not found', 404));
    }
    res.json({ project });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description } = req.body;

    const project = db
      .prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.session.userId) as Project | undefined;

    if (!project) {
      return next(createError('Project not found', 404));
    }

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return next(createError('Project title cannot be empty', 400));
      }
      if (title.trim().length > 100) {
        return next(createError('Project title must be 100 characters or fewer', 400));
      }
    }

    const newTitle = title !== undefined ? title.trim() : project.title;
    const newDescription = description !== undefined ? description.trim() : project.description;

    db.prepare('UPDATE projects SET title = ?, description = ? WHERE id = ?').run(
      newTitle,
      newDescription,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id) as Project;
    res.json({ project: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = db
      .prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.session.userId) as Project | undefined;

    if (!project) {
      return next(createError('Project not found', 404));
    }

    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
