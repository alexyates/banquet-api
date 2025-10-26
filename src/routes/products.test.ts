// src/routes/products.test.ts

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import knex from '../db/knex';
import { Product } from '../types';

describe('Product Routes', () => {
    
    beforeAll(async () => {
        await knex.migrate.latest();
    });

    beforeEach(async () => {
        await knex.seed.run();
    });

    describe('GET /api/products', () => {
        it('should return all products and a 200 status', async () => {
            const res = await request(app).get('/api/products');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body.length).toBe(10);
            expect(res.body[0]).toHaveProperty('name', 'The Classic Longboard');
            expect(res.body[0]).toHaveProperty('brand', 'WaveRider');
            expect(res.body[0]).toHaveProperty('rating', 4.5);
        });


        it('should filter products by category', async () => {
            const res = await request(app).get('/api/products?category=accessory');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body.length).toBe(6);
            expect(res.body.every((product: Product) => product.category === 'accessory')).toBe(true);
        });

        it('should filter products by brand', async () => {
            const res = await request(app).get('/api/products?brand=ShredStix');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body.length).toBe(2);
            expect(res.body.every((product: Product) => product.brand === 'ShredStix')).toBe(true);
        });

        it('should filter products with a price greater than a given value', async () => {
            const res = await request(app).get('/api/products?price_in_pence_gt=70000');
            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].name).toBe('High-Performance Shortboard');
        });

        it('should filter products with a price less than a given value', async () => {
            const res = await request(app).get('/api/products?price_in_pence_lt=3000');
            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(2);
            const names = res.body.map((product: Product) => product.name);
            expect(names).toContain('Pro Comp Leash');
            expect(names).toContain('Eco-Friendly Surf Wax');
        });

        it('should combine multiple filters correctly', async () => {
            const res = await request(app).get('/api/products?category=surfboard&price_in_pence_lt=70000');
            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(3);
            expect(res.body[0].name).toBe('The Classic Longboard');
        });

        it('should return a 400 Bad Request for invalid filter values', async () => {
            const res = await request(app).get('/api/products?category=skateboard');
            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toContain('Couldn not filter Products.');
        });

        it('should return an empty array if no products match the filter', async () => {
            const res = await request(app).get('/api/products?price_in_pence_gt=999999');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual([]);
        });
    });

    describe('GET /api/products/:id', () => {
        it('should return a single product for a valid ID and a 200 status', async () => {
            const res = await request(app).get('/api/products/2');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeInstanceOf(Object);
            expect(res.body).toHaveProperty('id', 2);
            expect(res.body).toHaveProperty('name', 'High-Performance Shortboard');
            expect(res.body).toHaveProperty('brand', 'ShredStix');
            expect(res.body).toHaveProperty('deal_type', 'percentage');
            expect(res.body).toHaveProperty('deal_discount', 10);
        });

        it('should return a 404 status for a non-existent ID', async () => {
            const res = await request(app).get('/api/products/9999');
            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('error', 'Product not found');
        });
    });

});
