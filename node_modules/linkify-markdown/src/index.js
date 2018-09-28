#!/usr/bin/env node

const meow = require('meow')
const chalk = require('chalk')
const mime = require('mime-types')
const fs = require('fs')
const { resolve } = require('path')

const linkify = require('./linkify')

const yellow = chalk.yellow
const cyan = chalk.cyan
const red = chalk.red

const log = (...args) => console.log(...args)

const printFileNames = files => {
  files.forEach((file, i) => {
    i++
    log(yellow(`${i}. ${file}`))
  })
  log()
}

const messages = {
  single: file =>
    log(cyan(`\n✅  Done adding references to your file ${yellow(file)}\n`)),
  multiple: (files, skippedFiles) => {
    log(
      cyan(
        `\n✅  Done adding references to ${files.length} ${files.length > 1
          ? 'files:'
          : 'file: '}\n`
      )
    )

    printFileNames(files.filter(file => !skippedFiles.includes(file)))

    if (skippedFiles.length === 1) {
      log(cyan(`Skipped processing the file ${yellow(skippedFiles[0])}\n`))
    } else if (skippedFiles.length > 1) {
      log(cyan('Skipped processing the files 👇\n'))
      printFileNames(skippedFiles)
    }
  },
  error: () =>
    log(
      red(
        `\nOops! You didn't provide a file name or a directory name. Type ${yellow(
          'linkify --help'
        )} for help.\n`
      )
    ),
  empty: data =>
    log(
      cyan(`\nHmm... seems like the file ${yellow(data.input[0])} is empty.\n`)
    ),
  invalidType: () =>
    log(
      red(
        `\nThe provided file is not a ${yellow('markdown')} file. Type ${yellow(
          'linkify --help'
        )} for help. \n`
      )
    ),
  emptyDir: data =>
    log(
      cyan(
        `\nHmm... seems like the directory ${yellow(data.input[0])} is empty.\n`
      )
    )
}

const isMarkdownFile = file => mime.lookup(file) === 'text/markdown'

const processMultipleFiles = (files, options = {}) => {
  let isEmpty = false
  let skippedFiles = []
  let processedFiles = []

  files.forEach(file => {
    isEmpty = linkify(
      options.isDir ? `${options.name}/${file}` : file,
      getOptions()
    )

    if (isEmpty) {
      skippedFiles.push(file)
    } else {
      processedFiles.push(file)
    }
  })

  return {
    processedFiles,
    skippedFiles
  }
}

const processSingleFile = data => {
  if (isMarkdownFile(data.input[0])) {
    const isEmpty = linkify(data.input[0], getOptions())

    !isEmpty ? messages.single(data.input[0]) : messages.empty(data)
  } else {
    messages.invalidType()
    return
  }
}

const processSeqFiles = data => {
  const { processedFiles, skippedFiles } = processMultipleFiles(data.input, {})
  messages.multiple(processedFiles, skippedFiles)
}

const processFilesInDir = data => {
  const files = fs.readdirSync(data.input[0])
  const { processedFiles, skippedFiles } = processMultipleFiles(files, {
    isDir: true,
    name: data.input[0]
  })

  messages.multiple(processedFiles, skippedFiles)
}

const template = `
Usage
  $ ${yellow('linkify <file 1> <file 2> ... <file n>')}
  $ ${yellow('linkify -d <directory_name>')}

  For file per options, use ${yellow(
    'linkify <filename> options'
  )}. For example - You only want to use strong option for some files.

Options
  --strong, -s  Wrap the @mentions in **strong nodes**
  --dir, -d Process the whole directory of markdown files

Example
  $ ${yellow('linkify README.md --strong')} or ${yellow('linkify README.md -s')}
  $ ${yellow('linkify -d directory/')}
`

const cli = meow(template, {
  flags: {
    strong: {
      type: 'boolean',
      alias: 's'
    },
    repo: {
      type: 'string',
      alias: 'r'
    },
    dir: {
      type: 'boolean',
      alias: 'd'
    }
  }
})

const data = { input: cli.input, flags: cli.flags }

const noFileOrDir = data.input.length === 0

const isSingleFile =
  data.input.length === 1 && (!data.flags.d || !data.flags.dir)

const hasMultipleFiles =
  (!data.flags.d || !data.flags.dir) && data.input.length > 1

const isDirectory = (data.flags.d || data.flags.dir) && data.input.length === 1

const isEmptyDir = data => fs.readdirSync(data.input[0]).length === 0

// Get the file options
const getOptions = () => {
  const { flags } = data
  let options = {
    mentionStrong: false
  }

  if (flags.s || flags.strong) {
    options.mentionStrong = true
  }

  if (flags.r || flags.repo) {
    if (flags.repo.length > 0 || flags.r.length > 0) {
      options.repository = flags.repo || flags.r
    }
  }

  return options
}

if (noFileOrDir) {
  messages.error()
  return
}

if (isSingleFile) {
  processSingleFile(data)
} else if (hasMultipleFiles) {
  processSeqFiles(data)
} else if (isDirectory) {
  !isEmptyDir(data) ? processFilesInDir(data) : messages.emptyDir(data)
}
