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
