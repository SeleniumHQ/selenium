// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2008 Google Inc. All Rights Reserved.

/**
 * @fileoverview Testing utilities for DOM related tests.
 *
 */

goog.provide('goog.testing.dom');

goog.require('goog.dom');
goog.require('goog.dom.NodeIterator');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagIterator');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classes');
goog.require('goog.iter');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.style');
goog.require('goog.testing.asserts');
goog.require('goog.userAgent');


/**
 * A unique object to use as an end tag marker.
 * @type {Object}
 * @private
 */
goog.testing.dom.END_TAG_MARKER_ = {};


/**
 * Tests if the given iterator over nodes matches the given Array of node
 * descriptors.  Throws an error if any match fails.
 * @param {goog.iter.Iterator} it  An iterator over nodes.
 * @param {Array.<Node|number|string>} array Array of node descriptors to match
 *     against.  Node descriptors can be any of the following:
 *         Node: Test if the two nodes are equal.
 *         number: Test node.nodeType == number.
 *         string starting with '#': Match the node's id with the text
 *             after "#".
 *         other string: Match the text node's contents.
 *
 */
goog.testing.dom.assertNodesMatch = function(it, array) {
  var i = 0;
  goog.iter.forEach(it, function(node) {
    if (array.length <= i) {
      fail('Got more nodes than expected: ' + goog.testing.dom.describeNode_(
          node));
    }
    var expected = array[i];

    if (goog.dom.isNodeLike(expected)) {
      assertEquals('Nodes should match at position ' + i, expected, node);
    } else if (goog.isNumber(expected)) {
      assertEquals('Node types should match at position ' + i, expected,
        node.nodeType);
    } else if (expected.charAt(0) == '#') {
      assertEquals('Expected element at position ' + i,
          goog.dom.NodeType.ELEMENT, node.nodeType);
      var expectedId = expected.substr(1);
      assertEquals('IDs should match at position ' + i,
          expectedId, node.id);

    } else {
      assertEquals('Expected text node at position ' + i,
          goog.dom.NodeType.TEXT, node.nodeType);
      assertEquals('Node contents should match at position ' + i,
          expected, node.nodeValue);
    }

    i++;
  });

  assertEquals('Used entire match array', array.length, i);
};


/**
 * Determines if the current user agent matches the specified string.  Returns
 * false if the string does specify at least one user agent but does not match
 * the running agent.
 * @param {string} userAgents Space delimited string of user agents.
 * @return {boolean} Whether the user agent was matched.  Also true if no user
 *     agent was listed in the expectation string.
 * @private
 */
goog.testing.dom.checkUserAgents_ = function(userAgents) {
  if (goog.string.startsWith(userAgents, '!')) {
    if (goog.string.contains(userAgents, ' ')) {
      throw new Error('Only a single negative user agent may be specified');
    }
    return !goog.userAgent[userAgents.substr(1)];
  }

  var agents = userAgents.split(' ');
  var hasUserAgent = false;
  for (var i = 0, len = agents.length; i < len; i++) {
    var cls = agents[i];
    if (cls in goog.userAgent) {
      hasUserAgent = true;
      if (goog.userAgent[cls]) {
        return true;
      }
    }
  }
  // If we got here, there was a user agent listed but we didn't match it.
  return !hasUserAgent;
};


/**
 * Map function that converts end tags to a specific object.
 * @param {Node} node The node to map.
 * @param {Object} ignore Always undefined.
 * @param {goog.dom.TagIterator} iterator The iterator.
 * @return {Node|Object} The resulting iteration item.
 * @private
 */
goog.testing.dom.endTagMap_ = function(node, ignore, iterator) {
  return iterator.isEndTag() ? goog.testing.dom.END_TAG_MARKER_ : node;
};


/**
 * Check if the given node is important.  A node is important if it is a
 * non-empty text node, a non-annotated element, or an element annotated to
 * match on this user agent.
 * @param {Node} node The node to test.
 * @return {boolean} Whether this node should be included for iteration.
 * @private
 */
goog.testing.dom.nodeFilter_ = function(node) {
  if (node.nodeType == goog.dom.NodeType.TEXT) {
    // If a node is part of a string of text nodes and it has spaces in it,
    // we allow it since it's going to affect the merging of nodes done below.
    if (goog.string.isBreakingWhitespace(node.nodeValue) &&
        (!node.previousSibling ||
             node.previousSibling.nodeType != goog.dom.NodeType.TEXT) &&
        (!node.nextSibling ||
             node.nextSibling.nodeType != goog.dom.NodeType.TEXT)) {
      return false;
    }
    // Allow optional text to be specified as [[BROWSER1 BROWSER2]]Text
    var match = node.nodeValue.match(/^\[\[(.+)\]\]/);
    if (match) {
      return goog.testing.dom.checkUserAgents_(match[1]);
    }
  } else if (node.className) {
    return goog.testing.dom.checkUserAgents_(node.className);
  }
  return true;
};


