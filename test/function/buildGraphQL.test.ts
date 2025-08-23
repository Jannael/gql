import { convertTsInterfaceToGraphQLType } from '../../src/functions/buildGraphQLAPI'

describe('function', () => {
  test('convertTsInterfaceToGraphQLType', () => {
    const tsInterface = `
      interface User {
        id: number
        name: string
        email?: string
        tags: string[]
        isActive: boolean
      }
    `

    const result = convertTsInterfaceToGraphQLType(tsInterface)

    expect(result).toBe(`
      type User {
        id:  Int!
        name: String!
        email: String
        tags: [String]!
        isActive: Boolean!
      }
    `)
  })
})
