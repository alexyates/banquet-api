// banquet-api/src/db/migrations/20251029094025_create_order_items_table.ts

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('order_items', (table) => {
        table.increments('id').primary();
        table
            .integer('order_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('orders')
            .onDelete('CASCADE');
        table
            .integer('product_id')
            .unsigned()
            .references('id')
            .inTable('products')
            .onDelete('SET NULL');

        table.integer('quantity').unsigned().notNullable();
        table.integer('price_in_pence_at_purchase').unsigned().notNullable();
        table.string('product_name_at_purchase').notNullable(); // For historical reference
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('order_items');
}