/**
 * Determines the text to match from the given node, removing browser
 * specification strings.
 * @param {Node} node The node expected to match.
 * @return {string} The text, stripped of browser specification strings.
 * @private
 */
goog.testing.dom.getExpectedText_ = function(node) {
  // Strip off the browser specifications.
  /^(\[\[.+\]\])?(.*)/.test(node.nodeValue);
  return RegExp.$2;
};

/**
 * Describes the given node.
 * @param {Node} node The node to describe.
 * @return {string} A description of the node.
 * @private
 */
goog.testing.dom.describeNode_ = function(node) {
  if (node.nodeType == goog.dom.NodeType.TEXT) {
    return '[Text: ' + node.nodeValue + ']';
  } else {
    return '<' + node.tagName + (node.id ? ' #' + node.id : '') + ' .../>';
  }
};


/**
 * Assert that the html in {@code actual} is substantially similar to
 * htmlPattern.  This method tests for the same set of styles, for the same
 * order of nodes, and the presence of attributes.  Breaking whitespace nodes
 * are ignored.  Elements can be
 * annotated with classnames corresponding to keys in goog.userAgent and will be
 * expected to show up in that user agent and expected not to show up in
 * others.
 * @param {string} htmlPattern The pattern to match.
 * @param {Element} actual The element to check: its contents are matched
 *     against the HTML pattern.
 * @param {boolean} opt_strictAttributes If false, attributes that appear in
 *     htmlPattern must be in actual, but actual can have attributes not
 *     present in htmlPattern.  If true, htmlPattern and actual must have the
 *     same set of attributes.  Default is false.
 */
goog.testing.dom.assertHtmlContentsMatch = function(htmlPattern, actual,
    opt_strictAttributes) {
  var div = goog.dom.createDom(goog.dom.TagName.DIV);
  div.innerHTML = htmlPattern;

  var errorSuffix = '\nExpected\n' + htmlPattern + '\nActual\n' +
      actual.innerHTML;

  var actualIt = goog.iter.filter(
      goog.iter.map(new goog.dom.TagIterator(actual),
          goog.testing.dom.endTagMap_),
      goog.testing.dom.nodeFilter_);

  var expectedIt = goog.iter.filter(new goog.dom.NodeIterator(div),
      goog.testing.dom.nodeFilter_);
  var actualNode;

  var preIterated = false;
  var advanceActualNode = function() {
    // If the iterator has already been advanced, don't advance it again.
    if (!preIterated) {
      actualNode = /** @type {Node} */ (goog.iter.nextOrValue(actualIt, null));
    }
    preIterated = false;

    // Advance the iterator so long as it is return end tags.
    while (actualNode == goog.testing.dom.END_TAG_MARKER_) {
      actualNode = /** @type {Node} */ (goog.iter.nextOrValue(actualIt, null));
    }
  };

  var number = 0;
  goog.iter.forEach(expectedIt, function(expectedNode) {
    advanceActualNode();
    assertNotNull('Finished actual HTML before finishing expected HTML at ' +
                  'node number ' + number + ': ' +
                  goog.testing.dom.describeNode_(expectedNode) + errorSuffix,
                  actualNode);

    // Do no processing for expectedNode == div.
    if (expectedNode == div) {
      return;
    }

    assertEquals('Should have the same node type, got ' +
        goog.testing.dom.describeNode_(actualNode) + ' but expected ' +
        goog.testing.dom.describeNode_(expectedNode) + '.' + errorSuffix,
        expectedNode.nodeType, actualNode.nodeType);

    if (expectedNode.nodeType == goog.dom.NodeType.ELEMENT) {
      assertEquals('Tag names should match' + errorSuffix,
          expectedNode.tagName, actualNode.tagName);
      assertObjectEquals('Should have same styles' + errorSuffix,
          goog.style.parseStyleAttribute(expectedNode.style.cssText),
          goog.style.parseStyleAttribute(actualNode.style.cssText));
      goog.testing.dom.assertAttributesEqual_(errorSuffix, expectedNode,
          actualNode, !!opt_strictAttributes);
    } else {
      // Concatenate text nodes until we reach a non text node.
      var actualText = actualNode.nodeValue;
      preIterated = true;
      while ((actualNode = goog.iter.nextOrValue(actualIt, null)) &&
          actualNode.nodeType == goog.dom.NodeType.TEXT) {
        actualText += actualNode.nodeValue;
      }

      var expectedText = goog.testing.dom.getExpectedText_(expectedNode);
      if ((actualText && !goog.string.isBreakingWhitespace(actualText)) ||
          (expectedText && !goog.string.isBreakingWhitespace(expectedText))) {
        var normalizedActual = actualText.replace(/\s+/g, ' ');
        var normalizedExpected = expectedText.replace(/\s+/g, ' ');

        assertEquals('Text should match' + errorSuffix, normalizedExpected,
            normalizedActual);
      }
    }

    number++;
  });

  advanceActualNode();
  assertNull('Finished expected HTML before finishing actual HTML' +
      errorSuffix, goog.iter.nextOrValue(actualIt, null));
};


