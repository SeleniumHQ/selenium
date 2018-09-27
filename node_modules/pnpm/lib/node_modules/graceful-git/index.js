'use strict'
const execa = require('execa')
const retry = require('retry')

const execGit = execa.bind(null, 'git')

const RETRY_OPTIONS = {
  retries: 3,
  minTimeout: 1 * 1000,
  maxTimeout: 10 * 1000,
  randomize: true,
}

module.exports = (args, opts) => {
  opts = opts || {}
  const operation = retry.operation(Object.assign({}, RETRY_OPTIONS, opts))
  return new Promise((resolve, reject) => {
    operation.attempt(currentAttempt => {
      execGit(args, {cwd: opts.cwd || process.cwd()})
        .then(resolve)
        .catch(err => {
          if (operation.retry(err)) {
            return
          }
          reject(operation.mainError())
        })
    })
  })
}
