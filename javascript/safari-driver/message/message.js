// Copyright 2012 Selenium committers
// Copyright 2012 Software Freedom Conservancy
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
 * @fileoverview Defines the messages exchanged between the extension global
 * page and injected scripts.
 */

goog.provide('safaridriver.message');
goog.provide('safaridriver.message.Message');

goog.require('goog.asserts');
goog.require('goog.debug.Logger');
goog.require('safaridriver.Command');


/**
 * @define {(string|number)} Compile time constant that may be used to identify
 *     where messages originate from. We permit strings or numbers since the
 *     Selenium build system currently does not support constant string
 *     expressions. TODO(jleyba): Fix this.
 */
safaridriver.message.ORIGIN = 'webdriver';


/**
 * @type {!goog.debug.Logger}
 * @const
 * @private
 */
safaridriver.message.LOG_ = goog.debug.Logger.getLogger(
    'safaridriver.message');


/**
 * @define {boolean} Whether to force messages to be sent synchronously when
 *     sending to a SafariContentBrowserTabProxy.
 */
safaridriver.message.FORCE_SYNCHRONOUS_PROXY_SEND = false;


/**
 * A map of message type to the factory function that can reconstruct a
 * {@link safaridriver.message.Message} from a JSON record.
 * @type {!Object.<function(!Object.<*>): !safaridriver.message.Message>}
 * @private
 */
safaridriver.message.factoryRegistry_ = {};


/**
 * Registers a factory for the provided message type.
 * @param {string} type The message type.
 * @param {function(!Object.<*>): !safaridriver.message.Message} factoryFn The
 *     factory function to use for messages of {@code type}.
 */
safaridriver.message.registerMessageType = function(type, factoryFn) {
  goog.asserts.assert(!(type in safaridriver.message.factoryRegistry_),
      'Message type has already been registered: ' + type);
  safaridriver.message.factoryRegistry_[type] = factoryFn;
};


/**
 * Creates a {@link safaridriver.message.Message} from a message event.
 * @param {!(SafariExtensionMessageEvent|MessageEvent)} event The raw event to
 *     convert to a message.
 * @return {!safaridriver.message.Message} The new message.
 * @throws {Error} If the event does not conform to the message protocol.
 */
safaridriver.message.fromEvent = function(event) {
  var data = event.message || event.data;
  if (goog.isString(data)) {
    data = JSON.parse(data);
  }

  if (!goog.isObject(data) ||
      (!goog.isString(data[safaridriver.message.Message.Field.ORIGIN]) &&
          !goog.isNumber(data[safaridriver.message.Message.Field.ORIGIN])) ||
      !goog.isString(data[safaridriver.message.Message.Field.TYPE])) {
    throw Error('Invalid message: ' + JSON.stringify(data));
  }

  var type = data[safaridriver.message.Message.Field.TYPE];
  var factory = safaridriver.message.factoryRegistry_[type];
  if (!factory) {
    safaridriver.message.LOG_.fine(
        'Unknown message type; falling back to the default factory: ' +
        JSON.stringify(data));
    factory = safaridriver.message.Message.fromData_;
  }

  var message = factory(data);

  var origin = (/** @type {(string|number)} */
      data[safaridriver.message.Message.Field.ORIGIN]);
  message.setOrigin(origin);
  return message;
};



/**
 * Base class for messages exchanged between components of the SafariDriver.
 * may either be exchanged between the extension's global page and injected
 * script, or the injected script and web page content.
 * @param {string} type The message type.
 * @constructor
 */
safaridriver.message.Message = function(type) {

  /**
   * The JSON data associated with this message.
   * @type {!Object.<*>}
   * @private
   */
  this.data_ = {};

  this.data_[safaridriver.message.Message.Field.ORIGIN] =
      safaridriver.message.ORIGIN;
  this.data_[safaridriver.message.Message.Field.TYPE] = type;
};


/**
 * The standard fields in a {@link safaridriver.message.Message}.
 * @enum {string}
 */
safaridriver.message.Message.Field = {
  ORIGIN: 'origin',
  TYPE: 'type'
};


/**
 * Creates a generic message from a raw data object.
 * @param {!Object.<*>} data The data object to convert.
 * @return {!safaridriver.message.Message} The new message.
 * @private
 */
safaridriver.message.Message.fromData_ = function(data) {
  var type = (/** @type {string} */ data[
      safaridriver.message.Message.Field.TYPE]);
  return new safaridriver.message.Message(type);
};


/**
 * Sets a field in this message's data.
 * @param {string} name The name of the field.
 * @param {*} value The field value; should be a JSON compatible value.
 */
safaridriver.message.Message.prototype.setField = function(name, value) {
  goog.asserts.assert(name !== safaridriver.message.Message.Field.TYPE,
      'The specified field may not be overridden: ' + name);
  this.data_[name] = value;
};


