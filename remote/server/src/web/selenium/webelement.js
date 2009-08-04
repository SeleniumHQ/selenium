/*
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
 * @fileoverview A class for working with elements on the page under test.
 * @author jmleyba@gmail.com (Jason Leyba)
 */

goog.provide('webdriver.Locator');
goog.provide('webdriver.WebElement');

goog.require('goog.array');
goog.require('goog.json');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('webdriver.CommandInfo');
goog.require('webdriver.Future');


/**
 * A datastructure representing a strategy to use for locating an element on the
 * current page under test.
 * @param {webdriver.CommandInfo} info A CommandInfo object identifying which
 *     command to use for finding the element.
 * @param {string} target The target of the search.
 * @constructor
 */
webdriver.Locator = function(info, target) {
  this.info = info;
  this.target = target;
};


/**
 * Class for building {@code webdriver.Locator} objects.
 * @constructor
 */
webdriver.Locator.Builder = function() {
  this.findUsingElement_ = false;
  this.findMany_ = false;
  this.locatorMap_ = webdriver.Locator.Builder.FIND_UNDER_ROOT_;
};


/**
 * A map of strategies to local command processor methods that can be used to
 * find an element under the document root. Each enumerated item is a 2-element
 * array; the first element is the method to use for finding a single element
 * and the second is for finding multiple elements.
 * @enum {Array.<string>}
 */
webdriver.Locator.Builder.FIND_UNDER_ROOT_ = {
  id: ['selectElementById', 'selectElementsUsingId'],
  name: ['selectElementByName', 'selectElementsUsingName'],
  className: ['selectElementUsingClassName', 'selectElementsUsingClassName'],
  linkText: ['selectElementUsingLink', 'selectElementsUsingLink'],
  partialLinkText: ['selectElementUsingPartialLinkText',
                    'selectElementsUsingPartialLinkText'],
  tagName: ['selectElementUsingTagName', 'selectElementsUsingTagName'],
  xpath: ['selectElementUsingXPath', 'selectElementsUsingXPath']
};


/**
 * A map of strategies to local command processor methods that can be used to
 * find a collection of child elements. Any strategies not in the map will be
 * converted to XPath.
 * @enum {string}
 */
webdriver.Locator.Builder.FIND_MANY_UNDER_ELEMENT_ = {
  className: 'findChildElementsByClassName',
  linkText: 'findElementsByLinkText',
  partialLinkText: 'findElementsByPartialLinkText',
  tagName: 'findElementsByTagName',
  xpath: 'findElementsByXPath'
};


/**
 * Build a locator that searches under the current element.
 * @return {webdriver.Locator.Builder} A self reference for chaining calls.
 */
webdriver.Locator.Builder.prototype.underCurrentElement = function() {
  this.findUsingElement_ = true;
  return this.findManyElements();
};


/**
 * Build a locator that searches for multiple elements instead of just one.
 * @return {webdriver.Locator.Builder} A self reference for chaining calls.
 */
webdriver.Locator.Builder.prototype.findManyElements = function() {
  this.findMany_ = true;
  this.locatorMap_ = this.findUsingElement_ ?
      webdriver.Locator.Builder.FIND_MANY_UNDER_ELEMENT_ :
      webdriver.Locator.Builder.FIND_UNDER_ROOT_;
  return this;
};


/**
 * Map a locator target to an XPath target.
 * @param {Object} locator A hash object to build a locator from. The object
 *     should have {@code type} and {@code target} properties.
 * @return {string} The value of {@code locator.target} as an XPath expression.
 * @throws If the locator target cannot be mapped to an XPath expression.
 * @private
 */
webdriver.Locator.Builder.prototype.mapToXPath_ = function(locator) {
  var prefix = this.findUsingElement_ ? '.' : '';
  switch (locator.type) {
    case 'id':
    case 'name':
      return prefix + '//*[@' + locator.type + '="' + locator.target + '"]';
    case 'className':
      return  prefix + "//*[contains(" +
              "concat(' ', normalize-space(@class), ' '),' " +
              locator.target + " ')]";
    case 'linkText':
      return prefix + '//a[text()="' + locator.target + '"]';
    case 'partialLinkText':
      return prefix + '//a[contains(text(),"' + locator.target + '")]';
    case 'tagName':
      return prefix + '//' + locator.target;
    case 'xpath':
      return locator.target;
  }
  throw new Error('Locator cannot be mapped to xpath: ' +
                  goog.json.serialize(locator));
};


