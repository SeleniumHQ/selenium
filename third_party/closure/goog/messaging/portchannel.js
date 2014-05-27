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
 * @fileoverview A class that wraps several types of HTML5 message-passing
 * entities ({@link MessagePort}s, {@link WebWorker}s, and {@link Window}s),
 * providing a unified interface.
 *
 * This is tested under Chrome, Safari, and Firefox. Since Firefox 3.6 has an
 * incomplete implementation of web workers, it doesn't support sending ports
 * over Window connections. IE has no web worker support at all, and so is
 * unsupported by this class.
 *
 */

goog.provide('goog.messaging.PortChannel');

goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.async.Deferred');
goog.require('goog.debug');
goog.require('goog.dom');
goog.require('goog.dom.DomHelper');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.json');
goog.require('goog.log');
goog.require('goog.messaging.AbstractChannel');
goog.require('goog.messaging.DeferredChannel');
goog.require('goog.object');
goog.require('goog.string');



/**
 * A wrapper for several types of HTML5 message-passing entities
 * ({@link MessagePort}s and {@link WebWorker}s). This class implements the
 * {@link goog.messaging.MessageChannel} interface.
 *
 * This class can be used in conjunction with other communication on the port.
 * It sets {@link goog.messaging.PortChannel.FLAG} to true on all messages it
 * sends.
 *
 * @param {!MessagePort|!WebWorker} underlyingPort The message-passing
 *     entity to wrap. If this is a {@link MessagePort}, it should be started.
 *     The remote end should also be wrapped in a PortChannel. This will be
 *     disposed along with the PortChannel; this means terminating it if it's a
 *     worker or removing it from the DOM if it's an iframe.
 * @constructor
 * @extends {goog.messaging.AbstractChannel}
 * @final
 */
goog.messaging.PortChannel = function(underlyingPort) {
  goog.messaging.PortChannel.base(this, 'constructor');

  /**
   * The wrapped message-passing entity.
   * @type {!MessagePort|!WebWorker}
   * @private
   */
  this.port_ = underlyingPort;

  /**
   * The key for the event listener.
   * @type {goog.events.Key}
   * @private
   */
  this.listenerKey_ = goog.events.listen(
      this.port_, goog.events.EventType.MESSAGE, this.deliver_, false, this);
};
goog.inherits(goog.messaging.PortChannel, goog.messaging.AbstractChannel);


/**
 * Create a PortChannel that communicates with a window embedded in the current
 * page (e.g. an iframe contentWindow). The code within the window should call
 * {@link forGlobalWindow} to establish the connection.
 *
 * It's possible to use this channel in conjunction with other messages to the
 * embedded window. However, only one PortChannel should be used for a given
 * window at a time.
 *
 * @param {!Window} window The window object to communicate with.
 * @param {string} peerOrigin The expected origin of the window. See
 *     http://dev.w3.org/html5/postmsg/#dom-window-postmessage.
 * @param {goog.Timer=} opt_timer The timer that regulates how often the initial
 *     connection message is attempted. This will be automatically disposed once
 *     the connection is established, or when the connection is cancelled.
 * @return {!goog.messaging.DeferredChannel} The PortChannel. Although this is
 *     not actually an instance of the PortChannel class, it will behave like
 *     one in that MessagePorts may be sent across it. The DeferredChannel may
 *     be cancelled before a connection is established in order to abort the
 *     attempt to make a connection.
 */
goog.messaging.PortChannel.forEmbeddedWindow = function(
    window, peerOrigin, opt_timer) {
  var timer = opt_timer || new goog.Timer(50);

  var disposeTimer = goog.partial(goog.dispose, timer);
  var deferred = new goog.async.Deferred(disposeTimer);
  deferred.addBoth(disposeTimer);

  timer.start();
  // Every tick, attempt to set up a connection by sending in one end of an
  // HTML5 MessageChannel. If the inner window posts a response along a channel,
  // then we'll use that channel to create the PortChannel.
  //
  // As per http://dev.w3.org/html5/postmsg/#ports-and-garbage-collection, any
  // ports that are not ultimately used to set up the channel will be garbage
  // collected (since there are no references in this context, and the remote
  // context hasn't seen them).
  goog.events.listen(timer, goog.Timer.TICK, function() {
    var channel = new MessageChannel();
    var gotMessage = function(e) {
      channel.port1.removeEventListener(
          goog.events.EventType.MESSAGE, gotMessage, true);
      // If the connection has been cancelled, don't create the channel.
      if (!timer.isDisposed()) {
        deferred.callback(new goog.messaging.PortChannel(channel.port1));
      }
    };
    channel.port1.start();
    // Don't use goog.events because we don't want any lingering references to
    // the ports to prevent them from getting GCed. Only modern browsers support
    // these APIs anyway, so we don't need to worry about event API
    // compatibility.
    channel.port1.addEventListener(
        goog.events.EventType.MESSAGE, gotMessage, true);

    var msg = {};
    msg[goog.messaging.PortChannel.FLAG] = true;
    window.postMessage(msg, [channel.port2], peerOrigin);
  });

  return new goog.messaging.DeferredChannel(deferred);
};


