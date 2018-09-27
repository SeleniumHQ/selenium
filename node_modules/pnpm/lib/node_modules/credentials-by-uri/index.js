'use strict'
var assert = require('assert')

var toNerfDart = require('nerf-dart')

module.exports = getCredentialsByURI

function getCredentialsByURI (uri, config) {
  assert(uri && typeof uri === 'string', 'registry URL is required')
  var nerfed = toNerfDart(uri)
  var defnerf = toNerfDart(config['registry'])

  // hidden class micro-optimization
  var c = {
    scope: nerfed,
    token: undefined,
    password: undefined,
    username: undefined,
    email: undefined,
    auth: undefined,
    alwaysAuth: undefined
  }

  // used to override scope matching for tokens as well as legacy auth
  if (config[nerfed + ':always-auth'] !== undefined) {
    var val = config[nerfed + ':always-auth']
    c.alwaysAuth = val === 'false' ? false : !!val
  } else if (config['always-auth'] !== undefined) {
    c.alwaysAuth = config['always-auth']
  }

  if (config[nerfed + ':_authToken']) {
    c.token = config[nerfed + ':_authToken']
    // the bearer token is enough, don't confuse things
    return c
  }

  // Handle the old-style _auth=<base64> style for the default
  // registry, if set.
  var authDef = config['_auth']
  var userDef = config['username']
  var passDef = config['_password']
  if (authDef && !(userDef && passDef)) {
    authDef = new Buffer(authDef, 'base64').toString()
    authDef = authDef.split(':')
    userDef = authDef.shift()
    passDef = authDef.join(':')
  }

  if (config[nerfed + ':_password']) {
    c.password = new Buffer(config[nerfed + ':_password'], 'base64').toString('utf8')
  } else if (nerfed === defnerf && passDef) {
    c.password = passDef
  }

  if (config[nerfed + ':username']) {
    c.username = config[nerfed + ':username']
  } else if (nerfed === defnerf && userDef) {
    c.username = userDef
  }

  if (config[nerfed + ':email']) {
    c.email = config[nerfed + ':email']
  } else if (config['email']) {
    c.email = config['email']
  }

  if (c.username && c.password) {
    c.auth = new Buffer(c.username + ':' + c.password).toString('base64')
  }

  return c
}
