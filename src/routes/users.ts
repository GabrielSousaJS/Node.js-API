import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      birthdate: z.string(),
      mass: z.number(),
    })

    const { name, birthdate, mass } = createUserBodySchema.parse(request.body)

    const user = await knex('users').where('name', name).first()

    if (user?.name === name) {
      reply.status(404).send('Usuário já cadastrado')
    }

    let { sessionId } = request.cookies

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      })
    }

    await knex('users').insert({
      id: randomUUID(),
      name,
      birthdate,
      mass,
      session_id: sessionId,
    })

    reply.status(201).send()
  })
}
