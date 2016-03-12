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

'use strict';

/**
 * @fileoverview Factory methods for the supported locator strategies.
 */

/**
 * Short-hand expressions for the primary element locator strategies.
 * For example the following two statements are equivalent:
 *
 *     var e1 = driver.findElement(By.id('foo'));
 *     var e2 = driver.findElement({id: 'foo'});
 *
 * Care should be taken when using JavaScript minifiers (such as the
 * Closure compiler), as locator hashes will always be parsed using
 * the un-obfuscated properties listed.
 *
 * @typedef {(
 *     {className: string}|
 *     {css: string}|
 *     {id: string}|
 *     {js: string}|
 *     {linkText: string}|
 *     {name: string}|
 *     {partialLinkText: string}|
 *     {tagName: string}|
 *     {xpath: string})}
 */
var ByHash;


/**
 * Error thrown if an invalid character is encountered while escaping a CSS
 * identifier.
 * @see https://drafts.csswg.org/cssom/#serialize-an-identifier
 */
class InvalidCharacterError extends Error {
  constructor() {
    super();
    this.name = this.constructor.name;
  }
}


/**
 * Escapes a CSS string.
 * @param {string} css the string to escape.
 * @return {string} the escaped string.
 * @throws {TypeError} if the input value is not a string.
 * @throws {InvalidCharacterError} if the string contains an invalid character.
 * @see https://drafts.csswg.org/cssom/#serialize-an-identifier
 */
function escapeCss(css) {
  if (typeof css !== 'string') {
    throw new TypeError('input must be a string');
  }
  let ret = '';
  const n = css.length;
  for (let i = 0; i  < n; i++) {
    const c = css.charCodeAt(i);
    if (c == 0x0) {
      throw new InvalidCharacterError();
    }

    if ((c >= 0x0001 && c <= 0x001F)
        || c == 0x007F
        || (i == 0 && c >= 0x0030 && c <= 0x0039)
        || (i == 1 && c >= 0x0030 && c <= 0x0039
            && css.charCodeAt(0) == 0x002D)) {
      ret += '\\' + c.toString(16);
      continue;
    }

    if (i == 0 && c == 0x002D && n == 1) {
      ret += '\\' + css.charAt(i);
      continue;
    }

    if (c >= 0x0080
        || c == 0x002D                      // -
        || c == 0x005F                      // _
        || (c >= 0x0030 && c <= 0x0039)     // [0-9]
        || (c >= 0x0041 && c <= 0x005A)     // [A-Z]
        || (c >= 0x0061 && c <= 0x007A)) {  // [a-z]
      ret += css.charAt(i);
      continue;
    }

    ret += '\\' + css.charAt(i);
  }
  return ret;
}


/**
 * Describes a mechanism for locating an element on the page.
 * @final
 */
class By {
  /**
   * @param {string} using the name of the location strategy to use.
   * @param {string} value the value to search for.
   */
  constructor(using, value) {
    /** @type {string} */
    this.using = using;

    /** @type {string} */
    this.value = value;
  }

  /**
   * Locates elements that have a specific class name.
   *
   * @param {string} name The class name to search for.
   * @return {!By} The new locator.
   * @see http://www.w3.org/TR/2011/WD-html5-20110525/elements.html#classes
   * @see http://www.w3.org/TR/CSS2/selector.html#class-html
   */
  static className(name) {
    let names = name.split(/\s+/g)
        .filter(s => s.length > 0)
        .map(s => escapeCss(s));
    return By.css('.' + names.join('.'));
  }

  /**
   * Locates elements using a CSS selector.
   *
   * @param {string} selector The CSS selector to use.
   * @return {!By} The new locator.
   * @see http://www.w3.org/TR/CSS2/selector.html
   */
  static css(selector) {
    return new By('css selector', selector);
  }

  /**
   * Locates eleemnts by the ID attribute. This locator uses the CSS selector
   * `*[id="$ID"]`, _not_ `document.getElementById`.
   *
   * @param {string} id The ID to search for.
   * @return {!By} The new locator.
   */
  static id(id) {
    return By.css('*[id="' + escapeCss(id) + '"]');
  }

  /**
   * Locates link elements whose
   * {@linkplain webdriver.WebElement#getText visible text} matches the given
   * string.
   *
   * @param {string} text The link text to search for.
   * @return {!By} The new locator.
   */
  static linkText(text) {
    return new By('link text', text);
  }

  /**
   * Locates an elements by evaluating a
   * {@linkplain webdriver.WebDriver#executeScript JavaScript expression}.
   * The result of this expression must be an element or list of elements.
   *
   * @param {!(string|Function)} script The script to execute.
   * @param {...*} var_args The arguments to pass to the script.
   * @return {function(!./webdriver.WebDriver): !./promise.Promise}
   *     A new JavaScript-based locator function.
   */
  static js(script, var_args) {
    let args = Array.prototype.slice.call(arguments, 0);
    return function(driver) {
      return driver.executeScript.apply(driver, args);
    };
  }

  /**
   * Locates elements whose `name` attribute has the given value.
   *
   * @param {string} name The name attribute to search for.
   * @return {!By} The new locator.
   */
  static name(name) {
    return By.css('*[name="' + escapeCss(name) + '"]');
  }

  /**
   * Locates link elements whose
   * {@linkplain webdriver.WebElement#getText visible text} contains the given
   * substring.
   *
   * @param {string} text The substring to check for in a link's visible text.
   * @return {!By} The new locator.
   */
  static partialLinkText(text) {
    return new By('partial link text', text);
  }

  /**
   * Locates elements with a given tag name.
   *
   * @param {string} name The tag name to search for.
   * @return {!By} The new locator.
   * @deprecated Use {@link By.css() By.css(tagName)} instead.
   */
  static tagName(name) {
    return By.css(name);
  }

  /**
   * Locates elements matching a XPath selector. Care should be taken when
   * using an XPath selector with a {@link webdriver.WebElement} as WebDriver
   * will respect the context in the specified in the selector. For example,
   * given the selector `//div`, WebDriver will search from the document root
   * regardless of whether the locator was used with a WebElement.
   *
   * @param {string} xpath The XPath selector to use.
   * @return {!By} The new locator.
   * @see http://www.w3.org/TR/xpath/
   */
  static xpath(xpath) {
    return new By('xpath', xpath);
  }

  /** @override */
  toString() {
    // The static By.name() overrides this.constructor.name.  Shame...
    return `By(${this.using}, ${this.value})`;
  }
}


/**
 * Checks if a value is a valid locator.
 * @param {!(By|Function|ByHash)} locator The value to check.
 * @return {!(By|Function)} The valid locator.
 * @throws {TypeError} If the given value does not define a valid locator
 *     strategy.
 */
function check(locator) {
  if (locator instanceof By || typeof locator === 'function') {
    return locator;
  }
  for (let key in locator) {
    if (locator.hasOwnProperty(key) && By.hasOwnProperty(key)) {
      return By[key](locator[key]);
    }
  }
  throw new TypeError('Invalid locator');
}



// PUBLIC API

module.exports = {
  By: By,
  checkedLocator: check,
};
