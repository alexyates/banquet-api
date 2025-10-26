// src/db/migrations/20251026204321_create_user_profiles_table.ts

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('user_profiles', (table) => {
        table
            .integer('user_id')
            .unsigned()
            .primary()
            .references('id')
            .inTable('users')
            .onDelete('CASCADE');

        table.string('first_name');
        table.string('last_name');
        table.string('phone_number');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('user_profiles');
}