/**
 * Assert that the html in {@code actual} is substantially similar to
 * htmlPattern.  This method tests for the same set of styles, and for the same
 * order of nodes.  Breaking whitespace nodes are ignored.  Elements can be
 * annotated with classnames corresponding to keys in goog.userAgent and will be
 * expected to show up in that user agent and expected not to show up in
 * others.
 * @param {string} htmlPattern The pattern to match.
 * @param {string} actual The html to check.
 */
goog.testing.dom.assertHtmlMatches = function(htmlPattern, actual) {
  var div = goog.dom.createDom(goog.dom.TagName.DIV);
  div.innerHTML = actual;

  goog.testing.dom.assertHtmlContentsMatch(htmlPattern, div);
};


/**
 * Finds the first text node descendant of root with the given content.  Note
 * that this operates on a text node level, so if text nodes get split this
 * may not match the user visible text.  Using normalize() may help here.
 * @param {string|RegExp} textOrRegexp The text to find, or a regular
 *     expression to find a match of.
 * @param {Element} root The element to search in.
 * @return {Node} The first text node that matches, or null if none is found.
 */
goog.testing.dom.findTextNode = function(textOrRegexp, root) {
  var it = new goog.dom.NodeIterator(root);
  var ret = goog.iter.nextOrValue(goog.iter.filter(it, function(node) {
    if (node.nodeType == goog.dom.NodeType.TEXT) {
      if (goog.isString(textOrRegexp)) {
        return node.nodeValue == textOrRegexp;
      } else {
        return !!node.nodeValue.match(textOrRegexp);
      }
    } else {
      return false;
    }
  }), null);
  return /** @type {Node} */ (ret);
};


/**
 * Assert the end points of a range.
 *
 * Notice that "Are two ranges visually identical?" and "Do two ranges have
 * the same endpoint?" are independent questions. Two visually identical ranges
 * may have different endpoints. And two ranges with the same endpoints may
 * be visually different.
 *
 * @param {Node} start The expected start node.
 * @param {number} startOffset The expected start offset.
 * @param {Node} end The expected end node.
 * @param {number} endOffset The expected end offset.
 * @param {goog.dom.AbstractRange} range The actual range.
 */
goog.testing.dom.assertRangeEquals = function(start, startOffset, end,
    endOffset, range) {
  assertEquals('Unexpected start node', start, range.getStartNode());
  assertEquals('Unexpected end node', end, range.getEndNode());
  assertEquals('Unexpected start offset', startOffset, range.getStartOffset());
  assertEquals('Unexpected end offset', endOffset, range.getEndOffset());
};


/**
 * Gets the value of a DOM attribute in deterministic way.
 * @param {!Node} node A node.
 * @param {string} name Attribute name.
 * @return {*} Attribute value.
 * @private
 */
goog.testing.dom.getAttributeValue_ = function(node, name) {
  // These hacks avoid nondetermistic results in the following cases:
  // IE7: document.createElement('input').height returns a random number.
  // FF3: getAttribute('disabled') returns different value for <div disabled="">
  //      and <div disabled="disabled">
  // WebKit: Two radio buttons with the same name can't be checked at the same
  //      time, even if only one of them is in the document.
  if (goog.userAgent.WEBKIT && node.tagName == 'INPUT' &&
      node['type'] == 'radio' && name == 'checked') {
    return false;
  }
  return goog.isDef(node[name]) &&
      typeof node.getAttribute(name) != typeof node[name] ?
      node[name] : node.getAttribute(name);
};


/**
 * Assert that the attributes of two Nodes are the same (ignoring any
 * instances of the style attribute).
 * @param {string} errorSuffix String to add to end of error messages.
 * @param {Node} expectedNode The node whose attributes we are expecting.
 * @param {Node} actualNode The node with the actual attributes.
 * @param {boolean} strictAttributes If false, attributes that appear in
 *     expectedNode must also be in actualNode, but actualNode can have
 *     attributes not present in expectedNode.  If true, expectedNode and
 *     actualNode must have the same set of attributes.
 * @private
 */
