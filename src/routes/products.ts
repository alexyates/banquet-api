// src/routes/products.ts

import express, { Request, Response } from 'express';
import knex from '../db/knex';
import { productFilterSchema } from '../utils/validation';
import { Product } from '../types';

const router = express.Router();

router.get(
    '/',
    async (request: Request, response: Response) => {
        try {
            const validationResult = productFilterSchema.safeParse(request.query);
            if (!validationResult.success) {
                if (process.env.NODE_ENV !== 'test') {
                    console.error(validationResult.error);
                }
                return response.status(400).json({ error: 'Couldn not filter Products.' });
            }
            const { category, price_in_pence_gt, price_in_pence_lt } = validationResult.data;
            const query = knex<Product>('products').select('*');
            if (category) {
                query.where('category', category);
            }
            if (price_in_pence_gt) {
                query.where('price_in_pence', '>', price_in_pence_gt);
            }
            if (price_in_pence_lt) {
                query.where('price_in_pence', '<', price_in_pence_lt);
            }
            const products: Product[] = await query;
            response.status(200).json(products);
        } catch (error) {
            if (process.env.NODE_ENV !== 'test') {
                console.error(error);
            }
            console.error(error);
            response.status(500).json({ error: 'An internal server error occurred.' });
        }
    });

router.get(
    '/:id',
    async (request: Request, response: Response) => {
        try {
            const { id } = request.params;
            const product = await knex('products').where({ id }).first();
            if (product) {
                response.status(200).json(product);
            } else {
                response.status(404).json({ error: 'Product not found' });
            }
        } catch (error) {
            if (process.env.NODE_ENV !== 'test') {
                console.error(error);
            }
            response.status(500).json({ error: 'An internal server error occurred.' });
        }
    });

export default router;
