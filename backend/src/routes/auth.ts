import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';
import { User } from '../types';
import { createError } from '../middleware/errorHandler';

const router = Router();

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string') {
      return next(createError('Email is required', 400));
    }
    if (!password || typeof password !== 'string') {
      return next(createError('Password is required', 400));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(createError('Invalid email format', 400));
    }
    if (password.length < 6) {
      return next(createError('Password must be at least 6 characters', 400));
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return next(createError('Email already in use', 409));
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    db.prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)').run(
      id,
      email.toLowerCase(),
      passwordHash
    );

    req.session.userId = id;
    res.status(201).json({ message: 'Account created successfully', user: { id, email: email.toLowerCase() } });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError('Email and password are required', 400));
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as User | undefined;
    if (!user) {
      return next(createError('Invalid email or password', 401));
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return next(createError('Invalid email or password', 401));
    }

    req.session.userId = user.id;
    res.json({ message: 'Logged in successfully', user: { id: user.id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

router.get('/me', (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const user = db.prepare('SELECT id, email, created_at FROM users WHERE id = ?').get(req.session.userId) as Omit<User, 'password_hash'> | undefined;
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
