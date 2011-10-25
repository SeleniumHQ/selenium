// Copyright 2011 WebDriver committers
// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Contains several classes for handling commands.
 */

goog.provide('webdriver.Command');
goog.provide('webdriver.CommandExecutor');
goog.provide('webdriver.CommandName');



/**
 * Describes a command to be executed by the WebDriverJS framework.
 * @param {!webdriver.CommandName} name The name of this command.
 * @constructor
 */
webdriver.Command = function(name) {

  /**
   * The name of this command.
   * @type {!webdriver.CommandName}
   * @private
   */
  this.name_ = name;

  /**
   * The parameters to this command.
   * @type {!Object.<*>}
   * @private
   */
  this.parameters_ = {};
};


/**
 * @return {!webdriver.CommandName} This command's name.
 */
webdriver.Command.prototype.getName = function() {
  return this.name_;
};


/**
 * Sets a parameter to send with this command.
 * @param {string} name The parameter name.
 * @param {*} value The parameter value.
 * @return {!webdriver.Command} A self reference.
 */
webdriver.Command.prototype.setParameter = function(name, value) {
  this.parameters_[name] = value;
  return this;
};


/**
 * Sets the parameters for this command.
 * @param {!Object.<*>} parameters The command parameters.
 * @return {!webdriver.Command} A self reference.
 */
webdriver.Command.prototype.setParameters = function(parameters) {
  this.parameters_ = parameters;
  return this;
};


/**
 * Returns a named command parameter.
 * @param {string} key The parameter key to look up.
 * @return {*} The parameter value, or undefined if it has not been set.
 */
webdriver.Command.prototype.getParameter = function(key) {
  return this.parameters_[key];
};


/**
 * @return {Object.<*>} The parameters to send with this command.
 */
webdriver.Command.prototype.getParameters = function() {
  return this.parameters_;
};


/**
 * Enumeration of predefined names command names that all command processors
 * will support. Implemented as a map so the enumeration can be properly
 * exported as part of WebDriver's public API.
 * @type {!Object.<string>}
 */
// TODO(jleyba): Delete obsolete command names.
webdriver.CommandName = {
  'GET_SERVER_STATUS': 'status',

  'NEW_SESSION': 'newSession',
  'DESCRIBE_SESSION': 'describeSession',

  'CLOSE': 'close',
  'QUIT': 'quit',

  'GET_CURRENT_URL': 'getCurrentUrl',
  'GET': 'get',
  'GO_BACK': 'goBack',
  'GO_FORWARD': 'goForward',
  'REFRESH': 'refresh',

  'ADD_COOKIE': 'addCookie',
  'GET_COOKIE': 'getCookie',
  'GET_ALL_COOKIES': 'getCookies',
  'DELETE_COOKIE': 'deleteCookie',
  'DELETE_ALL_COOKIES': 'deleteAllCookies',

  'FIND_ELEMENT': 'findElement',
  'FIND_ELEMENTS': 'findElements',
  'FIND_CHILD_ELEMENT': 'findChildElement',
  'FIND_CHILD_ELEMENTS': 'findChildElements',
  'GET_ACTIVE_ELEMENT': 'getActiveElement',

  'CLEAR_ELEMENT': 'clearElement',
  'CLICK_ELEMENT': 'clickElement',
  'SEND_KEYS_TO_ELEMENT': 'sendKeysToElement',
  'SUBMIT_ELEMENT': 'submitElement',
  'TOGGLE_ELEMENT': 'toggleElement',

  'GET_CURRENT_WINDOW_HANDLE': 'getCurrentWindowHandle',
  'GET_WINDOW_HANDLES': 'getWindowHandles',

  'SWITCH_TO_WINDOW': 'switchToWindow',
  'SWITCH_TO_FRAME': 'switchToFrame',
  'GET_PAGE_SOURCE': 'getPageSource',
  'GET_TITLE': 'getTitle',

  'EXECUTE_SCRIPT': 'executeScript',
  'EXECUTE_ASYNC_SCRIPT': 'executeAsyncScript',

  'GET_ELEMENT_TEXT': 'getElementText',
  'GET_ELEMENT_TAG_NAME': 'getElementTagName',
  'IS_ELEMENT_SELECTED': 'isElementSelected',
  'IS_ELEMENT_ENABLED': 'isElementEnabled',
  'IS_ELEMENT_DISPLAYED': 'isElementDisplayed',
  'GET_ELEMENT_LOCATION': 'getElementLocation',
  'GET_ELEMENT_SIZE': 'getElementSize',
  'GET_ELEMENT_ATTRIBUTE': 'getElementAttribute',
  'GET_ELEMENT_VALUE_OF_CSS_PROPERTY': 'getElementValueOfCssProperty',
  'ELEMENT_EQUALS': 'elementEquals',

  'SCREENSHOT': 'screenshot',
  'DIMISS_ALERT': 'dimissAlert',
  'IMPLICITLY_WAIT': 'implicitlyWait',
  'SET_SCRIPT_TIMEOUT': 'setScriptTimeout',

  'GET_ALERT': 'getAlert',
  'ACCEPT_ALERT': 'acceptAlert',
  'DISMISS_ALERT': 'dismissAlert',
  'GET_ALERT_TEXT': 'getAlertText',
  'SET_ALERT_VALUE': 'setAlertValue'
};


/**
 * Handles the execution of {@code webdriver.Command} objects.
 * @interface
 */
webdriver.CommandExecutor = function() {};


/**
 * Executes the given {@code command}.  Will return a promise that will be
 * resolved when a response is ready.  If there is an error executing the
 * command, the promise will be rejected with the offending error.
 * @param {!webdriver.Command} command The command to execute.
 * @return {!webdriver.promise.Promise} A promise that will be resolved when the
 *     command has finished execution.
 */
webdriver.CommandExecutor.prototype.execute = goog.abstractMethod;
