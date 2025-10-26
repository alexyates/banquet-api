// src/db/migrations/20251026131246_create_subscribers_table.ts

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('subscribers', (table) => {
        table.increments('id').primary();
        table.string('email').notNullable().unique();
        table
            .integer('user_id')
            .unsigned()
            .references('id')
            .inTable('users')
            .onDelete('SET NULL');
        table.enum('status', ['subscribed', 'unsubscribed']).notNullable().defaultTo('subscribed');
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('subscribers');
}
