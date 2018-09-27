const vfile = require('to-vfile')
const remark = require('remark')
const parser = require('remark-github')
const { resolve } = require('path')
const { blue, yellow } = require('chalk')

const read = file => vfile.readSync(file)

const write = data => vfile.writeSync(data)

const linkify = (filename, options = {}) => {
  let isEmpty = false

  remark()
    .use(parser, options)
    .process(read(filename), (err, data) => {
      if (err) {
        throw err
      }

      if (String(data).length === 1) {
        isEmpty = true
      } else if (String(data).length > 1) {
        write({ path: filename, contents: String(data) })
        isEmpty = false
      }
    })

  return isEmpty
}

module.exports = linkify
