// src/config/passport.test.ts

import { describe, it, expect, beforeEach, afterEach, beforeAll, vi, MockedFunction } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import app from '../app';
import knex from '../db/knex';
import { User } from '../types';

vi.mock('../db/knex');

describe('Passport JWT Strategy', () => {
    let user: User;
    const testSecret = 'test-secret-for-passport';
    const wrongSecret = 'wrong-secret';
    let originalEnv: NodeJS.ProcessEnv;

    beforeAll(async () => {
        user = {
            id: 1,
            email: 'passport@test.com',
            password: 'hashedpassword',
            created_at: new Date(),
            updated_at: new Date(),
        };
    });

    beforeEach(() => {
        originalEnv = { ...process.env };
        process.env.JWT_SECRETS = testSecret;
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.resetAllMocks();
    });

    it('should fail with 401 for a token signed with the wrong secret', async () => {
        const mockedKnex = knex as MockedFunction<typeof knex>;
        mockedKnex.mockImplementation((): any => ({
            where: vi.fn().mockReturnThis(),
            first: vi.fn().mockResolvedValue(user),
        }));
        const token = jwt.sign({ id: user.id }, wrongSecret, { expiresIn: '1h' });
        const res = await request(app)
            .get('/api/profile')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(401);
    });

    it('should fail with 401 for an expired token', async () => {
        const token = jwt.sign({ id: user.id }, testSecret, { expiresIn: '-1s' });
        const res = await request(app)
            .get('/api/profile')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(401);
    });

    it('should fail with 401 for a valid token but a non-existent user ID', async () => {
        const mockedKnex = knex as MockedFunction<typeof knex>;
        mockedKnex.mockImplementation((): any => ({
            where: vi.fn().mockReturnThis(),
            first: vi.fn().mockResolvedValue(undefined),
        }));
        const token = jwt.sign({ id: 99999 }, testSecret, { expiresIn: '1h' });
        const res = await request(app)
            .get('/api/profile')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(401);
    });

    it('should return 500 if the database lookup fails', async () => {
        const token = jwt.sign({ id: user.id }, testSecret, { expiresIn: '1h' });
        const mockedKnex = knex as MockedFunction<typeof knex>;
        mockedKnex.mockImplementation((): any => ({
            where: vi.fn().mockReturnThis(),
            first: vi.fn().mockRejectedValue(new Error('DB Lookup Failed')),
        }));
        const res = await request(app)
            .get('/api/profile')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(500);
    });

});
