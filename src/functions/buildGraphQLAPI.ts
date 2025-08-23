function convertTsInterfaceToGraphQLType (tsInterface: string): string {
  tsInterface = tsInterface.replace('interface', 'type')
  tsInterface = tsInterface.replace('number', ' Int')

  tsInterface = tsInterface.replace(/ string/g, ' String')
  tsInterface = tsInterface.replace(/ boolean/g, ' Boolean')

  // now lets check for arrays we want to change string[] => [string]
  tsInterface = tsInterface.replace(/\b(\w+)\[\]/g, (_, type: string) => `[${type}]`)

  // field?: string => field: string!
  tsInterface.matchAll(/\b\w+:\s*\[?\w+\]?/g)
    .forEach(m => {
      tsInterface = tsInterface.replace(m[0], `${m[0]}!`)
    })

  tsInterface = tsInterface.replace('?', '')
  return tsInterface
}

const tsInterface = `
interface User {
  id: number
  name: string
  email?: string
  tags: string[]
  isActive: boolean
}
`

console.log(convertTsInterfaceToGraphQLType(tsInterface))
