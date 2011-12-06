// Copyright 2011 Software Freedom Conservatory.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines a wrapper around {@link bot.inject.executeScript} so it
 * can be invoked via Selenium RC.
 */

goog.provide('core.inject');

goog.require('bot.inject');
goog.require('goog.array');
goog.require('goog.json');
goog.require('goog.object');


/**
 * @param {!{script:string, args:!Array.<*>}} json The executeScript parameters
 *     in the form of a JSON object.
 * @param {Window=} opt_window The window to execute the script in. Defaults to
 *     the window running this script.
 * @return {string} The stringified response object.
 * @see bot.inject.executeScript
 */
core.inject.executeScript = function(json, opt_window) {
  var result = bot.inject.executeScript(json['script'],
      core.inject.removeElementIdPrefix_(json['args']),
      false, opt_window || window);
  result = core.inject.addElementIdPrefix_(result);
  return goog.json.serialize(result);
};


/**
 * Prefix applied to cached element IDs so that they may be used with normal
 * Selenium commands.
 * @type {string}
 * @const
 */
core.inject.ELEMENT_ID_PREFIX = 'stored=';


/**
 * @param {*} value The value to scrub.
 * @return {*} The scrubbed value.
 * @private
 */
core.inject.removeElementIdPrefix_ = function(value) {
  if (goog.isArray(value)) {
    return goog.array.map((/**@type {goog.array.ArrayLike}*/value),
        core.inject.removeElementIdPrefix_ );
  } else if (value && goog.isObject(value) && !goog.isFunction(value)) {
    if (goog.object.containsKey(value, bot.inject.ELEMENT_KEY)) {
      var id = value[bot.inject.ELEMENT_KEY];
      if (id.substring(0, core.inject.ELEMENT_ID_PREFIX.length) ===
          core.inject.ELEMENT_ID_PREFIX) {
        value[bot.inject.ELEMENT_KEY] =
            id.substring(core.inject.ELEMENT_ID_PREFIX.length);
        return value;
      }
      return goog.object.map(value, core.inject.removeElementIdPrefix_);
    }
  }
  return value;
};


/**
 * @param {*} value The value to update.
 * @return {*} The updated value.
 * @private
 */
core.inject.addElementIdPrefix_ = function(value) {
  if (goog.isArray(value)) {
    return goog.array.map((/**@type {goog.array.ArrayLike}*/value),
        core.inject.addElementIdPrefix_ );
  } else if (value && goog.isObject(value) && !goog.isFunction(value)) {
    if (goog.object.containsKey(value, bot.inject.ELEMENT_KEY)) {
      value[bot.inject.ELEMENT_KEY] =
          core.inject.ELEMENT_ID_PREFIX + value[bot.inject.ELEMENT_KEY];
      return value;
    }
    return goog.object.map(value, core.inject.addElementIdPrefix_);
  }
  return value;
};
