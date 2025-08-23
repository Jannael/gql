#!/usr/bin/env node

import { program } from 'commander'
import fs from 'node:fs'
import path from 'node:path'

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

function copyFolderSync (src: string, dest: string): void {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyFolderSync(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}
