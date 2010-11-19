// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Mock MessageChannel implementation that can receive fake
 * messages and test that the right messages are sent.
 *
 */


goog.provide('goog.testing.messaging.MockMessageChannel');

goog.require('goog.messaging.MessageChannel'); // interface
goog.require('goog.testing.asserts');



/**
 * Class for unit-testing code that communicates over a MessageChannel.
 * @param {goog.testing.MockControl} mockControl The mock control used to create
 *   the method mock for #send.
 * @implements {goog.messaging.MessageChannel}
 * @constructor
 */
goog.testing.messaging.MockMessageChannel = function(mockControl) {
  /**
   * Services to call when receiving messages.
   * @type {Object.<string, function((string|!Object))>}
   * @private
   */
  this.services_ = {};

  /**
   * Whether the channel has been disposed.
   * @type {boolean}
   */
  this.disposed = false;

  mockControl.createMethodMock(this, 'send');
};


/**
 * Service to call when no other service matches.
 * @type {function(string, (string|!Object))}
 * @private
 */
goog.testing.messaging.MockMessageChannel.prototype.defaultService_;


/**
 * @inheritDoc
 */
goog.testing.messaging.MockMessageChannel.prototype.connect = function(
    opt_connectCb) {
  if (opt_connectCb) {
    opt_connectCb();
  }
};


/**
 * @inheritDoc
 */
goog.testing.messaging.MockMessageChannel.prototype.isConnected = function() {
  return true;
};


/**
 * A mock send function. Actually an instance of
 * {@link goog.testing.FunctionMock}.
 * @param {string} serviceName The name of the remote service to run.
 * @param {string|!Object} payload The payload to send to the remote page.
 */
goog.testing.messaging.MockMessageChannel.prototype.send = function(
    serviceName, payload) {};


/**
 * @inheritDoc
 */
goog.testing.messaging.MockMessageChannel.prototype.registerService = function(
    name, callback, isJson) {
  this.services_[name] = callback;
};


/**
 * @inheritDoc
 */
goog.testing.messaging.MockMessageChannel.prototype.registerDefaultService =
    function(callback) {
  this.defaultService_ = callback;
};


/**
 * Sets a flag indicating that this is disposed.
 */
goog.testing.messaging.MockMessageChannel.prototype.dispose = function() {
  this.disposed = true;
};


/**
 * Mocks the receipt of a message. Passes the payload the appropriate service.
 * @param {string} serviceName The service to run.
 * @param {string|!Object} payload The argument to pass to the service.
 */
goog.testing.messaging.MockMessageChannel.prototype.receive = function(
    serviceName, payload) {
  var callback = this.services_[serviceName];
  if (!callback && this.defaultService_) {
    callback = goog.partial(this.defaultService_, serviceName);
  }

  assertNotNull(callback);
  callback(payload);
};
