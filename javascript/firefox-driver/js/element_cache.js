/*
 Copyright 2012 WebDriver committers
 Copyright 2012 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

/**
 * @fileoverview The heart of a mozilla JSM for an element cache. By making use
 * of a JSM we can ensure that the cache is shared between all components.
*/

goog.provide('fxdriver.cache');

goog.require('Utils');
goog.require('WebDriverError');
goog.require('bot.ErrorCode');
goog.require('fxdriver.moz');
goog.require('fxdriver.utils');
goog.require('goog.dom');


var global_element_cache = {};


/**
 * Store an element in the cache and return an ID that can be used to retrieve
 * the element from the cache later.
 *
 * @param {!Element} element The element to store.
 * @return string An ID that can be used to retrieve the element.
 */
fxdriver.cache.addElement = function(element) {
  var owner = new XPCNativeWrapper(element.ownerDocument);

  // Right. This is ugly. Sorry. The reasoning goes:
  // * Finding elements normally returns a fairly "raw" object
  // * Finding elements by JS returns a fully populated object
  // In both cases, the elements implement the same XPCOM interfaces, but clicks
  // that are aimed at a target frame fail for elements found using JS.
  // Fortunately, if we _always_ wrap elements in an XPCNativeWrapper things
  // work as expected. Except for frames. When frames are wrapped switching to
  // a frame by passing in the element means that the element cache doesn't work
  // as expected (I've not done much research). Consequently, we avoid wrapping
  // elements that looks like a frame.

  var isFrame = element.tagName == goog.dom.TagName.IFRAME ||
                element.tagName == goog.dom.TagName.FRAME;

  var toCompareWith = isFrame ? element : new XPCNativeWrapper(element);

  var ownerWindow = fxdriver.moz.unwrap(goog.dom.getWindow(owner));
  var ownerWindowId = ownerWindow.fxdriver_id;
  if (!ownerWindowId) {
    ownerWindow.fxdriver_id = fxdriver.utils.getUniqueId();
    ownerWindowId = ownerWindow.fxdriver_id;
  }

  if (!global_element_cache[ownerWindowId]) {
    global_element_cache[ownerWindowId] = {};
    ownerWindow.addEventListener(
        'unload',
        function () {
          delete global_element_cache[ownerWindowId];
        },
        /*useCapture=*/true);
  }

  for (var e in global_element_cache[ownerWindowId]) {
    if (global_element_cache[ownerWindowId][e] == toCompareWith) {
      return e;
    }
  }

  var id = fxdriver.utils.getUniqueId();
  global_element_cache[ownerWindowId][id] = toCompareWith;

  return id;
};

/**
 * @param {string} index An ID previously returned by addElement.
 * @param {!Document} currentDoc The current document.
 * @return {!Element} The element associated with this ID.
 * @throws {WebDriverError} If the element cannot be found.
 */
fxdriver.cache.getElementAt = function(index, currentDoc) {
  var element;
  var cache;

  //TODO(dawagner): Maybe look up the current document's cache entry first
  for (var ownerWindowId in global_element_cache) {
    cache = global_element_cache[ownerWindowId] || {};
    if (cache[index]) {
      element = cache[index];
      break;
    }
  }

  if (!element) {
    throw new WebDriverError(bot.ErrorCode.STALE_ELEMENT_REFERENCE,
                             'Element not found in the cache - ' +
                             'perhaps the page has changed since it was looked up');
  }

  if (!Utils.isAttachedToDom(element)) {
    delete cache[index];
    throw new WebDriverError(bot.ErrorCode.STALE_ELEMENT_REFERENCE,
                             'Element is no longer attached to the DOM');
  }

  // Unwrap here, because if the element is a frame element, its ownerDocument
  // will be wrapped, and the equality check will fail.
  if (fxdriver.moz.unwrap(element.ownerDocument) != fxdriver.moz.unwrap(currentDoc)) {
    throw new WebDriverError(bot.ErrorCode.STALE_ELEMENT_REFERENCE,
                             'Element belongs to a different frame than the current one - ' +
                             'switch to its containing frame to use it');
  }

  return element;
};

var put = fxdriver.cache.addElement;
var get = fxdriver.cache.getElementAt;

var EXPORTED_SYMBOLS = ['get', 'put'];
