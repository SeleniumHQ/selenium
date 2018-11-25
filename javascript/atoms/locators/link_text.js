// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

goog.provide('bot.locators.linkText');
goog.provide('bot.locators.partialLinkText');

goog.require('bot');
goog.require('bot.dom');
goog.require('bot.locators.css');
goog.require('goog.array');
goog.require('goog.dom');


/**
 * Find an element by using the text value of a link
 * @param {string} target The link text to search for.
 * @param {!(Document|Element)} root The document or element to perform the
 *     search under.
 * @param {boolean=} opt_isPartial Whether the link text needs to be matched
 *     only partially.
 * @return {Element} The first matching element found in the DOM, or null if no
 *     such element could be found.
 * @private
 */
bot.locators.linkText.single_ = function(target, root, opt_isPartial) {
  var elements;
  try {
    elements = bot.locators.css.many('a', root);
  } catch (e) {
    // Old versions of browsers don't support CSS. They won't have XHTML
    // support. Sorry.
    elements = goog.dom.getDomHelper(root).getElementsByTagNameAndClass(
        goog.dom.TagName.A, /*className=*/null, root);
  }

  var element = goog.array.find(elements, function(element) {
    var text = bot.dom.getVisibleText(element);
    // getVisibleText replaces non-breaking spaces with plain
    // spaces, so if these are present at the beginning or end
    // of the link text, we need to trim the regular spaces off
    // to be spec compliant for matching on link text.
    text = text.replace(/^[\s]+|[\s]+$/g, '');
    return (opt_isPartial && text.indexOf(target) != -1) || text == target;
  });
  return /**@type{Element}*/ (element);
};


/**
 * Find many elements by using the value of the link text
 * @param {string} target The link text to search for.
 * @param {!(Document|Element)} root The document or element to perform the
 *     search under.
 * @param {boolean=} opt_isPartial Whether the link text needs to be matched
 *     only partially.
 * @return {IArrayLike} All matching elements, or an empty list.
 * @private
 */
bot.locators.linkText.many_ = function(target, root, opt_isPartial) {
  var elements;
  try {
    elements = bot.locators.css.many('a', root);
  } catch (e) {
    // Old versions of browsers don't support CSS. They won't have XHTML
    // support. Sorry.
    elements = goog.dom.getDomHelper(root).getElementsByTagNameAndClass(
        goog.dom.TagName.A, /*className=*/null, root);
  }

  return goog.array.filter(elements, function(element) {
    var text = bot.dom.getVisibleText(element);
    // getVisibleText replaces non-breaking spaces with plain
    // spaces, so if these are present at the beginning or end
    // of the link text, we need to trim the regular spaces off
    // to be spec compliant for matching on link text.
    text = text.replace(/^[\s]+|[\s]+$/g, '');
    return (opt_isPartial && text.indexOf(target) != -1) || text == target;
  });
};


/**
 * Find an element by using the text value of a link
 * @param {string} target The link text to search for.
 * @param {!(Document|Element)} root The document or element to perform the
 *     search under.
 * @return {Element} The first matching element found in the DOM, or null if no
 *     such element could be found.
 */
bot.locators.linkText.single = function(target, root) {
  return bot.locators.linkText.single_(target, root, false);
};


/**
 * Find many elements by using the value of the link text
 * @param {string} target The link text to search for.
 * @param {!(Document|Element)} root The document or element to perform the
 *     search under.
 * @return {IArrayLike} All matching elements, or an empty list.
 */
bot.locators.linkText.many = function(target, root) {
  return bot.locators.linkText.many_(target, root, false);
};


/**
 * Find an element by using part of the text value of a link.
 * @param {string} target The link text to search for.
 * @param {!(Document|Element)} root The document or element to perform the
 *     search under.
 * @return {Element} The first matching element found in the DOM, or null if no
 *     such element could be found.
 */
bot.locators.partialLinkText.single = function(target, root) {
  return bot.locators.linkText.single_(target, root, true);
};


/**
 * Find many elements by using part of the value of the link text.
 * @param {string} target The link text to search for.
 * @param {!(Document|Element)} root The document or element to perform the
 *     search under.
 * @return {IArrayLike} All matching elements, or an empty list.
 */
bot.locators.partialLinkText.many = function(target, root) {
  return bot.locators.linkText.many_(target, root, true);
};
