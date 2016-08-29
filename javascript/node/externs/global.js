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
 * @fileoverview Symbols expected to be defined in the global scope.
 */

/** @const */
var global = this;

// DOM type references. Dossier removes DOM externs when type-checking Node
// modules.

/** @constructor */
function Document() {};
/**
 * @param {string} tagName .
 * @return {!Element} .
 */
Document.prototype.createElement = function(tagName) {};

/** @constructor */
function Element() {}

/** @type {!Document} */Element.prototype.ownerDocument;
/** @type {string} */Element.prototype.innerHTML;
/** @type {string} */Element.prototype.outerHTML;
/** @param {!Element} child . */
Element.prototype.appendChild = function(child) {};
/** @param {boolean} deep . */
Element.prototype.cloneNode = function(deep) {};


// The following will only actually be defined if running with mocha.

/**
 * @param {function()} fn
 * @return {void}
 */
function after(fn) {}

/**
 * @param {function()} fn
 * @return {void}
 */
function afterEach(fn) {}

/**
 * @param {function()} fn
 * @return {void}
 */
function before(fn) {}

/**
 * @param {function()} fn
 * @return {void}
 */
function beforeEach(fn) {}

/**
 * @param {string} name
 * @param {function()=} fn
 * @return {void}
 */
function describe(name, fn) {}

/**
 * @param {string} name
 * @param {function()=} fn
 * @return {void}
 */
describe.skip = function(name, fn) {}

/**
 * @param {string} name
 * @param {function()=} fn
 * @return {void}
 */
function xdescribe(name, fn) {}

/**
 * @param {string} name
 * @param {function()=} fn
 * @return {void}
 */
function it(name, fn) {}

/**
 * @param {string} name
 * @param {function()=} fn
 * @return {void}
 */
it.only = function(name, fn) {};

/**
 * @param {string} name
 * @param {function()=} fn
 * @return {void}
 */
function xit(name, fn) {}

