// src/routes/cart.ts

import express, { Request, Response } from 'express';
import passport from 'passport';
import knex from '../db/knex';
import { User, Cart } from '../types';
import { addItemToCartSchema, updateCartItemSchema } from '../utils/validation';

const router = express.Router();

const authenticate = passport.authenticate('jwt', { session: false });

/**
 * Helper function to find a user's cart, or create one if it doesn't exist.
 * This prevents duplicating this logic in every route handler.
 */
const getOrCreateCart = async (userId: number): Promise<Cart> => {
    let cart = await knex<Cart>('carts').where({ user_id: userId }).first();
    if (!cart) {
        const [newCart] = await knex<Cart>('carts').insert({ user_id: userId }).returning('*');
        cart = newCart;
    }
    return cart;
};

router.get(
    '/',
    authenticate,
    async (req: Request, res: Response) => {
        const user = req.user as User;
        const cart = await getOrCreateCart(user.id);
        const items = await knex('cart_items')
            .join('products', 'cart_items.product_id', 'products.id')
            .where({ cart_id: cart.id })
            .select(
                'products.id',
                'products.name',
                'products.price_in_pence',
                'products.image_url',
                'cart_items.quantity'
            );
        res.status(200).json({ cart, items });
    });

router.post(
    '/items',
    authenticate,
    async (req: Request, res: Response) => {
        const validation = addItemToCartSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.flatten() });
        }
        const user = req.user as User;
        const { productId, quantity } = validation.data;
        const product = await knex('products').where({ id: productId }).first();
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }
        const cart = await getOrCreateCart(user.id);
        const [item] = await knex('cart_items')
            .insert({
                cart_id: cart.id,
                product_id: productId,
                quantity: quantity,
            })
            .onConflict(['cart_id', 'product_id'])
            .merge({
                quantity: knex.raw('cart_items.quantity + ?', [quantity]),
                updated_at: new Date()
            })
            .returning('*');
        const createdAtTime = new Date(item.created_at).getTime();
        const updatedAtTime = new Date(item.updated_at).getTime();
        const statusCode = createdAtTime === updatedAtTime ? 201 : 200;
        res.status(statusCode).json({ item });
    });

router.put(
    '/items/:productId',
    authenticate,
    async (req: Request, res: Response) => {
        const validation = updateCartItemSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.flatten() });
        }
        const user = req.user as User;
        const { productId } = req.params;
        const { quantity } = validation.data;
        const cart = await getOrCreateCart(user.id);
        const [updatedItem] = await knex('cart_items')
            .where({ cart_id: cart.id, product_id: productId })
            .update({ quantity: quantity })
            .returning('*');
        if (!updatedItem) {
            return res.status(404).json({ error: 'Item not found in cart.' });
        }
        res.status(200).json({ item: updatedItem });
    });

router.delete(
    '/items/:productId',
    authenticate,
    async (req: Request, res: Response) => {
        const user = req.user as User;
        const { productId } = req.params;
        const cart = await getOrCreateCart(user.id);
        const deletedCount = await knex('cart_items')
            .where({ cart_id: cart.id, product_id: productId })
            .del();

        if (deletedCount === 0) {
            return res.status(404).json({ error: 'Item not found in cart.' });
        }
        res.status(204).send();
    });

export default router;
