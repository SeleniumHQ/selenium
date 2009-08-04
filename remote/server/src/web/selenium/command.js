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
 * @fileoverview Contains several classes for handling commands.
 * @author jmleyba@gmail.com (Jason Leyba)
 */

goog.provide('webdriver.Command');
goog.provide('webdriver.CommandInfo');
goog.provide('webdriver.Response');


/**
 * Describes the basic structure of a command to send.  Each instance of this
 * class is considered immutable.
 * @param {string} methodName The method to call when using a local command
 *     processor.
 * @param {string} url The path on the RemoteServer to send the command to when
 *     using a remote command processor.
 * @param {webdriver.CommandInfo.Verb} verb The HTTP method to use when sending
 *     the command with a remote command processor.
 * @constructor
 */
webdriver.CommandInfo = function(methodName, url, verb) {
  this.methodName = methodName;
  this.url = url;
  this.verb = verb;
};


/**
 * Creates a {@code webdriver.Command} for the given {@code webdriver.WebDriver}
 * instance.
 * @param {webdriver.WebDriver} driver The driver that will eventually execute
 *     the created command.
 * @param {Array.<*>} opt_args The arguments to send with the command.
 * @param {function} opt_callbackFn The function to call when the command
 *     completes.  The function should take a single argument, the
 *     {@code webdriver.Response} to the command.
 * @param {function} opt_errorCallbackFn The function to call if the command
 *     returns an error.  The function should take a single argument, the
 *     {@code webdriver.Response} to the command. Note that this function can
 *     handle expected errors (e.g. negative paths) by clearing the error flag
 *     of the response.
 * @return {webdriver.Command} The new Command object.
 */
webdriver.CommandInfo.prototype.buildCommand = function(driver, opt_args,
                                                        opt_callbackFn,
                                                        opt_errorCallbackFn) {
  return new webdriver.Command(driver.getSessionId(), driver.getContext(), this,
      opt_args, opt_callbackFn, opt_errorCallbackFn);
};


