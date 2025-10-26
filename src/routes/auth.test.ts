// src/routes/auth.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import knex from '../db/knex';

describe('Auth Routes', () => {

    beforeEach(async () => {
        await knex('users').del();
    });

    describe('POST /api/register', () => {

        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });
            expect(res.statusCode).toEqual(201);
            expect(res.body.user).toHaveProperty('id');
            expect(res.body.user.email).toBe('test@example.com');
            expect(res.body.user.password).toBeUndefined();
        });

        it('should fail if email is invalid', async () => {
            const res = await request(app)
                .post('/api/register')
                .send({
                    email: 'not-an-email',
                    password: 'password123',
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toBe('An error occurred during registration.');
        });

        it('should fail if user already exists', async () => {
            await request(app)
                .post('/api/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });
            const res = await request(app)
                .post('/api/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });
            expect(res.statusCode).toEqual(400);
        });

    });

    describe('POST /api/login', () => {

        beforeEach(async () => {
            await request(app)
                .post('/api/register')
                .send({
                    email: 'login@example.com',
                    password: 'password123',
                });
        });

        it('should log in an existing user and return a JWT', async () => {
            const res = await request(app)
                .post('/api/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123',
                });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token');
            expect(typeof res.body.token).toBe('string');
        });

        it('should fail with incorrect password', async () => {
            const res = await request(app)
                .post('/api/login')
                .send({
                    email: 'login@example.com',
                    password: 'wrongpassword',
                });
            expect(res.statusCode).toEqual(401);
            expect(res.body.error).toBe('Invalid credentials.');
        });

        it('should fail with non-existent email', async () => {
            const res = await request(app)
                .post('/api/login')
                .send({
                    email: 'nosuchuser@example.com',
                    password: 'password123',
                });
            expect(res.statusCode).toEqual(401);
            expect(res.body.error).toBe('Invalid credentials.');
        });

    });

    describe('POST /api/login Environment Errors', () => {

        let originalEnv: NodeJS.ProcessEnv;

        beforeEach(async () => {
            originalEnv = { ...process.env };
            await knex('users').del();
            await request(app)
                .post('/api/register')
                .send({ email: 'env@test.com', password: 'password123' });
        });

        afterEach(() => {
            process.env = originalEnv;
        });

        it('should return 500 if JWT_SECRETS is not defined', async () => {
            delete process.env.JWT_SECRETS;
            const res = await request(app)
                .post('/api/login')
                .send({ email: 'env@test.com', password: 'password123' });
            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe('Internal server configuration error.');
        });

    });

});