// src/routes/auth.ts

import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import knex from '../db/knex';
import { registerSchema, loginSchema } from '../utils/validation';
import { User } from 'src/types';

const router = express.Router();

const limiter = process.env.NODE_ENV === 'test'
  ? []
  : [
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 50,
      message: 'Too many login attempts from this IP, please try again after 15 minutes',
      standardHeaders: true,
      legacyHeaders: false,
    })
  ];

router.post(
  '/register',
  limiter,
  async (request: Request, response: Response) => {
    try {
      const { email, password } = registerSchema.parse(request.body);
      const hashedPassword = await bcrypt.hash(password, 10);
      const [user] = await knex<User>('users').insert({ email, password: hashedPassword }).returning(['id', 'email', 'created_at', 'updated_at']);
      response.status(201).json({ user });
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error(error);
      }
      response.status(400).json({ error: 'An error occurred during registration.' });
    }
  });

router.post(
  '/login',
  limiter,
  async (request: Request, response: Response) => {
    try {
      const { email, password } = loginSchema.parse(request.body);
      const user = await knex<User>('users').where({ email }).first();
      if (!user || !(await bcrypt.compare(password, user.password!))) {
        return response.status(401).json({ error: 'Invalid credentials.' });
      }
      const secrets = process.env.JWT_SECRETS;
      if (!secrets) {
        console.error('JWT_SECRETS is not defined in environment variables.');
        return response.status(500).json({ error: 'Internal server configuration error.' });
      }
      const secret = secrets.split(',')[0];
      if (!secret) {
        console.error('JWT_SECRET is not defined in environment variables.');
        return response.status(500).json({ error: 'Internal server configuration error.' });
      }
      const token = jwt.sign({ id: user.id }, secret, {
        expiresIn: '1h',
      });
      response.json({ token });
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error(error);
      }
      response.status(400).json({ error: 'An error occurred during login.' });
    }
  });

export default router;
