'use strict'

module.exports = function (registry) {
  if (typeof registry !== 'string') {
    throw new TypeError('`registry` should be a string')
  }
  if (registry[registry.length - 1] === '/') return registry
  return `${registry}/`
}
