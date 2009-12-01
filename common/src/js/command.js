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
 * @fileoverview Contains several classes for handling commands.
 * @author jmleyba@gmail.com (Jason Leyba)
 */

goog.provide('webdriver.Command');
goog.provide('webdriver.CommandName');
goog.provide('webdriver.Response');

goog.require('goog.array');
goog.require('goog.events.EventTarget');
goog.require('goog.testing.stacktrace');
goog.require('webdriver.Future');


/**
 * Describes a command to be executed by a
 * {@code webdriver.AbstractCommandProcessor}.
 * @param {webdriver.WebDriver} driver The driver that this is a command for.
 * @param {webdriver.CommandName} name The name of this command.
 * @param {webdriver.WebElement} opt_element The element to perform this
 *     command on. If not defined, the command will be performed relative to
 *     the document root.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
webdriver.Command = function(driver, name, opt_element) {
  goog.events.EventTarget.call(this);

  /**
   * The driver that this is a command to.
   * @type {webdriver.WebDriver}
   * @private
   */
  this.driver_ = driver;

  /**
   * A future that will be automatically updated with the value of this
   * command's response when it is ready. If the command fails, the
   * future's value will not be set.
   * @type {webdriver.Future}
   * @private
   */
  this.futureResult_ = new webdriver.Future(this.driver_);

  /**
   * The name of this command.
   * @type {webdriver.CommandName}
   */
  this.name = name;

  /**
   * The element to perform this command on. If not defined, the command will be
   * performed relative to the document root.
   * @type {webdriver.WebElement}
   */
  this.element = opt_element;

  /**
   * The parameters to this command.
   * @type {Array.<*>}
   */
  this.parameters = [];

  /**
   * The response to this command.
   * @type {?webdriver.Response}
   */
  this.response = null;

};
goog.inherits(webdriver.Command, goog.events.EventTarget);


/**
 * The event dispatched by a command when it fails.
 * @type {string}
 */
webdriver.Command.ERROR_EVENT = 'ERROR';


/** @override */
webdriver.Command.prototype.disposeInternal = function() {
  webdriver.Command.superClass_.disposeInternal.call(this);
  this.futureResult_.dispose();
  delete this.driver_;
  delete this.futureResult_;
  delete this.name;
  delete this.element;
  delete this.parameters;
  delete this.response;
};


/** @override */
webdriver.Command.prototype.toString = function() {
  return this.name;
};


/**
 * @return {webdriver.WebDriver} The driver that this is a command to.
 */
webdriver.Command.prototype.getDriver = function() {
  return this.driver_;
};


/**
 * @return {webdriver.CommandName} This command's name.
 */
webdriver.Command.prototype.getName = function() {
  return this.name;
};


/**
 * @return {webdriver.Future} The future result (value-only) of this command.
 */
webdriver.Command.prototype.getFutureResult = function() {
  return this.futureResult_;
};


/**
 * @return {boolean} Whether this command has finished; aborted commands are
 *     never considered finished.
 */
webdriver.Command.prototype.isFinished = function() {
  return !!this.response;
};


/**
 * Set the parameters to send with this command.
 * @param {*} var_args The arguments to send to this command.
 * @return {webdriver.Command} A self reference.
 */
webdriver.Command.prototype.setParameters = function(var_args) {
  this.parameters = goog.array.slice(arguments, 0);
  return this;
};


/**
 * @return {Array.<*>} The parameters to send with this command.
 */
webdriver.Command.prototype.getParameters = function() {
  return this.parameters;
};


/**
 * @return {?webdriver.Response} The response to this command if it is ready.
 */
webdriver.Command.prototype.getResponse = function() {
  return this.response;
};


/**
 * Set the response for this command. The response may only be set once; any
 * repeat calls will be ignored.
 * @param {webdriver.Response} response The response.
 * @throws If the response was already set.
 */
webdriver.Command.prototype.setResponse = function(response) {
  if (this.isDisposed() || this.isFinished()) {
    return;
  }
  this.response = response;
  this.driver_.setContext(this.response.context);
  if (!this.response.isFailure) {
    this.futureResult_.setValue(this.response.value);
  } else {
    this.dispatchEvent(webdriver.Command.ERROR_EVENT);
  }
};


