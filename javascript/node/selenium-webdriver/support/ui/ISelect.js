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

'use strict'

/**
 * ISelect interface makes a protocol for all kind of select elements (standard html and custom
 * model)
 *
 * @interface
 */
class ISelect {
  /**
   * @return {!Promise<boolean>} Whether this select element supports selecting multiple options at the same time? This
   * is done by checking the value of the "multiple" attribute.
   */
  isMultiple() {} // eslint-disable-line

  /**
   * @return {!Promise<!Array<!WebElement>>} All options belonging to this select tag
   */
  getOptions() {} // eslint-disable-line

  /**
   * @return {!Promise<!Array<!WebElement>>} All selected options belonging to this select tag
   */
  getAllSelectedOptions() {} // eslint-disable-line

  /**
   * @return {!Promise<!WebElement>} The first selected option in this select tag (or the currently selected option in a
   * normal select)
   */
  getFirstSelectedOption() {} // eslint-disable-line

  /**
   * Select all options that display text matching the argument. That is, when given "Bar" this
   * would select an option like:
   *
   * &lt;option value="foo"&gt;Bar&lt;/option&gt;
   *
   * @param {string} text The visible text to match against
   * @return {Promise<void>}
   */
  selectByVisibleText(text) {} // eslint-disable-line

  /**
   * Select all options that have a value matching the argument. That is, when given "foo" this
   * would select an option like:
   *
   * &lt;option value="foo"&gt;Bar&lt;/option&gt;
   *
   * @param {string} value The value to match against
   * @return {Promise<void>}
   */
  selectByValue(value) {} // eslint-disable-line

  /**
   * Select the option at the given index. This is done by examining the "index" attribute of an
   * element, and not merely by counting.
   *
   * @param {int} index The option at this index will be selected
   * @return {Promise<void>}
   */
  selectByIndex(index) {} // eslint-disable-line

  /**
   * Clear all selected entries. This is only valid when the SELECT supports multiple selections.
   *
   * @return {Promise<void>}
   */
  deselectAll() {} // eslint-disable-line

  /**
   * Deselect all options that display text matching the argument. That is, when given "Bar" this
   * would deselect an option like:
   *
   * &lt;option value="foo"&gt;Bar&lt;/option&gt;
   *
   * @param {string} text The visible text to match against
   * @return {Promise<void>}
   */
  deselectByVisibleText(text) {} // eslint-disable-line

  /**
   * Deselect all options that have a value matching the argument. That is, when given "foo" this
   * would deselect an option like:
   *
   * &lt;option value="foo"&gt;Bar&lt;/option&gt;
   *
   * @param {string} value The value to match against
   * @return {Promise<void>}
   */
  deselectByValue(value) {} // eslint-disable-line

  /**
   * Deselect the option at the given index. This is done by examining the "index" attribute of an
   * element, and not merely by counting.
   *
   * @param {int} index The option at this index will be deselected
   * @return {Promise<void>}
   */
  deselectByIndex(index) {} // eslint-disable-line
}

exports.default = { ISelect }
