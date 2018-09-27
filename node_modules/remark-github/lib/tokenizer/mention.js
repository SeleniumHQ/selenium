'use strict'

var locator = require('../locator/mention')
var gh = require('../util/gh')
var usernameEnd = require('../util/username-end')

module.exports = mention

mention.locator = locator
mention.notInLink = true

var own = {}.hasOwnProperty

var C_SLASH = '/'
var C_AT = '@'

var CC_SLASH = C_SLASH.charCodeAt(0)
var CC_AT = C_AT.charCodeAt(0)

/* Map of overwrites for at-mentions.
 * GitHub does some fancy stuff with `@mention`, by linking
 * it to their blog-post introducing the feature.
 * To my knowledge, there are no other magical usernames. */
var OVERWRITES = {
  mention: 'blog/821',
  mentions: 'blog/821'
}

/* Tokenise a mention. */
function mention(eat, value, silent) {
  var self = this
  var index
  var subvalue
  var handle
  var href
  var node
  var exit
  var now

  if (value.charCodeAt(0) !== CC_AT) {
    return
  }

  index = usernameEnd(value, 1)

  if (index === -1) {
    return
  }

  /* Support teams. */
  if (value.charCodeAt(index) === CC_SLASH) {
    index = usernameEnd(value, index + 1)

    if (index === -1) {
      return
    }
  }

  /* istanbul ignore if - maybe used by plug-ins */
  if (silent) {
    return true
  }

  now = eat.now()
  handle = value.slice(1, index)
  subvalue = C_AT + handle

  href = gh()
  href += own.call(OVERWRITES, handle) ? OVERWRITES[handle] : handle

  now.column++

  exit = self.enterLink()

  node = eat(subvalue)({
    type: 'link',
    title: null,
    url: href,
    children: self.tokenizeInline(subvalue, now)
  })

  exit()

  if (self.githubOptions.mentionStrong !== false) {
    node.children = [{type: 'strong', children: node.children}]
  }

  return node
}