/**
 * Returns the value of the given field.
 * @param {string} name The name of the field.
 * @return {*} The field value, or {@code undefined} if it is not set.
 */
safaridriver.message.Message.prototype.getField = function(name) {
  return this.data_[name];
};


/**
 * Sets the origin for this message.
 * @param {(string|number)} origin The new origin.
 */
safaridriver.message.Message.prototype.setOrigin = function(origin) {
  this.setField(safaridriver.message.Message.Field.ORIGIN, origin);
};


/**
 * @return {(string|number)} This message's origin.
 */
safaridriver.message.Message.prototype.getOrigin = function() {
  return (/** @type {(string|number)} */this.getField(
      safaridriver.message.Message.Field.ORIGIN));
};


/**
 * @return {boolean} Whether this message originated from the same context as
 *     this script.
 */
safaridriver.message.Message.prototype.isSameOrigin = function() {
  return this.getOrigin() === safaridriver.message.ORIGIN;
};


/**
 * @return {string} This message's type.
 */
safaridriver.message.Message.prototype.getType = function() {
  return (/** @type {string} */this.getField(
      safaridriver.message.Message.Field.TYPE));
};


/**
 * Tests whether this message has the givne {@code type}.
 * @param {string} type The type to test for.
 * @return {boolean} Whether this message is of the given type.
 */
safaridriver.message.Message.prototype.isType = function(type) {
  return this.getField(safaridriver.message.Message.Field.TYPE) === type;
};


/**
 * Sends this message to the given target.
 * @param {!(SafariContentBrowserTabProxy|SafariWebPageProxy|Window)} target
 *     The object to send this message to.
 * @return {*} If {@link safaridriver.message.FORCE_SYNCHRONOUS_PROXY_SEND} was
 *     set and the target of the message is a SafariContentBrowserTabProxy,
 *     this function will return the extension's response to the message.
 */
safaridriver.message.Message.prototype.send = function(target) {
  this.setOrigin(safaridriver.message.ORIGIN);
  if (target.postMessage) {
    (/** @type {!Window} */target).postMessage(this.data_, '*');
  } else {
    if (safaridriver.message.FORCE_SYNCHRONOUS_PROXY_SEND &&
        target.canLoad) {
      return this.sendSync(
          (/** @type {!SafariContentBrowserTabProxy} */target));
    }

    (/** @type {!(SafariContentBrowserTabProxy|SafariWebPageProxy)} */
        target).dispatchMessage(this.getType(), this.data_);
  }
};


/**
 * Attribute on the documentElement containing the response to a synchronous
 * message sent to a window object.
 * @type {string}
 * @const
 * @private
 */
safaridriver.message.Message.SYNCHRONOUS_MESSAGE_RESPONSE_ATTRIBUTE_ =
    'safaridriver.message.syncResponse';


/**
 * @param {string} response The response value.
 */
safaridriver.message.Message.setSynchronousMessageResponse = function(
    response) {
  document.documentElement.setAttribute(
      safaridriver.message.Message.SYNCHRONOUS_MESSAGE_RESPONSE_ATTRIBUTE_,
      response);
};


/**
 * Sends this message synchronously to the proved tab proxy or window.
 * @param {!(SafariContentBrowserTabProxy|Window)} target The proxy to send
 *     this message to.
 * @return {*} The message response. Will always be undefined if the target is
 *     a DOMWindow.
 */
safaridriver.message.Message.prototype.sendSync = function(target) {
  if (target.postMessage) {
    goog.asserts.assert(target === window,
        'Synchrnous messages may only be sent to a window when that ' +
            'window is the same as the current context');

    var messageEvent = document.createEvent('MessageEvent');
    messageEvent.initMessageEvent('message', false, false, this.data_,
        // origin is a non-standard property on location.
        window.location['origin'], '0', window, null);
    target.dispatchEvent(messageEvent);

    var response = document.documentElement.getAttribute(
        safaridriver.message.Message.SYNCHRONOUS_MESSAGE_RESPONSE_ATTRIBUTE_);
    document.documentElement.removeAttribute(
        safaridriver.message.Message.SYNCHRONOUS_MESSAGE_RESPONSE_ATTRIBUTE_);
    return response;
  } else {
    // Create a beforeload event, which is required by the canLoad function.
    var stubEvent = document.createEvent('Events');
    stubEvent.initEvent('beforeload', false, false);
    return target.canLoad(stubEvent, this.data_);
    // TODO(jleyba): Do something more intelligent with the response.
  }
};


/** @return {!Object.<*>} The JSON representation of this message. */
safaridriver.message.Message.prototype.toJSON = function() {
  return this.data_;
};


/** @override */
safaridriver.message.Message.prototype.toString = function() {
  return JSON.stringify(this);
};
