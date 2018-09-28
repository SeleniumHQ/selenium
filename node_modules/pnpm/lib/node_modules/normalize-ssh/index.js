'use strict'
const parseUrl = require('parse-url')
const isSsh = require('is-ssh')

module.exports = function (ssh) {
  if (!isSsh(ssh)) throw new Error(`Invalid SSH URL - ${ssh}`)
  const parsedUrl = parseUrl(ssh)
  const port = parsedUrl.port || '22'
  return `${parsedUrl.protocol}://${parsedUrl.user}@${parsedUrl.resource}:${port}${parsedUrl.pathname}`
}
