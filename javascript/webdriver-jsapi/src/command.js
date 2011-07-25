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
goog.provide('webdriver.Response.Code');

goog.require('goog.array');
goog.require('goog.events.EventTarget');
goog.require('goog.testing.stacktrace');
goog.require('webdriver.Future');


/**
 * Describes a command to be executed by a
 * {@code webdriver.AbstractCommandProcessor}.
 * @param {webdriver.WebDriver} driver The driver that this is a command for.
 * @param {webdriver.CommandName} name The name of this command.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
webdriver.Command = function(driver, name) {
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
   * The parameters to this command.
   * @type {Object}
   */
  this.parameters = {};

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
 * Sets a parameter to send with this command.
 * @param {string} name The parameter name.
 * @param {*} var_args The parameter value.
 * @return {webdriver.Command} A self reference.
 */
webdriver.Command.prototype.setParameter = function(name, value) {
  this.parameters[name] = value;
  return this;
};


/**
 * @return {Object} The parameters to send with this command.
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
  if (this.response.getStatus() == webdriver.Response.Code.SUCCESS) {
    this.futureResult_.setValue(this.response.getValue());
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

  CLOSE: 'close',
  QUIT: 'quit',

  GET: 'get',
  GO_BACK: 'goBack',
  GO_FORWARD: 'goForward',
  REFRESH: 'refresh',

  ADD_COOKIE: 'addCookie',
  GET_COOKIE: 'getCookie',
  GET_ALL_COOKIES: 'getCookies',
  DELETE_COOKIE: 'deleteCookie',
  DELETE_ALL_COOKIES: 'deleteAllCookies',

  FIND_ELEMENT: 'findElement',
  FIND_ELEMENTS: 'findElements',
  FIND_CHILD_ELEMENT: 'findChildElement',
  FIND_CHILD_ELEMENTS: 'findChildElements',

  CLEAR_ELEMENT: 'clearElement',
  CLICK_ELEMENT: 'clickElement',
  HOVER_OVER_ELEMNET: 'hoverOverElement',
  SEND_KEYS_TO_ELEMENT: 'sendKeysToElement',
  SUBMIT_ELEMENT: 'submitElement',
  TOGGLE_ELEMENT: 'toggleElement',

  GET_CURRENT_WINDOW_HANDLE: 'getCurrentWindowHandle',
  GET_WINDOW_HANDLES: 'getWindowHandles',

  SWITCH_TO_WINDOW: 'switchToWindow',
  SWITCH_TO_FRAME: 'switchToFrame',
  SWITCH_TO_DEFAULT_CONTENT: 'switchToDefaultContent',
  GET_ACTIVE_ELEMENT: 'getActiveElement',

  GET_CURRENT_URL: 'getCurrentUrl',
  GET_PAGE_SOURCE: 'getPageSource',
  GET_TITLE: 'getTitle',

  EXECUTE_SCRIPT: 'executeScript',

  GET_SPEED: 'getSpeed',
  SET_SPEED: 'setSpeed',

  SET_BROWSE_VISIBLE: 'setBrowserVisible',
  IS_BROWSER_VISIBLE: 'isBrowserVisible',

  GET_ELEMENT_TEXT: 'getElementText',
  GET_ELEMENT_VALUE: 'getElementValue',
  GET_ELEMENT_TAG_NAME: 'getElementTagName',
  SET_ELEMENT_SELECTED: 'setElementSelected',
  DRAG_ELEMENT: 'dragElement',
  IS_ELEMENT_SELECTED: 'isElementSelected',
  IS_ELEMENT_ENABLED: 'isElementEnabled',
  IS_ELEMENT_DISPLAYED: 'isElementDisplayed',
  GET_ELEMENT_LOCATION: 'getElementLocation',
  GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW:
      'getElementLocationOnceScrolledIntoView',
  GET_ELEMENT_SIZE: 'getElementSize',
  GET_ELEMENT_ATTRIBUTE: 'getElementAttribute',
  GET_ELEMENT_VALUE_OF_CSS_PROPERTY: 'getElementValueOfCssProperty',
  ELEMENT_EQUALS: 'elementEquals',

  SCREENSHOT: 'screenshot',
  DIMISS_ALERT: 'dimissAlert'
};


/**
 * Encapsulates a response to a {@code webdriver.Command}.
 * @param {webdriver.Response.Code} status The status code for this response.
 * @param {*} value The value of the response, the meaning of which depends
 *     on the command.
 * @constructor
 */
webdriver.Response = function(status, value) {

  /**
   * The status code for this response.
   * @type {webdriver.Response.Code}
   * @private
   */
  this.status_ = status;

  /**
   * The value for this response.
   * @type {*}
   * @private
   */
  this.value_ = value;
};


/** @return {webdriver.Response.Code} The status code for this response. */
webdriver.Response.prototype.getStatus = function() {
  return this.status_;
};


/** @return {*} The value of this response. */
webdriver.Response.prototype.getValue = function() {
  return this.value_;
};


/** @return {!boolean} Whether this is a response to a successful command. */
webdriver.Response.prototype.isSuccess = function() {
  return this.status_ == webdriver.Response.Code.SUCCESS;
};


/**
 * @return {?string} A formatted error message, or {@code null} if this is not a
 *     failure response.
 */
webdriver.Response.prototype.getErrorMessage = function() {
  if (this.status_ == webdriver.Response.Code.SUCCESS) {
    return null;
  }

  if (!this.value_) {
    return 'Unknown error';  // Really should never happen
  }

  if (goog.isDef(this.value_['message'])) {
    var message = [this.value_['message']];

    var stackTrace = this.value_['stackTrace'];
    if (goog.isArray(stackTrace)) {
      goog.array.extend(message, goog.array.map(this.value_['stackTrace'],
          function(frame) {
            var buffer = [];

            // className is provided by remote java servers
            var className = frame['className'];
            if (goog.isDef(className)) {
              buffer.push(className + '.');
            }
            buffer.push(frame['methodName'] || '<anonymous function>');
            buffer.push('() at ');
            // fileName will be undefined if the method call was to an XPCOM
            // interface.
            buffer.push(frame['fileName'] || '<unknown file>');
            buffer.push(':');
            buffer.push(frame['lineNumber']);
            return buffer.join('');
          }));
    } else if (goog.isDef(stackTrace)) {
      message.push(stackTrace);
    } else if (goog.isDef(this.value_.stack)) {
      message.push(goog.testing.stacktrace.canonicalize(this.value_.stack));
    }
    return message.join('\n');
  } else {
    return this.value_.toString();
  }
};


/**
 * Error codes used by the wire protocol.
 * @enum {number}
 */
webdriver.Response.Code = {
  /* keep in sync with codes in org.openqa.selenium.remote.ErrorCodes */
  SUCCESS: 0,
  COOKIE_ERROR: 2,
  NO_SUCH_WINDOW: 3,
  NO_SUCH_ELEMENT: 7,
  NO_SUCH_FRAME: 8,
  UNKNOWN_COMMAND: 9,
  STALE_ELEMENT_REFERENCE: 10,
  ELEMENT_NOT_VISIBLE: 11,
  INVALID_ELEMENT_STATE: 12,
  UNHANDLED_ERROR: 13,
  UNEXPECTED_JAVASCRIPT_ERROR: 17,
  XPATH_LOOKUP_ERROR: 19,
  INVALID_SELECTOR_ERROR: 32
};
