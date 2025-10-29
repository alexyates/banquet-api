// banquet-api/src/routes/orders.ts

import express, { Request, Response } from 'express';
import passport from 'passport';

import knex from '../db/knex';
import { User, Product, Order, OrderItem } from '../types';
import { createOrderIntentSchema, confirmOrderSchema } from '../utils/validation';

const router = express.Router();
const authenticate = passport.authenticate('jwt', { session: false });

// Magic numbers
const SHIPPING_COST_IN_PENCE = 499; // £4.99
const TAX_RATE = 0.20; // 20%

// Helper to calculate the price of a single item considering deals
const calculateDiscountedPrice = (product: Product): number => {
    if (product.deal_type === 'percentage' && product.deal_discount) {
        return Math.round(product.price_in_pence * (1 - product.deal_discount / 100));
    }
    if (product.deal_type === 'fixed_amount' && product.deal_discount) {
        return product.price_in_pence - product.deal_discount;
    }
    return product.price_in_pence;
};

router.get('/', authenticate, async (req: Request, res: Response) => {
    const user = req.user as User;
    const orders = await knex<Order>('orders').where({ user_id: user.id }).orderBy('created_at', 'desc');
    res.json(orders);
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
    const user = req.user as User;

    const orderId = parseInt(req.params.id, 10);
    if (isNaN(orderId)) {
        return res.status(400).json({ error: 'Invalid order ID.' });
    }

    const order = await knex<Order>('orders').where({ id: orderId, user_id: user.id }).first();
    if (!order) {
        return res.status(404).json({ error: 'Order not found.' });
    }
    const items = await knex<OrderItem>('order_items').where({ order_id: orderId });
    res.json({ ...order, items });
});

/**
 * Payment Intent
 * Calculates the total cost and creates a mock payment intent.
 */
router.post(
    '/intent',
    authenticate,
    async (req: Request, res: Response) => {
        try {
            const validation = createOrderIntentSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({ error: validation.error.flatten() });
            }
            const user = req.user as User;
            const { shipping_address_id } = validation.data;

            const cart = await knex('carts').where({ user_id: user.id }).first();
            if (!cart) {
                return res.status(400).json({ error: 'Cart is empty.' });
            }
            const shippingAddress = await knex('addresses').where({ id: shipping_address_id, user_id: user.id }).first();
            if (!shippingAddress) {
                return res.status(404).json({ error: 'Shipping address not found.' });
            }

            const items = await knex('cart_items')
                .join('products', 'cart_items.product_id', 'products.id')
                .where({ cart_id: cart.id })
                .select('products.*', 'cart_items.quantity');

            if (items.length === 0) {
                return res.status(400).json({ error: 'Cart is empty.' });
            }

            const subtotal = items.reduce((acc, item) => {
                const price = calculateDiscountedPrice(item);
                return acc + (price * item.quantity);
            }, 0);

            const tax = Math.round((subtotal + SHIPPING_COST_IN_PENCE) * TAX_RATE);
            const total = subtotal + SHIPPING_COST_IN_PENCE + tax;

            // MOCK: Call an API here to create a PaymentIntent // const paymentIntent = await PaymentProcessor.paymentIntents.create({ amount: total, currency: 'gbp' });
            const mockPaymentIntent = {
                id: `pi_mock_${Date.now()}`,
                client_secret: `pi_mock_${Date.now()}_secret_${Date.now()}`
            };

            res.json({
                clientSecret: mockPaymentIntent.client_secret,
                paymentIntentId: mockPaymentIntent.id,
                total,
            });
        } catch (error) {
            res.status(500).json({ error: 'An internal server error occurred.' });
        }
    });

/**
 * Confirm Order
 * Simulates the action a webhook would perform after successful payment.
 * Creates the order record and clears the cart.
 */
router.post(
    '/confirm',
    authenticate,
    async (req: Request, res: Response) => {
        const validation = confirmOrderSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.flatten() });
        }
        const user = req.user as User;
        const { payment_intent_id, shipping_address_id } = validation.data;
        const trx = await knex.transaction();
        try {
            const cart = await trx('carts').where({ user_id: user.id }).first();
            if (!cart) {
                throw new Error('Cart not found.');
            }
            const shippingAddress = await trx('addresses').where({ id: shipping_address_id, user_id: user.id }).first();
            if (!shippingAddress) {
                throw new Error('Shipping address not found.');
            }
            const items = await trx('cart_items')
                .join('products', 'cart_items.product_id', 'products.id')
                .where({ cart_id: cart.id })
                .select('products.*', 'cart_items.quantity');
            if (items.length === 0) {
                throw new Error('Cart is empty.');
            }
            const subtotal = items.reduce((acc, item) => acc + (calculateDiscountedPrice(item) * item.quantity), 0);
            const tax = Math.round((subtotal + SHIPPING_COST_IN_PENCE) * TAX_RATE);
            const total = subtotal + SHIPPING_COST_IN_PENCE + tax;
            const [newOrder] = await trx('orders').insert({
                user_id: user.id,
                status: 'paid',
                subtotal_in_pence: subtotal,
                shipping_in_pence: SHIPPING_COST_IN_PENCE,
                tax_in_pence: tax,
                total_in_pence: total,
                shipping_address: JSON.stringify(shippingAddress),
                payment_intent_id,
            }).returning('*');
            const orderItems = items.map(item => ({
                order_id: newOrder.id,
                product_id: item.id,
                quantity: item.quantity,
                price_in_pence_at_purchase: calculateDiscountedPrice(item),
                product_name_at_purchase: item.name,
            }));
            await trx('order_items').insert(orderItems);
            await trx('cart_items').where({ cart_id: cart.id }).del();
            await trx.commit();
            res.status(201).json(newOrder);
        } catch (error) {
            await trx.rollback();
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'An internal server error occurred.' });
        }
    });

export default router;