/**
 * Builds the URL the command should be sent to when using a remote command
 * processor.
 * @return {string} The URL to send the locator command to.
 * @private
 */
webdriver.Locator.Builder.prototype.buildUrl_ = function() {
  var url = '/session/:sessionId/:context/element';
  if (this.findMany_) {
    url += 's';
  }
  if (this.findUsingElement_) {
    url += '/:using';
  }
  return url;
};


/**
 * Builds a locator that searches under the current document root.
 * @param {Object} locator A hash object to build a locator from. The object
 *     should have {@code type} and {@code target} properties.
 * @param {string} url The URL to send the locator command to.
 * @return {webdriver.Locator} A new locator.
 * @private
 */
webdriver.Locator.Builder.prototype.buildLocatorFromRoot_ = function(locator,
                                                                     url) {
  var method = this.locatorMap_[locator.type][Number(this.findMany_)];
  return new webdriver.Locator(
      new webdriver.CommandInfo(method, url, 'POST'), locator.target);
};


/**
 * Builds a locator that searches under an element in the DOM tree.
 * @param {Object} locator A hash object to build a locator from. The object
 *     should have {@code type} and {@code target} properties.
 * @param {string} url The URL to send the locator command to.
 * @return {webdriver.Locator} A new locator.
 * @private
 */
webdriver.Locator.Builder.prototype.buildLocatorFromElement_ = function(locator,
                                                                        url) {
  var method = this.locatorMap_[locator.type];
  var target = locator.target;
  if (!method) {
    method = webdriver.Locator.Builder.FIND_MANY_UNDER_ELEMENT_.xpath;
    target = this.mapToXPath_(locator);
  }
  return new webdriver.Locator(
      new webdriver.CommandInfo(method, url, 'POST'), target);
};


/**
 * Builds a new locator using this {@code Builder} object's current
 * configuration. This method takes an anonymous object describing the locator
 * strategy to use and the target to search for.  The hash object should define
 * one of the following strategies:
 * <ol>
 * <li>id</li>
 * <li>name</li>
 * <li>className</li>
 * <li>linkText</li>
 * <li>partialLinkText</li>
 * <li>tagName</li>
 * <li>xpath</li>
 * </ol>
 * The strategy should be the hash key and the target its value. Strategies are
 * given the priority listed above.
 * Example usage:
 * <code>
 * new webdriver.Locator.Builder().
 *     underCurrentElement().
 *     build({id: 'my-id'});
 * </code>
 * @param {Object} by An anonymous hash object describing the locator strategy
 *     to use and the target to search for.
 * @return {webdriver.Locator} A new locator.
 * @throws If the hash object does not specify a supported locator strategy or
 *     if attempting to build a {@code className} locator with a compound class
 *     as the target (e.g. "lorem ipsum").
 */
webdriver.Locator.Builder.prototype.build = function(by) {
  var searchOrder = ['id', 'name', 'className', 'linkText', 'partialLinkText',
                     'tagName', 'xpath'];
  var mappedLocator = goog.array.reduce(searchOrder, function(current, item) {
    if (current) {
      return current;
    } else if (item in by) {
      return {type: item, target: by[item]};
    } else {
      return null;
    }
  }, null, this);

  if (!mappedLocator) {
    throw new Error('Unsupported locator: ' + goog.json.serialize(by));
  } else if (mappedLocator.type == 'className') {
    var normalized = goog.string.normalizeWhitespace(mappedLocator.target);
    mappedLocator.target = goog.string.trim(normalized);
    if (mappedLocator.target.search(/\s/) >= 0) {
      throw new Error('Compound class names are not allowed for searches: ' +
          goog.string.quote(mappedLocator.target));
    }
  }

  if (this.findUsingElement_) {
    return this.buildLocatorFromElement_(mappedLocator, this.buildUrl_());
  } else {
    return this.buildLocatorFromRoot_(mappedLocator, this.buildUrl_());
  }
};


