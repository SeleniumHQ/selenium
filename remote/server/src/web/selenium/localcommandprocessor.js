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
 * @fileoverview Defines a command processor that uses a browser
 * extension/plugin object available to the Javascript on the page.
 * @author jmleyba@gmail.com (Jason Leyba)
 */

goog.provide('webdriver.LocalCommandProcessor');

goog.require('goog.array');
goog.require('goog.object');
goog.require('webdriver.AbstractCommandProcessor');
goog.require('webdriver.CommandName');
goog.require('webdriver.Context');
goog.require('webdriver.Response');


/**
 * Command processor that uses a browser extension/plugin exposed to the page
 * for executing WebDriver commands.
 * @constructor
 * @extends {webdriver.AbstractCommandProcessor}
 */
webdriver.LocalCommandProcessor = function() {
  webdriver.AbstractCommandProcessor.call(this);
  // TODO(jmleyba): IE, Chrome, et al. support
  this.cp_ = goog.global['__webDriverCommandProcessor'];
  if (!goog.isDef(this.cp_)) {
    throw new Error(
        'The current browser does not support a LocalCommandProcessor');
  }
};
goog.inherits(webdriver.LocalCommandProcessor,
              webdriver.AbstractCommandProcessor);


/**
 * Map of {@code webdriver.CommandName}s to the corresponding method name for a
 * local command processor.
 * TODO(jmleyba): Currently this is FF-specific. When we add other local command
 * processors, we'll need to standardize on names.
 * @enum {string}
 */
webdriver.LocalCommandProcessor.DRIVER_METHOD_NAMES_ = goog.object.transpose({
  'findActiveDriver': webdriver.CommandName.NEW_SESSION,
  'getCurrentWindowHandle': webdriver.CommandName.GET_CURRENT_WINDOW_HANDLE,
  'getAllWindowHandles': webdriver.CommandName.GET_ALL_WINDOW_HANDLES,
  'get': webdriver.CommandName.GET,
  'goForward': webdriver.CommandName.FORWARD,
  'goBack': webdriver.CommandName.BACK,
  'refresh': webdriver.CommandName.REFRESH,
  'title': webdriver.CommandName.GET_TITLE,
  'getPageSource': webdriver.CommandName.GET_PAGE_SOURCE,
  'close': webdriver.CommandName.CLOSE,
  'switchToWindow': webdriver.CommandName.SWITCH_TO_WINDOW,
  'switchToFrame': webdriver.CommandName.SWITCH_TO_FRAME,
  'switchToDefaultContent': webdriver.CommandName.SWITCH_TO_DEFAULT_CONTENT,
  'executeScript': webdriver.CommandName.EXECUTE_SCRIPT,
  'getMouseSpeed': webdriver.CommandName.GET_MOUSE_SPEED,
  'setMouseSpeed': webdriver.CommandName.SET_MOUSE_SPEED,
  'getActiveElement': webdriver.CommandName.GET_ACTIVE_ELEMENT,
  'getVisible': webdriver.CommandName.GET_VISIBLE,
  'setVisible': webdriver.CommandName.SET_VISIBLE,
  'click': webdriver.CommandName.CLICK,
  'clear': webdriver.CommandName.CLEAR,
  'submitElement': webdriver.CommandName.SUBMIT,
  'getElementText': webdriver.CommandName.GET_TEXT,
  'sendKeys': webdriver.CommandName.SEND_KEYS,
  'getElementValue': webdriver.CommandName.GET_VALUE,
  'getTagName': webdriver.CommandName.GET_TAG_NAME,
  'isElementSelected': webdriver.CommandName.IS_SELECTED,
  'setElementSelected': webdriver.CommandName.SET_SELECTED,
  'toggleElement': webdriver.CommandName.TOGGLE,
  'isElementEnabled': webdriver.CommandName.IS_ENABLED,
  'isElementDisplayed': webdriver.CommandName.IS_DISPLAYED,
  'getElementLocation': webdriver.CommandName.GET_LOCATION,
  'getElementSize': webdriver.CommandName.GET_SIZE,
  'getElementAttribute': webdriver.CommandName.GET_ATTRIBUTE,
  'dragAndDrop': webdriver.CommandName.DRAG,
  'getValueOfCssProperty': webdriver.CommandName.GET_CSS_PROPERTY
});


