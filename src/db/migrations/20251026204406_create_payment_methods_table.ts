// src/db/migrations/20251026204406_create_payment_methods_table.ts

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('payment_methods', (table) => {
        table.increments('id').primary();
        table
            .integer('user_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('users')
            .onDelete('CASCADE');

        // e.g., 'stripe', 'paypal'
        table.string('payment_provider').notNullable();

        // The customer ID from the payment provider (e.g., Stripe's 'cus_xxxxxxxx')
        table.string('provider_customer_id').notNullable();

        // The specific payment method ID (e.g., Stripe's 'pm_xxxxxxxx')
        table.string('provider_payment_method_id').notNullable().unique();

        // Safe metadata to display to the user
        table.string('card_brand'); // e.g., 'Visa'
        table.string('last_four_digits'); // e.g., '4242'
        table.integer('expiry_month');
        table.integer('expiry_year');

        table.boolean('is_default').notNullable().defaultTo(false);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('payment_methods');
}
