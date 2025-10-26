// src/routes/cart.test.ts

import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import knex from '../db/knex';

describe('Cart Routes', () => {
    let token: string;
    let userId: number;

    beforeAll(async () => {
        await knex.seed.run();
    });

    beforeEach(async () => {
        await knex('cart_items').del();
        await knex('carts').del();
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

    it('should require authentication for all cart routes', async () => {
        const resGet = await request(app).get('/api/cart');
        expect(resGet.statusCode).toBe(401);
        const resPost = await request(app).post('/api/cart/items').send({ productId: 1, quantity: 1 });
        expect(resPost.statusCode).toBe(401);
    });

    describe('GET /api/cart', () => {
        it("should fetch the user's cart, which is initially empty", async () => {
            const res = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.items).toEqual([]);
        });
    });

    describe('POST /api/cart/items', () => {
        it('should add a new item to the cart', async () => {
            const res = await request(app)
                .post('/api/cart/items')
                .set('Authorization', `Bearer ${token}`)
                .send({ productId: 1, quantity: 1 });
            expect(res.statusCode).toBe(201);
            expect(res.body.item.product_id).toBe(1);
            expect(res.body.item.quantity).toBe(1);
            const cartRes = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${token}`);
            expect(cartRes.body.items.length).toBe(1);
            expect(cartRes.body.items[0].name).toBe('The Classic Longboard');
        });

        it('should increment the quantity if the same item is added again', async () => {
            await request(app)
                .post('/api/cart/items')
                .set('Authorization', `Bearer ${token}`)
                .send({ productId: 2, quantity: 1 });
            const res = await request(app)
                .post('/api/cart/items')
                .set('Authorization', `Bearer ${token}`)
                .send({ productId: 2, quantity: 1 });
            expect(res.statusCode).toBe(200);
            expect(res.body.item.quantity).toBe(2);
        });

        it('should return 404 if the product does not exist', async () => {
            const res = await request(app)
                .post('/api/cart/items')
                .set('Authorization', `Bearer ${token}`)
                .send({ productId: 9999, quantity: 1 });
            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('Product not found.');
        });
    });

    describe('PUT /api/cart/items/:productId', () => {
        beforeEach(async () => {
            await request(app)
                .post('/api/cart/items')
                .set('Authorization', `Bearer ${token}`)
                .send({ productId: 3, quantity: 1 });
        });

        it('should update the quantity of an item in the cart', async () => {
            const res = await request(app)
                .put('/api/cart/items/3')
                .set('Authorization', `Bearer ${token}`)
                .send({ quantity: 5 });
            expect(res.statusCode).toBe(200);
            expect(res.body.item.quantity).toBe(5);
        });

        it('should return 404 if the item to update is not in the cart', async () => {
            const res = await request(app)
                .put('/api/cart/items/999')
                .set('Authorization', `Bearer ${token}`)
                .send({ quantity: 5 });
            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('Item not found in cart.');
        });
    });

    describe('DELETE /api/cart/items/:productId', () => {
        beforeEach(async () => {
            await request(app)
                .post('/api/cart/items')
                .set('Authorization', `Bearer ${token}`)
                .send({ productId: 4, quantity: 1 });
        });

        it('should remove an item from the cart', async () => {
            const res = await request(app)
                .delete('/api/cart/items/4')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(204);
            const cartRes = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${token}`);

            expect(cartRes.body.items.length).toBe(0);
        });

        it('should return 404 if the item to delete is not in the cart', async () => {
            const res = await request(app)
                .delete('/api/cart/items/999')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('Item not found in cart.');
        });
    });
});
