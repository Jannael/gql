import fs from 'node:fs'
import { type } from 'node:os'
import path from 'node:path'

export function build (projectPath: string = process.cwd(),
  routerPath: string = path.join(process.cwd(), 'route'),
  intefacePath: string = path.join(process.cwd(), 'route')): void {
  //
  const graphQLPath = path.join(projectPath, 'graphQL')
  if (!fs.existsSync(graphQLPath)) {
    fs.mkdirSync(graphQLPath, { recursive: true })
  }
}

export function convertTsInterfaceToGraphQLType (tsInterface: string): string {
  tsInterface = tsInterface.replaceAll('export', '')
  tsInterface = tsInterface.replaceAll('interface', 'type')
  tsInterface = tsInterface.replaceAll('number', ' Int')

  tsInterface = tsInterface.replaceAll(/ string/g, ' String')
  tsInterface = tsInterface.replaceAll(/ boolean/g, ' Boolean')

  // now lets check for arrays we want to change string[] => [string]
  tsInterface = tsInterface.replace(/\b(\w+)\[\]/g, (_, type: string) => `[${type}]`)

  // field?: string => field: string!
  let result = ''
  let lastIndex = 0

  for (const match of tsInterface.matchAll(/\b\w+:\s*\[?\w+\]?/g)) {
    const start = match.index
    const end = start + match[0].length

    // Añade el contenido previo al match
    result += tsInterface.slice(lastIndex, end) + '!'
    lastIndex = end
  }

  // Añade el resto del string
  result += tsInterface.slice(lastIndex)
  tsInterface = result

  tsInterface = tsInterface.replace(/\b(\w+)\s*\?:/g, '$1:')

  return tsInterface
}

export function convertRouterToGraphQLTypes (router: string, controller: string): string {
  let queryRoutes = 'type Query {\n'
  let mutationRoutes = 'type Mutation {\n'
  const match = router.matchAll(/\w+\.\w+\(.*\)/g)

  match.forEach(m => {
    const queryRegex = /\w+\.get\(.*\)/g
    const isQuery = queryRegex.test(m[0])

    m[0] = m[0].replace(/\w+.\w+\(/g, '')

    const typeNameRexArray = m[0].match(/'.+'/) as RegExpMatchArray
    const controllerFunctionRexArray = m[0].match(/\w+\.\w+\)$/) as RegExpMatchArray

    const typeName = typeNameRexArray[0].replace(/('|\/)/g, '')
    const controllerFunc = controllerFunctionRexArray[0].replace(/(\w+\.|\))/g, '')
    const returnTypeRegex = new RegExp(`${controllerFunc}: .+: \\w+ \\{`, 'g')
    const returntypeRegexArray = controller.match(returnTypeRegex) as RegExpMatchArray
    const returnType = returntypeRegexArray[0].replace(/(\w+: .+:|\{)/g, '')
    console.log(returnType)
    if (isQuery) {
      queryRoutes += `  ${m[0]}\n`
      return
    }
    mutationRoutes += `  ${m[0]}\n`
  })

  mutationRoutes += '}'
  queryRoutes += '}'
  router = queryRoutes + '\n' + mutationRoutes
  return router
}

const router = `
import { Router } from 'express'
import { ThreadController } from '../controllers/thread'
import { UserLogin } from '../middlewares/UserLogin'

export const ThreadRouter = Router()

ThreadRouter.get('/getAll', ThreadController.getAll)
ThreadRouter.post('/create', UserLogin, ThreadController.createThread)
ThreadRouter.patch('/update', UserLogin, ThreadController.update)
ThreadRouter.delete('/delete', UserLogin, ThreadController.delete)`

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

convertRouterToGraphQLTypes(router, controller)
