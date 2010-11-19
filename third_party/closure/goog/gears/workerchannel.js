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
 * @fileoverview A message channel between Gears workers. This is meant to work
 * even when the Gears worker has other message listeners. GearsWorkerChannel
 * adds a specific prefix to its messages, and handles messages with that
 * prefix.
 *
 */


goog.provide('goog.gears.WorkerChannel');

goog.require('goog.Disposable');
goog.require('goog.debug');
goog.require('goog.debug.Logger');
goog.require('goog.events');
goog.require('goog.gears.Worker');
goog.require('goog.gears.Worker.EventType');
goog.require('goog.gears.WorkerEvent');
goog.require('goog.json');
goog.require('goog.messaging.MessageChannel'); // interface



/**
 * Creates a message channel for the given Gears worker.
 *
 * @param {goog.gears.Worker} worker The Gears worker to communicate with. This
 *     should already be initialized.
 * @constructor
 * @extends {goog.Disposable}
 * @implements {goog.messaging.MessageChannel}
 */
goog.gears.WorkerChannel = function(worker) {
  goog.base(this);

  /**
   * The Gears worker to communicate with.
   * @type {goog.gears.Worker}
   * @private
   */
  this.worker_ = worker;

  /**
   * The services registered for this worker channel.
   * @type {Object.<string, {callback: Function, jsonEncoded: boolean}>}
   * @private
   */
  this.services_ = {};

  goog.events.listen(this.worker_, goog.gears.Worker.EventType.MESSAGE,
                     this.deliver_, false, this);
};
goog.inherits(goog.gears.WorkerChannel, goog.Disposable);


/**
 * The flag added to messages that are sent by a GearsWorkerChannel, and are
 * meant to be handled by one on the other side.
 * @type {string}
 */
goog.gears.WorkerChannel.FLAG = '--goog.gears.WorkerChannel';


/**
 * The expected origin of the other end of the worker channel, represented as a
 * string of the form SCHEME://DOMAIN[:PORT]. The port may be omitted for
 * standard ports (http port 80, https port 443).
 *
 * If this is set, all GearsWorkerChannel messages are validated to come from
 * this origin, and ignored (with a warning) if they don't. Messages that aren't
 * in the GearsWorkerChannel format are not validated.
 *
 * If more complex origin validation is required, the checkMessageOrigin method
 * can be overridden.
 *
 * @type {?string}
 */
goog.gears.WorkerChannel.prototype.peerOrigin;


/**
 * The default service to be run when no other services match.
 *
 * @type {?function(string, (string|!Object))}
 * @private
 */
goog.gears.WorkerChannel.prototype.defaultService_;


/**
 * Logger for this class.
 * @type {goog.debug.Logger}
 * @protected
 */
goog.gears.WorkerChannel.prototype.logger =
    goog.debug.Logger.getLogger('goog.gears.WorkerChannel');


/**
 * Currently a no-op, since the worker is already connected when it's passed in.
 * @inheritDoc
 */
goog.gears.WorkerChannel.prototype.connect = function(opt_connectCb) {
  if (opt_connectCb) {
    opt_connectCb();
  }
};


/**
 * Currently always returns true, since the worker is already connected when
 * it's passed in.
 * @inheritDoc
 */
goog.gears.WorkerChannel.prototype.isConnected = function() {
  return true;
};


/**
 * @inheritDoc
 */
goog.gears.WorkerChannel.prototype.registerService =
    function(serviceName, callback, opt_jsonEncoded) {
  this.services_[serviceName] = {
    callback: callback,
    jsonEncoded: !!opt_jsonEncoded
  };
};


/**
 * @inheritDoc
 */
goog.gears.WorkerChannel.prototype.registerDefaultService =
    function(callback) {
  this.defaultService_ = callback;
};


/**
 * @inheritDoc
 */
goog.gears.WorkerChannel.prototype.send =
    function(serviceName, payload) {
  var message = {'serviceName': serviceName, 'payload': payload};
  message[goog.gears.WorkerChannel.FLAG] = true;
  this.worker_.sendMessage(message);
};


/**
 * @inheritDoc
 */
