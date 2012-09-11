// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview The central node of a {@link goog.messaging.PortNetwork}. The
 * operator is responsible for providing the two-way communication channels (via
 * {@link MessageChannel}s) between each pair of nodes in the network that need
 * to communicate with one another. Each network should have one and only one
 * operator.
 *
 */

goog.provide('goog.messaging.PortOperator');

goog.require('goog.Disposable');
goog.require('goog.asserts');
goog.require('goog.debug.Logger');
goog.require('goog.messaging.PortChannel');
goog.require('goog.messaging.PortNetwork'); // interface
goog.require('goog.object');



/**
 * The central node of a PortNetwork.
 *
 * @param {string} name The name of this node.
 * @constructor
 * @extends {goog.Disposable}
 * @implements {goog.messaging.PortNetwork}
 */
goog.messaging.PortOperator = function(name) {
  goog.base(this);

  /**
   * The collection of channels for communicating with other contexts in the
   * network. These are the channels that are returned to the user, as opposed
   * to the channels used for internal network communication. This is lazily
   * populated as the user requests communication with other contexts, or other
   * contexts request communication with the operator.
   *
   * @type {!Object.<!goog.messaging.PortChannel>}
   * @private
   */
  this.connections_ = {};

  /**
   * The collection of channels for internal network communication with other
   * contexts. This is not lazily populated, and always contains entries for
   * each member of the network.
   *
   * @type {!Object.<!goog.messaging.MessageChannel>}
   * @private
   */
  this.switchboard_ = {};

  /**
   * The name of the operator context.
   *
   * @type {string}
   * @private
   */
  this.name_ = name;
};
goog.inherits(goog.messaging.PortOperator, goog.Disposable);


/**
 * The logger for PortOperator.
 * @type {goog.debug.Logger}
 * @private
 */
goog.messaging.PortOperator.prototype.logger_ =
    goog.debug.Logger.getLogger('goog.messaging.PortOperator');


/** @override */
goog.messaging.PortOperator.prototype.dial = function(name) {
  this.connectSelfToPort_(name);
  return this.connections_[name];
};


/**
 * Adds a caller to the network with the given name. This port should have no
 * services registered on it. It will be disposed along with the PortOperator.
 *
 * @param {string} name The name of the port to add.
 * @param {!goog.messaging.MessageChannel} port The port to add. Must be either
 *     a {@link goog.messaging.PortChannel} or a decorator wrapping a
 *     PortChannel; in particular, it must be able to send and receive
 *     {@link MessagePort}s.
 */
goog.messaging.PortOperator.prototype.addPort = function(name, port) {
  this.switchboard_[name] = port;
  port.registerService(goog.messaging.PortNetwork.REQUEST_CONNECTION_SERVICE,
                       goog.bind(this.requestConnection_, this, name));
};


/**
 * Connects two contexts by creating a {@link MessageChannel} and sending one
 * end to one context and the other end to the other. Called when we receive a
 * request from a caller to connect it to another context (including potentially
 * the operator).
 *
 * @param {string} sourceName The name of the context requesting the connection.
 * @param {!Object|string} message The name of the context to which
 *     the connection is requested.
 * @private
 */
goog.messaging.PortOperator.prototype.requestConnection_ = function(
    sourceName, message) {
  var requestedName = /** @type {string} */ (message);
  if (requestedName == this.name_) {
    this.connectSelfToPort_(sourceName);
    return;
  }

  var sourceChannel = this.switchboard_[sourceName];
  var requestedChannel = this.switchboard_[requestedName];

  goog.asserts.assert(goog.isDefAndNotNull(sourceChannel));
  if (!requestedChannel) {
    var err = 'Port "' + sourceName + '" requested a connection to port "' +
        requestedName + '", which doesn\'t exist';
    this.logger_.warning(err);
    sourceChannel.send(goog.messaging.PortNetwork.GRANT_CONNECTION_SERVICE,
                       {'success': false, 'message': err});
    return;
  }

  var messageChannel = new MessageChannel();
  sourceChannel.send(goog.messaging.PortNetwork.GRANT_CONNECTION_SERVICE, {
    'success': true,
    'name': requestedName,
    'port': messageChannel.port1
  });
  requestedChannel.send(goog.messaging.PortNetwork.GRANT_CONNECTION_SERVICE, {
    'success': true,
    'name': sourceName,
    'port': messageChannel.port2
  });
};


/**
 * Connects together the operator and a caller by creating a
 * {@link MessageChannel} and sending one end to the remote context.
 *
 * @param {string} contextName The name of the context to which to connect the
 *     operator.
 * @private
 */
goog.messaging.PortOperator.prototype.connectSelfToPort_ = function(
    contextName) {
  if (contextName in this.connections_) {
    // We've already established a connection with this port.
    return;
  }

  var contextChannel = this.switchboard_[contextName];
  if (!contextChannel) {
    throw Error('Port "' + contextName + '" doesn\'t exist');
  }

  var messageChannel = new MessageChannel();
  contextChannel.send(goog.messaging.PortNetwork.GRANT_CONNECTION_SERVICE, {
    'success': true,
    'name': this.name_,
    'port': messageChannel.port1
  });
  messageChannel.port2.start();
  this.connections_[contextName] =
      new goog.messaging.PortChannel(messageChannel.port2);
};


/** @override */
goog.messaging.PortOperator.prototype.disposeInternal = function() {
  goog.object.forEach(this.switchboard_, goog.dispose);
  goog.object.forEach(this.connections_, goog.dispose);
  delete this.switchboard_;
  delete this.connections_;
  goog.base(this, 'disposeInternal');
};