/**
 * Represents a DOM element.
 * <p/>
 * WebElements can be found using a {@code webdriver.WebDriver}:
 *
 *   driver.get('http://www.google.com');
 *   var searchBoxWebElement = driver.findElement({name: 'q'});
 *   searchBoxWebElement.sendKeys('webdriver');
 *
 * @param {webdriver.WebDriver} driver The WebDriver instance that will
 *     actually execute commands.
 * @constructor
 */
webdriver.WebElement = function(driver) {

  /**
   * The WebDriver instance to issue commands to.
   * @type {webdriver.WebDriver}
   * @private
   */
  this.driver_ = driver;

  /**
   * The UUID used by WebDriver to identify this element on the page. The ID is
   * wrapped in a webdriver.Future instance so it can be determined
   * asynchronously.
   * @type {webdriver.Future}
   * @private
   */
  this.elementId_ = new webdriver.Future(this.driver_);
};


/**
 * Regular expression for a UUID.
 * @type {RegExp}
 * @static
 */
webdriver.WebElement.UUID_REGEX =
    /^{[\da-z]{8}-[\da-z]{4}-[\da-z]{4}-[\da-z]{4}-[\da-z]{12}}$/i;


/**
 * Adds a command to the given driver to find an element on the current page
 * under test.
 * @param {webdriver.WebDriver} driver Instance to add the command to.
 * @param {webdriver.Locator} locator Locator strategy to use.
 * @param {function} opt_callbackFn Function to call if the command succeeds.
 * @param {function} opt_errorCallbackFn Function to call if the command fails.
 * @param {webdriver.Future} opt_elementId A future for the ID of the element
 *     to search under. If not specified, the search will be conducted from the
 *     document root.
 * @static
 * @private
 */
webdriver.WebElement.findElementInternal_ = function(driver,
                                                     locator,
                                                     opt_callbackFn,
                                                     opt_errorCallbackFn,
                                                     opt_elementId) {
  var command = locator.info.buildCommand(
      driver, [locator.target],
      function(response) {
        var ids = response.value.split(',');
        var elements = [];
        for (var i = 0, id; id = ids[i]; i++) {
          var element = new webdriver.WebElement(driver);
          element.getId().setValue(id);
          elements.push(element);
        }
        response.value = elements;
        if (opt_callbackFn) {
          opt_callbackFn(response);
        }
      },
      opt_errorCallbackFn);
  if (opt_elementId) {
    command.elementId = opt_elementId;
  }
  driver.addCommand(command);
};


/**
 * Adds a command to the given {@code webdriver.WebDriver} instance to find an
 * element on the page.
 * @param {webdriver.WebDriver} driver The driver to perform the search with.
 * @param {Object} by A hash object describing the strategy to use for finding
 *     the element.
 * @return {webdriver.WebElement} A WebElement that can be used to issue
 *     commands on the found element.  The element's ID will be set
 *     asynchronously once the driver successfully finds the element.
 */
webdriver.WebElement.findElement = function(driver, by) {
  var locator = new webdriver.Locator.Builder().build(by);
  var webElement = new webdriver.WebElement(driver);
  webdriver.WebElement.findElementInternal_(
      driver, locator,
      function(response) {
        webElement.getId().setValue(response.value[0].getId().getValue());
      });
  return webElement;
};


/**
 * Adds a command to the given {@code webdriver.WebDriver} instance to test if
 * an element is present on the page.
 * @param {webdriver.WebDriver} driver The driver to perform the search with.
 * @param {Object} by A hash object describing the strategy to use for finding
 *     the element.
 * @return {webdriver.Future} A future whose value will be set when the driver
 *     completes the search; value will be {@code true} if the element was
 *     found, false otherwise.
 */
