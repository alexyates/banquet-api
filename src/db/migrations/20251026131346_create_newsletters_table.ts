// src/db/migrations/20251026131346_create_newsletters_table.ts

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('newsletters', (table) => {
        table.increments('id').primary();
        table.string('subject').notNullable();
        table.text('content', 'longtext').notNullable();
        table.timestamp('published_at').defaultTo(knex.fn.now());
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('newsletters');
}
