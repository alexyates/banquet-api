// src/routes/newsletter.test.ts

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import knex from '../db/knex';

describe('Newsletter Routes', () => {
  let registeredToken: string;
  let registeredUserEmail: string;

  beforeEach(async () => {
    await knex('subscribers').del();
    await knex('newsletters').del();
    await knex('users').del();
    registeredUserEmail = `test-${Date.now()}@example.com`;
    await request(app)
      .post('/api/register')
      .send({ email: registeredUserEmail, password: 'password123' });
    const loginRes = await request(app)
      .post('/api/login')
      .send({ email: registeredUserEmail, password: 'password123' });
    registeredToken = loginRes.body.token;
  });

  describe('POST /api/newsletter/subscribe', () => {
    it('should subscribe a new guest email successfully', async () => {
      const res = await request(app)
        .post('/api/newsletter/subscribe')
        .send({ email: 'guest@example.com' });
      expect(res.statusCode).toBe(201);
      expect(res.body.subscriber).toHaveProperty('email', 'guest@example.com');
      expect(res.body.subscriber.status).toBe('subscribed');
    });

    it('should subscribe an authenticated user and link their user ID', async () => {
      const res = await request(app)
        .post('/api/newsletter/subscribe')
        .set('Authorization', `Bearer ${registeredToken}`)
        .send({ email: registeredUserEmail }); // NOTE: Sending email is good practice.
      expect(res.statusCode).toBe(201);
      expect(res.body.subscriber.email).toBe(registeredUserEmail);
      expect(res.body.subscriber.user_id).toBeDefined();
    });

    it('should return 400 for an invalid email address', async () => {
      const res = await request(app)
        .post('/api/newsletter/subscribe')
        .send({ email: 'not-an-email' });
      expect(res.statusCode).toBe(400);
    });

    it('should return 409 for a duplicate, currently subscribed email', async () => {
      await request(app).post('/api/newsletter/subscribe').send({ email: 'duplicate@example.com' });
      const res = await request(app).post('/api/newsletter/subscribe').send({ email: 'duplicate@example.com' });
      expect(res.statusCode).toBe(409);
      expect(res.body.error).toBe('Email is already subscribed.');
    });

    it('should re-subscribe an unsubscribed email with a 200 OK status', async () => {
      // NOTE: Assuming an unsubscribe endpoint exists.
      const [subscriber] = await knex('subscribers').insert({ email: 'resub@example.com' }).returning('*');
      await knex('subscribers').where({ id: subscriber.id }).update({ status: 'unsubscribed' });
      const res = await request(app)
        .post('/api/newsletter/subscribe')
        .send({ email: 'resub@example.com' });

      expect(res.statusCode).toBe(200);
      expect(res.body.subscriber.status).toBe('subscribed');
    });
  });

  describe('GET /api/newsletter/archive', () => {
    beforeEach(async () => {
      await knex('newsletters').insert([
        { subject: 'Issue 1', content: 'Content 1', published_at: new Date('2025-01-01') },
        { subject: 'Issue 2', content: 'Content 2', published_at: new Date('2025-01-02') },
      ]);
    });

    it('should return 401 for unauthenticated users', async () => {
      const res = await request(app).get('/api/newsletter/archive');
      expect(res.statusCode).toBe(401);
    });

    it('should return 403 for authenticated but non-subscribed users', async () => {
      const res = await request(app)
        .get('/api/newsletter/archive')
        .set('Authorization', `Bearer ${registeredToken}`);
      expect(res.statusCode).toBe(403);
      expect(res.body.error).toBe('Access denied. You must be subscribed to the newsletter.');
    });

    it('should return the newsletter archive for an authenticated and subscribed user', async () => {
      await request(app)
        .post('/api/newsletter/subscribe')
        .set('Authorization', `Bearer ${registeredToken}`)
        .send({ email: registeredUserEmail });
      const res = await request(app)
        .get('/api/newsletter/archive')
        .set('Authorization', `Bearer ${registeredToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(2);
      expect(res.body[0].subject).toBe('Issue 2');
    });
  });
});