webdriver.WebElement.isElementPresent = function(driver, by) {
  var locator = new webdriver.Locator.Builder().build(by);
  var isPresent = new webdriver.Future(driver);
  webdriver.WebElement.findElementInternal_(
      driver, locator,
      // If returns without an error, element is present
      function(response) {
        response.value = response.value.length > 0;
        isPresent.setValue(response.value);
      },
      // If returns with an error, element is not present (clear the error!)
      function(response) {
        response.isError = false;
        response.value = false;
        isPresent.setValue(false);
      });
  return isPresent;
};


/**
 * Adds a command to the given {@code webdriver.WebDriver} instance to find
 * multiple elements on the page.
 * @param {webdriver.WebDriver} driver The driver to perform the search with.
 * @param {Object} by A hash object describing the strategy to use for finding
 *     the element.
 */
webdriver.WebElement.findElements = function(driver, by) {
  webdriver.WebElement.findElementInternal_(driver,
      new webdriver.Locator.Builder().
          findManyElements().
          build(by));
};


/**
 * Adds a command to determine if an element is present under this element in
 * the DOM tree.
 * @param {Object} findBy A hash object describing the strategy to use for
 *     finding the element.
 * @return {webdriver.Future} A future whose value will be set when the driver
 *     completes the search; value will be {@code true} if the element was
 *     found, false otherwise.
 */
webdriver.WebElement.prototype.isElementPresent = function(findBy) {
  var locator = new webdriver.Locator.Builder().
      underCurrentElement().
      build(findBy);
  var isPresent = new webdriver.Future(this.driver_);
  webdriver.WebElement.findElementInternal_(
      this.driver_, locator,
      // If returns without an error, element could be present (check response).
      function(response) {
        response.value = response.value.length > 0;
        isPresent.setValue(response.value);
      },
      // If returns with an error, element is not present (clear the error!)
      function(response) {
        response.isError = false;
        response.value = false;
        isPresent.setValue(false);
      },
      this.getId());
  return isPresent;
};


/**
 * Adds a command to search for a single element on the page, restricting the
 * search to the descendants of the element represented by this instance.
 * @param {Object} by The strategy to use for finding the element.
 * @return {webdriver.WebElement} A WebElement that can be used to issue
 *     commands on the found element.  The element's ID will be set
 *     asynchronously once the element is successfully located.
 */
webdriver.WebElement.prototype.findElement = function(by) {
  var locator = new webdriver.Locator.Builder().
      underCurrentElement().
      build(by);
  var webElement = new webdriver.WebElement(this.driver_);
  webdriver.WebElement.findElementInternal_(
      this.driver_, locator,
      function(response) {
        webElement.getId().setValue(response.value[0].getId().getValue());
      },
      /*let any errors bubble up*/null,
      this.getId());
  return webElement;
};


/**
 * Adds a command to search for multiple elements on the page, restricting the
 * search to the descendants of hte element represented by this instance.
 * @param {Object} by The strategy to use for finding the element.
 */
webdriver.WebElement.prototype.findElements = function(by) {
  webdriver.WebElement.findElementInternal_(this.driver_,
      new webdriver.Locator.Builder().
          underCurrentElement().
          findManyElements().
          build(by),
      /*default callback handler is enough*/null,
      /*let any errors bubble up*/null,
      this.getId());
};


/**
 * @return {webdriver.WebDriver} The driver that this element delegates commands
 *     to.
 */
webdriver.WebElement.prototype.getDriver = function() {
  return this.driver_;
};


/**
 * @return {webdriver.Futur} The UUID of this element wrapped in a Future.
 */
webdriver.WebElement.prototype.getId = function() {
  return this.elementId_;
};


/**
 * Helper function for building commands that execute against the element
 * represented by this instance.
 * @param {webdriver.CommandInfo} commandInfo Describes the command to add.
 * @param {Array.<*>} opt_parameters Array of arguments to send with the
 *     command; defaults to an empty array.
 * @param {function} opt_callbackFn Function to call with the response to the
 *     command.
 * @param {function} opt_errorCallbackFn Function to call with the response when
 *     the response is an error.
 * @param {boolean} opt_addToFront Whether this command should be added to the
 *     front or back of the driver's command queue; defaults to {@code false}.
 * @private
 */