/**
 * Create a PortChannel that communicates with the document in which this window
 * is embedded (e.g. within an iframe). The enclosing document should call
 * {@link forEmbeddedWindow} to establish the connection.
 *
 * It's possible to use this channel in conjunction with other messages posted
 * to the global window. However, only one PortChannel should be used for the
 * global window at a time.
 *
 * @param {string} peerOrigin The expected origin of the enclosing document. See
 *     http://dev.w3.org/html5/postmsg/#dom-window-postmessage.
 * @return {!goog.messaging.MessageChannel} The PortChannel. Although this may
 *     not actually be an instance of the PortChannel class, it will behave like
 *     one in that MessagePorts may be sent across it.
 */
goog.messaging.PortChannel.forGlobalWindow = function(peerOrigin) {
  var deferred = new goog.async.Deferred();
  // Wait for the external page to post a message containing the message port
  // which we'll use to set up the PortChannel. Ignore all other messages. Once
  // we receive the port, notify the other end and then set up the PortChannel.
  var key = goog.events.listen(
      window, goog.events.EventType.MESSAGE, function(e) {
        var browserEvent = e.getBrowserEvent();
        var data = browserEvent.data;
        if (!goog.isObject(data) || !data[goog.messaging.PortChannel.FLAG]) {
          return;
        }

        if (peerOrigin != '*' && peerOrigin != browserEvent.origin) {
          return;
        }

        var port = browserEvent.ports[0];
        // Notify the other end of the channel that we've received our port
        port.postMessage({});

        port.start();
        deferred.callback(new goog.messaging.PortChannel(port));
        goog.events.unlistenByKey(key);
      });
  return new goog.messaging.DeferredChannel(deferred);
};


/**
 * The flag added to messages that are sent by a PortChannel, and are meant to
 * be handled by one on the other side.
 * @type {string}
 */
goog.messaging.PortChannel.FLAG = '--goog.messaging.PortChannel';


/**
 * Whether the messages sent across the channel must be JSON-serialized. This is
 * required for older versions of Webkit, which can only send string messages.
 *
 * Although Safari and Chrome have separate implementations of message passing,
 * both of them support passing objects by Webkit 533.
 *
 * @type {boolean}
 * @private
 */
goog.messaging.PortChannel.REQUIRES_SERIALIZATION_ = goog.userAgent.WEBKIT &&
    goog.string.compareVersions(goog.userAgent.VERSION, '533') < 0;


/**
 * Logger for this class.
 * @type {goog.log.Logger}
 * @protected
 * @override
 */
goog.messaging.PortChannel.prototype.logger =
    goog.log.getLogger('goog.messaging.PortChannel');


/**
 * Sends a message over the channel.
 *
 * As an addition to the basic MessageChannel send API, PortChannels can send
 * objects that contain MessagePorts. Note that only plain Objects and Arrays,
 * not their subclasses, can contain MessagePorts.
 *
 * As per {@link http://www.w3.org/TR/html5/comms.html#clone-a-port}, once a
 * port is copied to be sent across a channel, the original port will cease
 * being able to send or receive messages.
 *
 * @override
 * @param {string} serviceName The name of the service this message should be
 *     delivered to.
 * @param {string|!Object|!MessagePort} payload The value of the message. May
 *     contain MessagePorts or be a MessagePort.
 */
goog.messaging.PortChannel.prototype.send = function(serviceName, payload) {
  var ports = [];
  payload = this.extractPorts_(ports, payload);
  var message = {'serviceName': serviceName, 'payload': payload};
  message[goog.messaging.PortChannel.FLAG] = true;

  if (goog.messaging.PortChannel.REQUIRES_SERIALIZATION_) {
    message = goog.json.serialize(message);
  }

  this.port_.postMessage(message, ports);
};


/**
 * Delivers a message to the appropriate service handler. If this message isn't
 * a GearsWorkerChannel message, it's ignored and passed on to other handlers.
 *
 * @param {goog.events.Event} e The event.
 * @private
 */
