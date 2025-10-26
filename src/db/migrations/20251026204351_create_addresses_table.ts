// src/db/migrations/20251026204351_create_addresses_table.ts

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('addresses', (table) => {
        table.increments('id').primary();
        table
            .integer('user_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('users')
            .onDelete('CASCADE');

        table.enum('address_type', ['shipping', 'billing']).notNullable();
        table.string('street_address').notNullable();
        table.string('city').notNullable();
        table.string('post_code').notNullable();
        table.string('country').notNullable();
        table.boolean('is_default').notNullable().defaultTo(false);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('addresses');
}