// An anonymous function used to initialize predefined webdriver.CommandInfo
// objects in a more readable manner.
(function() {
  var info = webdriver.CommandInfo;

  info.NEW_SESSION = new info('findActiveDriver', '/session', 'POST');
  info.QUIT = new info(null, '/session/:sessionId', 'DELETE');

  info.GET_CURRENT_WINDOW_HANDLE = new info(
      'getCurrentWindowHandle', '/session/:sessionId/:context/window_handle',
      'GET');
  info.GET_CURRENT_WINDOW_HANDLES = new info(
      'getAllWindowHandles', '/session/:sessionId/:context/window_handles',
      'GET');
  info.GET_PAGE_SOURCE = new info('getPageSource', '', 'GET');

  info.GET = new info('get', '/session/:sessionId/:context/url', 'POST');
  info.FORWARD = new info(
      'goForward', '/session/:sessionId/:context/forward', 'POST');
  info.BACK = new info('goBack', '/session/:sessionId/:context/back', 'POST');
  info.REFRESH = new info(
      'refresh', '/session/:sessionId/:context/refresh', 'POST');

  info.GET_TITLE = new info(
      'title', '/session/:sessionId/:context/title', 'GET');
  info.PAGE_SOURCE = new info(
      'getPageSource', '/session/:sessionId/:context/source', 'GET');

  info.CLOSE = new info(
      'close', '/session/:sessionId/:context/window', 'DELETE');
  info.SWITCH_TO_WINDOW = new info(
      'switchToWindow', '/session/:sessionId/:context/window/:name', 'POST');
  info.SWITCH_TO_FRAME = new info(
      'switchToFrame', '/session/:sessionId/:context/frame/:id', 'POST');
  info.SWITCH_TO_DEFAULT_CONTENT = new info(
      'switchToDefaultContent',
      '/session/:sessionId/:context/frame/:id', 'POST');

  info.EXECUTE_SCRIPT = new info(
      'executeScript', '/session/:sessionId/:context/execute', 'POST');

  info.GET_MOUSE_SPEED = new info(
      'getMouseSpeed', '/session/:sessionId/:context/speed', 'GET');
  info.SET_MOUSE_SPEED = new info(
      'setMouseSpeed', '/session/:sessionId/:context/speed', 'POST');

  info.GET_ACTIVE_ELEMENT = new info('getActiveElement',
      '/session/:sessionId/:context/element/active', 'POST');

  info.SET_VISIBLE = new info(
      'setVisible', '/session/:sessionId/:context/visible', 'POST');
  info.GET_VISIBLE = new info(
      'getVisible', '/session/:sessionId/:context/visible', 'GET');
  info.CLICK_ELEMENT = new info(
      'click', '/session/:sessionId/:context/element/:id/click', 'POST');
  info.CLEAR_ELEMENT = new info(
      'clear', '/session/:sessionId/:context/element/:id/clear', 'POST');
  info.SUBMIT_ELEMENT = new info(
      'submitElement', '/session/:sessionId/:context/element/:id/submit',
      'POST');
  info.GET_ELEMENT_TEXT = new info(
      'getElementText', '/session/:sessionId/:context/element/:id/text', 'GET');
  info.SEND_KEYS = new info(
      'sendKeys', '/session/:sessionId/:context/element/:id/value', 'POST');
  info.GET_ELEMENT_VALUE = new info(
      'getElementValue', '/session/:sessionId/:context/element/:id/value',
      'GET');
  info.GET_ELEMENT_NAME = new info(
      'getTagName', '/session/:sessionId/:context/element/:id/name', 'GET');
  info.IS_ELEMENT_SELECTED = new info(
      'isElementSelected', '/session/:sessionId/:context/element/:id/selected',
      'GET');
  info.SET_ELEMENT_SELECTED = new info(
      'setElementSelected', '/session/:sessionId/:context/element/:id/selected',
      'POST');
  info.TOGGLE_ELEMENT = new info(
      'toggleElement', '/session/:sessionId/:context/element/:id/toggle',
      'POST');
  info.IS_ELEMENT_ENABLED = new info(
      'isElementEnabled', '/session/:sessionId/:context/element/:id/enabled',
      'GET');
  info.IS_ELEMENT_DISPLAYED = new info(
      'isElementDisplayed',
      '/session/:sessionId/:context/element/:id/displayed', 'GET');
  info.GET_ELEMENT_LOCATION = new info(
      'getElementLocation', '/session/:sessionId/:context/element/:id/location',
      'GET');
  info.GET_ELEMENT_SIZE = new info(
      'getElementSize', '/session/:sessionId/:context/element/:id/size', 'GET');
  info.GET_ELEMENT_ATTRIBUTE = new info(
      'getElementAttribute',
      '/session/:sessionId/:context/element/:id/attribute/:name', 'GET');
  info.DRAG_ELEMENT = new info(
      'dragAndDrop', '/session/:sessionId/:context/element/:id/drag', 'POST');
  info.GET_VALUE_OF_CSS_PROPERTY = new info(
      'getValueOfCssProperty',
      '/session/:sessionId/:context/element/:id/css/:propertyName', 'GET');
})();


/**
 * Defines a command to be executed.
 * @param {string} sessionId The session to execute the for. This parameter is
 *     only required when the executing {@code webdriver.WebDriver} is using a
 *     {@code webdriver.HttpCommandProcessor}.
 * @param {webdriver.Context} context The context to execute the command in.
 * @param {webdriver.CommandInfo} info Describes the internal structure of the
 *     command to send.
 * @param {Array.<*>} opt_parameters The parameters to send with this command;
 *     Defaults to an empty array.
 * @param {function} opt_commandCallbackFn The function to call when the command
 *     completes.
 * @param {function} opt_errorCallbackFn The function to call if the command
 *     results in an error.  This function can be used to handle negative paths
 *     by clearing an expected error flag.
 * @private
 */
webdriver.Command = function(sessionId, context, info, opt_parameters,
                             opt_commandCallbackFn, opt_errorCallbackFn) {
  this.sessionId = sessionId;
  this.context = context;
  this.info = info;
  this.parameters = opt_parameters || [];
  this.callbackFn = opt_commandCallbackFn || goog.nullFunction;
  this.errorCallbackFn = opt_errorCallbackFn || goog.nullFunction;
  this.elementId = null;
};


/**
 * Encapsulates a response to a {@code webdriver.Command}.
 * @param {webdriver.Command} command The original command.
 * @param {boolean} isError Whether the command resulted in an error. If
 *     {@code true}, then {@code value} contains the error message.
 * @param {webdriver.Context} context The (potentially new) context resulting
 *     from the command.
 * @param {string} value The value of the response, the meaning of which depends
 *    on the command.
 * @constructor
 */
webdriver.Response = function(command, isError, context, value) {
  this.command = command;
  this.isError = isError;
  this.context = context;
  this.value = value;
};