/**
 * Enumeration of predefined names command names that all command processors
 * will support.
 * @enum {string}
 */
webdriver.CommandName = {
  // Commands executed directly by the JS API. --------------------------------
  FUNCTION: 'function',
  SLEEP: 'sleep',
  WAIT: 'wait',
  PAUSE: 'pause',

  // Commands dispatched to the browser driver. -------------------------------
  NEW_SESSION: 'newSession',
  DELETE_SESSION: 'deleteSession',
  QUIT: 'quit',
  GET_CURRENT_WINDOW_HANDLE: 'getCurrentWindowHandle',
  GET_WINDOW_HANDLES: 'getWindowHandles',
  GET_CURRENT_URL: 'getCurrentUrl',
  CLOSE: 'close',
  SWITCH_TO_WINDOW: 'switchToWindow',
  SWITCH_TO_FRAME: 'switchToFrame',
  SWITCH_TO_DEFAULT_CONTENT: 'switchToDefaultContent',
  GET: 'get',
  FORWARD: 'goForward',
  BACK: 'goBack',
  REFRESH: 'refresh',
  GET_TITLE: 'title',
  GET_PAGE_SOURCE: 'getPageSource',
  EXECUTE_SCRIPT: 'executeScript',
  GET_MOUSE_SPEED: 'getMouseSpeed',
  SET_MOUSE_SPEED: 'setMouseSpeed',
  FIND_ELEMENT: 'findElement',
  FIND_ELEMENTS: 'findElements',
  FIND_CHILD_ELEMENT: 'findChildElement',
  FIND_CHILD_ELEMENTS: 'findChildElements',
  GET_ACTIVE_ELEMENT: 'getActiveElement',
  SET_VISIBLE: 'setVisible',
  GET_VISIBLE: 'getVisible',
  CLICK: 'click',
  CLEAR: 'clear',
  SUBMIT: 'submit',
  GET_TEXT: 'getText',
  SEND_KEYS: 'sendKeys',
  GET_VALUE: 'getValue',
  GET_TAG_NAME: 'getTagName',
  IS_SELECTED: 'isSelected',
  SET_SELECTED: 'setSelected',
  TOGGLE: 'toggle',
  IS_ENABLED: 'isEnabled',
  IS_DISPLAYED: 'isDisplayed',
  GET_LOCATION: 'getLocation',
  GET_SIZE: 'getSize',
  GET_ATTRIBUTE: 'getAttribute',
  DRAG_ELEMENT: 'dragElement',
  GET_VALUE_OF_CSS_PROPERTY: 'getValueOfCssProperty'
};


/**
 * Encapsulates a response to a {@code webdriver.Command}.
 * @param {boolean} isFailure Whether the command resulted in an error. If
 *     {@code true}, then {@code value} contains the error message.
 * @param {webdriver.Context} context The (potentially new) context resulting
 *     from the command.
 * @param {*} value The value of the response, the meaning of which depends
 *     on the command.
 * @parma {Error} opt_error An error that caused this command to fail
 *     prematurely.
 * @constructor
 */
webdriver.Response = function(isFailure, context, value, opt_error) {
  this.isFailure = isFailure;
  this.context = context;
  this.value = value;
  this.errors = goog.array.slice(arguments, 3);
};


/**
 * @return {?string} A formatted error message, or {@code null} if this is not a
 *     failure response.
 */
webdriver.Response.prototype.getErrorMessage = function() {
  if (!this.isFailure) {
    return null;
  }
  var message = [];
  if (goog.isString(this.value)) {
    message.push(this.value);
  } else if (null != this.value && goog.isDef(this.value.message)) {
    message.push(this.value.message);
    if (goog.isDef(this.value.fileName)) {
      message.push(this.value.fileName + '@' + this.value.lineNumber);
    }
  }
  goog.array.extend(message, goog.array.map(this.errors, function(error) {
    if (goog.isString(error)) {
      return error;
    }
    var errMsg = error.message || error.description || error.toString();
    var stack = error.stack ?
        goog.testing.stacktrace.canonicalize(error.stack) : error['stackTrace'];
    return errMsg + '\n' + stack;
  }));
  return message.join('\n');
};
