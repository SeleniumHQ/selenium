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

goog.require('goog.messaging.AbstractChannel');
goog.require('goog.testing.asserts');



/**
 * Class for unit-testing code that communicates over a MessageChannel.
 * @param {goog.testing.MockControl} mockControl The mock control used to create
 *   the method mock for #send.
 * @extends {goog.messaging.AbstractChannel}
 * @constructor
 * @final
 */
goog.testing.messaging.MockMessageChannel = function(mockControl) {
  goog.testing.messaging.MockMessageChannel.base(this, 'constructor');

  /**
   * Whether the channel has been disposed.
   * @type {boolean}
   */
  this.disposed = false;

  mockControl.createMethodMock(this, 'send');
};
goog.inherits(goog.testing.messaging.MockMessageChannel,
              goog.messaging.AbstractChannel);


/**
 * A mock send function. Actually an instance of
 * {@link goog.testing.FunctionMock}.
 * @param {string} serviceName The name of the remote service to run.
 * @param {string|!Object} payload The payload to send to the remote page.
 * @override
 */
goog.testing.messaging.MockMessageChannel.prototype.send = function(
    serviceName, payload) {};


/**
 * Sets a flag indicating that this is disposed.
 * @override
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
  this.deliver(serviceName, payload);
};
