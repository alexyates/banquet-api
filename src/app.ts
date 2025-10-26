// src/app.ts

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import dotenv from 'dotenv';

import configurePassport from './config/passport';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import cartRoutes from './routes/cart';
import newsletterRoutes from './routes/newsletter';
import usersRoutes from './routes/users';

dotenv.config();

if (!process.env.JWT_SECRETS) {
    throw new Error('JWT_SECRETS is not defined in the environment variables');
}

if (!process.env.PORT) {
    throw new Error('PORT is not defined in the environment variables');
}

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(limiter);
app.use(passport.initialize());
configurePassport(passport);

app.use('/api', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api', usersRoutes);

app.get('/', (_request, response) => {
    response.send('Welcome to the Food E-Commerce API!');
});

export default app;