goog.testing.dom.assertAttributesEqual_ = function(errorSuffix,
    expectedNode, actualNode, strictAttributes) {
  if (strictAttributes) {
    goog.testing.dom.compareClassAttribute_(expectedNode, actualNode);
  }

  var expectedAttributes = expectedNode.attributes;
  var actualAttributes = actualNode.attributes;

  for (var i = 0, len = expectedAttributes.length; i < len; i++) {
    var expectedName = expectedAttributes[i].name;
    var expectedValue = goog.testing.dom.getAttributeValue_(expectedNode,
        expectedName);

    var actualAttribute = actualAttributes[expectedName];

    if (expectedName == 'id' && goog.userAgent.IE) {
      goog.testing.dom.compareIdAttributeForIe_(
          /** @type {string} */ (expectedValue), actualAttribute,
          strictAttributes, errorSuffix);
      continue;
    }

    if (goog.testing.dom.ignoreAttribute_(expectedName)) {
      continue;
    }

    assertNotUndefined('Expected to find attribute with name ' +
        expectedName + ', in element ' +
        goog.testing.dom.describeNode_(actualNode) + errorSuffix,
        actualAttribute);
    assertEquals('Expected attribute ' + expectedName +
        ' has a different value ' + errorSuffix,
        expectedValue,
        goog.testing.dom.getAttributeValue_(actualNode, actualAttribute.name));
  }

  if (strictAttributes) {
    for (i = 0; i < actualAttributes.length; i++) {
      var actualName = actualAttributes[i].name;

      if (goog.testing.dom.ignoreAttribute_(actualName)) {
        continue;
      }

      assertNotUndefined('Unexpected attribute with name ' +
          actualName + ' in element ' +
          goog.testing.dom.describeNode_(actualNode) + errorSuffix,
          expectedAttributes[actualName]);
    }
  }
};


/**
 * Assert the class attribute of actualNode is the same as the one in
 * expectedNode, ignoring classes that are useragents.
 * @param {Node} expectedNode The DOM node whose class we expect.
 * @param {Node} actualNode The DOM node with the actual class.
 * @private
 */
goog.testing.dom.compareClassAttribute_ = function(expectedNode,
    actualNode) {
  var classes = goog.dom.classes.get(expectedNode);

  var expectedClasses = [];
  for (var i = 0, len = classes.length; i < len; i++) {
    if (!(classes[i] in goog.userAgent)) {
      expectedClasses.push(classes[i]);
    }
  }
  expectedClasses.sort();

  var actualClasses = goog.dom.classes.get(actualNode);
  actualClasses.sort();

  assertArrayEquals(
      'Expected class was: ' + expectedClasses.join(' ') +
      ', but actual class was: ' + actualNode.className,
      expectedClasses, actualClasses);
};


/**
 * Set of attributes IE adds to elements randomly.
 * @type {Object}
 * @private
 */
goog.testing.dom.BAD_IE_ATTRIBUTES_ = goog.object.createSet(
    'methods', 'CHECKED', 'dataFld', 'dataFormatAs', 'dataSrc');


/**
 * Whether to ignore the attribute.
 * @param {string} name Name of the attribute.
 * @return {boolean} True if the attribute should be ignored.
 * @private
 */
goog.testing.dom.ignoreAttribute_ = function(name) {
  if (name == 'style' || name == 'class') {
    return true;
  }
  return goog.userAgent.IE && goog.testing.dom.BAD_IE_ATTRIBUTES_[name];
};


/**
 * Compare id attributes for IE.  In IE, if an element lacks an id attribute
 * in the original HTML, the element object will still have such an attribute,
 * but its value will be the empty string.
 * @param {string} expectedValue The expected value of the id attribute.
 * @param {Attr} actualAttribute The actual id attribute.
 * @param {boolean} strictAttributes Whether strict attribute checking should be
 *     done.
 * @param {string} errorSuffix String to append to error messages.
 * @private
 */
goog.testing.dom.compareIdAttributeForIe_ = function(expectedValue,
    actualAttribute, strictAttributes, errorSuffix) {
  if (expectedValue === '') {
    if (strictAttributes) {
      assertTrue('Unexpected attribute with name id in element ' +
          errorSuffix, actualAttribute.value == '');
    }
  } else {
    assertNotUndefined('Expected to find attribute with name id, in element ' +
        errorSuffix, actualAttribute);
    assertNotEquals('Expected to find attribute with name id, in element ' +
        errorSuffix, '', actualAttribute.value);
    assertEquals('Expected attribute has a different value ' + errorSuffix,
        expectedValue, actualAttribute.value);
  }
};
