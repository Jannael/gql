import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeTypeDefs } from '@graphql-tools/merge'

const arrayTypeDefs = loadFilesSync('./**/*.gql')

export default mergeTypeDefs(arrayTypeDefs)
