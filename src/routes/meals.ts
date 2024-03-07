import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { knex } from '../database'
import { z } from 'zod'

export async function mealsRoutes(app: FastifyInstance) {
  // Inserir uma nova refeição
  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.string(),
        hours: z.string(),
        withinDiet: z.string(),
      })

      const { name, description, date, hours, withinDiet } =
        createMealBodySchema.parse(request.body)

      const { sessionId } = request.cookies

      const user = await knex('users').where({ session_id: sessionId }).first()

      await knex('meals').insert({
        id: randomUUID(),
        user_id: user?.id,
        name,
        description,
        date,
        hours,
        within_diet: withinDiet,
      })

      reply.status(201).send()
    },
  )

  // Recuperar todas as refeições de um usuário
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const user = await knex('users')
        .where('session_id', sessionId)
        .select()
        .first()

      const meals = await knex('meals').where('user_id', user?.id).select()

      reply.status(200).send(meals)
    },
  )

  // Busca apenas uma refeição do usuário
  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      const meal = await knex('meals').where('id', id).first()

      reply.status(200).send(meal)
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const user = await knex('users')
        .where('session_id', sessionId)
        .select('id')
        .first()

      const totalMeals = await knex('meals')
        .where('user_id', user?.id)
        .orderBy('date', 'desc')
        .orderBy('hours', 'desc')

      const totalMealsOnDiet = await knex('meals')
        .where('user_id', user?.id)
        .where('within_diet', 'S')
        .count('within_diet', { as: 'total_meals_diet' })
        .first()

      const totalMealsOffDiet = await knex('meals')
        .where('user_id', user?.id)
        .where('within_diet', 'N')
        .count('within_diet', { as: 'total_meals_diet' })
        .first()

      const { bestOnDietSequence } = totalMeals.reduce(
        (acc, meal) => {
          if (meal.within_diet === 'S') {
            acc.currentSequence += 1
          } else {
            acc.currentSequence = 0
          }

          if (acc.currentSequence > acc.bestOnDietSequence) {
            acc.bestOnDietSequence = acc.currentSequence
          }

          return acc
        },
        { bestOnDietSequence: 0, currentSequence: 0 },
      )

      reply.status(200).send({
        totalMeals: totalMeals.length,
        totalMealsOnDiet: totalMealsOnDiet?.total_meals_diet,
        totalMealsOffDiet: totalMealsOffDiet?.total_meals_diet,
        bestOnDietSequence,
      })
    },
  )

  // Realiza a atualização da refeição
  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const updateMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.string(),
        hours: z.string(),
        withinDiet: z.string(),
      })

      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      const { name, description, date, hours, withinDiet } =
        updateMealBodySchema.parse(request.body)

      await knex('meals').where('id', id).update({
        name,
        description,
        date,
        hours,
        within_diet: withinDiet,
      })

      reply.status(200).send()
    },
  )

  // Apaga a refeição da base de dados
  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      await knex('meals').where('id', id).del()

      reply.status(204).send()
    },
  )
}
