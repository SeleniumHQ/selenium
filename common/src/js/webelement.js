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
goog.require('webdriver.By.Locator');
goog.require('webdriver.By.Strategy');
goog.require('webdriver.CommandName');
goog.require('webdriver.Future');


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
 * Adds a command to determine if an element is present under this element in
 * the DOM tree.
 * @param {webdriver.By.Locator|{*: string}} locator The locator to use for
 *     finding the element, or a short-hand object that can be converted into a
 *     locator.
 * @return {webdriver.Future} A future whose value will be set when the driver
 *     completes the search; value will be {@code true} if the element was
 *     found, false otherwise.
 * @see webdriver.By.Locator.createFromObj
 */
webdriver.WebElement.prototype.isElementPresent = function(locator) {
  locator = webdriver.By.Locator.checkLocator(locator);
  return this.driver_.callFunction(function() {
    var findCommand = this.
        createCommand_(webdriver.CommandName.FIND_CHILD_ELEMENT).
        setParameter('using', locator.type).
        setParameter('value', locator.target);
    var commandFailed = false;
    var key = goog.events.listenOnce(findCommand,
        webdriver.Command.ERROR_EVENT, function(e) {
          commandFailed = true;
          this.driver_.abortCommand(e.currentTarget);
          e.preventDefault();
          e.stopPropagation();
          return false;
        }, /*capture phase*/true, this);
    return this.driver_.callFunction(function() {
      goog.events.unlistenByKey(key);
      return !commandFailed;
    });
  }, this);
};


/**
 * Adds a command to search for a single element on the page, restricting the
 * search to the descendants of the element represented by this instance.
 * @param {webdriver.By.Locator|{*: string}} locator The locator to use for
 *     finding the element, or a short-hand object that can be converted into a
 *     locator.
 * @return {webdriver.WebElement} A WebElement that can be used to issue
 *     commands on the found element.  The element's ID will be set
 *     asynchronously once the element is successfully located.
 * @see webdriver.By.Locator.createFromObj
 */
webdriver.WebElement.prototype.findElement = function(locator) {
  var webElement = new webdriver.WebElement(this.driver_);
  locator = webdriver.By.Locator.checkLocator(locator);
  this.driver_.callFunction(function() {
    var command = this.
        createCommand_(webdriver.CommandName.FIND_CHILD_ELEMENT).
        setParameter('using', locator.type).
        setParameter('value', locator.target);
    this.driver_.callFunction(function(id) {
      webElement.getId().setValue(id['ELEMENT']);
    });
  }, this);
  return webElement;
};


/**
 * Adds a command to search for multiple elements on the page, restricting the
 * search to the descendants of hte element represented by this instance.
 * @param {webdriver.By.Locator|{*: string}} locator The locator to use for
 *     finding the element, or a short-hand object that can be converted into a
 *     locator.
 * @see webdriver.By.Locator.createFromObj
 */
webdriver.WebElement.prototype.findElements = function(locator) {
  locator = webdriver.By.Locator.checkLocator(locator);
  this.driver_.callFunction(function() {
    this.createCommand_(webdriver.CommandName.FIND_CHILD_ELEMENTS).
        setParameter('using', locator.type).
        setParameter('value', locator.target);
    return this.driver_.callFunction(function(ids) {
      var elements = [];
      for (var i = 0; i < ids.length; i++) {
        if (ids[i]) {
          var element = new webdriver.WebElement(this.driver_);
          element.getId().setValue(ids[i]['ELEMENT']);
          elements.push(element);
        }
      }
      return elements;
    }, this);
  }, this);
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
  return this.driver_.addCommand(name).setParameter('id', this.getId());
};


/**
 * Adds a command to click on this element.
 */
webdriver.WebElement.prototype.click = function() {
  this.createCommand_(webdriver.CommandName.CLICK_ELEMENT);
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
  var command = this.createCommand_(
      webdriver.CommandName.SEND_KEYS_TO_ELEMENT);
  command.setParameter('value', goog.array.slice(arguments, 0));
};

/**
 * Queries for the tag/node name of this element.
 */
webdriver.WebElement.prototype.getTagName = function() {
  return this.createCommand_(webdriver.CommandName.GET_ELEMENT_TAG_NAME).
      getFutureResult();
};


/**
 * Queries for the computed style of the element represented by this instance.
 * If the element inherits the named style from its parent, the parent will be
 * queried for its value.  Where possible, color values will be converted to
 * their hex representation (#00ff00 instead of rgb(0, 255, 0)).
 * <em>Warning:</em> the value returned will be as the browser interprets it, so
 * it may be tricky to form a proper assertion.
 * @param {string} cssStyleProperty The name of the CSS style property to look
 *     up.
 * @return {webdriver.Future<string>} The computed style property wrapped in a
 *    Future.
 */
