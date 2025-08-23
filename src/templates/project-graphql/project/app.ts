// Sources
import typeDefs from './graphQL/schemas/merge'
import resolvers from './graphQL/resolvers/merge'

// Framwork/libraries
import { ApolloServer } from '@apollo/server'
import express from 'express'
import { expressMiddleware } from '@as-integrations/express5'

export async function createApp (): Promise<express.Express> {
  const app = express()

  const server = new ApolloServer({ typeDefs, resolvers })
  await server.start()

  app.use(
    '/graphql',
    express.json(),

    expressMiddleware(server, {
      context: async ({ req, res }) => {
        return { req, res }
      }
    })
  )

  return app
}
