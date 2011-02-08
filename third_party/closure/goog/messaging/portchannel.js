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

goog.require('goog.array');
goog.require('goog.debug');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.dom.DomHelper');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.json');
goog.require('goog.messaging.AbstractChannel');
goog.require('goog.object');



/**
 * A wrapper for several types of HTML5 message-passing entities
 * ({@link MessagePort}s, {@link WebWorker}s, and {@link Window}s). This class
 * adds several things on top of the standard API: it implements the
 * {@link goog.messaging.MessageChannel} interface and allows easy restriction
 * of the origin from which messages are accepted for cross-document messaging.
 *
 * The origin may be restricted using the opt_origin parameter. This is only
 * used for cross-domain messaging; that is, when the underlying port is a
 * {@link Window}. It restricts both sent and received messages, so that this
 * will never report a message from a non-matching domain and its messages will
 * never be seen by a non-matching domain. The syntax for this is given in
 * {@link http://www.w3.org/TR/html5/origin-0.html}, although "*" (meaning any
 * origin) is allowed but discouraged.
 *
 * This class can be used in conjunction with other communication on the port.
 * It sets {@link goog.messaging.PortChannel.FLAG} to true on all messages it
 * sends.
 *
 * @param {!MessagePort|!WebWorker|!Window} underlyingPort The message-passing
 *     entity to wrap. If this is a {@link MessagePort}, it should be started.
 *     The remote end should also be wrapped in a PortChannel. This will be
 *     disposed along with the PortChannel; this means terminating it if it's a
 *     worker or removing it from the DOM if it's an iframe.
 * @param {string=} opt_origin The expected origin of the remote end of the
 *     port. Required if underlyingPort is a {@link Window}.
 * @constructor
 * @extends {goog.messaging.AbstractChannel}
 */
goog.messaging.PortChannel = function(underlyingPort, opt_origin) {
  goog.base(this);

  if (goog.dom.isWindow(underlyingPort) && !opt_origin) {
    throw Error('Origin must be specified for a PortChannel wrapping a Window');
  }

  /**
   * The wrapped message-passing entity.
   * @type {!MessagePort|!WebWorker|!Window}
   * @private
   */
  this.port_ = underlyingPort;

  /**
   * The expected origin of the remote end of the port.
   * @type {?string}
   * @protected
   */
  this.peerOrigin = opt_origin || null;

  /**
   * The key for the event listener.
   * @type {?number}
   * @private
   */
  this.listenerKey_ = goog.events.listen(
      this.port_, goog.events.EventType.MESSAGE, this.deliver_, false, this);
};
goog.inherits(goog.messaging.PortChannel, goog.messaging.AbstractChannel);


/**
 * The flag added to messages that are sent by a PortChannel, and are meant to
 * be handled by one on the other side.
 * @type {string}
 */
goog.messaging.PortChannel.FLAG = '--goog.messaging.PortChannel';


/**
 * Logger for this class.
 * @type {goog.debug.Logger}
 * @protected
 */
goog.messaging.PortChannel.prototype.logger =
    goog.debug.Logger.getLogger('goog.messaging.PortChannel');


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
  if (goog.userAgent.GECKO && goog.dom.isWindow(this.port_)) {
    // Firefox doesn't support sending ports to Windows, nor does it support
    // arbitrary objects. Raise an error if there are ports, and JSON-serialize
    // the object.
    //
    // TODO(user): Add a version check once some version of Firefox does
    // support this.
    if (ports.length != 0) {
      throw Error('Firefox doesn\'t support sending ports to windows');
    }
    this.port_.postMessage(goog.json.serialize(message), this.peerOrigin);
  } else {
    this.port_.postMessage(message, ports, this.peerOrigin);
  }
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

  if (goog.userAgent.GECKO && goog.dom.isWindow(this.port_)) {
    // Firefox doesn't support sending objects to Windows, so we have to
    // deserialize if we're receiving a message via a Window connection.
    data = goog.json.parse(data);
  }

  if (!goog.isObject(data) || !data[goog.messaging.PortChannel.FLAG]) {
    return;
  }

  if (browserEvent.origin &&
      !this.checkMessageOrigin(browserEvent.origin)) {
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
        service.jsonEncoded);
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
    this.logger.warning('Message object doesn\'t contain service name: ' +
                        goog.debug.deepExpose(data));
    return false;
  }

  if (!('payload' in data)) {
    this.logger.warning('Message object doesn\'t contain payload: ' +
                        goog.debug.deepExpose(data));
    return false;
  }

  return true;
};


/**
 * Checks whether the origin for a given message is the expected origin. If it's
 * not, a warning is logged and the message is ignored.
 *
 * This checks that the origin matches the peerOrigin property. It can be
 * overridden if more complex origin detection is necessary.
 *
 * @param {string} messageOrigin The origin of the message, of the form
 *     given in {@link http://www.w3.org/TR/html5/origin-0.html}.
 * @return {boolean} True if the origin is acceptable, false otherwise.
 * @protected
 */
goog.messaging.PortChannel.prototype.checkMessageOrigin = function(
    messageOrigin) {
  if (!this.peerOrigin || this.peerOrigin == '*') {
    return true;
  }

  if (this.peerOrigin == messageOrigin) {
    return true;
  }

  this.logger.warning('Message from unexpected origin "' + messageOrigin +
                      '"; expected only messages from origin "' +
                      this.peerOrigin + '"');
  return false;
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
    message = /** @type {Object} */ (message);
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


/** @inheritDoc */
goog.messaging.PortChannel.prototype.disposeInternal = function() {
  goog.events.unlistenByKey(this.listenerKey_);
  // Can't use instanceof here because MessagePort is undefined in workers and
  // in Firefox
  if (Object.prototype.toString.call(this.port_) == '[object MessagePort]') {
    this.port_.close();
  // Worker is undefined in workers as well as of Chrome 9
  } else if (Object.prototype.toString.call(this.port_) == '[object Worker]') {
    this.port_.terminate();
  } else if (goog.dom.isWindow(this.port_) && this.port_ != goog.global &&
             this.port_.parent) {
    var win = this.port_.parent;
    var dom = new goog.dom.DomHelper(win.document);
    // If port_ is an iframe in a document, find the iframe element and remove
    // it.
    dom.removeNode(dom.getElementsByTagNameAndClass('iframe')[
        goog.array.indexOf(win.frames, this.port_)]);
  }
  delete this.port_;
  goog.base(this, 'disposeInternal');
};
