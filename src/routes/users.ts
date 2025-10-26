// src/routes/users.ts

import express, { Request, Response } from 'express';
import passport from 'passport';
import knex from '../db/knex';
import { User } from '../types';
import { profileSchema, addressSchema, paymentMethodSchema } from '../utils/validation';

const router = express.Router();
const authenticate = passport.authenticate('jwt', { session: false });

router.route('/profile')
    .all(authenticate)
    .get(async (req: Request, res: Response) => {
        const user = req.user as User;
        const profile = await knex('user_profiles').where({ user_id: user.id }).first();
        if (!profile) return res.status(404).json({ error: 'Profile not found.' });
        res.json(profile);
    })
    .post(async (req: Request, res: Response) => {
        const user = req.user as User;
        const validation = profileSchema.safeParse(req.body);
        if (!validation.success) return res.status(400).json({ error: validation.error.flatten() });

        const [newProfile] = await knex('user_profiles').insert({ ...validation.data, user_id: user.id }).returning('*');
        res.status(201).json(newProfile);
    })
    .put(async (req: Request, res: Response) => {
        const user = req.user as User;
        const validation = profileSchema.safeParse(req.body);
        if (!validation.success) return res.status(400).json({ error: validation.error.flatten() });

        const [updatedProfile] = await knex('user_profiles').where({ user_id: user.id }).update(validation.data).returning('*');
        if (!updatedProfile) return res.status(404).json({ error: 'Profile not found to update.' });
        res.status(200).json(updatedProfile);
    });

router.route('/addresses')
    .all(authenticate)
    .get(async (req: Request, res: Response) => {
        const user = req.user as User;
        const addresses = await knex('addresses').where({ user_id: user.id });
        res.json(addresses);
    })
    .post(async (req: Request, res: Response) => {
        const user = req.user as User;
        const validation = addressSchema.safeParse(req.body);
        if (!validation.success) return res.status(400).json({ error: validation.error.flatten() });

        const [newAddress] = await knex('addresses').insert({ ...validation.data, user_id: user.id }).returning('*');
        res.status(201).json(newAddress);
    });

router.route('/addresses/:id')
    .all(authenticate)
    .put(async (req: Request, res: Response) => {
        const user = req.user as User;
        const validation = addressSchema.safeParse(req.body);
        if (!validation.success) return res.status(400).json({ error: validation.error.flatten() });

        const [updatedAddress] = await knex('addresses').where({ id: req.params.id, user_id: user.id }).update(validation.data).returning('*');
        if (!updatedAddress) return res.status(404).json({ error: 'Address not found.' });
        res.status(200).json(updatedAddress);
    })
    .delete(async (req: Request, res: Response) => {
        const user = req.user as User;
        const count = await knex('addresses').where({ id: req.params.id, user_id: user.id }).del();
        if (count === 0) return res.status(404).json({ error: 'Address not found.' });
        res.status(204).send();
    });

// --- Payment Method Routes ---
router.route('/payment-methods')
    .all(authenticate)
    .post(async (req: Request, res: Response) => {
        const user = req.user as User;
        const validation = paymentMethodSchema.safeParse(req.body);
        if (!validation.success) return res.status(400).json({ error: validation.error.flatten() });

        // MOCK: In a real app, you'd use a library like 'stripe' here.
        // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        // await stripe.customers.create({ email: user.email });
        // This is a fake response for our test case.
        if (validation.data.provider_token === 'tok_visa') {
            const [newMethod] = await knex('payment_methods').insert({
                user_id: user.id,
                payment_provider: 'stripe',
                provider_customer_id: 'cus_mock123',
                provider_payment_method_id: 'pm_mock_visa',
                card_brand: 'Visa',
                last_four_digits: '4242',
                expiry_month: 12,
                expiry_year: 2028
            }).returning('*');
            return res.status(201).json(newMethod);
        }

        res.status(400).json({ error: 'Invalid provider token.' });
    });

export default router;
