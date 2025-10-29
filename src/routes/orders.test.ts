// banquet-api/src/routes/orders.test.ts

import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';

import app from '../app';
import knex from '../db/knex';
import type { Product } from '../types';

// Magic numbers
const SHIPPING_COST_IN_PENCE = 499; // £4.99
const TAX_RATE = 0.20; // 20%

// Helper function to mirror the price calculation logic from the API route.
const calculateDiscountedPrice = (product: Product): number => {
    if (product.deal_type === 'percentage' && product.deal_discount) {
        return Math.round(product.price_in_pence * (1 - product.deal_discount / 100));
    }
    if (product.deal_type === 'fixed_amount' && product.deal_discount) {
        return product.price_in_pence - product.deal_discount;
    }
    return product.price_in_pence;
};

describe('Order & Checkout Routes', () => {
    let token: string;
    let userId: number;
    let addressId: number;

    beforeAll(async () => {
        await knex.migrate.latest();
        await knex.seed.run();
    });

    beforeEach(async () => {
        await knex('order_items').del();
        await knex('orders').del();
        await knex('cart_items').del();
        await knex('carts').del();
        await knex('addresses').del();
        await knex('users').del();

        const registerRes = await request(app)
            .post('/api/register')
            .send({ email: `order-user-${Date.now()}@test.com`, password: 'password123' });
        userId = registerRes.body.user.id;
        token = (await request(app)
            .post('/api/login')
            .send({ email: registerRes.body.user.email, password: 'password123' })).body.token;

        const addressRes = await request(app)
            .post('/api/addresses')
            .set('Authorization', `Bearer ${token}`)
            .send({ address_type: 'shipping', street_address: '1 Test St', city: 'Testville', post_code: 'T1 1TT', country: 'UK' });
        addressId = addressRes.body.id;
    });

    describe('POST /api/orders/intent', () => {

        it('should fail if cart is empty', async () => {
            const res = await request(app)
                .post('/api/orders/intent')
                .set('Authorization', `Bearer ${token}`)
                .send({ shipping_address_id: addressId });
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Cart is empty.');
        });

        it('should create a payment intent and calculate total correctly', async () => {

            await request(app).post('/api/cart/items').set('Authorization', `Bearer ${token}`).send({ productId: 1, quantity: 1 });
            await request(app).post('/api/cart/items').set('Authorization', `Bearer ${token}`).send({ productId: 2, quantity: 2 });

            const product1 = await knex<Product>('products').where({ id: 1 }).first();
            const product2 = await knex<Product>('products').where({ id: 2 }).first();

            expect(product1).toBeDefined();
            expect(product2).toBeDefined();

            const subtotal = (calculateDiscountedPrice(product1!) * 1) + (calculateDiscountedPrice(product2!) * 2);
            const tax = Math.round((subtotal + SHIPPING_COST_IN_PENCE) * TAX_RATE);
            const expectedTotal = subtotal + SHIPPING_COST_IN_PENCE + tax;

            const res = await request(app)
                .post('/api/orders/intent')
                .set('Authorization', `Bearer ${token}`)
                .send({ shipping_address_id: addressId });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('clientSecret');
            expect(res.body).toHaveProperty('paymentIntentId');
            expect(res.body.total).toBe(expectedTotal);
        });
    });

    describe('Full Checkout Flow (/intent -> /confirm)', () => {

        it('should create an order, clear the cart, and allow viewing the order', async () => {

            const product6 = await knex<Product>('products').where({ id: 6 }).first();
            expect(product6).toBeDefined();
            const expectedPriceForProduct6 = calculateDiscountedPrice(product6!);

            await request(app).post('/api/cart/items').set('Authorization', `Bearer ${token}`).send({ productId: 6, quantity: 1 });
            await request(app).post('/api/cart/items').set('Authorization', `Bearer ${token}`).send({ productId: 4, quantity: 3 });

            const intentRes = await request(app)
                .post('/api/orders/intent')
                .set('Authorization', `Bearer ${token}`)
                .send({ shipping_address_id: addressId });
            expect(intentRes.statusCode).toBe(200);
            const { paymentIntentId } = intentRes.body;

            const confirmRes = await request(app)
                .post('/api/orders/confirm')
                .set('Authorization', `Bearer ${token}`)
                .send({ payment_intent_id: paymentIntentId, shipping_address_id: addressId });
            const orderId = confirmRes.body.id;

            expect(confirmRes.statusCode).toBe(201);
            expect(confirmRes.body.status).toBe('paid');
            expect(confirmRes.body.total_in_pence).toBe(intentRes.body.total);

            const cartRes = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
            expect(cartRes.body.items).toEqual([]);

            const historyRes = await request(app).get('/api/orders').set('Authorization', `Bearer ${token}`);
            expect(historyRes.statusCode).toBe(200);
            expect(historyRes.body.length).toBe(1);
            expect(historyRes.body[0].id).toBe(orderId);

            const orderDetailsRes = await request(app).get(`/api/orders/${orderId}`).set('Authorization', `Bearer ${token}`);
            expect(orderDetailsRes.statusCode).toBe(200);
            expect(orderDetailsRes.body.id).toBe(orderId);
            expect(orderDetailsRes.body.items.length).toBe(2);

            const softTopItem = orderDetailsRes.body.items.find((i: any) => i.product_id === 6);
            expect(softTopItem).toBeDefined();
            expect(softTopItem.price_in_pence_at_purchase).toBe(expectedPriceForProduct6);
        });

        it('should prevent a user from viewing another user\'s order', async () => {

            await request(app).post('/api/cart/items').set('Authorization', `Bearer ${token}`).send({ productId: 1, quantity: 1 });
            const intentRes = await request(app).post('/api/orders/intent').set('Authorization', `Bearer ${token}`).send({ shipping_address_id: addressId });
            const confirmRes = await request(app).post('/api/orders/confirm').set('Authorization', `Bearer ${token}`).send({ payment_intent_id: intentRes.body.paymentIntentId, shipping_address_id: addressId });
            const orderId = confirmRes.body.id;

            await request(app).post('/api/register').send({ email: 'hacker@test.com', password: 'password123' });
            const secondToken = (await request(app).post('/api/login').send({ email: 'hacker@test.com', password: 'password123' })).body.token;

            const res = await request(app).get(`/api/orders/${orderId}`).set('Authorization', `Bearer ${secondToken}`);
            expect(res.statusCode).toBe(404);
        });

    });
});
