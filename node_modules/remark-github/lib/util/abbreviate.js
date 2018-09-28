'use strict'

module.exports = abbreviate

var MIN_SHA_LENGTH = 7

/* Abbreviate a SHA. */
function abbreviate(sha) {
  return sha.slice(0, MIN_SHA_LENGTH)
}
