#!/usr/bin/env node
import { program } from 'commander'
import path from 'node:path'
import { copyFolderSync } from '../functions/copyFolderSync'
import { exec } from 'node:child_process'

program
  .option('-i, --init', 'creates a template in the current path')
  .option('-o, --output <char>', 'path of the project')

program.parse()

const options = program.opts()

if (options.init === true) {
  const destFolder = options.output ?? process.cwd()
  const initProjectCommand = `cd "${path.join(destFolder, 'project')}" && pnpm i`

  copyFolderSync(path.join('src', 'templates', 'project-graphql'), destFolder)

  console.log(initProjectCommand)
  exec(initProjectCommand, (error, stdout, stderr) => {
    if (error != null) {
      console.error(`Error: ${error.message}`)
      return
    }
    if (stderr !== '') {
      console.error(`stderr: ${stderr}`)
      return
    }
    console.log(`stdout:\n${stdout}`)
    console.log('template created')
  })
}
