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
 * @fileoverview The leaf node of a {@link goog.messaging.PortNetwork}. Callers
 * connect to the operator, and request connections with other contexts from it.
 *
 */

goog.provide('goog.messaging.PortCaller');

goog.require('goog.Disposable');
goog.require('goog.async.Deferred');
goog.require('goog.messaging.DeferredChannel');
goog.require('goog.messaging.PortChannel');
goog.require('goog.messaging.PortNetwork'); // interface
goog.require('goog.object');



/**
 * The leaf node of a network.
 *
 * @param {!goog.messaging.MessageChannel} operatorPort The channel for
 *     communicating with the operator. The other side of this channel should be
 *     passed to {@link goog.messaging.PortOperator#addPort}. Must be either a
 *     {@link goog.messaging.PortChannel} or a decorator wrapping a PortChannel;
 *     in particular, it must be able to send and receive {@link MessagePort}s.
 * @constructor
 * @extends {goog.Disposable}
 * @implements {goog.messaging.PortNetwork}
 */
goog.messaging.PortCaller = function(operatorPort) {
  goog.base(this);

  /**
   * The channel to the {@link goog.messaging.PortOperator} for this network.
   *
   * @type {!goog.messaging.MessageChannel}
   * @private
   */
  this.operatorPort_ = operatorPort;

  /**
   * The collection of channels for communicating with other contexts in the
   * network. Each value can contain a {@link goog.aync.Deferred} and/or a
   * {@link goog.messaging.MessageChannel}.
   *
   * If the value contains a Deferred, then the channel is a
   * {@link goog.messaging.DeferredChannel} wrapping that Deferred. The Deferred
   * will be resolved with a {@link goog.messaging.PortChannel} once we receive
   * the appropriate port from the operator. This is the situation when this
   * caller requests a connection to another context; the DeferredChannel is
   * used to queue up messages until we receive the port from the operator.
   *
   * If the value does not contain a Deferred, then the channel is simply a
   * {@link goog.messaging.PortChannel} communicating with the given context.
   * This is the situation when this context received a port for the other
   * context before it was requested.
   *
   * If a value exists for a given key, it must contain a channel, but it
   * doesn't necessarily contain a Deferred.
   *
   * @type {!Object.<{deferred: goog.async.Deferred,
   *                  channel: !goog.messaging.MessageChannel}>}
   * @private
   */
  this.connections_ = {};

  this.operatorPort_.registerService(
      goog.messaging.PortNetwork.GRANT_CONNECTION_SERVICE,
      goog.bind(this.connectionGranted_, this),
      true /* opt_json */);
};
goog.inherits(goog.messaging.PortCaller, goog.Disposable);


/** @override */
goog.messaging.PortCaller.prototype.dial = function(name) {
  if (name in this.connections_) {
    return this.connections_[name].channel;
  }

  this.operatorPort_.send(
      goog.messaging.PortNetwork.REQUEST_CONNECTION_SERVICE, name);
  var deferred = new goog.async.Deferred();
  var channel = new goog.messaging.DeferredChannel(deferred);
  this.connections_[name] = {deferred: deferred, channel: channel};
  return channel;
};


/**
 * Registers a connection to another context in the network. This is called when
 * the operator sends us one end of a {@link MessageChannel}, either because
 * this caller requested a connection with another context, or because that
 * context requested a connection with this caller.
 *
 * It's possible that the remote context and this one request each other roughly
 * concurrently. The operator doesn't keep track of which contexts have been
 * connected, so it will create two separate {@link MessageChannel}s in this
 * case. However, the first channel created will reach both contexts first, so
 * we simply ignore all connections with a given context after the first.
 *
 * @param {!Object|string} message The name of the context
 *     being connected and the port connecting the context.
 * @private
 */
goog.messaging.PortCaller.prototype.connectionGranted_ = function(message) {
  var args = /** @type {{name: string, port: MessagePort}} */ (message);
  var port = args['port'];
  var entry = this.connections_[args['name']];
  if (entry && (!entry.deferred || entry.deferred.hasFired())) {
    // If two PortCallers request one another at the same time, the operator may
    // send out a channel for connecting them multiple times. Since both callers
    // will receive the first channel's ports first, we can safely ignore and
    // close any future ports.
    port.close();
  } else if (!args['success']) {
    throw Error(args['message']);
  } else {
    port.start();
    var channel = new goog.messaging.PortChannel(port);
    if (entry) {
      entry.deferred.callback(channel);
    } else {
      this.connections_[args['name']] = {channel: channel, deferred: null};
    }
  }
};


/** @override */
goog.messaging.PortCaller.prototype.disposeInternal = function() {
  goog.dispose(this.operatorPort_);
  goog.object.forEach(this.connections_, goog.dispose);
  delete this.operatorPort_;
  delete this.connections_;
  goog.base(this, 'disposeInternal');
};
