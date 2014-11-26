// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Contains the base class for transports.
 *
 */


goog.provide('goog.net.xpc.Transport');

goog.require('goog.Disposable');
goog.require('goog.dom');
goog.require('goog.net.xpc.TransportNames');



/**
 * The base class for transports.
 * @param {goog.dom.DomHelper=} opt_domHelper The dom helper to use for
 *     finding the window objects.
 * @constructor
 * @extends {goog.Disposable};
 */
goog.net.xpc.Transport = function(opt_domHelper) {
  goog.Disposable.call(this);

  /**
   * The dom helper to use for finding the window objects to reference.
   * @type {goog.dom.DomHelper}
   * @private
   */
  this.domHelper_ = opt_domHelper || goog.dom.getDomHelper();
};
goog.inherits(goog.net.xpc.Transport, goog.Disposable);


/**
 * The transport type.
 * @type {number}
 * @protected
 */
goog.net.xpc.Transport.prototype.transportType = 0;


/**
 * @return {number} The transport type identifier.
 */
goog.net.xpc.Transport.prototype.getType = function() {
  return this.transportType;
};


/**
 * Returns the window associated with this transport instance.
 * @return {!Window} The window to use.
 */
goog.net.xpc.Transport.prototype.getWindow = function() {
  return this.domHelper_.getWindow();
};


/**
 * Return the transport name.
 * @return {string} the transport name.
 */
goog.net.xpc.Transport.prototype.getName = function() {
  return goog.net.xpc.TransportNames[String(this.transportType)] || '';
};


/**
 * Handles transport service messages (internal signalling).
 * @param {string} payload The message content.
 */
goog.net.xpc.Transport.prototype.transportServiceHandler = goog.abstractMethod;


/**
 * Connects this transport.
 * The transport implementation is expected to call
 * CrossPageChannel.prototype.notifyConnected when the channel is ready
 * to be used.
 */
goog.net.xpc.Transport.prototype.connect = goog.abstractMethod;


/**
 * Sends a message.
 * @param {string} service The name off the service the message is to be
 * delivered to.
 * @param {string} payload The message content.
 */
goog.net.xpc.Transport.prototype.send = goog.abstractMethod;
