var tape = require('tape')
var chalk = require('chalk')
var ansiSplit = require('./')

tape('basic', function (t) {
  t.same(ansiSplit('hello world'), ['hello world'])

  t.same(ansiSplit(chalk.red('hello') + ' world'), [
    '',
    '\u001b[31m',
    'hello',
    '\u001b[39m',
    ' world'
  ])

  t.same(ansiSplit(chalk.red.bold('hello') + ' ' + chalk.green('world')), [
    '',
    '\u001b[31m\u001b[1m',
    'hello',
    '\u001b[22m\u001b[39m',
    ' ',
    '\u001b[32m',
    'world',
    '\u001b[39m',
    ''
  ])

  t.end()
})
