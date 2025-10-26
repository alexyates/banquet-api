// src/config/passport.ts

import { Strategy as JwtStrategy, ExtractJwt, SecretOrKeyProvider } from 'passport-jwt';
import { PassportStatic } from 'passport';
import knex from '../db/knex';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { User } from '../types';

const secretProvider: SecretOrKeyProvider = (_request, rawJwtToken, done) => {
    const secrets = process.env.JWT_SECRETS;
    if (!secrets) {
        return done(new Error('JWT_SECRETS is not defined in environment variables.'));
    }
    const secretKeys = secrets.split(',');



    for (const key of secretKeys) {
        try {
            jwt.verify(rawJwtToken, key);
            return done(null, key);
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                return done(new Error('The token has expired.'));
            }
            if (error instanceof JsonWebTokenError) {
                continue;
            }
            return done(error);
        }
    }
    return done(new Error('The token signature is invalid.'));

};

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKeyProvider: secretProvider
};

export default (passport: PassportStatic) => {
    passport.use(
        new JwtStrategy(opts, async (jwt_payload, done) => {
            try {
                const user = await knex<User>('users').where({ id: jwt_payload.id }).first();
                if (user) {
                    return done(null, user);
                }
                return done(null, false);
            } catch (err) {
                return done(err, false);
            }
        })
    );
};