webdriver.LocalCommandProcessor.mapLocator_ = function(findOneMethod,
                                                       findManyMethod) {
  var map = {};
  map[webdriver.CommandName.FIND_ELEMENT] = findOneMethod;
  map[webdriver.CommandName.FIND_ELEMENTS] = findManyMethod;
  return map;
};


/**
 * Map of {@code webdriver.LocatorStrategy} to the corresponding method name for
 * a local command processor.
 * TODO(jmleyba): Currently this is FF-specific. When we add other local command
 * processors, we'll need to standardize on names.
 * @enum {Array.<string>}
 */
webdriver.LocalCommandProcessor.LOCATOR_UNDER_ROOT_ = {
  id: webdriver.LocalCommandProcessor.mapLocator_(
      'selectElementById', 'selectElementsUsingId'),
  name: webdriver.LocalCommandProcessor.mapLocator_(
      'selectElementByName', 'selectElementsUsingName'),
  className: webdriver.LocalCommandProcessor.mapLocator_(
      'selectElementUsingClassName', 'selectElementsUsingClassName'),
  linkText: webdriver.LocalCommandProcessor.mapLocator_(
      'selectElementUsingLink', 'selectElementsUsingLink'),
  partialLinkText: webdriver.LocalCommandProcessor.mapLocator_(
      'selectElementUsingPartialLinkText',
      'selectElementsUsingPartialLinkText'),
  tagName: webdriver.LocalCommandProcessor.mapLocator_(
      'selectElementUsingTagName', 'selectElementsUsingTagName'),
  xpath: webdriver.LocalCommandProcessor.mapLocator_(
      'selectElementUsingXPath', 'selectElementsUsingXPath')
};


/**
 * Map of {@code webdriver.LocatorStrategy} to the corresponding method name for
 * a local command processor.
 * TODO(jmleyba): Currently this is FF-specific. When we add other local command
 * processors, we'll need to standardize on names.
 * @enum {Array.<string>}
 */
webdriver.LocalCommandProcessor.LOCATOR_UNDER_ELEMENT_ = {
  id: webdriver.LocalCommandProcessor.mapLocator_(
      'findElementById', 'findElementsById'),
  name: webdriver.LocalCommandProcessor.mapLocator_(
      'findElementByName', 'findElementsByName'),
  className: webdriver.LocalCommandProcessor.mapLocator_(
      'findElementByClassName', 'findChildElementsByClassName'),
  linkText: webdriver.LocalCommandProcessor.mapLocator_(
      'findElementByLinkText', 'findElementsByLinkText'),
  partialLinkText: webdriver.LocalCommandProcessor.mapLocator_(
      'findElementByPartialLinkText', 'findElementsByPartialLinkText'),
  tagName: webdriver.LocalCommandProcessor.mapLocator_(
      'findElementByTagName', 'findElementsByTagName'),
  xpath: webdriver.LocalCommandProcessor.mapLocator_(
      'findElementByXPath', 'findElementsByXPath')
};


/**
 * @override
 */
webdriver.LocalCommandProcessor.prototype.executeDriverCommand = function(
    command, sessionId, context) {
  var respond = goog.bind(function(rawResponse) {
    command.setResponse(new webdriver.Response(
        rawResponse['isError'],
        webdriver.Context.fromString(rawResponse['context']),
        rawResponse['response']));
  }, this);

  var methodName;
  switch (command.name) {
    case webdriver.CommandName.FIND_ELEMENT:
    case webdriver.CommandName.FIND_ELEMENTS:
      var map = command.element ?
          webdriver.LocalCommandProcessor.LOCATOR_UNDER_ELEMENT_ :
          webdriver.LocalCommandProcessor.LOCATOR_UNDER_ROOT_;
      methodName = map[command.parameters[0]][command.name];
      command.parameters = [command.parameters[1]];
      break;

    case webdriver.CommandName.SEND_KEYS:
      command.parameters = [command.parameters.join('')];
      // Fall-through

    default:
      methodName =
          webdriver.LocalCommandProcessor.DRIVER_METHOD_NAMES_[command.name];
      break;
  }

  if (!methodName) {
    throw new Error(
        'LocalCommandProcessor: Unsupported command, ' + command.name);
  }

  var jsonCommand = {
    'commandName': methodName,
    'context': context.toString(),
    'parameters': command.parameters,
    'callbackFn': respond
  };

  if (command.element) {
    jsonCommand['elementId'] = command.element.getId().getValue();
  }

  this.cp_.execute({'wrappedJSObject': jsonCommand});
};
