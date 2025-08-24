import { convertRouterToGraphQLTypes, convertTsInterfaceToGraphQLType } from '../../src/functions/buildGraphQLAPI'

describe('function', () => {
  test('convertTsInterfaceToGraphQLType', () => {
    const cases = [
      {
        input: `
          interface User {
            id: number
            name: string
            email?: string
            tags: string[]
            isActive: boolean
          }
        `,
        expect: `
          type User {
            id:  Int!
            name: String!
            email: String
            tags: [String]!
            isActive: Boolean!
          }
        `
      }
    ]

    for (const inputExpect of cases) {
      const result = convertTsInterfaceToGraphQLType(inputExpect.input)

      expect(result).toBe(inputExpect.expect)
    }
  })

  test('router and controller to query and mutation gql types', () => {
    const router = `
import { Router } from 'express'
import { ThreadController } from '../controllers/thread'
import { UserLogin } from '../middlewares/UserLogin'

export const ThreadRouter = Router()

ThreadRouter.get('/getAllThread', ThreadController.getAll)
ThreadRouter.post('/createThread', UserLogin, ThreadController.createThread)
ThreadRouter.patch('/updateThread', UserLogin, ThreadController.update)
ThreadRouter.delete('/deleteThread', UserLogin, ThreadController.delete)`

const controller = `
import { Request, Response } from 'express'
import { ThreadModel } from '../models/thread'
import { connection } from '../database/connect'
import { CustomRequest } from '../interfaces/interfaces'
import { UserBadRequestError } from '../errors/errors'

export const ThreadController = {
  getAll: async function (req: Request, res: Response): returnInterface {
    const response = await ThreadModel.getAll(await connection)
    res.send(response)
  },

  createThread: async function (req: Request, res: Response): returnInterface1 {
    const { name, description } = req.body
    const id = (req as CustomRequest).UserId

    try {
      const response = await ThreadModel.create(id, name, description, await connection)
      res.status(201).send(response)
    } catch (e) {
      if (e instanceof UserBadRequestError) {
        res.status(400).json({ message: 'Invalid or missing data' })
      }
      res.status(500).json({ message: 'Error creating thread' })
    }
  },

  update: async function (req: Request, res: Response): returnInterface2 {
    const id = (req as CustomRequest).UserId
    const { threadId, name, description } = req.body

    if (threadId === undefined || threadId === '') {
      res.status(400).send('Invalid or missing data')
      return
    }

    try {
      const data = { name, description }
      await ThreadModel.update(id, threadId, data, await connection)
      res.json({ message: 'Thread updated' })
    } catch (e) {
      if (e instanceof UserBadRequestError) {
        res.status(400).json({ message: 'Invalid or missing data' })
      }
      res.status(500).json({ message: 'Error updating thread' })
    }
  },

  delete: async function (req: Request, res: Response): returnInterface3 {
    const id = (req as CustomRequest).UserId
    const { threadId } = req.body

    if (threadId === undefined || threadId === '' || id === undefined || id === '') {
      res.status(400).send('Invalid or missing data')
      return
    }

    try {
      await ThreadModel.delete(id, threadId, await connection)
      res.sendStatus(204)
    } catch (e) {
      if (e instanceof UserBadRequestError) {
        res.status(400).json({ message: 'Invalid or missing data' })
      }
      res.status(500).json({ message: 'Error deleting thread' })
    }
  }
}`

    const response = convertRouterToGraphQLTypes(router, controller)
    expect(response).toBe(`type Query {
  getAllThread:  returnInterface 
}
type Mutation {
  createThread:  returnInterface1 
  updateThread:  returnInterface2 
  deleteThread:  returnInterface3 
}`)
  })
})
