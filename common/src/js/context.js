/** @license
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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
 * @fileoverview Defines a simple class for tracking the context of a WebDriver
 * instance currently being controlled.
 * @author jmleyba@gmail.com (Jason Leyba)
 */

goog.provide('webdriver.Context');


/**
 * Keeps track of a WebDriver context (window and frame).
 * @param {string} opt_windowId The current window ID.
 * @param {string} opt_frameId The current frame ID.
 * @constructor
 */
webdriver.Context = function(opt_windowId, opt_frameId) {
  this.windowId = opt_windowId || '';
  this.frameId = opt_frameId || '';
};


/**
 * @return {string} The string representation of this context, in the form of
 *     "${windowId} ${frameId}".
 * @override
 */
webdriver.Context.prototype.toString = function() {
  return this.windowId + ' ' + this.frameId;
};



/**
 * Creates a new context from the given string.
 * @param {string} str A string of the form "${windowId} ${frameId}".
 * @static
 */
webdriver.Context.fromString = function(str) {
  var parts = str.split(' ');
  return new webdriver.Context(parts[0], parts[1]);
};
