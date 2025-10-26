// src/db/migrations/20251026010411_create_products_table.tss

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('products', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.text('description').notNullable();
        table.integer('price_in_pence').notNullable();
        table.string('image_url');
        table.enum('category', ['surfboard', 'accessory']).notNullable();
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('products');
}