import { convertTsInterfaceToGraphQLType } from '../../src/functions/buildGraphQLAPI'

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
})
