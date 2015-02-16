// Copyright 2013 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines a library that simplifies writing assertions against
 * promised values.
 *
 * > <hr>
 * > __NOTE:__ This module is considered experimental and is subject to
 * > change, or removal, at any time!
 * > <hr>
 *
 * Sample usage:
 *
 *     var driver = new webdriver.Builder().build();
 *     driver.get('http://www.google.com');
 *
 *     assert(driver.getTitle()).equalTo('Google');
 */

var base = require('../_base'),
    assert = base.require('webdriver.testing.assert');


// PUBLIC API


/**
 * Creates a new assertion.
 * @param {*} value The value to perform an assertion on.
 * @return {!webdriver.testing.Assertion} The new assertion.
 */
module.exports = function(value) {
  return assert(value);
};


/**
 * Registers a new assertion to expose from the
 * {@link webdriver.testing.Assertion} prototype.
 * @param {string} name The assertion name.
 * @param {(function(new: goog.labs.testing.Matcher, *)|
 *          {matches: function(*): boolean,
 *           describe: function(): string})} matcherTemplate Either the
 *     matcher constructor to use, or an object literal defining a matcher.
 */
module.exports.register = assert.register;
