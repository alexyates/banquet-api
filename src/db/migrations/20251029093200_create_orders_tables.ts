// banquet-api/src/db/migrations/20251029093200_create_orders_tables.ts

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('orders', (table) => {
        table.increments('id').primary();
        table
            .integer('user_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('users')
            .onDelete('CASCADE');

        table.enum('status', ['pending', 'paid', 'shipped', 'delivered', 'cancelled']).notNullable().defaultTo('pending');

        table.integer('subtotal_in_pence').unsigned().notNullable();
        table.integer('shipping_in_pence').unsigned().notNullable();
        table.integer('tax_in_pence').unsigned().notNullable();
        table.integer('total_in_pence').unsigned().notNullable();

        table.json('shipping_address').notNullable();
        table.string('payment_intent_id').unique();

        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('orders');
}
