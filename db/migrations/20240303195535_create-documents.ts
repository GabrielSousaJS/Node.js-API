import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary()
    table.uuid('session_id').index()
    table.string('name').notNullable()
    table.date('birthdate').notNullable()
    table.decimal('mass').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
  })

  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.string('user_id').references('id').inTable('users')
    table.string('name').notNullable()
    table.string('describe').notNullable()
    table.date('date').notNullable()
    table.time('hors').notNullable()
    table.string('within_diet').notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users')
  await knex.schema.dropTable('meals')
}
