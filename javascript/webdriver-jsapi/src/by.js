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
 * @fileoverview Factory methods for the supported locator strategies.
 * @author jmleyba@gmail.com (Jason Leyba)
 */

goog.provide('webdriver.By');
goog.provide('webdriver.By.Locator');
goog.provide('webdriver.By.Strategy');

goog.require('goog.object');
goog.require('goog.string');



/**
 * An element locator.
 * @param {webdriver.By.Strategy} type The type of strategy to use for this
 *     locator.
 * @param {string} target The target of this locator.
 * @constructor
 */
webdriver.By.Locator = function(type, target) {
  this.type = type;
  this.target = target;
};


/**
 * Creates a new Locator from an object whose only property is also a key in
 * the {@code webdriver.By.Strategy} enumeration. This property will be the
 * locator type; its value will be the locator target.
 * @param {{*: string}} obj The object to convert into a Locator.
 * @return {webdriver.By.Locator} The new locator object.
 * @throws If {@code obj} could not be converted.
 */
webdriver.By.Locator.createFromObj = function(obj) {
  var key = goog.object.getAnyKey(obj);
  if (key && key in webdriver.By.Strategy) {
    return new webdriver.By.Locator(webdriver.By.Strategy[key], obj[key]);
  }
  throw new Error('Unsupported locator strategy: ' + key);
};


/**
 * Verifies that a {@code locator} is a valid locator to use for searching for
 * elements on the page.
 * @param {webdriver.By.Locator|{*: string}} locator The locator to verify, or
 *     a short-hand object that can be converted into a locator to verify.
 * @return {webdriver.By.Locator} The validated locator.
 * @throws If the {@code locator} is not valid.
 */
webdriver.By.Locator.checkLocator = function(locator) {
  if (!locator.type || !locator.target) {
    locator = webdriver.By.Locator.createFromObj(locator);
  }

  if (locator.type == webdriver.By.Strategy.className) {
    var normalized = goog.string.normalizeWhitespace(locator.target);
    locator.target = goog.string.trim(normalized);
    if (locator.target.search(/\s/) >= 0) {
      throw new Error('Compound class names are not allowed for searches: ' +
                      goog.string.quote(locator.target));
    }
  }

  return locator;
};


/**
 * Enumeration of the supported strategies for finding {@code Element}s on the
 * page.  For all strategies, if there is more than one possible match, the
 * first element encountered will be returned.
 * @enum {string}
 */
webdriver.By.Strategy = {

  /**
   * Find an element by its ID.
   */
  id: 'id',

  /**
   * Find an element by the value of its name attribute.
   */
  name: 'name',

  /**
   * Find an element by one of its class names. Only one class name may be
   * specified per search.
   */
  className: 'class name',

  /**
   * Find an A tag by its text context.
   */
  linkText: 'link text',

  /**
   * Find an A tag by partially matching its text context.
   */
  partialLinkText: 'partial link text',

  /**
   * Find an element by its tagName property.
   */
  tagName: 'tag name',

  /**
   * Find an element by evaluating an XPath expression.
   */
  xpath: 'xpath',

  /**
   * Find an element by evaluating a javascript expression.
   */
  js: 'js'
};


/**
 * Map each of the supported strategies to a factory function in the
 * {@code webdriver.By} namespace.
 */
goog.object.forEach(webdriver.By.Strategy, function(name, key) {
  webdriver.By[key] = function(target) {
    return new webdriver.By.Locator(name, target);
  };
});

goog.exportSymbol('By', webdriver.By);