webdriver.WebElement.prototype.addCommand_ = function(commandInfo,
                                                      opt_parameters,
                                                      opt_callbackFn,
                                                      opt_errorCallbackFn,
                                                      opt_addToFront) {
  var command = commandInfo.buildCommand(
      this.driver_, opt_parameters, opt_callbackFn, opt_errorCallbackFn);
  command.elementId = this.getId();
  this.driver_.addCommand(command, opt_addToFront);
};


/**
 * Adds a command to click on this element.
 */
webdriver.WebElement.prototype.click = function() {
  this.addCommand_(webdriver.CommandInfo.CLICK_ELEMENT);
};


/**
 * Types a sequence on the DOM element represented by this instance.
 * <p/>
 * Modifier keys (SHIFT, CONTROL, ALT, META) are stateful; once a modifier is
 * processed in the keysequence, that key state is toggled until one of the
 * following occurs:
 * <ul>
 * <li>The modifier key is encountered again in the sequence. At this point the
 * state of the key is toggled (along with the appropriate keyup/down events).
 * </li>
 * <li>The {@code webdriver.Key.NULL} key is encountered in the sequence. When
 * this key is encountered, all modifier keys current in the down state are
 * released (with accompanying keyup events). The NULL key can be used to
 * simulate common keyboard shortcuts:
 * <code>
 *     element.sendKeys("text was",
 *                      webdriver.Key.CONTROL, "a", webdriver.Key.NULL,
 *                      "now text is");
 *     // Alternatively:
 *     element.sendKeys("text was",
 *                      webdriver.Key.chord(webdriver.Key.CONTROL, "a"),
 *                      "now text is");
 * </code></li>
 * <li>The end of the keysequence is encountered. When there are no more keys
 * to type, all depressed modifier keys are released (with accompanying keyup
 * events).
 * </li>
 * </ul>
 * If a certain character can only be generated by using the shift key, such as
 * uppercase characters or certain punctuation marks, the shift key will be
 * applied for that individual key. If the shift key was not depressed before
 * typing that key, it will be released after typing the key. If the shift key
 * was already depressed, the extra event will not be generated. For example:
 * <code>
 *    // Expect shift down/up for each character.
 *    element.sendKeys("ABC");
 *    // Shift is already depressed, so it will not be pushed again for each
 *    // character.
 *    element.sendKeys(webdriver.Key.SHIFT, "ABC");
 * </code>
 * <p/>
 * <strong>Note:</strong> On browsers where native keyboard events are not yet
 * supported (e.g. Firefox on OS X), key events will be synthesized. Special
 * punctionation keys will be synthesized according to a standard QWERTY English
 * keyboard layout.
 * @param {string} var_args The strings to type.  All arguments will be joined
 *     into a single sequence (var_args is permitted for convenience).
 */
webdriver.WebElement.prototype.sendKeys = function(var_args) {
  this.addCommand_(webdriver.CommandInfo.SEND_KEYS,
                   [goog.array.slice(arguments, 0).join('')]);
};

/**
 * Queries for the tag/node name of this element.
 */
webdriver.WebElement.prototype.getElementName = function() {
  var name = new webdriver.Future(this.driver_);
  this.addCommand_(webdriver.CommandInfo.GET_ELEMENT_NAME, null,
      goog.bind(name.setValueFromResponse, name));
  return name;
};


/**
 * Queries for the specified attribute.
 * @param {string} attributeName The name of the attribute to query.
 */
webdriver.WebElement.prototype.getAttribute = function(attributeName) {
  var value = new webdriver.Future(this.driver_);
  this.addCommand_(webdriver.CommandInfo.GET_ELEMENT_ATTRIBUTE,
      [attributeName], goog.bind(value.setValueFromResponse, value),
      // If there is an error b/c the attribute was not found, set value to null
      function (response) {
        // TODO(jmleyba): This error message needs to be consistent for all
        // drivers.
        if (response.value == 'No match') {
          response.isError = false;
          response.value = null;
          value.setValue(null);
        }
      });
  return value;
};


