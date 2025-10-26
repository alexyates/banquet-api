// src/routes/newsletter.ts

import express, { Request, Response } from 'express';
import passport from 'passport';
import knex from '../db/knex';
import { User, Subscriber } from '../types';
import { subscribeSchema } from '../utils/validation';

const router = express.Router();

// A version of passport.authenticate that doesn't fail if the JWT is missing.
// We use this for the subscribe route, which can be used by guests or logged-in users.
const optionalAuthenticate = (req: Request, res: Response, next: express.NextFunction) => {
    // passport.authenticate('jwt', { session: false }, (err, user, info) => {
    passport.authenticate('jwt', { session: false }, (_err: any, user: Express.User | undefined, _info: any) => {
        if (user) {
            req.user = user; // Attach user to the request if authentication succeeds
        }
        next(); // Always proceed
    })(req, res, next);
};

// POST /api/newsletter/subscribe
router.post('/subscribe', optionalAuthenticate, async (req: Request, res: Response) => {
    const validation = subscribeSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error.flatten() });
    }

    const { email } = validation.data;
    const user = req.user as User | undefined; // User might be undefined

    try {
        const existingSubscriber = await knex<Subscriber>('subscribers').where({ email }).first();

        if (existingSubscriber) {
            if (existingSubscriber.status === 'subscribed') {
                return res.status(409).json({ error: 'Email is already subscribed.' });
            }

            // If they were unsubscribed, re-subscribe them
            const [updatedSubscriber] = await knex<Subscriber>('subscribers')
                .where({ id: existingSubscriber.id })
                // .update({ status: 'subscribed', user_id: user?.id ?? existingSubscriber.user_id })
                .update({ status: 'subscribed', id: user?.id ?? existingSubscriber.id })
                .returning('*');

            return res.status(200).json({ subscriber: updatedSubscriber });
        }

        // If no existing subscriber, create a new one
        const [newSubscriber] = await knex<Subscriber>('subscribers')
            // .insert({ email, user_id: user?.id ?? null })
            .insert({ email, id: user?.id })
            .returning('*');

        res.status(201).json({ subscriber: newSubscriber });
    } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
            console.error(error);
        }
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});


// GET /api/newsletter/archive
router.get('/archive', passport.authenticate('jwt', { session: false }), async (req: Request, res: Response) => {
    const user = req.user as User;

    try {
        const subscriber = await knex<Subscriber>('subscribers')
            // .where({ user_id: user.id, status: 'subscribed' })
            .where({ id: user.id, status: 'subscribed' })
            .first();

        if (!subscriber) {
            return res.status(403).json({ error: 'Access denied. You must be subscribed to the newsletter.' });
        }

        const newsletters = await knex('newsletters').orderBy('published_at', 'desc');
        res.status(200).json(newsletters);
    } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
            console.error(error);
        }
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});


export default router;