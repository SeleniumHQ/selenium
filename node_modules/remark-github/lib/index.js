'use strict'

var visit = require('unist-util-visit')
var parse = require('./util/parse-link')
var abbr = require('./util/abbreviate')
var repo = require('./tokenizer/repo')
var mention = require('./tokenizer/mention')
var issue = require('./tokenizer/issue')
var hash = require('./tokenizer/hash')

module.exports = github

/* Hide process use from browserify. */
var proc = typeof global !== 'undefined' && global.process

/* Load `fs` and `path` if available. */
var fs
var path

try {
  fs = require('fs')
  path = require('path')
} catch (err) {}

/* Username may only contain alphanumeric characters or
 * single hyphens, and cannot begin or end with a hyphen*.
 *
 * \* That is: until https://github.com/remarkjs/remark-github/issues/13.
 *
 * `PERSON` is either a user or an organization, but also
 * matches a team:
 *
 *   https://github.com/blog/1121-introducing-team-mentions
 */
var NAME = '(?:[a-z0-9]{1,2}|[a-z0-9][a-z0-9-]{1,38})'
var USER = '(' + NAME + ')'
var PROJECT = '((?:[_A-Za-z0-9-]|\\.git[_A-Za-z0-9-]|\\.(?!git))+)'
var REPO = USER + '\\/' + PROJECT

/* Match a repo from a git / github URL. */
var REPOSITORY = new RegExp(
  '(?:^|/(?:repos/)?)' + REPO + '(?=\\.git|[\\/#@]|$)',
  'i'
)

function github(options) {
  var settings = options || {}
  var repository = settings.repository
  var proto = this.Parser.prototype
  var scope = proto.inlineTokenizers
  var methods = proto.inlineMethods
  var pack

  /* Get the repository from `package.json`. */
  if (!repository) {
    try {
      pack = JSON.parse(fs.readFileSync(path.join(proc.cwd(), 'package.json')))
    } catch (err) {
      pack = {}
    }

    if (pack.repository) {
      repository = pack.repository.url || pack.repository
    } else {
      repository = ''
    }
  }

  /* Parse the URL: See the tests for all possible kinds. */
  repository = REPOSITORY.exec(repository)

  REPOSITORY.lastIndex = 0

  if (!repository) {
    throw new Error('Missing `repository` field in `options`')
  }

  repository = {user: repository[1], project: repository[2]}

  /* Add helpers. */
  proto.githubRepo = repository
  proto.githubOptions = settings

  /* Add tokenizers to the `Parser`. */
  scope.mention = mention
  scope.issue = issue
  scope.hash = hash
  scope.repoReference = repo

  /* Specify order (just before `inlineText`). */
  methods.splice(
    methods.indexOf('inlineText'),
    0,
    'mention',
    'issue',
    'hash',
    'repoReference'
  )

  return transformer

  function transformer(tree) {
    visit(tree, 'link', visitor)
  }

  function visitor(node) {
    var link = parse(node)
    var children
    var base
    var comment

    if (!link) {
      return
    }

    comment = link.comment ? ' (comment)' : ''

    if (link.project !== repository.project) {
      base = link.user + '/' + link.project
    } else if (link.user === repository.user) {
      base = ''
    } else {
      base = link.user
    }

    if (link.page === parse.COMMIT) {
      children = []

      if (base) {
        children.push({type: 'text', value: base + '@'})
      }

      children.push({type: 'inlineCode', value: abbr(link.reference)})

      if (link.comment) {
        children.push({type: 'text', value: comment})
      }
    } else {
      base += '#'
      children = [{type: 'text', value: base + abbr(link.reference) + comment}]
    }

    node.children = children
  }
}
