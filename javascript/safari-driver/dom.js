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

/**
 * @fileoverview Common functions for working with the DOM.
 */

goog.provide('safaridriver.dom');

goog.require('goog.array');


/**
 * Invokes the native definition of a DOM function using the object's
 * constructor. This attempts to protect against pages that redefine DOM
 * functions (e.g. window.postMessage or window.dispatchEvent) from interfering
 * with the SafariDriver's functionality. We're out of luck if the page
 * redefines the function on the constructor prototype.
 * @param {!(Document|Element|Window)} obj The object to use.
 * @param {string} name The name of the function to retrieve.
 * @param {...} var_args The function arguments.
 * @return {*} The function result.
 */
safaridriver.dom.call = function(obj, name, var_args) {
  // Safari does not let you override the constructor property of document
  // or an element, so we can access those directly. The constructor property
  // for Window can be hidden by defining a global with the same name, so we
  // have to use some trickery for Window.
  var ctor = obj.constructor;
  if (obj.window === obj) {
    try {
      var saved = obj.constructor;
      delete obj.constructor;
      ctor = obj.constructor;
      obj.constructor = saved;
    } catch (ex) {
    }
  }
  return ctor.prototype[name].apply(obj, goog.array.slice(arguments, 2));
};
