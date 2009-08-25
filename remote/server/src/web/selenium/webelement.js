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
 * @fileoverview A class for working with elements on the page under test.
 * @author jmleyba@gmail.com (Jason Leyba)
 */

goog.provide('webdriver.WebElement');

goog.require('goog.array');
goog.require('goog.json');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('webdriver.Command');
goog.require('webdriver.CommandName');
goog.require('webdriver.Future');
goog.require('webdriver.LocatorStrategy');


/**
 * Represents a DOM element.  WebElements can be found by searching from the
 * document root using a {@code webdriver.WebDriver}, or by searhcing under
 * another {@code webdriver.WebElement}:
 *
 *   driver.get('http://www.google.com');
 *   var searchForm = driver.findElement({tagName: 'form'});
 *   var searchBox = searchForm.findElement({name: 'q'});
 *   searchBox.sendKeys('webdriver');
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
 * <p/>
 * The {@code locator} object should define the strategy to use by having a
 * property whose key matches one of the keys in
 * {@code webdriver.LocatorStrategy}. The value of this property defines the
 * target of the search.  For example, {@code locator = {id: 'myButton'}}, would
 * search for an element whose ID is "myButton".
 * 
 * @param {webdriver.WebDriver} driver Instance to add the command to.
 * @param {object} locator Hash object describing the locator strategy to use.
 * @param {webdriver.WebElement} opt_element The element to search under. If not
 *     provided, will search from the document root.
 * @param {boolean} opt_findMany Whether to find many elements or just one;
 *     defaults to {@code false}.
 * @param {function} opt_callbackFn Function to call if the command succeeds.
 * @param {function} opt_errorCallbackFn Function to call if the command fails.
 * @throws If {@code locator} does not define a supported strategy.
 * @static
 */
webdriver.WebElement.buildFindElementCommand = function(driver,
                                                        locator,
                                                        opt_element,
                                                        opt_findMany,
                                                        opt_callbackFn,
                                                        opt_errorCallbackFn) {
  var type, target;
  for (var key in locator) {
    if (key in webdriver.LocatorStrategy) {
      type = key;
      target = locator[key];
      break;
    }
  }

  if (!type) {
    throw new Error('Unsupported locator: ' + goog.json.serialize(locator));

  } else if (type == 'className') {
    var normalized = goog.string.normalizeWhitespace(target);
    target = goog.string.trim(normalized);
    if (target.search(/\s/) >= 0) {
      throw new Error('Compound class names are not allowed for searches: ' +
                      goog.string.quote(target));
    }
  }

  var commandName = opt_findMany ?
      webdriver.CommandName.FIND_ELEMENTS :
      webdriver.CommandName.FIND_ELEMENT;

  var command = new webdriver.Command(commandName, opt_element).
      setParameters(type, target).
      setSuccessCallback(function(response) {
        var ids = response.value.split(',');
        var elements = [];
        for (var i = 0, id; id = ids[i]; i++) {
          if (id) {
            var element = new webdriver.WebElement(driver);
            element.getId().setValue(id);
            elements.push(element);
          }
        }
        response.value = elements;
        if (opt_callbackFn) {
          opt_callbackFn(response);
        }
      }).
      setFailureCallback(opt_errorCallbackFn);
  driver.addCommand(command);
};


/**
 * Adds a command to the given {@code webdriver.WebDriver} instance to find an
 * element on the page.
 * @param {webdriver.WebDriver} driver The driver to perform the search with.
 * @param {Object} locator A hash object describing how to find the element. For
 *     more information, see {@code #buildFindElementCommand()}.
 * @return {webdriver.WebElement} A WebElement that can be used to issue
 *     commands on the found element.  The element's ID will be set
 *     asynchronously once the driver successfully finds the element.
 */
webdriver.WebElement.findElement = function(driver, locator) {
  var webElement = new webdriver.WebElement(driver);
  webdriver.WebElement.buildFindElementCommand(driver, locator, null, false,
      function(response) {
        webElement.getId().setValue(response.value[0].getId().getValue());
      });
  return webElement;
};


/**
 * Adds a command to the given {@code webdriver.WebDriver} instance to test if
 * an element is present on the page.
 * @param {webdriver.WebDriver} driver The driver to perform the search with.
 * @param {Object} locator A hash object describing how to find the element. For
 *     more information, see {@code #buildFindElementCommand()}.
 * @return {webdriver.Future} A future whose value will be set when the driver
 *     completes the search; value will be {@code true} if the element was
 *     found, false otherwise.
 */
webdriver.WebElement.isElementPresent = function(driver, locator) {
  var isPresent = new webdriver.Future(driver);
  webdriver.WebElement.buildFindElementCommand(driver, locator, null, false,
      // If returns without an error, element is present
      function(response) {
        response.value = response.value.length > 0;
        isPresent.setValue(response.value);
      },
      // If returns with an error, element is not present (clear the error!)
      function(response) {
        response.isFailure = false;
        response.value = false;
        isPresent.setValue(false);
      });
  return isPresent;
};


