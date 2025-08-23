#!/usr/bin/env node
import { program } from 'commander'
import path from 'node:path'
import { copyFolderSync } from '../functions/copyFolderSync'

program
  .option('-i, --init', 'creates a template in the current path')
  .option('-o, --output <char>', 'path of the project')

program.parse()

const options = program.opts()

if (options.init === true) {
  const destFolder = options.output ?? __dirname
  copyFolderSync(path.join('src', 'templates', 'graphQL'), destFolder)
  console.log('template copy to your proyect')
}
