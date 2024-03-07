import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('meals', (table) => {
    table.renameColumn('hors', 'hours')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('meals', (table) => {
    table.renameColumn('hours', 'hors')
  })
}
