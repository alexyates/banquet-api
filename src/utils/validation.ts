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
    category: z.enum(['surfboard', 'accessory']).optional(),
    price_in_pence_gt: z.coerce.number().int().positive().optional(),
    price_in_pence_lt: z.coerce.number().int().positive().optional(),
    brand: z.string().optional(),
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

export const profileSchema = z.object({
    first_name: z.string().min(1).optional(),
    last_name: z.string().min(1).optional(),
    phone_number: z.string().min(1).optional(),
});

export const addressSchema = z.object({
    address_type: z.enum(['shipping', 'billing']),
    street_address: z.string().min(1),
    city: z.string().min(1),
    post_code: z.string().min(1),
    country: z.string().min(1),
    is_default: z.boolean().optional(),
});

export const paymentMethodSchema = z.object({
    provider_token: z.string().min(1), // e.g., 'tok_visa' from Stripe
});

export const createOrderIntentSchema = z.object({
    shipping_address_id: z.number().int().positive(),
});

export const confirmOrderSchema = z.object({
    payment_intent_id: z.string().min(1),
    shipping_address_id: z.number().int().positive(),
});