/**
 * Adds a command to the given {@code webdriver.WebDriver} instance to find
 * multiple elements on the page.
 * @param {webdriver.WebDriver} driver The driver to perform the search with.
 * @param {Object} locator A hash object describing how to find the element. For
 *     more information, see {@code #buildFindElementCommand()}.
 */
webdriver.WebElement.findElements = function(driver, locator) {
  webdriver.WebElement.buildFindElementCommand(driver, locator, null, true);
};


/**
 * Adds a command to determine if an element is present under this element in
 * the DOM tree.
 * @param {Object} locator A hash object describing how to find the element. For
 *     more information, see {@code #buildFindElementCommand()}.
 * @return {webdriver.Future} A future whose value will be set when the driver
 *     completes the search; value will be {@code true} if the element was
 *     found, false otherwise.
 */
webdriver.WebElement.prototype.isElementPresent = function(locator) {
  var isPresent = new webdriver.Future(this.driver_);
  webdriver.WebElement.buildFindElementCommand(
      this.driver_, locator, this, false,
      // If returns without an error, element could be present (check response).
      function(response) {
        response.value = response.value.length > 0;
        isPresent.setValue(response.value);
      },
      // If returns with an error, element is not present (clear the error!)
      function(response) {
        response.isFailure = false;
        response.value = false;
        isPresent.setValue(false);
      });
  return isPresent;
};


/**
 * Adds a command to search for a single element on the page, restricting the
 * search to the descendants of the element represented by this instance.
 * @param {Object} locator A hash object describing how to find the element. For
 *     more information, see {@code #buildFindElementCommand()}.
 * @return {webdriver.WebElement} A WebElement that can be used to issue
 *     commands on the found element.  The element's ID will be set
 *     asynchronously once the element is successfully located.
 */
webdriver.WebElement.prototype.findElement = function(locator) {
  var webElement = new webdriver.WebElement(this.driver_);
  webdriver.WebElement.buildFindElementCommand(
      this.driver_, locator, this, false,
      function(response) {
        webElement.getId().setValue(response.value[0].getId().getValue());
      });
  return webElement;
};


/**
 * Adds a command to search for multiple elements on the page, restricting the
 * search to the descendants of hte element represented by this instance.
 * @param {Object} locator A hash object describing how to find the element. For
 *     more information, see {@code #buildFindElementCommand()}.
 */
webdriver.WebElement.prototype.findElements = function(locator) {
  webdriver.WebElement.buildFindElementCommand(
      this.driver_, locator, this, true);
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
 * Creates a new {@code webdriver.Command} against the element represented by
 * this instance.
 * @param {string} name The name of the command to create.
 * @return {webdriver.Command} The new command.
 * @private
 */
webdriver.WebElement.prototype.createCommand_ = function(name) {
  return new webdriver.Command(name, this);
};


/**
 * Adds a command to click on this element.
 */
webdriver.WebElement.prototype.click = function() {
  var command = this.createCommand_(webdriver.CommandName.CLICK);
  this.driver_.addCommand(command);
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
 * @param {string|webdriver.Future} var_args The strings to type. All arguments
 *     will be joined into a single sequence (var_args is permitted for
 *     convenience).
 */
webdriver.WebElement.prototype.sendKeys = function(var_args) {
  var command = this.createCommand_(webdriver.CommandName.SEND_KEYS);
  command.setParameters.apply(command, arguments);
  this.driver_.addCommand(command);
};

/**
 * Queries for the tag/node name of this element.
 */
webdriver.WebElement.prototype.getTagName = function() {
  var name = new webdriver.Future(this.driver_);
  var command = this.createCommand_(webdriver.CommandName.GET_TAG_NAME).
      setSuccessCallback(name.setValueFromResponse, name);
  this.driver_.addCommand(command);
  return name;
};


/**
 * Queries for the specified attribute.
 * @param {string} attributeName The name of the attribute to query.
 */
webdriver.WebElement.prototype.getAttribute = function(attributeName) {
  var value = new webdriver.Future(this.driver_);
  var command = this.createCommand_(webdriver.CommandName.GET_ATTRIBUTE).
      setParameters(attributeName).
      setSuccessCallback(value.setValueFromResponse, value).
      // If there is an error b/c the attribute was not found, set value to null
      setFailureCallback(function(response) {
        // TODO(jmleyba): This error message needs to be consistent for all
        // drivers.
        if (response.value == 'No match') {
          response.isFailure = false;
          response.value = null;
          value.setValue(null);
        }
      });
  this.driver_.addCommand(command);
  return value;
};


/**
 * @return {webdriver.Future} The value attribute for the element represented by
 *    this instance.
 */
webdriver.WebElement.prototype.getValue = function() {
  var value = new webdriver.Future(this.driver_);
  var command = this.createCommand_(webdriver.CommandName.GET_VALUE).
      setSuccessCallback(value.setValueFromResponse, value);
  this.driver_.addCommand(command);
  return value;
};


/**
 * @return {webdriver.Future} The innerText of this element, without any leading
 *     or trailing whitespace.
 */
webdriver.WebElement.prototype.getText = function() {
  var text = new webdriver.Future(this.driver_);
  var command = this.createCommand_(webdriver.CommandName.GET_TEXT).
      setSuccessCallback(text.setValueFromResponse, text);
  this.driver_.addCommand(command);
  return text;
};


/**
 * Selects this element.
 */
webdriver.WebElement.prototype.setSelected = function() {
  var command = this.createCommand_(webdriver.CommandName.SET_SELECTED);
  this.driver_.addCommand(command);
};


/**
 * @return {webdriver.Future} The size of this element.
 */
webdriver.WebElement.prototype.getSize = function() {
  var size = new webdriver.Future(this.driver_);
  var command = this.createCommand_(webdriver.CommandName.GET_SIZE).
      setSuccessCallback(function(response) {
        var wh = response.value.replace(/\s/g, '').split(',');
        response.value = new goog.math.Size(wh[0], wh[1]);
        size.setValue(response.value);
      });
  this.driver_.addCommand(command);
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
  var command = this.createCommand_(webdriver.CommandName.GET_LOCATION).
      setSuccessCallback(
          goog.bind(webdriver.WebElement.createCoordinatesFromResponse_, null,
              currentLocation));
  this.driver_.addCommand(command);
  return currentLocation;
};


/**
 * @param {webdriver.Future} newLocation Future to store the new location in
 *     when the command is complete.
 * @param {number} x Horizontal distance to drag this element.
 * @param {number} y Vertical distanct to drag this element.
 * @param opt_addToFront
 * @private
 */
webdriver.WebElement.prototype.addDragAndDropCommand_ = function(
    newLocation, x, y, opt_addToFront) {
  var command = this.createCommand_(webdriver.CommandName.DRAG).
      setParameters(x, y).
      setSuccessCallback(
          goog.bind(webdriver.WebElement.createCoordinatesFromResponse_, null,
              newLocation));
  this.driver_.addCommand(command, opt_addToFront);
};


/**
 * Drags this element by the given offset.
 * @param {number} x The horizontal amount, in pixels, to drag this element.
 * @param {number} y The vertical amount, in pixels, to drag this element.
 * @return {webdriver.Future} The new location of the element.
 */
webdriver.WebElement.prototype.dragAndDropBy = function(x, y) {
  var newLocation = new webdriver.Future(this.driver_);
  this.addDragAndDropCommand_(newLocation, x, y);
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
    this.addDragAndDropCommand_(newLocation, delta.x, delta.y, true);
  }, this));
  return newLocation;
};


