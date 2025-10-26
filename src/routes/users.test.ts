// src/routes/users.test.ts

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import knex from '../db/knex';

describe('User Management Routes', () => {

    let token: string;
    let userId: number;

    beforeEach(async () => {
        await knex('addresses').del();
        await knex('user_profiles').del();
        await knex('users').del();
        const registerRes = await request(app)
            .post('/api/register')
            .send({ email: `user-${Date.now()}@test.com`, password: 'password123' });
        userId = registerRes.body.user.id;

        const loginRes = await request(app)
            .post('/api/login')
            .send({ email: registerRes.body.user.email, password: 'password123' });
        token = loginRes.body.token;
    });

    describe('Profile Management (/api/profile)', () => {

        it('should require authentication', async () => {
            const res = await request(app).get('/api/profile');
            expect(res.statusCode).toBe(401);
        });

        it('should initially return a 404 for a user with no profile', async () => {
            const res = await request(app)
                .get('/api/profile')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(404);
        });

        it('should create a new profile for a user', async () => {
            const profileData = { first_name: 'John', last_name: 'Doe' };
            const res = await request(app)
                .post('/api/profile')
                .set('Authorization', `Bearer ${token}`)
                .send(profileData);
            expect(res.statusCode).toBe(201);
            expect(res.body.first_name).toBe('John');
        });

        it('should update an existing profile', async () => {
            await request(app).post('/api/profile').set('Authorization', `Bearer ${token}`).send({ first_name: 'John' });
            const res = await request(app)
                .put('/api/profile')
                .set('Authorization', `Bearer ${token}`)
                .send({ first_name: 'Jane' });
            expect(res.statusCode).toBe(200);
            expect(res.body.first_name).toBe('Jane');
        });

        it('should return 400 when creating a profile with invalid data', async () => {
            const invalidProfileData = { first_name: '' };
            const res = await request(app)
                .post('/api/profile')
                .set('Authorization', `Bearer ${token}`)
                .send(invalidProfileData);
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBeDefined();
        });

    });

    describe('Address Management (/api/addresses)', () => {

        it('should require authentication', async () => {
            const res = await request(app).get('/api/addresses');
            expect(res.statusCode).toBe(401);
        });

        it('should fetch an empty array for a user with no addresses', async () => {
            const res = await request(app)
                .get('/api/addresses')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([]);
        });

        it('should add a new address for a user', async () => {
            const addressData = { address_type: 'shipping', street_address: '123 Surf Rd', city: 'Pipeline', post_code: '96712', country: 'USA' };
            const res = await request(app)
                .post('/api/addresses')
                .set('Authorization', `Bearer ${token}`)
                .send(addressData);
            expect(res.statusCode).toBe(201);
            expect(res.body.street_address).toBe('123 Surf Rd');
        });

        it('should update an existing address', async () => {
            const addressData = { address_type: 'shipping', street_address: '123 Surf Rd', city: 'Pipeline', post_code: '96712', country: 'USA' };
            const addRes = await request(app).post('/api/addresses').set('Authorization', `Bearer ${token}`).send(addressData);
            const addressId = addRes.body.id;
            const res = await request(app)
                .put(`/api/addresses/${addressId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ ...addressData, city: 'Waimea' });
            expect(res.statusCode).toBe(200);
            expect(res.body.city).toBe('Waimea');
        });

        it('should delete an address', async () => {
            const addressData = { address_type: 'shipping', street_address: '123 Surf Rd', city: 'Pipeline', post_code: '96712', country: 'USA' };
            const addRes = await request(app).post('/api/addresses').set('Authorization', `Bearer ${token}`).send(addressData);
            const addressId = addRes.body.id;
            const res = await request(app)
                .delete(`/api/addresses/${addressId}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(204);
        });

        it('should prevent a user from accessing another user\'s address', async () => {
            const addressData = { address_type: 'shipping', street_address: '123 Surf Rd', city: 'Pipeline', post_code: '96712', country: 'USA' };
            const addRes = await request(app).post('/api/addresses').set('Authorization', `Bearer ${token}`).send(addressData);
            const addressId = addRes.body.id;
            let secondToken;
            await request(app).post('/api/register').send({ email: 'hacker@test.com', password: 'password123' });
            const loginRes = await request(app).post('/api/login').send({ email: 'hacker@test.com', password: 'password123' });
            secondToken = loginRes.body.token;
            const res = await request(app).delete(`/api/addresses/${addressId}`).set('Authorization', `Bearer ${secondToken}`);
            expect(res.statusCode).toBe(404);
        });

    });

    describe('Payment Method Management (/api/payment-methods)', () => {

        it('should add a new payment method using a mock token', async () => {
            const res = await request(app)
                .post('/api/payment-methods')
                .set('Authorization', `Bearer ${token}`)
                .send({ provider_token: 'tok_visa' }); // NOTE: Simulate a token from Stripe.js/etc.
            expect(res.statusCode).toBe(201);
            expect(res.body.card_brand).toBe('Visa');
            expect(res.body.last_four_digits).toBe('4242');
        });

        it('should return 400 for an invalid provider token', async () => {
            const res = await request(app)
                .post('/api/payment-methods')
                .set('Authorization', `Bearer ${token}`)
                .send({ provider_token: 'tok_invalid' });
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Invalid provider token.');
        });

    });

});
