import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeTypeDefs } from '@graphql-tools/merge'
import path from 'node:path'

const arrayTypeDefs = loadFilesSync(path.join('.', '**', '*.gql'))
export default mergeTypeDefs(arrayTypeDefs)