goog.messaging.PortChannel.prototype.deliver_ = function(e) {
  var browserEvent = e.getBrowserEvent();
  var data = browserEvent.data;

  if (goog.messaging.PortChannel.REQUIRES_SERIALIZATION_) {
    try {
      data = goog.json.parse(data);
    } catch (error) {
      // Ignore any non-JSON messages.
      return;
    }
  }

  if (!goog.isObject(data) || !data[goog.messaging.PortChannel.FLAG]) {
    return;
  }

  if (this.validateMessage_(data)) {
    var serviceName = data['serviceName'];
    var payload = data['payload'];
    var service = this.getService(serviceName, payload);
    if (!service) {
      return;
    }

    payload = this.decodePayload(
        serviceName,
        this.injectPorts_(browserEvent.ports || [], payload),
        service.objectPayload);
    if (goog.isDefAndNotNull(payload)) {
      service.callback(payload);
    }
  }
};


/**
 * Checks whether the message is invalid in some way.
 *
 * @param {Object} data The contents of the message.
 * @return {boolean} True if the message is valid, false otherwise.
 * @private
 */
goog.messaging.PortChannel.prototype.validateMessage_ = function(data) {
  if (!('serviceName' in data)) {
    goog.log.warning(this.logger,
        'Message object doesn\'t contain service name: ' +
        goog.debug.deepExpose(data));
    return false;
  }

  if (!('payload' in data)) {
    goog.log.warning(this.logger,
        'Message object doesn\'t contain payload: ' +
        goog.debug.deepExpose(data));
    return false;
  }

  return true;
};


/**
 * Extracts all MessagePort objects from a message to be sent into an array.
 *
 * The message ports are replaced by placeholder objects that will be replaced
 * with the ports again on the other side of the channel.
 *
 * @param {Array.<MessagePort>} ports The array that will contain ports
 *     extracted from the message. Will be destructively modified. Should be
 *     empty initially.
 * @param {string|!Object} message The message from which ports will be
 *     extracted.
 * @return {string|!Object} The message with ports extracted.
 * @private
 */
goog.messaging.PortChannel.prototype.extractPorts_ = function(ports, message) {
  // Can't use instanceof here because MessagePort is undefined in workers
  if (message &&
      Object.prototype.toString.call(/** @type {!Object} */ (message)) ==
      '[object MessagePort]') {
    ports.push(message);
    return {'_port': {'type': 'real', 'index': ports.length - 1}};
  } else if (goog.isArray(message)) {
    return goog.array.map(message, goog.bind(this.extractPorts_, this, ports));
  // We want to compare the exact constructor here because we only want to
  // recurse into object literals, not native objects like Date.
  } else if (message && message.constructor == Object) {
    return goog.object.map(/** @type {Object} */ (message), function(val, key) {
      val = this.extractPorts_(ports, val);
      return key == '_port' ? {'type': 'escaped', 'val': val} : val;
    }, this);
  } else {
    return message;
  }
};


/**
 * Injects MessagePorts back into a message received from across the channel.
 *
 * @param {Array.<MessagePort>} ports The array of ports to be injected into the
 *     message.
 * @param {string|!Object} message The message into which the ports will be
 *     injected.
 * @return {string|!Object} The message with ports injected.
 * @private
 */
goog.messaging.PortChannel.prototype.injectPorts_ = function(ports, message) {
  if (goog.isArray(message)) {
    return goog.array.map(message, goog.bind(this.injectPorts_, this, ports));
  } else if (message && message.constructor == Object) {
    message = /** @type {!Object} */ (message);
    if (message['_port'] && message['_port']['type'] == 'real') {
      return /** @type {!MessagePort} */ (ports[message['_port']['index']]);
    }
    return goog.object.map(message, function(val, key) {
      return this.injectPorts_(ports, key == '_port' ? val['val'] : val);
    }, this);
  } else {
    return message;
  }
};


/** @override */
goog.messaging.PortChannel.prototype.disposeInternal = function() {
  goog.events.unlistenByKey(this.listenerKey_);
  // Can't use instanceof here because MessagePort is undefined in workers and
  // in Firefox
  if (Object.prototype.toString.call(this.port_) == '[object MessagePort]') {
    this.port_.close();
  // Worker is undefined in workers as well as of Chrome 9
  } else if (Object.prototype.toString.call(this.port_) == '[object Worker]') {
    this.port_.terminate();
  }
  delete this.port_;
  goog.messaging.PortChannel.base(this, 'disposeInternal');
};
