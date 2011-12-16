/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.
Portions copyright 2011 Software Freedom Conservancy

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
 * @fileoverview Messenger service used to communicate with the current web
 * page through custom DOM events.
 *
 * <p>The DomMessenger will listen for {@code webdriverCommand} events on the
 * document. The event target should be a node whose {@code command} attribute
 * is a JSON string with the command to execute.
 *
 * <p>Once the command has been executed, the response will be stored as a JSON
 * string in the {@code response} attribute of the node that dispatched the
 * original {@code webdriverCommand} event. The DomMessenger will then dispatch
 * a {@code webdriverResponse} event on that node to notify the page that a
 * response is ready.
 * 
 * @author jmleyba@gmail.com (Jason Leyba)
 */


/**
 * The DomMessenger is used to communicate with the current webpage through
 * custom events fired on the DOM.
 *
 * @param { {execute: function(string, function(string))} } commandProcessor The
 *     object to send commands to for execution. The object should have a single
 *     method, {@code execute}, that takes two arguments: the command to execute
 *     as a JSON string, and a callback for the command response (specified as a
 *     JSON string).
 * @constructor
 */
var DomMessenger = function(commandProcessor) {

  /**
   * The object to use as a command processor.
   * @type { {execute: function(string, function(string))} }
   * @private
   */
  this.commandProcessor_ = commandProcessor;

  var self = this;  // TODO(jmleyba): bind

  /**
   * EventListener for {@code COMMAND_EVENT}s.
   * @type {function(Event)}
   * @private
   */
  this.commandEventListener_ = function(e) {
    self.onCommand(e);
  };
};


/**
 * Attributes used to pass information between the extension and the current
 * web page.
 * @enum {string}
 */
DomMessenger.Attribute = {
  COMMAND: 'command',
  RESPONSE: 'response'
};


/**
 * Custom event types used to signal a new message either to or from the current
 * web page.
 * @enum {string}
 */
DomMessenger.EventType = {
  COMMAND: 'webdriverCommand',
  RESPONSE: 'webdriverResponse'
};


/**
 * Called when a page loads to 
 * Called when a page loads so an element can be injected for communicating with
 * the web page.
 */
DomMessenger.prototype.onPageLoad = function(e) {
  // Annotate the documentElement to signal to the client that webdriver is
  // installed.
  var doc = e.originalTarget || e.target;
  doc.documentElement.setAttribute('webdriver', true);
  doc.addEventListener(
      DomMessenger.EventType.COMMAND, this.commandEventListener_, true);
};


/**
 * Called when a page unloads; removes the command event listener.
 * @param {Event} e The unload event, whose target is the document that was
 *    unloaded.
 */
DomMessenger.prototype.onPageUnload = function(e) {
  var doc = e.originalTarget || e.target;
  doc.removeEventListener(
      DomMessenger.EventType.COMMAND, this.commandEventListener_, true);
};


/**
 * Handles {@code COMMAND_EVENT}s. The command should be stored as a JSON string
 * in the {@code COMMAND_ATTRIBUTE}.
 * @param {Event} e The command event.
 */
DomMessenger.prototype.onCommand = function(e) {
  var client = e.target;
  var command = client.getAttribute(DomMessenger.Attribute.COMMAND);

  if (!command) {
    throw Error('No command specified');
  }

  var self = this;  // TODO(jmleyba): bind
  this.commandProcessor_.execute(command, function(response) {
    self.dispatchResponse(client, response);
  });
};


/**
 * Dispatches a {@code RESPONSE_EVENT} to notify the appropriate page that a
 * command it gave completed execution.
 * @param {Node} client The DOM node that issued the command this response is
 *     for.
 * @param {string} response Response to a command as a JSON string.
 */
DomMessenger.prototype.dispatchResponse = function(client, response) {
  client.setAttribute(DomMessenger.Attribute.RESPONSE, response);
  var evt = client.ownerDocument.createEvent('Event');
  evt.initEvent(DomMessenger.EventType.RESPONSE,
      /*canBubble=*/true, /*cancellable=*/true);
  client.dispatchEvent(evt);
};
