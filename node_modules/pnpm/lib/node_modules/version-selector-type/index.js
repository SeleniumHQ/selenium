'use strict'
const semver = require('semver')

module.exports = (selector) => versionSelectorType(true, selector)
module.exports.strict = (selector) => versionSelectorType(false, selector)

function versionSelectorType (loose, selector) {
  if (typeof selector !== 'string') {
    throw new TypeError('`selector` should be a string')
  }
  let normalizedSelector
  if (normalizedSelector = semver.valid(selector, loose)) {
    return {
      normalized: normalizedSelector,
      type: 'version',
    }
  }
  if (normalizedSelector = semver.validRange(selector, loose)) {
    return {
      normalized: normalizedSelector,
      type: 'range',
    }
  }
  if (encodeURIComponent(selector) === selector) {
    return {
      normalized: selector,
      type: 'tag',
    }
  }
  return null
}
