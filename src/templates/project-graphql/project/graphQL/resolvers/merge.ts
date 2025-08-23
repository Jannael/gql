import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeResolvers } from '@graphql-tools/merge'
import path from 'node:path'

const resolversArray = loadFilesSync(path.join('.', '**', '*.ts'))
export default mergeResolvers(resolversArray)
