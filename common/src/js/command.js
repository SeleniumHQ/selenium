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

goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.testing.stacktrace');


/**
 * Describes a command to be executed by a
 * {@code webdriver.AbstractCommandProcessor}.
 * @param {webdriver.WebDriver} driver The driver that this is a command for.
 * @param {webdriver.CommandName} name The name of this command.
 * @param {webdriver.WebElement} opt_element The element to perform this
 *     command on. If not defined, the command will be performed relative to
 *     the document root.
 * @constructor
 * @extends {goog.Disposable}
 */
webdriver.Command = function(driver, name, opt_element) {
  goog.Disposable.call(this);

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
   * Callback for when the command processor successfully finishes this command.
   * The result of this function is included in the final result of the command.
   * @type {?function}
   */
  this.onSuccessCallbackFn = null;
  
  /**
   * Callback for when the command processor fails to successfully finish a
   * command. The function should take a single argument, the
   * {@code webdriver.Response} from the command processor. The response may be
   * modified (for example, to turn an expect failure into a success). If the
   * error state is cleared, the {@code onSucessCallbackFn} will still not be
   * called.
   * @type {?function}
   */
  this.onFailureCallbackFn = null;

  /**
   * Callback for when this command is completely finished, which is after the
   * response is set and success/failure callbacks have been run. The function
   * should take a single argument, a reference to this command.
   * @type {?function}
   * @private
   */
  this.onCompleteCallbackFn_ = null;

  /**
   * The response to this command.
   * @type {webdriver.Response}
   */
  this.response = null;

  /**
   * Whether this command was aborted.
   * @type {boolean}
   */
  this.abort = false;
};
goog.inherits(webdriver.Command, goog.Disposable);


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
 * Set the parameters to send with this command.
 * @param {*} var_args The arguments to send to this command.
 * @return {webdriver.Command} A self reference.
 */
webdriver.Command.prototype.setParameters = function(var_args) {
  this.parameters = goog.array.slice(arguments, 0);
  return this;
};


/**
 * Set the function to call with the {@code webdriver.Response} when the
 * command processor successfully runs this command. This function is considered
 * part of the command and any errors will cause the command as a whole to fail.
 * @param {function} callbackFn The function to call on success.
 * @param {Object} opt_selfObj The object in whose context to execute the
 *     function.
 */
webdriver.Command.prototype.setSuccessCallback = function(callbackFn,
                                                          opt_selfObj) {
  if (callbackFn) {
    this.onSuccessCallbackFn = goog.bind(callbackFn, opt_selfObj);
  }
  return this;
};


/**
 * Set the function to call with the {@code webdriver.Response} when the
 * command processor encounters an error while executing this command.
 * @param {function} callbackFn The function to call on failure.
 * @param {Object} opt_selfObj The object in whose context to execute the
 *     function.
 */
webdriver.Command.prototype.setFailureCallback = function(callbackFn,
                                                          opt_selfObj) {
  if (callbackFn) {
    this.onFailureCallbackFn = goog.bind(callbackFn, opt_selfObj);
  }
  return this;
};


/**
 * Set the function to call with this command when it is completed.
 * @param {function} callbackFn The function to call on command completion.
 * @param {Object} opt_selfObj The object in whose context to execute the
 *     function.
 */
webdriver.Command.prototype.setCompleteCallback = function(callbackFn,
                                                           opt_selfObj) {
  if (callbackFn) {
    this.onCompleteCallbackFn_ = goog.bind(callbackFn, opt_selfObj);
  }
  return this;
};


/**
 * Set the response for this command. The response may only be set once; any
 * repeat calls will be ignored.
 * @param {webdriver.Response} response The response.
 * @throws If the response was already set.
 */
webdriver.Command.prototype.setResponse = function(response) {
  if (this.response) {
    return;
  }
  this.response = response;

  var sandbox = goog.bind(function(fn) {
    try {
      fn.call(this, this.response);
    } catch (ex) {
      this.response.isFailure = true;
      this.response.errors.push(ex);
    }
  }, this);

  if (!this.response.errors.length) {
    if (this.response.isFailure &&
        goog.isFunction(this.onFailureCallbackFn)) {
      sandbox(this.onFailureCallbackFn);
    } else if (!this.response.isFailure &&
               goog.isFunction(this.onSuccessCallbackFn)) {
      sandbox(this.onSuccessCallbackFn);
    }
  }

  if (!this.response.isFailure) {
    this.futureResult_.setValue(this.response.value);
  }

  if (this.onCompleteCallbackFn_) {
    this.onCompleteCallbackFn_(this);
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
