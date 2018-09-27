var ansiSplit = require('./')
var chalk = require('chalk')

// prints ['hello world']
console.log(ansiSplit('hello world'))

// prints ['', '\u001b[31m', 'hello', '\u001b[39m', ' world']
console.log(ansiSplit(chalk.red('hello') + ' world'))

// prints ['', '\u001b[31m\u001b[1m', 'hello', '\u001b[22m\u001b[39m', ' ', '\u001b[32m', 'world', '\u001b[39m', '']
console.log(ansiSplit(chalk.red.bold('hello') + ' ' + chalk.green('world')))
