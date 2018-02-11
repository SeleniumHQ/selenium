// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Utilties for working with the styles of DOM nodes, and
 * related to rich text editing.
 *
 * Many of these are not general enough to go into goog.style, and use
 * constructs (like "isContainer") that only really make sense inside
 * of an HTML editor.
 *
 * The API has been optimized for iterating over large, irregular DOM
 * structures (with lots of text nodes), and so the API tends to be a bit
 * more permissive than the goog.style API should be. For example,
 * goog.style.getComputedStyle will throw an exception if you give it a
 * text node.
 *
 * @author nicksantos@google.com (Nick Santos)
 */

goog.provide('goog.editor.style');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.editor.BrowserFeature');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.object');
goog.require('goog.style');
goog.require('goog.userAgent');


/**
 * Gets the computed or cascaded style.
 *
 * This is different than goog.style.getStyle_ because it returns null
 * for text nodes (instead of throwing an exception), and never reads
 * inline style. These two functions may need to be reconciled.
 *
 * @param {!Node} node Node to get style of.
 * @param {string} stylePropertyName Property to get (must be camelCase,
 *     not css-style).
 * @return {?string} Style value, or null if this is not an element node.
 * @private
 */
goog.editor.style.getComputedOrCascadedStyle_ = function(
    node, stylePropertyName) {
  if (node.nodeType != goog.dom.NodeType.ELEMENT) {
    // Only element nodes have style.
    return null;
  }
  return goog.userAgent.IE ?
      goog.style.getCascadedStyle(
          /** @type {!Element} */ (node), stylePropertyName) :
      goog.style.getComputedStyle(
          /** @type {!Element} */ (node), stylePropertyName);
};


/**
 * Checks whether the given element inherits display: block.
 * @param {!Node} node The Node to check.
 * @return {boolean} Whether the element inherits CSS display: block.
 */
goog.editor.style.isDisplayBlock = function(node) {
  return goog.editor.style.getComputedOrCascadedStyle_(node, 'display') ==
      'block';
};


/**
 * Returns true if the element is a container of other non-inline HTML
 * Note that span, strong and em tags, being inline can only contain
 * other inline elements and are thus, not containers. Containers are elements
 * that should not be broken up when wrapping selections with a node of an
 * inline block styling.
 * @param {Node} element The element to check.
 * @return {boolean} Whether the element is a container.
 */
goog.editor.style.isContainer = function(element) {
  var nodeName = element && element.nodeName;
  return !!(
      element &&
      (goog.editor.style.isDisplayBlock(element) ||
       nodeName == goog.dom.TagName.TD || nodeName == goog.dom.TagName.TABLE ||
       nodeName == goog.dom.TagName.LI));
};


/**
 * Return the first ancestor of this node that is a container, inclusive.
 * @see isContainer
 * @param {Node} node Node to find the container of.
 * @return {Element} The element which contains node.
 */
goog.editor.style.getContainer = function(node) {
  // We assume that every node must have a container.
  return /** @type {Element} */ (
      goog.dom.getAncestor(node, goog.editor.style.isContainer, true));
};


/**
 * Set of input types that should be kept selectable even when their ancestors
 * are made unselectable.
 * @type {Object}
 * @private
 */
goog.editor.style.SELECTABLE_INPUT_TYPES_ =
    goog.object.createSet('text', 'file', 'url');


/**
 * Prevent the default action on mousedown events.
 * @param {goog.events.Event} e The mouse down event.
 * @private
 */
goog.editor.style.cancelMouseDownHelper_ = function(e) {
  var targetTagName = e.target.tagName;
  if (targetTagName != goog.dom.TagName.TEXTAREA &&
      targetTagName != goog.dom.TagName.INPUT) {
    e.preventDefault();
  }
};


/**
 * Makes the given element unselectable, as well as all of its children, except
 * for text areas, text, file and url inputs.
 * @param {Element} element The element to make unselectable.
 * @param {goog.events.EventHandler} eventHandler An EventHandler to register
 *     the event with. Assumes when the node is destroyed, the eventHandler's
 *     listeners are destroyed as well.
 */
goog.editor.style.makeUnselectable = function(element, eventHandler) {
  if (goog.editor.BrowserFeature.HAS_UNSELECTABLE_STYLE) {
    // The mousing down on a node should not blur the focused node.
    // This is consistent with how IE works.
    // TODO: Consider using just the mousedown handler and not the css property.
    eventHandler.listen(
        element, goog.events.EventType.MOUSEDOWN,
        goog.editor.style.cancelMouseDownHelper_, true);
  }

  goog.style.setUnselectable(element, true);

  // Make inputs and text areas selectable.
  var inputs = goog.dom.getElementsByTagName(
      goog.dom.TagName.INPUT, goog.asserts.assert(element));
  for (var i = 0, len = inputs.length; i < len; i++) {
    var input = inputs[i];
    if (input.type in goog.editor.style.SELECTABLE_INPUT_TYPES_) {
      goog.editor.style.makeSelectable(input);
    }
  }
  goog.array.forEach(
      goog.dom.getElementsByTagName(
          goog.dom.TagName.TEXTAREA, goog.asserts.assert(element)),
      goog.editor.style.makeSelectable);
};


/**
 * Make the given element selectable.
 *
 * For IE this simply turns off the "unselectable" property.
 *
 * Under FF no descendent of an unselectable node can be selectable:
 *
 * https://bugzilla.mozilla.org/show_bug.cgi?id=203291
 *
 * So we make each ancestor of node selectable, while trying to preserve the
 * unselectability of other nodes along that path
 *
 * This may cause certain text nodes which should be unselectable, to become
 * selectable. For example:
 *
 *    <div id=div1 style="-moz-user-select: none">
 *      Text1
 *      <span id=span1>Text2</span>
 *    </div>
 *
 * If we call makeSelectable on span1, then it will cause "Text1" to become
 * selectable, since it had to make div1 selectable in order for span1 to be
 * selectable.
 *
 * If "Text1" were enclosed within a `<p>` or `<span>`, then this problem would
 * not arise.  Text nodes do not have styles, so its style can't be set to
 * unselectable.
 *
 * @param {!Element} element The element to make selectable.
 */
goog.editor.style.makeSelectable = function(element) {
  goog.style.setUnselectable(element, false);
  if (goog.editor.BrowserFeature.HAS_UNSELECTABLE_STYLE) {
    // Go up ancestor chain, searching for nodes that are unselectable.
    // If such a node exists, mark it as selectable but mark its other children
    // as unselectable so the minimum set of nodes is changed.
    var child = element;
    var current = /** @type {Element} */ (element.parentNode);
    while (current && current.tagName != goog.dom.TagName.HTML) {
      if (goog.style.isUnselectable(current)) {
        goog.style.setUnselectable(current, false, true);

        for (var i = 0, len = current.childNodes.length; i < len; i++) {
          var node = current.childNodes[i];
          if (node != child && node.nodeType == goog.dom.NodeType.ELEMENT) {
            goog.style.setUnselectable(
                /** @type {!Element} */ (current.childNodes[i]), true);
          }
        }
      }

      child = current;
      current = /** @type {Element} */ (current.parentNode);
    }
  }
};
