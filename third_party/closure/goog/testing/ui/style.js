// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Tools for testing Closure renderers against static markup
 * spec pages.
 *
*
 */

goog.provide('goog.testing.ui.style');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.testing.asserts');

/**
 * Uses document.write to add an iFrame to the page with the reference path in
 * the src attribute. Used for loading an html file containing reference
 * structures to test against into the page. Should be called within the body of
 * the jsunit test page.
 * @param {string} referencePath A path to a reference HTML file.
 */
goog.testing.ui.style.writeReferenceFrame = function(referencePath) {
  document.write('<iframe id="reference" name="reference" ' +
      'src="' + referencePath + '"></iframe>');
};


/**
 * Returns a reference to the first element child of a node with the given id
 * from the page loaded into the reference iFrame. Used to retrieve a particular
 * reference DOM structure to test against.
 * @param {string} referenceId The id of a container element for a reference
 *   structure in the reference page.
 * @return {Node} The root element of the reference structure.
 */
goog.testing.ui.style.getReferenceNode = function(referenceId) {
  return goog.dom.getFirstElementChild(
      window.frames['reference'].document.getElementById(referenceId));
};


/**
 * Returns an array of all element children of a given node.
 * @param {Node} element The node to get element children of.
 * @return {Array.<Node>} An array of all the element children.
 */
goog.testing.ui.style.getElementChildren = function(element) {
  var first = goog.dom.getFirstElementChild(element);
  if (!first) {
    return [];
  }
  var children = [first], next;
  while (next = goog.dom.getNextElementSibling(children[children.length - 1])) {
    children.push(next);
  }
  return children;
};


/**
 * Tests whether a given node is a "content" node of a reference structure,
 * which means it is allowed to have arbitrary children.
 * @param {Node} element The node to test.
 * @return {boolean} Whether the given node is a content node or not.
 */
goog.testing.ui.style.isContentNode = function(element) {
  return element.className.indexOf('content') != -1;
};


/**
 * Tests that the structure, node names, and classes of the given element are
 * the same as the reference structure with the given id. Throws an error if the
 * element doesn't have the same nodes at each level of the DOM with the same
 * classes on each. The test ignores all DOM structure within content nodes.
 * @param {Node} element The root node of the DOM structure to test.
 * @param {string} referenceId The id of the container for the reference
 *   structure to test against.
 */
goog.testing.ui.style.assertStructureMatchesReference = function(element,
    referenceId) {
  goog.testing.ui.style.assertStructureMatchesReferenceInner_(element,
      goog.testing.ui.style.getReferenceNode(referenceId));
};


/**
 * A recursive function for comparing structure, node names, and classes between
 * a test and reference DOM structure. Throws an error if one of these things
 * doesn't match. Used internally by
 * {@link goog.testing.ui.style.assertStructureMatchesReference}.
 * @param {Node} element DOM element to test.
 * @param {Node} reference DOM element to use as a reference (test against).
 * @private
 */
goog.testing.ui.style.assertStructureMatchesReferenceInner_ = function(element,
    reference) {
  if (!element && !reference) {
    return;
  }
  assertTrue('Expected two elements.', !!element && !!reference);
  assertEquals('Expected nodes to have the same nodeName.',
      element.nodeName, reference.nodeName);
  var elementClasses = goog.dom.classes.get(element);
  goog.array.forEach(goog.dom.classes.get(reference), function(referenceClass) {
    assertContains('Expected test node to have all reference classes.',
        referenceClass, elementClasses);
  });
  // Call assertStructureMatchesReferenceInner_ on all element children
  // unless this is a content node
  var elChildren = goog.testing.ui.style.getElementChildren(element),
      refChildren = goog.testing.ui.style.getElementChildren(reference);
  if (!goog.testing.ui.style.isContentNode(reference)) {
    if (elChildren.length != refChildren.length) {
      assertEquals('Expected same number of children for a non-content node.',
          elChildren.length, refChildren.length);
    }
    for (var i = 0; i < elChildren.length; i++) {
      goog.testing.ui.style.assertStructureMatchesReferenceInner_(elChildren[i],
          refChildren[i]);
    }
  }
};