/**
 * @return {boolean} Whether the DOM element represented by this instance is
 *     enabled, as dictated by the {@code disabled} attribute.
 */
webdriver.WebElement.prototype.isEnabled = function() {
  var futureValue = new webdriver.Future(this.driver_);
  var command = this.createCommand_(webdriver.CommandName.GET_ATTRIBUTE).
      setParameters('disabled').
      setSuccessCallback(function(response) {
        response.value = !!!response.value;
        futureValue.setValue(response.value);
      });
  this.driver_.addCommand(command);
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
  var command = this.createCommand_(webdriver.CommandName.GET_TAG_NAME).
      setSuccessCallback(function(response) {
        var attribute = response.value == 'input' ? 'checked' : 'selected';
        var getAttrCommand =
            this.createCommand_(webdriver.CommandName.GET_ATTRIBUTE).
                setParameters(attribute).
                setSuccessCallback(function(response) {
                  response.value = !!response.value;
                  value.setValue(response.value);
                });
        this.driver_.addCommand(getAttrCommand, true);
      }, this);
  this.driver_.addCommand(command, opt_addToFront);
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
  var command = this.createCommand_(webdriver.CommandName.TOGGLE).
      setSuccessCallback(function() {
        this.isCheckedOrSelected_(toggleResult, true);
      }, this);
  this.driver_.addCommand(command);
  return toggleResult;
};


/**
 * If this current element is a form, or an element within a form, then this
 * will that form.
 */
webdriver.WebElement.prototype.submit = function() {
  this.driver_.addCommand(
      this.createCommand_(webdriver.CommandName.SUBMIT));
};


/**
 * If this instance represents a text INPUT element, or a TEXTAREA element, this
 * will clear its {@code value}.
 */
webdriver.WebElement.prototype.clear = function() {
  this.driver_.addCommand(
      this.createCommand_(webdriver.CommandName.CLEAR));
};


/**
 * @return {webdriver.Future} Whether this element is currently displayed.
 */
webdriver.WebElement.prototype.isDisplayed = function() {
  var futureValue = new webdriver.Future(this.driver_);
  var command = this.createCommand_(webdriver.CommandName.IS_DISPLAYED).
      setSuccessCallback(function(response) {
        // TODO(jmleyba): FF extension should not be returning a string here...
        if (goog.isString(response.value)) {
          futureValue.setValue(response.value == 'true');
        } else {
          futureValue.setValue(response.value);
        }
      });
  this.driver_.addCommand(command);
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