webdriver.WebElement.prototype.getComputedStyle = function(cssStyleProperty) {
  return this.createCommand_(
      webdriver.CommandName.GET_ELEMENT_VALUE_OF_CSS_PROPERTY).
      setParameter('propertyName', cssStyleProperty).
      getFutureResult();
};


/**
 * Queries for the specified attribute.
 * @param {string} attributeName The name of the attribute to query.
 */
webdriver.WebElement.prototype.getAttribute = function(attributeName) {
  return this.createCommand_(webdriver.CommandName.GET_ELEMENT_ATTRIBUTE).
      setParameter('name', attributeName).
      getFutureResult();
};


/**
 * @return {webdriver.Future} The value attribute for the element represented by
 *    this instance.
 */
webdriver.WebElement.prototype.getValue = function() {
  return this.createCommand_(webdriver.CommandName.GET_ELEMENT_VALUE).
      getFutureResult();
};


/**
 * @return {webdriver.Future} The innerText of this element, without any leading
 *     or trailing whitespace.
 */
webdriver.WebElement.prototype.getText = function() {
  return this.createCommand_(webdriver.CommandName.GET_ELEMENT_TEXT).
      getFutureResult();
};


/**
 * Selects this element.
 */
webdriver.WebElement.prototype.setSelected = function() {
  this.createCommand_(webdriver.CommandName.SET_ELEMENT_SELECTED);
};


/**
 * @return {webdriver.Future} The size of this element.
 */
webdriver.WebElement.prototype.getSize = function() {
  return this.createCommand_(webdriver.CommandName.GET_ELEMENT_SIZE).
      getFutureResult();
};


/**
 * @return {webdriver.Future} The location of this element.
 */
webdriver.WebElement.prototype.getLocation = function() {
  return this.createCommand_(webdriver.CommandName.GET_ELEMENT_LOCATION).
      getFutureResult();
};


/**
 * Drags this element by the given offset.
 * @param {number} x The horizontal amount, in pixels, to drag this element.
 * @param {number} y The vertical amount, in pixels, to drag this element.
 * @return {webdriver.Future} The new location of the element.
 */
webdriver.WebElement.prototype.dragAndDropBy = function(x, y) {
  return this.createCommand_(webdriver.CommandName.DRAG_ELEMENT).
      setParameter('x', x).
      setParameter('y', y).
      getFutureResult();
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
  return this.driver_.callFunction(function() {
    var delta = goog.math.Coordinate.difference(
        toLocation.getValue(), thisLocation.getValue());
    return this.dragAndDropBy(delta.x, delta.y);
  }, this);
};


/**
 * @return {boolean} Whether the DOM element represented by this instance is
 *     enabled, as dictated by the {@code disabled} attribute.
 */
webdriver.WebElement.prototype.isEnabled = function() {
  return this.driver_.callFunction(function() {
    this.getAttribute('disabled');
    return this.driver_.callFunction(function(value) {
      return !!!value;
    });
  }, this);
};


/**
 * Determines if this element is checked or selected; will generate an error if
 * the DOM element represented by this instance is not an OPTION or checkbox
 * INPUT element.
 * @return {webdriver.Future} Whether this element is checked or selected.
 * @private
 */
webdriver.WebElement.prototype.isCheckedOrSelected_ = function() {
  return this.driver_.callFunction(function() {
    this.createCommand_(webdriver.CommandName.GET_ELEMENT_TAG_NAME);
    return this.driver_.callFunction(function(prevResult) {
      var attribute = prevResult == 'input' ? 'checked' : 'selected';
      return this.getAttribute(attribute);
    }, this);
  }, this);
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
  return this.driver_.callFunction(function() {
    this.createCommand_(webdriver.CommandName.TOGGLE_ELEMENT);
    return this.isCheckedOrSelected_();
  }, this);
};


/**
 * If this current element is a form, or an element within a form, then this
 * will that form.
 */
webdriver.WebElement.prototype.submit = function() {
  this.createCommand_(webdriver.CommandName.SUBMIT_ELEMENT);
};


/**
 * If this instance represents a text INPUT element, or a TEXTAREA element, this
 * will clear its {@code value}.
 */
webdriver.WebElement.prototype.clear = function() {
  this.createCommand_(webdriver.CommandName.CLEAR_ELEMENT);
};


/**
 * @return {webdriver.Future} Whether this element is currently displayed.
 */
webdriver.WebElement.prototype.isDisplayed = function() {
  return this.createCommand_(webdriver.CommandName.IS_ELEMENT_DISPLAYED).
      getFutureResult();
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

