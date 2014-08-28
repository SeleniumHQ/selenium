// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * @fileoverview
 * HTML tag filtering, and balancing.
 * A more user-friendly API is exposed via {@code goog.labs.html.sanitizer}.
 * @visibility {//visibility:private}
 */


goog.provide('goog.labs.html.scrubber');

goog.require('goog.array');
goog.require('goog.dom.tags');
goog.require('goog.labs.html.attributeRewriterPresubmitWorkaround');
goog.require('goog.string');


/**
 * Replaces tags not on the white-list with empty text nodes, dropping all
 * attributes, and drops other non-text nodes such as comments.
 *
 * @param {!Object.<string, boolean>} tagWhitelist a set of lower-case tag names
 *    following the convention established by {@link goog.object.createSet}.
 * @param {!Object.<string, Object.<string, goog.labs.html.AttributeRewriter>>}
 *        attrWhitelist
 *    maps lower-case tag names and the special string {@code "*"} to functions
 *    from decoded attribute values to sanitized values or {@code null} to
 *    indicate that the attribute is not allowed with that value.
 *
 *    For example, if {@code attrWhitelist['a']['href']} is defined then it
 *    is used to sanitize the value of the link's URL.
 *
 *    If {@code attrWhitelist['*']['id']} is defined, and
 *    {@code attrWhitelist['div']['id']} is not, then the former is used to
 *    sanitize any {@code id} attribute on a {@code <div>} element.
 * @param {string} html a string of HTML
 * @return {string} the input but with potentially dangerous tokens removed.
 */
goog.labs.html.scrubber.scrub = function(tagWhitelist, attrWhitelist, html) {
  return goog.labs.html.scrubber.render_(
      goog.labs.html.scrubber.balance_(
          goog.labs.html.scrubber.filter_(
              tagWhitelist,
              attrWhitelist,
              goog.labs.html.scrubber.lex_(html))));
};


/**
 * Balances tags in trusted HTML.
 * @param {string} html a string of HTML
 * @return {string} the input but with an end-tag for each non-void start tag
 *     and only for non-void start tags, and with start and end tags nesting
 *     properly.
 */
goog.labs.html.scrubber.balance = function(html) {
  return goog.labs.html.scrubber.render_(
      goog.labs.html.scrubber.balance_(
          goog.labs.html.scrubber.lex_(html)));
};


/** Character code constant for {@code '<'}.  @private */
goog.labs.html.scrubber.CC_LT_ = '<'.charCodeAt(0);


/** Character code constant for {@code '!'}.  @private */
goog.labs.html.scrubber.CC_BANG_ = '!'.charCodeAt(0);


/** Character code constant for {@code '/'}.  @private */
goog.labs.html.scrubber.CC_SLASH_ = '/'.charCodeAt(0);


/** Character code constant for {@code '?'}.  @private */
goog.labs.html.scrubber.CC_QMARK_ = '?'.charCodeAt(0);


/**
 * Matches content following a tag name or attribute value, and before the
 * beginning of the next attribute value.
 * @private
 */
goog.labs.html.scrubber.ATTR_VALUE_PRECEDER_ = '[^=>]+';


/** @private */
goog.labs.html.scrubber.UNQUOTED_ATTR_VALUE_ = '(?:[^"\'\\s>][^\\s>]*)';


/** @private */
goog.labs.html.scrubber.DOUBLE_QUOTED_ATTR_VALUE_ = '(?:"[^"]*"?)';


/** @private */
goog.labs.html.scrubber.SINGLE_QUOTED_ATTR_VALUE_ = "(?:'[^']*'?)";


/**
 * Matches the equals-sign and any attribute value following it, but does not
 * capture any {@code >} that would close the tag.
 * @private
 */
goog.labs.html.scrubber.ATTR_VALUE_ = '=\\s*(?:' +
    goog.labs.html.scrubber.UNQUOTED_ATTR_VALUE_ +
    '|' + goog.labs.html.scrubber.DOUBLE_QUOTED_ATTR_VALUE_ +
    '|' + goog.labs.html.scrubber.SINGLE_QUOTED_ATTR_VALUE_ + ')?';


/**
 * The body of a tag between the end of the name and the closing {@code >}
 * if any.
 * @private
 */
goog.labs.html.scrubber.ATTRS_ =
    '(?:' + goog.labs.html.scrubber.ATTR_VALUE_PRECEDER_ +
    '|' + goog.labs.html.scrubber.ATTR_VALUE_ + ')*';


/**
 * A character that continues a tag name as defined at
 * http://www.w3.org/html/wg/drafts/html/master/syntax.html#tag-name-state
 * @private
 */
goog.labs.html.scrubber.TAG_NAME_CHAR_ = '[^\t\f\n />]';


/**
 * Matches when the next character cannot continue a tag name.
 * @private
 */
goog.labs.html.scrubber.BREAK_ =
    '(?!' + goog.labs.html.scrubber.TAG_NAME_CHAR_ + ')';


/**
 * Matches the open tag and body of a special element :
 * one whose body cannot contain nested elements so uses special parsing rules.
 * It does not include the end tag.
 * @private
 */
goog.labs.html.scrubber.SPECIAL_ELEMENT_ = '<(?:' +
    // Special tag name.
    '(iframe|script|style|textarea|title|xmp)' +
    // End of tag name
    goog.labs.html.scrubber.BREAK_ +
    // Attributes
    goog.labs.html.scrubber.ATTRS_ + '>' +
    // Element content includes non '<' characters, and
    // '<' that don't start a matching end tag.
    // This uses a back-reference to the tag name to determine whether
    // the tag names match.
    // Since matching is case-insensitive, this can only be used in
    // a case-insensitive regular expression.
    // JavaScript does not treat Turkish dotted I's as equivalent to their
    // ASCII equivalents.
    '(?:[^<]|<(?!/\\1' + goog.labs.html.scrubber.BREAK_ + '))*' +
    ')';


/**
 * Regexp pattern for an HTML tag.
 * @private
 */
goog.labs.html.scrubber.TAG_ =
    '<[/]?[a-z]' + goog.labs.html.scrubber.TAG_NAME_CHAR_ + '*' +
    goog.labs.html.scrubber.ATTRS_ + '>?';


/**
 * Regexp pattern for an HTML text node.
 * @private
 */
goog.labs.html.scrubber.TEXT_NODE_ = '(?:[^<]|<(?![a-z]|[?!/]))+';


/**
 * Matches HTML comments including HTML 5 "bogus comments" of the form
 * {@code <!...>} or {@code <?...>} or {@code </...>}.
 * @private
 */
goog.labs.html.scrubber.COMMENT_ =
    '<!--(?:[^\\-]|-+(?![\\->]))*(?:-(?:->?)?)?' +
    '|<[!?/][^>]*>?';


/**
 * Regexp pattern for an HTML token after a doctype.
 * Special elements introduces a capturing group for use with a
 * back-reference.
 * @private
 */
goog.labs.html.scrubber.HTML_TOKENS_RE_ = new RegExp(
    '(?:' + goog.labs.html.scrubber.TEXT_NODE_ +
    '|' + goog.labs.html.scrubber.SPECIAL_ELEMENT_ +
    '|' + goog.labs.html.scrubber.TAG_ +
    '|' + goog.labs.html.scrubber.COMMENT_ + ')',
    'ig');


/**
 * An HTML tag which captures the name in group 1,
 * and any attributes in group 2.
 * @private
 */
goog.labs.html.scrubber.TAG_RE_ = new RegExp(
    '<[/]?([a-z]' + goog.labs.html.scrubber.TAG_NAME_CHAR_ + '*)' +
    '(' + goog.labs.html.scrubber.ATTRS_ + ')>?',
    'i');


/**
 * A global matcher that separates attributes out of the tag body cruft.
 * @private
 */
goog.labs.html.scrubber.ATTRS_RE_ = new RegExp(
    '[^=\\s]+\\s*(?:' + goog.labs.html.scrubber.ATTR_VALUE_ + ')?', 'ig');


/**
 * Returns an array of HTML tokens including tags, text nodes and comments.
 * "Special" elements, like {@code <script>...</script>} whose bodies cannot
 * include nested elements, are returned as single tokens.
 *
 * @param {string} html a string of HTML
 * @return {!Array.<string>}
 * @private
 */
goog.labs.html.scrubber.lex_ = function(html) {
  return ('' + html).match(goog.labs.html.scrubber.HTML_TOKENS_RE_) || [];
};


/**
 * Replaces tags not on the white-list with empty text nodes, dropping all
 * attributes, and drops other non-text nodes such as comments.
 *
 * @param {!Object.<string, boolean>} tagWhitelist a set of lower-case tag names
 *    following the convention established by {@link goog.object.createSet}.
 * @param {!Object.<string, Object.<string, goog.labs.html.AttributeRewriter>>
 *        } attrWhitelist
 *    maps lower-case tag names and the special string {@code "*"} to functions
 *    from decoded attribute values to sanitized values or {@code null} to
 *    indicate that the attribute is not allowed with that value.
 *
 *    For example, if {@code attrWhitelist['a']['href']} is defined then it is
 *    used to sanitize the value of the link's URL.
 *
 *    If {@code attrWhitelist['*']['id']} is defined, and
 *    {@code attrWhitelist['div']['id']} is not, then the former is used to
 *    sanitize any {@code id} attribute on a {@code <div>} element.
 * @param {!Array.<string>} htmlTokens an array of HTML tokens as returned by
 *    {@link goog.labs.html.scrubber.lex_}.
 * @return {!Array.<string>} the input array modified in place to have some
 *    tokens removed.
 * @private
 */
goog.labs.html.scrubber.filter_ = function(
    tagWhitelist, attrWhitelist, htmlTokens) {
  var genericAttrWhitelist = attrWhitelist['*'];
  for (var i = 0, n = htmlTokens.length; i < n; ++i) {
    var htmlToken = htmlTokens[i];
    if (htmlToken.charCodeAt(0) !== goog.labs.html.scrubber.CC_LT_) {
      // Definitely not a tag
      continue;
    }

    var tag = htmlToken.match(goog.labs.html.scrubber.TAG_RE_);
    if (tag) {
      var lowerCaseTagName = tag[1].toLowerCase();
      var isCloseTag =
          htmlToken.charCodeAt(1) === goog.labs.html.scrubber.CC_SLASH_;
      var attrs = '';
      if (!isCloseTag && tag[2]) {
        var tagSpecificAttrWhitelist =
            /** @type {Object.<string, goog.labs.html.AttributeRewriter>} */ (
            goog.labs.html.scrubber.readOwnProperty_(
                attrWhitelist, lowerCaseTagName));
        if (genericAttrWhitelist || tagSpecificAttrWhitelist) {
          attrs = goog.labs.html.scrubber.filterAttrs_(
              tag[2], genericAttrWhitelist, tagSpecificAttrWhitelist);
        }
      }
      var specialContent = htmlToken.substring(tag[0].length);
      htmlTokens[i] =
          (tagWhitelist[lowerCaseTagName] === true) ?
          (
              (isCloseTag ? '</' : '<') + lowerCaseTagName + attrs + '>' +
              specialContent
          ) :
          '';
    } else if (htmlToken.length > 1) {
      switch (htmlToken.charCodeAt(1)) {
        case goog.labs.html.scrubber.CC_BANG_:
        case goog.labs.html.scrubber.CC_SLASH_:
        case goog.labs.html.scrubber.CC_QMARK_:
          htmlTokens[i] = '';  // Elide comments.
          break;
        default:
          // Otherwise, token is just a text node that starts with '<'.
          // Speed up later passes by normalizing the text node.
          htmlTokens[i] = htmlTokens[i].replace(/</g, '&lt;');
      }
    }
  }
  return htmlTokens;
};


/**
 * Parses attribute names and values out of a tag body and applies the attribute
 * white-list to produce a tag body containing only safe attributes.
 *
 * @param {string} attrsText the text of a tag between the end of the tag name
 *   and the beginning of the tag end marker, so {@code " foo bar='baz'"} for
 *   the tag {@code <tag foo bar='baz'/>}.
 * @param {Object.<string, goog.labs.html.AttributeRewriter>}
 *   genericAttrWhitelist
 *   a whitelist of attribute transformations for attributes that are allowed
 *   on any element.
 * @param {Object.<string, goog.labs.html.AttributeRewriter>}
 *   tagSpecificAttrWhitelist
 *   a whitelist of attribute transformations for attributes that are allowed
 *   on the element started by the tag whose body is {@code tagBody}.
 * @return {string} a tag-body that consists only of safe attributes.
 * @private
 */
goog.labs.html.scrubber.filterAttrs_ =
    function(attrsText, genericAttrWhitelist, tagSpecificAttrWhitelist) {
  var attrs = attrsText.match(goog.labs.html.scrubber.ATTRS_RE_);
  var nAttrs = attrs ? attrs.length : 0;
  var safeAttrs = '';
  for (var i = 0; i < nAttrs; ++i) {
    var attr = attrs[i];
    var eq = attr.indexOf('=');
    var name, value;
    if (eq >= 0) {
      name = goog.string.trim(attr.substr(0, eq));
      value = goog.string.stripQuotes(
          goog.string.trim(attr.substr(eq + 1)), '"\'');
    } else {
      name = value = attr;
    }
    name = name.toLowerCase();
    var rewriter = /** @type {?goog.labs.html.AttributeRewriter} */ (
        tagSpecificAttrWhitelist &&
        goog.labs.html.scrubber.readOwnProperty_(
            tagSpecificAttrWhitelist, name) ||
        genericAttrWhitelist &&
        goog.labs.html.scrubber.readOwnProperty_(genericAttrWhitelist, name));
    if (rewriter) {
      var safeValue = rewriter(goog.string.unescapeEntities(value));
      if (safeValue != null) {
        if (safeValue.implementsGoogStringTypedString) {
          safeValue = /** @type {goog.string.TypedString} */
              (safeValue).getTypedStringValue();
        }
        safeValue = String(safeValue);
        if (safeValue.indexOf('`') >= 0) {
          safeValue += ' ';
        }
        safeAttrs +=
            ' ' + name + '="' + goog.string.htmlEscape(safeValue, false) +
            '"';
      }
    }
  }
  return safeAttrs;
};


/**
 * @param {!Object} o the object
 * @param {!string} k a key into o
 * @return {*}
 * @private
 */
goog.labs.html.scrubber.readOwnProperty_ = function(o, k) {
  return Object.prototype.hasOwnProperty.call(o, k) ? o[k] : undefined;
};


/**
 * We limit the nesting limit of balanced HTML to a large but manageable number
 * so that built-in browser limits aren't likely to kick in and undo all our
 * matching of start and end tags.
 * <br>
 * This mitigates the HTML parsing equivalent of stack smashing attacks.
 * <br>
 * Otherwise, crafted inputs like
 * {@code <p><p><p><p>...Ad nauseam...</p></p></p></p>} could exploit
 * browser bugs, and/or undocumented nesting limit recovery code to misnest
 * tags.
 * @private
 * @const
 */
goog.labs.html.scrubber.BALANCE_NESTING_LIMIT_ = 256;


/**
 * Ensures that there are end-tags for all and only for non-void start tags.
 * @param {Array.<string>} htmlTokens an array of HTML tokens as returned by
 *    {@link goog.labs.html.scrubber.lex}.
 * @return {!Array.<string>} the input array modified in place to have some
 *    tokens removed.
 * @private
 */
goog.labs.html.scrubber.balance_ = function(htmlTokens) {
  var openElementStack = [];
  for (var i = 0, n = htmlTokens.length; i < n; ++i) {
    var htmlToken = htmlTokens[i];
    if (htmlToken.charCodeAt(0) !== goog.labs.html.scrubber.CC_LT_) {
      // Definitely not a tag
      continue;
    }
    var tag = htmlToken.match(goog.labs.html.scrubber.TAG_RE_);
    if (tag) {
      var lowerCaseTagName = tag[1].toLowerCase();
      var isCloseTag =
          htmlToken.charCodeAt(1) === goog.labs.html.scrubber.CC_SLASH_;
      // Special case: HTML5 mandates that </br> be treated as <br>.
      if (isCloseTag && lowerCaseTagName == 'br') {
        isCloseTag = false;
        htmlToken = '<br>';
      }
      var isVoidTag = goog.dom.tags.isVoidTag(lowerCaseTagName);
      if (isVoidTag && isCloseTag) {
        htmlTokens[i] = '';
        continue;
      }

      var prefix = '';

      // Insert implied open tags.
      var nOpenElements = openElementStack.length;
      if (nOpenElements && !isCloseTag) {
        var top = openElementStack[nOpenElements - 1];
        var groups = goog.labs.html.scrubber.ELEMENT_GROUPS_[lowerCaseTagName];
        if (groups === undefined) {
          groups = goog.labs.html.scrubber.Group_.INLINE_;
        }
        var canContain = goog.labs.html.scrubber.ELEMENT_CONTENTS_[top];
        if (!(groups & canContain)) {
          var blockContainer = goog.labs.html.scrubber.BLOCK_CONTAINERS_[top];
          if ('string' === typeof blockContainer) {
            var containerCanContain =
                goog.labs.html.scrubber.ELEMENT_CONTENTS_[blockContainer];
            if (containerCanContain & groups) {
              if (nOpenElements <
                  goog.labs.html.scrubber.BALANCE_NESTING_LIMIT_) {
                prefix = '<' + blockContainer + '>';
              }
              openElementStack[nOpenElements] = blockContainer;
              ++nOpenElements;
            }
          }
        }
      }

      // Insert any missing close tags we need.
      var newStackLen = goog.labs.html.scrubber.pickElementsToClose_(
          lowerCaseTagName, isCloseTag, openElementStack);

      var nClosed = nOpenElements - newStackLen;
      if (nClosed) {  // ["p", "a", "b"] -> "</b></a></p>"
        // First, dump anything past the nesting limit.
        if (nOpenElements > goog.labs.html.scrubber.BALANCE_NESTING_LIMIT_) {
          nClosed -= nOpenElements -
              goog.labs.html.scrubber.BALANCE_NESTING_LIMIT_;
          nOpenElements = goog.labs.html.scrubber.BALANCE_NESTING_LIMIT_;
        }
        // Truncate to the new limit, and produce end tags.
        var closeTags = openElementStack.splice(newStackLen, nClosed);
        if (closeTags.length) {
          closeTags.reverse();
          prefix += '</' + closeTags.join('></') + '>';
        }
      }

      // We could do resumption here to handle misnested tags like
      //    <b><i class="c">Foo</b>Bar</i>
      // which is equivalent to
      //    <b><i class="c">Foo</i></b><i class="c">Bar</i>
      // but that requires storing attributes on the open element stack
      // which complicates all the code using it for marginal added value.

      if (isCloseTag) {
        // If the close tag matched an open tag, then the closed section
        // included that tag name.
        htmlTokens[i] = prefix;
      } else {
        if (!isVoidTag) {
          openElementStack[openElementStack.length] = lowerCaseTagName;
        }
        if (openElementStack.length >
            goog.labs.html.scrubber.BALANCE_NESTING_LIMIT_) {
          htmlToken = '';
        }
        htmlTokens[i] = prefix + htmlToken;
      }
    }
  }
  if (openElementStack.length) {
    if (openElementStack.length >
        goog.labs.html.scrubber.BALANCE_NESTING_LIMIT_) {
      openElementStack.length = goog.labs.html.scrubber.BALANCE_NESTING_LIMIT_;
    }
    if (openElementStack.length) {
      openElementStack.reverse();
      htmlTokens[htmlTokens.length] = '</' + openElementStack.join('></') + '>';
    }
  }
  return htmlTokens;
};


/**
 * Normalizes HTML tokens and concatenates them into a string.
 * @param {Array.<string>} htmlTokens an array of HTML tokens as returned by
 *    {@link goog.labs.html.scrubber.lex}.
 * @return {string} a string of HTML.
 * @private
 */
goog.labs.html.scrubber.render_ = function(htmlTokens) {
  for (var i = 0, n = htmlTokens.length; i < n; ++i) {
    var htmlToken = htmlTokens[i];
    if (htmlToken.charCodeAt(0) === goog.labs.html.scrubber.CC_LT_ &&
        goog.labs.html.scrubber.TAG_RE_.test(htmlToken)) {
      // The well-formedness and quotedness of attributes must be ensured by
      // earlier passes.  filter does this.
    } else {
      if (htmlToken.indexOf('<') >= 0) {
        htmlToken = htmlToken.replace(/</g, '&lt;');
      }
      if (htmlToken.indexOf('>') >= 0) {
        htmlToken = htmlToken.replace(/>/g, '&gt;');
      }
      htmlTokens[i] = htmlToken;
    }
  }
  return htmlTokens.join('');
};


/**
 * Groups of elements used to specify containment relationships.
 * @enum {number}
 * @private
 */
goog.labs.html.scrubber.Group_ = {
  BLOCK_: (1 << 0),
  INLINE_: (1 << 1),
  INLINE_MINUS_A_: (1 << 2),
  MIXED_: (1 << 3),
  TABLE_CONTENT_: (1 << 4),
  HEAD_CONTENT_: (1 << 5),
  TOP_CONTENT_: (1 << 6),
  AREA_ELEMENT_: (1 << 7),
  FORM_ELEMENT_: (1 << 8),
  LEGEND_ELEMENT_: (1 << 9),
  LI_ELEMENT_: (1 << 10),
  DL_PART_: (1 << 11),
  P_ELEMENT_: (1 << 12),
  OPTIONS_ELEMENT_: (1 << 13),
  OPTION_ELEMENT_: (1 << 14),
  PARAM_ELEMENT_: (1 << 15),
  TABLE_ELEMENT_: (1 << 16),
  TR_ELEMENT_: (1 << 17),
  TD_ELEMENT_: (1 << 18),
  COL_ELEMENT_: (1 << 19),
  CHARACTER_DATA_: (1 << 20)
};


/**
 * Element scopes limit where close tags can have effects.
 * For example, a table cannot be implicitly closed by a {@code </p>} even if
 * the table appears inside a {@code <p>} because the {@code <table>} element
 * introduces a scope.
 *
 * @enum {number}
 * @private
 */
goog.labs.html.scrubber.Scope_ = {
  COMMON_: (1 << 0),
  BUTTON_: (1 << 1),
  LIST_ITEM_: (1 << 2),
  TABLE_: (1 << 3)
};


/** @const @private */
goog.labs.html.scrubber.ALL_SCOPES_ =
    goog.labs.html.scrubber.Scope_.COMMON_ |
    goog.labs.html.scrubber.Scope_.BUTTON_ |
    goog.labs.html.scrubber.Scope_.LIST_ITEM_ |
    goog.labs.html.scrubber.Scope_.TABLE_;


/**
 * Picks which open HTML elements to close.
 *
 * @param {string}         lowerCaseTagName The name of the tag.
 * @param {boolean}        isCloseTag       True for a {@code </tagname>} tag.
 * @param {Array.<string>} openElementStack The names of elements that have been
 *                                          opened and not subsequently closed.
 * @return {number} the length of openElementStack after closing any tags that
 *               need to be closed.
 * @private
 */
goog.labs.html.scrubber.pickElementsToClose_ =
    function(lowerCaseTagName, isCloseTag, openElementStack) {
  var nOpenElements = openElementStack.length;
  if (isCloseTag) {
    // Look for a matching close tag inside blocking scopes.
    var topMost;
    if (/^h[1-6]$/.test(lowerCaseTagName)) {
      // </h1> will close any header.
      topMost = -1;
      for (var i = nOpenElements; --i >= 0;) {
        if (/^h[1-6]$/.test(openElementStack[i])) {
          topMost = i;
        }
      }
    } else {
      topMost = goog.array.lastIndexOf(openElementStack, lowerCaseTagName);
    }
    if (topMost >= 0) {
      var blockers = goog.labs.html.scrubber.ALL_SCOPES_ &
          ~(goog.labs.html.scrubber.ELEMENT_SCOPES_[lowerCaseTagName] | 0);
      for (var i = nOpenElements; --i > topMost;) {
        var blocks =
            goog.labs.html.scrubber.ELEMENT_SCOPES_[openElementStack[i]] | 0;
        if (blockers & blocks) {
          return nOpenElements;
        }
      }
      return topMost;
    }
    return nOpenElements;
  } else {
    // Close anything that cannot contain the tag name.
    var groups = goog.labs.html.scrubber.ELEMENT_GROUPS_[lowerCaseTagName];
    if (groups === undefined) {
      groups = goog.labs.html.scrubber.Group_.INLINE_;
    }
    for (var i = nOpenElements; --i >= 0;) {
      var canContain =
          goog.labs.html.scrubber.ELEMENT_CONTENTS_[openElementStack[i]];
      if (canContain === undefined) {
        canContain = goog.labs.html.scrubber.Group_.INLINE_;
      }
      if (groups & canContain) {
        return i + 1;
      }
    }
    return 0;
  }
};


/**
 * The groups into which the element falls.
 * The default is an inline element.
 * @private
 */
goog.labs.html.scrubber.ELEMENT_GROUPS_ = {
  'a': goog.labs.html.scrubber.Group_.INLINE_,
  'abbr': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'acronym': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'address': goog.labs.html.scrubber.Group_.BLOCK_,
  'applet': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'area': goog.labs.html.scrubber.Group_.AREA_ELEMENT_,
  'audio': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'b': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'base': goog.labs.html.scrubber.Group_.HEAD_CONTENT_,
  'basefont': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'bdi': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'bdo': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'big': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'blink': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'blockquote': goog.labs.html.scrubber.Group_.BLOCK_,
  'body': goog.labs.html.scrubber.Group_.TOP_CONTENT_,
  'br': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'button': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'canvas': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'caption': goog.labs.html.scrubber.Group_.TABLE_CONTENT_,
  'center': goog.labs.html.scrubber.Group_.BLOCK_,
  'cite': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'code': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'col': goog.labs.html.scrubber.Group_.TABLE_CONTENT_ |
      goog.labs.html.scrubber.Group_.COL_ELEMENT_,
  'colgroup': goog.labs.html.scrubber.Group_.TABLE_CONTENT_,
  'dd': goog.labs.html.scrubber.Group_.DL_PART_,
  'del': goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.MIXED_,
  'dfn': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'dir': goog.labs.html.scrubber.Group_.BLOCK_,
  'div': goog.labs.html.scrubber.Group_.BLOCK_,
  'dl': goog.labs.html.scrubber.Group_.BLOCK_,
  'dt': goog.labs.html.scrubber.Group_.DL_PART_,
  'em': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'fieldset': goog.labs.html.scrubber.Group_.BLOCK_,
  'font': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'form': goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.FORM_ELEMENT_,
  'h1': goog.labs.html.scrubber.Group_.BLOCK_,
  'h2': goog.labs.html.scrubber.Group_.BLOCK_,
  'h3': goog.labs.html.scrubber.Group_.BLOCK_,
  'h4': goog.labs.html.scrubber.Group_.BLOCK_,
  'h5': goog.labs.html.scrubber.Group_.BLOCK_,
  'h6': goog.labs.html.scrubber.Group_.BLOCK_,
  'head': goog.labs.html.scrubber.Group_.TOP_CONTENT_,
  'hr': goog.labs.html.scrubber.Group_.BLOCK_,
  'html': 0,
  'i': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'iframe': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'img': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'input': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'ins': goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.INLINE_,
  'isindex': goog.labs.html.scrubber.Group_.INLINE_,
  'kbd': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'label': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'legend': goog.labs.html.scrubber.Group_.LEGEND_ELEMENT_,
  'li': goog.labs.html.scrubber.Group_.LI_ELEMENT_,
  'link': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.HEAD_CONTENT_,
  'listing': goog.labs.html.scrubber.Group_.BLOCK_,
  'map': goog.labs.html.scrubber.Group_.INLINE_,
  'meta': goog.labs.html.scrubber.Group_.HEAD_CONTENT_,
  'nobr': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'noframes': goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.TOP_CONTENT_,
  'noscript': goog.labs.html.scrubber.Group_.BLOCK_,
  'object': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_ |
      goog.labs.html.scrubber.Group_.HEAD_CONTENT_,
  'ol': goog.labs.html.scrubber.Group_.BLOCK_,
  'optgroup': goog.labs.html.scrubber.Group_.OPTIONS_ELEMENT_,
  'option': goog.labs.html.scrubber.Group_.OPTIONS_ELEMENT_ |
      goog.labs.html.scrubber.Group_.OPTION_ELEMENT_,
  'p': goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.P_ELEMENT_,
  'param': goog.labs.html.scrubber.Group_.PARAM_ELEMENT_,
  'pre': goog.labs.html.scrubber.Group_.BLOCK_,
  'q': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  's': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'samp': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'script': (goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_ |
      goog.labs.html.scrubber.Group_.MIXED_ |
      goog.labs.html.scrubber.Group_.TABLE_CONTENT_ |
      goog.labs.html.scrubber.Group_.HEAD_CONTENT_ |
      goog.labs.html.scrubber.Group_.TOP_CONTENT_ |
      goog.labs.html.scrubber.Group_.AREA_ELEMENT_ |
      goog.labs.html.scrubber.Group_.FORM_ELEMENT_ |
      goog.labs.html.scrubber.Group_.LEGEND_ELEMENT_ |
      goog.labs.html.scrubber.Group_.LI_ELEMENT_ |
      goog.labs.html.scrubber.Group_.DL_PART_ |
      goog.labs.html.scrubber.Group_.P_ELEMENT_ |
      goog.labs.html.scrubber.Group_.OPTIONS_ELEMENT_ |
      goog.labs.html.scrubber.Group_.OPTION_ELEMENT_ |
      goog.labs.html.scrubber.Group_.PARAM_ELEMENT_ |
      goog.labs.html.scrubber.Group_.TABLE_ELEMENT_ |
      goog.labs.html.scrubber.Group_.TR_ELEMENT_ |
      goog.labs.html.scrubber.Group_.TD_ELEMENT_ |
      goog.labs.html.scrubber.Group_.COL_ELEMENT_),
  'select': goog.labs.html.scrubber.Group_.INLINE_,
  'small': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'span': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'strike': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'strong': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'style': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.HEAD_CONTENT_,
  'sub': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'sup': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'table': goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.TABLE_ELEMENT_,
  'tbody': goog.labs.html.scrubber.Group_.TABLE_CONTENT_,
  'td': goog.labs.html.scrubber.Group_.TD_ELEMENT_,
  'textarea': goog.labs.html.scrubber.Group_.INLINE_,
  'tfoot': goog.labs.html.scrubber.Group_.TABLE_CONTENT_,
  'th': goog.labs.html.scrubber.Group_.TD_ELEMENT_,
  'thead': goog.labs.html.scrubber.Group_.TABLE_CONTENT_,
  'title': goog.labs.html.scrubber.Group_.HEAD_CONTENT_,
  'tr': goog.labs.html.scrubber.Group_.TABLE_CONTENT_ |
      goog.labs.html.scrubber.Group_.TR_ELEMENT_,
  'tt': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'u': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'ul': goog.labs.html.scrubber.Group_.BLOCK_,
  'var': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'video': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'wbr': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'xmp': goog.labs.html.scrubber.Group_.BLOCK_
};


/**
 * The groups which the element can contain.
 * Defaults to 0.
 * @private
 */
goog.labs.html.scrubber.ELEMENT_CONTENTS_ = {
  'a': goog.labs.html.scrubber.Group_.INLINE_MINUS_A_,
  'abbr': goog.labs.html.scrubber.Group_.INLINE_,
  'acronym': goog.labs.html.scrubber.Group_.INLINE_,
  'address': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.P_ELEMENT_,
  'applet': goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.PARAM_ELEMENT_,
  'b': goog.labs.html.scrubber.Group_.INLINE_,
  'bdi': goog.labs.html.scrubber.Group_.INLINE_,
  'bdo': goog.labs.html.scrubber.Group_.INLINE_,
  'big': goog.labs.html.scrubber.Group_.INLINE_,
  'blink': goog.labs.html.scrubber.Group_.INLINE_,
  'blockquote': goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.INLINE_,
  'body': goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.INLINE_,
  'button': goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.INLINE_,
  'canvas': goog.labs.html.scrubber.Group_.INLINE_,
  'caption': goog.labs.html.scrubber.Group_.INLINE_,
  'center': goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.INLINE_,
  'cite': goog.labs.html.scrubber.Group_.INLINE_,
  'code': goog.labs.html.scrubber.Group_.INLINE_,
  'colgroup': goog.labs.html.scrubber.Group_.COL_ELEMENT_,
  'dd': goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.INLINE_,
  'del': goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.INLINE_,
  'dfn': goog.labs.html.scrubber.Group_.INLINE_,
  'dir': goog.labs.html.scrubber.Group_.LI_ELEMENT_,
  'div': goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.INLINE_,
  'dl': goog.labs.html.scrubber.Group_.DL_PART_,
  'dt': goog.labs.html.scrubber.Group_.INLINE_,
  'em': goog.labs.html.scrubber.Group_.INLINE_,
  'fieldset': goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.LEGEND_ELEMENT_,
  'font': goog.labs.html.scrubber.Group_.INLINE_,
  'form': (goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.INLINE_MINUS_A_ |
      goog.labs.html.scrubber.Group_.TR_ELEMENT_ |
      goog.labs.html.scrubber.Group_.TD_ELEMENT_),
  'h1': goog.labs.html.scrubber.Group_.INLINE_,
  'h2': goog.labs.html.scrubber.Group_.INLINE_,
  'h3': goog.labs.html.scrubber.Group_.INLINE_,
  'h4': goog.labs.html.scrubber.Group_.INLINE_,
  'h5': goog.labs.html.scrubber.Group_.INLINE_,
  'h6': goog.labs.html.scrubber.Group_.INLINE_,
  'head': goog.labs.html.scrubber.Group_.HEAD_CONTENT_,
  'html': goog.labs.html.scrubber.Group_.TOP_CONTENT_,
  'i': goog.labs.html.scrubber.Group_.INLINE_,
  'iframe': goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.INLINE_,
  'ins': goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.INLINE_,
  'kbd': goog.labs.html.scrubber.Group_.INLINE_,
  'label': goog.labs.html.scrubber.Group_.INLINE_,
  'legend': goog.labs.html.scrubber.Group_.INLINE_,
  'li': goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.INLINE_,
  'listing': goog.labs.html.scrubber.Group_.INLINE_,
  'map': goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.AREA_ELEMENT_,
  'nobr': goog.labs.html.scrubber.Group_.INLINE_,
  'noframes': goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.TOP_CONTENT_,
  'noscript': goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.INLINE_,
  'object': goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.PARAM_ELEMENT_,
  'ol': goog.labs.html.scrubber.Group_.LI_ELEMENT_,
  'optgroup': goog.labs.html.scrubber.Group_.OPTIONS_ELEMENT_,
  'option': goog.labs.html.scrubber.Group_.CHARACTER_DATA_,
  'p': goog.labs.html.scrubber.Group_.INLINE_ |
      goog.labs.html.scrubber.Group_.TABLE_ELEMENT_,
  'pre': goog.labs.html.scrubber.Group_.INLINE_,
  'q': goog.labs.html.scrubber.Group_.INLINE_,
  's': goog.labs.html.scrubber.Group_.INLINE_,
  'samp': goog.labs.html.scrubber.Group_.INLINE_,
  'script': goog.labs.html.scrubber.Group_.CHARACTER_DATA_,
  'select': goog.labs.html.scrubber.Group_.OPTIONS_ELEMENT_,
  'small': goog.labs.html.scrubber.Group_.INLINE_,
  'span': goog.labs.html.scrubber.Group_.INLINE_,
  'strike': goog.labs.html.scrubber.Group_.INLINE_,
  'strong': goog.labs.html.scrubber.Group_.INLINE_,
  'style': goog.labs.html.scrubber.Group_.CHARACTER_DATA_,
  'sub': goog.labs.html.scrubber.Group_.INLINE_,
  'sup': goog.labs.html.scrubber.Group_.INLINE_,
  'table': goog.labs.html.scrubber.Group_.TABLE_CONTENT_ |
      goog.labs.html.scrubber.Group_.FORM_ELEMENT_,
  'tbody': goog.labs.html.scrubber.Group_.TR_ELEMENT_,
  'td': goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.INLINE_,
  'textarea': goog.labs.html.scrubber.Group_.CHARACTER_DATA_,
  'tfoot': goog.labs.html.scrubber.Group_.FORM_ELEMENT_ |
      goog.labs.html.scrubber.Group_.TR_ELEMENT_ |
      goog.labs.html.scrubber.Group_.TD_ELEMENT_,
  'th': goog.labs.html.scrubber.Group_.BLOCK_ |
      goog.labs.html.scrubber.Group_.INLINE_,
  'thead': goog.labs.html.scrubber.Group_.FORM_ELEMENT_ |
      goog.labs.html.scrubber.Group_.TR_ELEMENT_ |
      goog.labs.html.scrubber.Group_.TD_ELEMENT_,
  'title': goog.labs.html.scrubber.Group_.CHARACTER_DATA_,
  'tr': goog.labs.html.scrubber.Group_.FORM_ELEMENT_ |
      goog.labs.html.scrubber.Group_.TD_ELEMENT_,
  'tt': goog.labs.html.scrubber.Group_.INLINE_,
  'u': goog.labs.html.scrubber.Group_.INLINE_,
  'ul': goog.labs.html.scrubber.Group_.LI_ELEMENT_,
  'var': goog.labs.html.scrubber.Group_.INLINE_,
  'xmp': goog.labs.html.scrubber.Group_.INLINE_
};


/**
 * The scopes in which an element falls.
 * No property defaults to 0.
 * @private
 */
goog.labs.html.scrubber.ELEMENT_SCOPES_ = {
  'applet': goog.labs.html.scrubber.Scope_.COMMON_ |
      goog.labs.html.scrubber.Scope_.BUTTON_ |
      goog.labs.html.scrubber.Scope_.LIST_ITEM_,
  'button': goog.labs.html.scrubber.Scope_.BUTTON_,
  'caption': goog.labs.html.scrubber.Scope_.COMMON_ |
      goog.labs.html.scrubber.Scope_.BUTTON_ |
      goog.labs.html.scrubber.Scope_.LIST_ITEM_,
  'html': goog.labs.html.scrubber.Scope_.COMMON_ |
      goog.labs.html.scrubber.Scope_.BUTTON_ |
      goog.labs.html.scrubber.Scope_.LIST_ITEM_ |
      goog.labs.html.scrubber.Scope_.TABLE_,
  'object': goog.labs.html.scrubber.Scope_.COMMON_ |
      goog.labs.html.scrubber.Scope_.BUTTON_ |
      goog.labs.html.scrubber.Scope_.LIST_ITEM_,
  'ol': goog.labs.html.scrubber.Scope_.LIST_ITEM_,
  'table': goog.labs.html.scrubber.Scope_.COMMON_ |
      goog.labs.html.scrubber.Scope_.BUTTON_ |
      goog.labs.html.scrubber.Scope_.LIST_ITEM_ |
      goog.labs.html.scrubber.Scope_.TABLE_,
  'td': goog.labs.html.scrubber.Scope_.COMMON_ |
      goog.labs.html.scrubber.Scope_.BUTTON_ |
      goog.labs.html.scrubber.Scope_.LIST_ITEM_,
  'th': goog.labs.html.scrubber.Scope_.COMMON_ |
      goog.labs.html.scrubber.Scope_.BUTTON_ |
      goog.labs.html.scrubber.Scope_.LIST_ITEM_,
  'ul': goog.labs.html.scrubber.Scope_.LIST_ITEM_
};


/**
 * Per-element, a child that can contain block content.
 * @private
 */
goog.labs.html.scrubber.BLOCK_CONTAINERS_ = {
  'dl': 'dd',
  'ol': 'li',
  'table': 'tr',
  'tr': 'td',
  'ul': 'li'
};


goog.labs.html.attributeRewriterPresubmitWorkaround();