goog.gears.WorkerChannel.prototype.disposeInternal = function() {
  this.worker_.dispose();
};


/**
 * Delivers a message to the appropriate service handler. If this message isn't
 * a GearsWorkerChannel message, it's ignored and passed on to other handlers.
 *
 * @param {goog.gears.WorkerEvent} e The event.
 * @private
 */
goog.gears.WorkerChannel.prototype.deliver_ = function(e) {
  var messageObject = e.messageObject || {};
  var body = messageObject.body;
  if (!goog.isObject(body) || !body[goog.gears.WorkerChannel.FLAG]) {
    return;
  }

  if (!this.checkMessageOrigin(messageObject.origin)) {
    return;
  }

  var service = this.serviceForMessage_(body);
  if (service) {
    // Even though our payloads can be objects, we want to respect the
    // jsonEncoded flag for compatibility's sake.
    var payload = body['payload'];
    if (service.jsonEncoded && goog.isString(payload)) {
      try {
        payload = goog.json.parse(payload);
      } catch (err) {
        this.logger.warning(
            'Expected JSON payload for ' + body['serviceName'] + ', was "' +
            payload + '"');
        return;
      }
    } else if (!service.jsonEncoded && !goog.isString(payload)) {
      payload = goog.json.serialize(payload);
    }
    service.callback(payload);
  }

  e.preventDefault();
  e.stopPropagation();
};


/**
 * Returns the service registered for the given GearsWorkerChannel message, or
 * null if the message is invalid in some way.
 *
 * @param {Object} body The contents of the message.
 * @return {?{callback: Function, jsonEncoded: boolean}} The service registered
 *     for the message, if the message is valid and such a service exists.
 * @private
 */
goog.gears.WorkerChannel.prototype.serviceForMessage_ = function(body) {
  if (!('serviceName' in body)) {
    this.logger.warning('GearsWorkerChannel::deliver_(): ' +
                        'Message object doesn\'t contain service name: ' +
                        goog.debug.deepExpose(body));
    return null;
  }

  if (!('payload' in body)) {
    this.logger.warning('GearsWorkerChannel::deliver_(): ' +
                        'Message object doesn\'t contain payload: ' +
                        goog.debug.deepExpose(body));
    return null;
  }

  var service = this.services_[body['serviceName']];
  if (!service) {
    if (this.defaultService_) {
      var callback = goog.partial(this.defaultService_, body['serviceName']);
      var jsonEncoded = goog.isObject(body['payload']);
      return {callback: callback, jsonEncoded: jsonEncoded};
    }

    this.logger.warning('GearsWorkerChannel::deliver_(): ' +
                        'Unknown service name "' + body['serviceName'] + '" ' +
                        '(payload: ' + goog.debug.deepExpose(body['payload']) +
                        ')');
    return null;
  }

  return service;
};


/**
 * Checks whether the origin for a given message is the expected origin. If it's
 * not, a warning is logged and the message is ignored.
 *
 * This checks that the origin matches the peerOrigin property. It can be
 * overridden if more complex origin detection is necessary.
 *
 * @param {string} messageOrigin The origin of the message, of the form
 *     SCHEME://HOST[:PORT]. The port is omitted for standard ports (http port
 *     80, https port 443).
 * @return {boolean} True if the origin is acceptable, false otherwise.
 * @protected
 */
goog.gears.WorkerChannel.prototype.checkMessageOrigin = function(
    messageOrigin) {
  if (!this.peerOrigin) {
    return true;
  }

  // Gears doesn't include standard port numbers, but we want to let the user
  // include them, so we'll just edit them out.
  var peerOrigin = this.peerOrigin;
  if (/^http:/.test(peerOrigin)) {
    peerOrigin = peerOrigin.replace(/\:80$/, '');
  } else if (/^https:/.test(peerOrigin)) {
    peerOrigin = peerOrigin.replace(/\:443$/, '');
  }

  if (messageOrigin === peerOrigin) {
    return true;
  }

  this.logger.warning('Message from unexpected origin "' + messageOrigin +
                      '"; expected only messages from origin "' + peerOrigin +
                      '"');
  return false;
};
