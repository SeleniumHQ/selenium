'use strict'

const fs = require('graceful-fs')
const pify = require('pify')
const stripBom = require('strip-bom')
const yaml = require('js-yaml')

const parse = data => yaml.safeLoad(stripBom(data))

module.exports = fp => pify(fs.readFile)(fp, 'utf8').then(data => parse(data))
module.exports.sync = fp => parse(fs.readFileSync(fp, 'utf8'))