/**
 * @return {webdriver.Future} The value attribute for the element represented by
 *    this instance.
 */
webdriver.WebElement.prototype.getValue = function() {
  var value = new webdriver.Future(this.driver_);
  this.addCommand_(webdriver.CommandInfo.GET_ELEMENT_VALUE, null,
      goog.bind(value.setValueFromResponse, value));
  return value;
};


/**
 * @return {webdriver.Future} The innerText of this element, without any leading
 *     or trailing whitespace.
 */
webdriver.WebElement.prototype.getText = function() {
  var text = new webdriver.Future(this.driver_);
  this.addCommand_(webdriver.CommandInfo.GET_ELEMENT_TEXT, null,
      goog.bind(text.setValueFromResponse, text));
  return text;
};


/**
 * Selects this element.
 */
webdriver.WebElement.prototype.setSelected = function() {
  this.addCommand_(webdriver.CommandInfo.SET_ELEMENT_SELECTED);
};


/**
 * @return {webdriver.Future} The size of this element.
 */
webdriver.WebElement.prototype.getSize = function() {
  var size = new webdriver.Future(this.driver_);
  this.addCommand_(webdriver.CommandInfo.GET_ELEMENT_SIZE, null,
      goog.bind(function(response) {
        var wh = response.value.replace(/\s/g, '').split(',');
        response.value = new goog.math.Size(wh[0], wh[1]);
        size.setValue(response.value);
      }, this));
  return size;
};


/**
 * Parses a response of the form "$x $y" into a {@code goog.math.Coordinate}
 * object.
 * @param {webdriver.Future} future The Future to store the parsed result in.
 * @param {webdriver.Response} response The response to parse.
 * @private
 */
webdriver.WebElement.createCoordinatesFromResponse_ = function(future,
                                                               response) {
  var xy = response.value.replace(/\s/g, '').split(',');
  response.value = new goog.math.Coordinate(xy[0], xy[1]);
  future.setValue(response.value);
};


/**
 * @return {webdriver.Future} The location of this element.
 */
webdriver.WebElement.prototype.getLocation = function() {
  var currentLocation = new webdriver.Future(this.driver_);
  this.addCommand_(webdriver.CommandInfo.GET_ELEMENT_LOCATION, null,
      goog.bind(webdriver.WebElement.createCoordinatesFromResponse_, null,
          currentLocation));
  return currentLocation;
};


/**
 * Drags this element by the given offset.
 * @param {number} x The horizontal amount, in pixels, to drag this element.
 * @param {nubmer} y The vertical amount, in pixels, to drag this element.
 * @return {webdriver.Future} The new location of the element.
 */
webdriver.WebElement.prototype.dragAndDropBy = function(x, y) {
  var newLocation = new webdriver.Future(this.driver_);
  this.addCommand_(webdriver.CommandInfo.DRAG_ELEMENT, [x, y],
      goog.bind(webdriver.WebElement.createCoordinatesFromResponse_, null,
          newLocation));
  return newLocation;
};


/**
 * Drags this element to the location of another {@code webElement}. After this
 * command executes, this element's upper-left hand corner should be the same
 * location as the upper-left hand corner of the given {@code webElement}.
 * @param {webdriver.WebElement} webElement The element to drag this element to.
 * @return {webdriver.Future} This element's new location.
 */
webdriver.WebElement.prototype.dragAndDropTo = function(webElement) {
  if (this.driver_ != webElement.driver_) {
    throw new Error(
        'WebElements created by different drivers cannot coordinate');
  }

  var toLocation = webElement.getLocation();
  var thisLocation = this.getLocation();
  var newLocation = new webdriver.Future(this.driver_);
  this.driver_.callFunction(goog.bind(function() {
    var delta = goog.math.Coordinate.difference(
        toLocation.getValue(), thisLocation.getValue());
    this.addCommand_(webdriver.CommandInfo.DRAG_ELEMENT, [delta.x, delta.y],
        goog.bind(webdriver.WebElement.createCoordinatesFromResponse_, null,
            newLocation), null, true);
  }, this));
  return newLocation;
};


