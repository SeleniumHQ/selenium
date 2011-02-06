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
 * @fileoverview Defines a command processor that uses a browser
 * extension/plugin object available to the Javascript on the page.
 * @author jmleyba@gmail.com (Jason Leyba)
 */

goog.provide('webdriver.LocalCommandProcessor');

goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.json');
goog.require('goog.object');
goog.require('webdriver.AbstractCommandProcessor');
goog.require('webdriver.CommandName');
goog.require('webdriver.Response');


/**
 * Command processor that uses a browser extension/plugin exposed to the page
 * for executing WebDriver commands.
 * @param {goog.dom.DomHelper} opt_dom The DomHelper for this instance to use;
 *     defaults to a DomHelper for the current document.
 * @constructor
 * @extends {webdriver.AbstractCommandProcessor}
 */
webdriver.LocalCommandProcessor = function(opt_dom) {
  webdriver.AbstractCommandProcessor.call(this);
  // TODO(jmleyba): IE, Chrome, et al. support

  /**
   * The DomHelper for this instance to use.
   * @type {goog.dom.DomHelper}
   * @private
   */
  this.dom_ = opt_dom || goog.dom.getDomHelper();

  /**
   * The element to use for communicating with the extension.
   * @type {Element}
   * @private
   */
  this.documentElement_ = this.dom_.getDocument().documentElement;

  // Verify the extension is installed by checking for the webdriver attribute
  // on the documentElement.
  var webdriverAttribute = this.documentElement_.getAttribute('webdriver');
  if (!webdriverAttribute) {
    throw Error(
        'The current browser does not support a LocalCommandProcessor');
  }
};
goog.inherits(webdriver.LocalCommandProcessor,
              webdriver.AbstractCommandProcessor);


/**
 * The custom event types used to communicate with the browser extension.
 * @enum {string}
 */
webdriver.LocalCommandProcessor.EventType_ = {
  COMMAND: 'webdriverCommand',
  RESPONSE: 'webdriverResponse'
};


/**
 * The attributes used to store information passed to the browser extension.
 * @enum {string}
 */
webdriver.LocalCommandProcessor.MessageAttribute_ = {
  COMMAND: 'command',
  RESPONSE: 'response'
};


/**
 * @override
 */
webdriver.LocalCommandProcessor.prototype.disposeInternal = function() {
  goog.events.removeAll(this.documentElement_,
      webdriver.LocalCommandProcessor.EventType_.RESPONSE);
  webdriver.LocalCommandProcessor.superClass_.disposeInternal.call(this);
};


/**
 * Event handler for command responses.
 * @param {webdriver.Command} command The initiating command.
 * @param {Event} e The response event. The target should be a node with a
 *     {@code response} attribute.
 */
webdriver.LocalCommandProcessor.onResponse_ = function(command, e) {
  // It is technically possible that the response could be for a different
  // command, but this should be prevented by code higher in the WebDriverJS
  // stack, so we don't do any error checking here.
  if (e.type != webdriver.LocalCommandProcessor.EventType_.RESPONSE) {
    throw Error('Not a response event!');
  }

  var jsonResponse = e.target.getAttribute(
      webdriver.LocalCommandProcessor.MessageAttribute_.RESPONSE);
  if (!jsonResponse) {
    throw Error('Empty response!');
  }

  var rawResponse = goog.json.parse(jsonResponse);
  goog.debug.Logger.getLogger('webdriver.LocalCommandProcessor').fine(
      'receiving:\n' + jsonResponse);

  var response = new webdriver.Response(
      rawResponse['status'], rawResponse['value']);

  // Only code in this file should be dispatching command events and listening
  // for response events, so this is safe. If someone else decided to attach a
  // listener anyway, tough luck.
  goog.events.removeAll(
      e.target, webdriver.LocalCommandProcessor.EventType_.RESPONSE);
  command.setResponse(response);
};


/**
 * @override
 */
webdriver.LocalCommandProcessor.prototype.dispatchDriverCommand = function(
    command) {
  var jsonCommand = {
    'name': command.getName(),
    'sessionId': {
      'value': command.getDriver().getSessionId()
    },
    'parameters': command.getParameters()
  };

  jsonCommand = goog.json.serialize(jsonCommand);
  goog.debug.Logger.getLogger('webdriver.LocalCommandProcessor').fine(
      'sending:\n' + jsonCommand);

  this.documentElement_.setAttribute(
      webdriver.LocalCommandProcessor.MessageAttribute_.COMMAND,
      jsonCommand);

  goog.events.listen(this.documentElement_,
      webdriver.LocalCommandProcessor.EventType_.RESPONSE,
      goog.bind(webdriver.LocalCommandProcessor.onResponse_, null, command));

  var commandEvent = this.dom_.getDocument().createEvent('Event');
  commandEvent.initEvent(
      webdriver.LocalCommandProcessor.EventType_.COMMAND,
      /*canBubble=*/true, /*cancelable=*/true);
  this.documentElement_.dispatchEvent(commandEvent);
};
