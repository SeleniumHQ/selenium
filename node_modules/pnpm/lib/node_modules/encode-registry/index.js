'use strict'
const assert = require('assert')
const url = require('url')
const mem = require('mem')

module.exports = mem(encodeRegistry)

function encodeRegistry (registry) {
  assert(registry, '`registry` is required')
  assert(typeof registry === 'string', '`registry` should be a string')
  const host = getHost(registry)
  return escapeHost(host)
}

function escapeHost (host) {
  return host.replace(':', '+')
}

function getHost (rawUrl) {
  const urlObj = url.parse(rawUrl)
  if (!urlObj || !urlObj.host) {
    throw new Error(`Couldn't get host from ${rawUrl}`)
  }
  return urlObj.host
}
