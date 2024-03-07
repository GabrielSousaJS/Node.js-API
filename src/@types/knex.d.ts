// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      birthdate: string
      mass: number
      created_at: string
      session_id?: string
    }

    meals: {
      id: string
      user_id: string
      name: string
      description: string
      date: string
      hours: string
      within_diet: string
    }
  }
}
