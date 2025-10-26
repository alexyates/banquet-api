// src/db/migrations/20251026021954_create_cart_items_table.ts

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('cart_items', (table) => {
        table.increments('id').primary();
        table
            .integer('cart_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('carts')
            .onDelete('CASCADE');
        table
            .integer('product_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('products')
            .onDelete('CASCADE');
        table.integer('quantity').unsigned().notNullable().defaultTo(1);
        table.timestamps(true, true);
        table.unique(['cart_id', 'product_id']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('cart_items');
}
