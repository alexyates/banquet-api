// src/utils/validation.ts

import { z } from 'zod';

export const registerSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
});

export const loginSchema = z.object({
    email: z.email(),
    password: z.string(),
});

export const productFilterSchema = z.object({
    category: z.enum(['Surfboard', 'Accessory']).optional(),
    price_in_pence_gt: z.coerce.number().int().positive().optional(),
    price_in_pence_lt: z.coerce.number().int().positive().optional(),
});

export const addItemToCartSchema = z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
});

export const updateCartItemSchema = z.object({
    quantity: z.number().int().positive(),
});

export const subscribeSchema = z.object({
    email: z.email(),
});
