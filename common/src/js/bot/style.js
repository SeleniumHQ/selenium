/** @license
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

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
 * @fileoverview CSS routines.
 *
*
 */

goog.provide('bot.style');

goog.require('bot');
goog.require('goog.style');



/**
 * Pick the first available value from the element's computed, cascaded or
 * inline style.
 *
 * @param {!Element} elem Element to get the style value from.
 * @param {string} styleName The name of the value to look up.
 * @return {string} The value of the style, or undefined.
 */
bot.style.getEffectiveStyle = function(elem, styleName) {

  styleName = goog.style.toCamelCase(styleName);

  return goog.style.getComputedStyle(elem, styleName) ||
      goog.style.getCascadedStyle(elem, styleName) ||
      (elem.style ? elem.style[styleName] : undefined);
};
