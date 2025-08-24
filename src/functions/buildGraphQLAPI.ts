import fs from 'node:fs'
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

    const graphQLType = '  ' + typeName + ': ' + returnType + '\n'

    if (isQuery) {
      queryRoutes += graphQLType
      return
    }
    mutationRoutes += graphQLType
  })

  mutationRoutes += '}'
  queryRoutes += '}'
  router = queryRoutes + '\n' + mutationRoutes
  return router
}