/**
 * @return {boolean} Whether the DOM element represented by this instance is
 *     enabled, as dictated by the {@code disabled} attribute.
 */
webdriver.WebElement.prototype.isEnabled = function() {
  var futureValue = new webdriver.Future(this.driver_);
  this.addCommand_(webdriver.CommandInfo.GET_ELEMENT_ATTRIBUTE, ['disabled'],
      function(response) {
        response.value = !!!response.value;
        futureValue.setValue(response.value);
      });
  return futureValue;
};


/**
 * Determines if this element is checked or selected; will generate an error if
 * the DOM element represented by this instance is not an OPTION or checkbox
 * INPUT element.
 * @return {webdriver.Future} Whether this instance is currently checked or
 *    selected.
 * @private
 */
webdriver.WebElement.prototype.isCheckedOrSelected_ = function(opt_future,
                                                               opt_addToFront) {
  var value = opt_future ||  new webdriver.Future(this.driver_);
  this.addCommand_(webdriver.CommandInfo.GET_ELEMENT_NAME, null,
      goog.bind(function(response) {
        var attribute = response.value == 'input' ? 'checked' : 'selected';
        this.addCommand_(
            webdriver.CommandInfo.GET_ELEMENT_ATTRIBUTE, [attribute],
            function(response) {
              response.value = !!response.value;
              value.setValue(response.value);
            }, null, true);
      }, this), null, opt_addToFront);
  return value;
};


/**
 * @return {webdriver.Future} Whether this element is selected.
 */
webdriver.WebElement.prototype.isSelected = function() {
  return this.isCheckedOrSelected_();
};


/**
 * @return {webdriver.Future} Whether this element is checked.
 */
webdriver.WebElement.prototype.isChecked = function() {
  return this.isCheckedOrSelected_();
};


/**
 * Toggles the checked/selected state of this element; will generate an error if
 * the DOM element represented by this instance is not an OPTION or checkbox
 * input element.
 * @return {webdriver.Future} The new checked/selected state of this element.
 */
webdriver.WebElement.prototype.toggle = function() {
  var toggleResult = new webdriver.Future(this.driver_);
  this.addCommand_(webdriver.CommandInfo.TOGGLE_ELEMENT, null,
      goog.bind(function() {
        this.isCheckedOrSelected_(toggleResult, true);
      }, this));
  return toggleResult;
};


/**
 * If this current element is a form, or an element within a form, then this
 * will that form.
 */
webdriver.WebElement.prototype.submit = function() {
  this.addCommand_(webdriver.CommandInfo.SUBMIT_ELEMENT);
};


/**
 * If this instance represents a text INPUT element, or a TEXTAREA element, this
 * will clear its {@code value}.
 */
webdriver.WebElement.prototype.clear = function() {
  this.addCommand_(webdriver.CommandInfo.CLEAR_ELEMENT);
};


/**
 * @return {webdriver.Future} Whether this element is currently displayed.
 */
webdriver.WebElement.prototype.isDisplayed = function() {
  var futureValue = new webdriver.Future(this.driver_);
  this.addCommand_(webdriver.CommandInfo.IS_ELEMENT_DISPLAYED, null,
      function(response) {
        // TODO(jmleyba): FF extension should not be returning a string here...
        if (goog.isString(response.value)) {
          futureValue.setValue(response.value == 'true');
        } else {
          futureValue.setValue(response.value);
        }
      });
  return futureValue;
};


/**
 * @return {webdriver.Future} The outer HTML of this element.
 */
webdriver.WebElement.prototype.getOuterHtml = function() {
  return this.driver_.executeScript(
      ['var element = arguments[0];',
       'if ("outerHTML" in element) {',
       '  return element.outerHTML;',
       '} else {',
       '  var div = document.createElement("div");',
       '  div.appendChild(element.cloneNode(true));',
       '  return div.innerHTML;',
       '}'].join(''), this);
};


/**
 * @return {webdriver.Future} The inner HTML of this element.
 */
webdriver.WebElement.prototype.getInnerHtml = function() {
  return this.driver_.executeScript('return arguments[0].innerHTML', this);
};

