const bzipMaybe = require('bzip2-maybe')
const gunzipMaybe = require('gunzip-maybe')
const pumpify = require('pumpify')


module.exports = function () {
  return pumpify(bzipMaybe(), gunzipMaybe())
}
