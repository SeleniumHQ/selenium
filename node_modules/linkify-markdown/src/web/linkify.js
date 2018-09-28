const remark = require('remark')
const parser = require('remark-github')

const resolveOptions = (options = {}) => {
  return {
    mentionStrong: options.strong || false,
    repository: options.repository || ''
  }
}

const linkify = (source, options = {}) => {
  let output = ''

  remark()
    .use(parser, resolveOptions(options))
    .process(String(source), (err, contents) => {
      if (err) {
        throw err
      }

      output = String(contents)
    })

  return output
}

module.exports = { linkify }
