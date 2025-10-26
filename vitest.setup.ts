// vitest.setup.ts

import { beforeAll, afterAll } from 'vitest';
import knex from './src/db/knex';

beforeAll(async () => {
    process.env.JWT_SECRETS = 'test-secret';
    await knex.migrate.latest();
});

afterAll(async () => {
    await knex.migrate.rollback();
    await knex.destroy();
});
