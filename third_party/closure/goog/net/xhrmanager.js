// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Manages a pool of XhrIo's. This handles all the details of
 * dealing with the XhrPool and provides a simple interface for sending requests
 * and managing events.
 *
 * This class supports queueing & prioritization of requests (XhrIoPool
 * handles this) and retrying of requests.
 *
 * The events fired by the XhrManager are an aggregation of the events of
 * each of its XhrIo objects (with some filtering, i.e., ERROR only called
 * when there are no more retries left). For this reason, all send requests have
 * to have an id, so that the user of this object can know which event is for
 * which request.
 *
 */

goog.provide('goog.net.XhrManager');
goog.provide('goog.net.XhrManager.Event');
goog.provide('goog.net.XhrManager.Request');

goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.net.ErrorCode');
goog.require('goog.net.EventType');
goog.require('goog.net.XhrIo');
goog.require('goog.net.XhrIoPool');
goog.require('goog.structs.Map');

// TODO(user): Add some time in between retries.



/**
 * A manager of an XhrIoPool.
 * @param {number=} opt_maxRetries Max. number of retries (Default: 1).
 * @param {goog.structs.Map=} opt_headers Map of default headers to add to every
 *     request.
 * @param {number=} opt_minCount Min. number of objects (Default: 1).
 * @param {number=} opt_maxCount Max. number of objects (Default: 10).
 * @param {number=} opt_timeoutInterval Timeout (in ms) before aborting an
 *     attempt (Default: 0ms).
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.net.XhrManager = function(
    opt_maxRetries,
    opt_headers,
    opt_minCount,
    opt_maxCount,
    opt_timeoutInterval) {
  goog.net.XhrManager.base(this, 'constructor');

  /**
   * Maximum number of retries for a given request
   * @type {number}
   * @private
   */
  this.maxRetries_ = goog.isDef(opt_maxRetries) ? opt_maxRetries : 1;

  /**
   * Timeout interval for an attempt of a given request.
   * @type {number}
   * @private
   */
  this.timeoutInterval_ =
      goog.isDef(opt_timeoutInterval) ? Math.max(0, opt_timeoutInterval) : 0;

  /**
   * The pool of XhrIo's to use.
   * @type {goog.net.XhrIoPool}
   * @private
   */
  this.xhrPool_ = new goog.net.XhrIoPool(
      opt_headers, opt_minCount, opt_maxCount);

  /**
   * Map of ID's to requests.
   * @type {goog.structs.Map.<string, !goog.net.XhrManager.Request>}
   * @private
   */
  this.requests_ = new goog.structs.Map();

  /**
   * The event handler.
   * @type {goog.events.EventHandler.<!goog.net.XhrManager>}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler(this);
};
goog.inherits(goog.net.XhrManager, goog.events.EventTarget);


/**
 * Error to throw when a send is attempted with an ID that the manager already
 * has registered for another request.
 * @type {string}
 * @private
 */
goog.net.XhrManager.ERROR_ID_IN_USE_ = '[goog.net.XhrManager] ID in use';


/**
 * The goog.net.EventType's to listen/unlisten for on the XhrIo object.
 * @type {Array.<goog.net.EventType>}
 * @private
 */
goog.net.XhrManager.XHR_EVENT_TYPES_ = [
  goog.net.EventType.READY,
  goog.net.EventType.COMPLETE,
  goog.net.EventType.SUCCESS,
  goog.net.EventType.ERROR,
  goog.net.EventType.ABORT,
  goog.net.EventType.TIMEOUT];


/**
 * Sets the number of milliseconds after which an incomplete request will be
 * aborted. Zero means no timeout is set.
 * @param {number} ms Timeout interval in milliseconds; 0 means none.
 */
goog.net.XhrManager.prototype.setTimeoutInterval = function(ms) {
  this.timeoutInterval_ = Math.max(0, ms);
};


/**
 * Returns the number of requests either in flight, or waiting to be sent.
 * The count will include the current request if used within a COMPLETE event
 * handler or callback.
 * @return {number} The number of requests in flight or pending send.
 */
goog.net.XhrManager.prototype.getOutstandingCount = function() {
  return this.requests_.getCount();
};


/**
 * Returns an array of request ids that are either in flight, or waiting to
 * be sent. The id of the current request will be included if used within a
 * COMPLETE event handler or callback.
 * @return {!Array.<string>} Request ids in flight or pending send.
 */
goog.net.XhrManager.prototype.getOutstandingRequestIds = function() {
  return this.requests_.getKeys();
};


/**
 * Registers the given request to be sent. Throws an error if a request
 * already exists with the given ID.
 * NOTE: It is not sent immediately. It is queued and will be sent when an
 * XhrIo object becomes available, taking into account the request's
 * priority.
 * @param {string} id The id of the request.
 * @param {string} url Uri to make the request too.
 * @param {string=} opt_method Send method, default: GET.
 * @param {ArrayBuffer|ArrayBufferView|Blob|Document|FormData|string=}
 *     opt_content Post data.
 * @param {Object|goog.structs.Map=} opt_headers Map of headers to add to the
 *     request.
 * @param {number=} opt_priority The priority of the request. A smaller value
 *     means a higher priority.
 * @param {Function=} opt_callback Callback function for when request is
 *     complete. The only param is the event object from the COMPLETE event.
 * @param {number=} opt_maxRetries The maximum number of times the request
 *     should be retried.
 * @param {goog.net.XhrIo.ResponseType=} opt_responseType The response type of
 *     this request; defaults to goog.net.XhrIo.ResponseType.DEFAULT.
 * @return {!goog.net.XhrManager.Request} The queued request object.
 */
goog.net.XhrManager.prototype.send = function(
    id,
    url,
    opt_method,
    opt_content,
    opt_headers,
    opt_priority,
    opt_callback,
    opt_maxRetries,
    opt_responseType) {
  var requests = this.requests_;
  // Check if there is already a request with the given id.
  if (requests.get(id)) {
    throw Error(goog.net.XhrManager.ERROR_ID_IN_USE_);
  }

  // Make the Request object.
  var request = new goog.net.XhrManager.Request(
      url,
      goog.bind(this.handleEvent_, this, id),
      opt_method,
      opt_content,
      opt_headers,
      opt_callback,
      goog.isDef(opt_maxRetries) ? opt_maxRetries : this.maxRetries_,
      opt_responseType);
  this.requests_.set(id, request);

  // Setup the callback for the pool.
  var callback = goog.bind(this.handleAvailableXhr_, this, id);
  this.xhrPool_.getObject(callback, opt_priority);

  return request;
};


/**
 * Aborts the request associated with id.
 * @param {string} id The id of the request to abort.
 * @param {boolean=} opt_force If true, remove the id now so it can be reused.
 *     No events are fired and the callback is not called when forced.
 */
goog.net.XhrManager.prototype.abort = function(id, opt_force) {
  var request = this.requests_.get(id);
  if (request) {
    var xhrIo = request.xhrIo;
    request.setAborted(true);
    if (opt_force) {
      if (xhrIo) {
        // We remove listeners to make sure nothing gets called if a new request
        // with the same id is made.
        this.removeXhrListener_(xhrIo, request.getXhrEventCallback());
        goog.events.listenOnce(
            xhrIo,
            goog.net.EventType.READY,
            function() { this.xhrPool_.releaseObject(xhrIo); },
            false,
            this);
      }
      this.requests_.remove(id);
    }
    if (xhrIo) {
      xhrIo.abort();
    }
  }
};


/**
 * Handles when an XhrIo object becomes available. Sets up the events, fires
 * the READY event, and starts the process to send the request.
 * @param {string} id The id of the request the XhrIo is for.
 * @param {goog.net.XhrIo} xhrIo The available XhrIo object.
 * @private
 */
goog.net.XhrManager.prototype.handleAvailableXhr_ = function(id, xhrIo) {
  var request = this.requests_.get(id);
  // Make sure the request doesn't already have an XhrIo attached. This can
  // happen if a forced abort occurs before an XhrIo is available, and a new
  // request with the same id is made.
  if (request && !request.xhrIo) {
    this.addXhrListener_(xhrIo, request.getXhrEventCallback());

    // Set properties for the XhrIo.
    xhrIo.setTimeoutInterval(this.timeoutInterval_);
    xhrIo.setResponseType(request.getResponseType());

    // Add a reference to the XhrIo object to the request.
    request.xhrIo = xhrIo;

    // Notify the listeners.
    this.dispatchEvent(new goog.net.XhrManager.Event(
        goog.net.EventType.READY, this, id, xhrIo));

    // Send the request.
    this.retry_(id, xhrIo);

    // If the request was aborted before it got an XhrIo object, abort it now.
    if (request.getAborted()) {
      xhrIo.abort();
    }
  } else {
    // If the request has an XhrIo object already, or no request exists, just
    // return the XhrIo back to the pool.
    this.xhrPool_.releaseObject(xhrIo);
  }
};


/**
 * Handles all events fired by the XhrIo object for a given request.
 * @param {string} id The id of the request.
 * @param {goog.events.Event} e The event.
 * @return {Object} The return value from the handler, if any.
 * @private
 */
goog.net.XhrManager.prototype.handleEvent_ = function(id, e) {
  var xhrIo = /** @type {goog.net.XhrIo} */(e.target);
  switch (e.type) {
    case goog.net.EventType.READY:
      this.retry_(id, xhrIo);
      break;

    case goog.net.EventType.COMPLETE:
      return this.handleComplete_(id, xhrIo, e);

    case goog.net.EventType.SUCCESS:
      this.handleSuccess_(id, xhrIo);
      break;

    // A timeout is handled like an error.
    case goog.net.EventType.TIMEOUT:
    case goog.net.EventType.ERROR:
      this.handleError_(id, xhrIo);
      break;

    case goog.net.EventType.ABORT:
      this.handleAbort_(id, xhrIo);
      break;
  }
  return null;
};


/**
 * Attempts to retry the given request. If the request has already attempted
 * the maximum number of retries, then it removes the request and releases
 * the XhrIo object back into the pool.
 * @param {string} id The id of the request.
 * @param {goog.net.XhrIo} xhrIo The XhrIo object.
 * @private
 */
goog.net.XhrManager.prototype.retry_ = function(id, xhrIo) {
  var request = this.requests_.get(id);

  // If the request has not completed and it is below its max. retries.
  if (request && !request.getCompleted() && !request.hasReachedMaxRetries()) {
    request.increaseAttemptCount();
    xhrIo.send(request.getUrl(), request.getMethod(), request.getContent(),
        request.getHeaders());
  } else {
    if (request) {
      // Remove the events on the XhrIo objects.
      this.removeXhrListener_(xhrIo, request.getXhrEventCallback());

      // Remove the request.
      this.requests_.remove(id);
    }
    // Release the XhrIo object back into the pool.
    this.xhrPool_.releaseObject(xhrIo);
  }
};


/**
 * Handles the complete of a request. Dispatches the COMPLETE event and sets the
 * the request as completed if the request has succeeded, or is done retrying.
 * @param {string} id The id of the request.
 * @param {goog.net.XhrIo} xhrIo The XhrIo object.
 * @param {goog.events.Event} e The original event.
 * @return {Object} The return value from the callback, if any.
 * @private
 */
goog.net.XhrManager.prototype.handleComplete_ = function(id, xhrIo, e) {
  // Only if the request is done processing should a COMPLETE event be fired.
  var request = this.requests_.get(id);
  if (xhrIo.getLastErrorCode() == goog.net.ErrorCode.ABORT ||
      xhrIo.isSuccess() || request.hasReachedMaxRetries()) {
    this.dispatchEvent(new goog.net.XhrManager.Event(
        goog.net.EventType.COMPLETE, this, id, xhrIo));

    // If the request exists, we mark it as completed and call the callback
    if (request) {
      request.setCompleted(true);
      // Call the complete callback as if it was set as a COMPLETE event on the
      // XhrIo directly.
      if (request.getCompleteCallback()) {
        return request.getCompleteCallback().call(xhrIo, e);
      }
    }
  }
  return null;
};


/**
 * Handles the abort of an underlying XhrIo object.
 * @param {string} id The id of the request.
 * @param {goog.net.XhrIo} xhrIo The XhrIo object.
 * @private
 */
goog.net.XhrManager.prototype.handleAbort_ = function(id, xhrIo) {
  // Fire event.
  // NOTE: The complete event should always be fired before the abort event, so
  // the bulk of the work is done in handleComplete.
  this.dispatchEvent(new goog.net.XhrManager.Event(
      goog.net.EventType.ABORT, this, id, xhrIo));
};


/**
 * Handles the success of a request. Dispatches the SUCCESS event and sets the
 * the request as completed.
 * @param {string} id The id of the request.
 * @param {goog.net.XhrIo} xhrIo The XhrIo object.
 * @private
 */
goog.net.XhrManager.prototype.handleSuccess_ = function(id, xhrIo) {
  // Fire event.
  // NOTE: We don't release the XhrIo object from the pool here.
  // It is released in the retry method, when we know it is back in the
  // ready state.
  this.dispatchEvent(new goog.net.XhrManager.Event(
      goog.net.EventType.SUCCESS, this, id, xhrIo));
};


/**
 * Handles the error of a request. If the request has not reach its maximum
 * number of retries, then it lets the request retry naturally (will let the
 * request hit the READY state). Else, it dispatches the ERROR event.
 * @param {string} id The id of the request.
 * @param {goog.net.XhrIo} xhrIo The XhrIo object.
 * @private
 */
goog.net.XhrManager.prototype.handleError_ = function(id, xhrIo) {
  var request = this.requests_.get(id);

  // If the maximum number of retries has been reached.
  if (request.hasReachedMaxRetries()) {
    // Fire event.
    // NOTE: We don't release the XhrIo object from the pool here.
    // It is released in the retry method, when we know it is back in the
    // ready state.
    this.dispatchEvent(new goog.net.XhrManager.Event(
        goog.net.EventType.ERROR, this, id, xhrIo));
  }
};


/**
 * Remove listeners for XHR events on an XhrIo object.
 * @param {goog.net.XhrIo} xhrIo The object to stop listenening to events on.
 * @param {Function} func The callback to remove from event handling.
 * @param {string|Array.<string>=} opt_types Event types to remove listeners
 *     for. Defaults to XHR_EVENT_TYPES_.
 * @private
 */
goog.net.XhrManager.prototype.removeXhrListener_ = function(xhrIo,
                                                            func,
                                                            opt_types) {
  var types = opt_types || goog.net.XhrManager.XHR_EVENT_TYPES_;
  this.eventHandler_.unlisten(xhrIo, types, func);
};


/**
 * Adds a listener for XHR events on an XhrIo object.
 * @param {goog.net.XhrIo} xhrIo The object listen to events on.
 * @param {Function} func The callback when the event occurs.
 * @param {string|Array.<string>=} opt_types Event types to attach listeners to.
 *     Defaults to XHR_EVENT_TYPES_.
 * @private
 */
goog.net.XhrManager.prototype.addXhrListener_ = function(xhrIo,
                                                         func,
                                                         opt_types) {
  var types = opt_types || goog.net.XhrManager.XHR_EVENT_TYPES_;
  this.eventHandler_.listen(xhrIo, types, func);
};


/** @override */
goog.net.XhrManager.prototype.disposeInternal = function() {
  goog.net.XhrManager.superClass_.disposeInternal.call(this);

  this.xhrPool_.dispose();
  this.xhrPool_ = null;

  this.eventHandler_.dispose();
  this.eventHandler_ = null;

  this.requests_.clear();
  this.requests_ = null;
};



/**
 * An event dispatched by XhrManager.
 *
 * @param {goog.net.EventType} type Event Type.
 * @param {goog.net.XhrManager} target Reference to the object that is the
 *     target of this event.
 * @param {string} id The id of the request this event is for.
 * @param {goog.net.XhrIo} xhrIo The XhrIo object of the request.
 * @constructor
 * @extends {goog.events.Event}
 * @final
 */
goog.net.XhrManager.Event = function(type, target, id, xhrIo) {
  goog.events.Event.call(this, type, target);

  /**
   * The id of the request this event is for.
   * @type {string}
   */
  this.id = id;

  /**
   * The XhrIo object of the request.
   * @type {goog.net.XhrIo}
   */
  this.xhrIo = xhrIo;
};
goog.inherits(goog.net.XhrManager.Event, goog.events.Event);



/**
 * An encapsulation of everything needed to make a Xhr request.
 * NOTE: This is used internal to the XhrManager.
 *
 * @param {string} url Uri to make the request too.
 * @param {Function} xhrEventCallback Callback attached to the events of the
 *     XhrIo object of the request.
 * @param {string=} opt_method Send method, default: GET.
 * @param {ArrayBuffer|ArrayBufferView|Blob|Document|FormData|string=}
 *     opt_content Post data.
 * @param {Object|goog.structs.Map=} opt_headers Map of headers to add to the
 *     request.
 * @param {Function=} opt_callback Callback function for when request is
 *     complete. NOTE: Only 1 callback supported across all events.
 * @param {number=} opt_maxRetries The maximum number of times the request
 *     should be retried (Default: 1).
 * @param {goog.net.XhrIo.ResponseType=} opt_responseType The response type of
 *     this request; defaults to goog.net.XhrIo.ResponseType.DEFAULT.
 *
 * @constructor
 * @final
 */
goog.net.XhrManager.Request = function(url, xhrEventCallback, opt_method,
    opt_content, opt_headers, opt_callback, opt_maxRetries, opt_responseType) {
  /**
   * Uri to make the request too.
   * @type {string}
   * @private
   */
  this.url_ = url;

  /**
   * Send method.
   * @type {string}
   * @private
   */
  this.method_ = opt_method || 'GET';

  /**
   * Post data.
   * @type {ArrayBuffer|ArrayBufferView|Blob|Document|FormData|string|undefined}
   * @private
   */
  this.content_ = opt_content;

  /**
   *  Map of headers
   * @type {Object|goog.structs.Map|null}
   * @private
   */
  this.headers_ = opt_headers || null;

  /**
   * The maximum number of times the request should be retried.
   * @type {number}
   * @private
   */
  this.maxRetries_ = goog.isDef(opt_maxRetries) ? opt_maxRetries : 1;

  /**
   * The number of attempts  so far.
   * @type {number}
   * @private
   */
  this.attemptCount_ = 0;

  /**
   * Whether the request has been completed.
   * @type {boolean}
   * @private
   */
  this.completed_ = false;

  /**
   * Whether the request has been aborted.
   * @type {boolean}
   * @private
   */
  this.aborted_ = false;

  /**
   * Callback attached to the events of the XhrIo object.
   * @type {Function}
   * @private
   */
  this.xhrEventCallback_ = xhrEventCallback;

  /**
   * Callback function called when request is complete.
   * @type {Function|undefined}
   * @private
   */
  this.completeCallback_ = opt_callback;

  /**
   * A response type to set on this.xhrIo when it's populated.
   * @type {!goog.net.XhrIo.ResponseType}
   * @private
   */
  this.responseType_ = opt_responseType || goog.net.XhrIo.ResponseType.DEFAULT;

  /**
   * The XhrIo instance handling this request. Set in handleAvailableXhr.
   * @type {goog.net.XhrIo}
   */
  this.xhrIo = null;

};


/**
 * Gets the uri.
 * @return {string} The uri to make the request to.
 */
goog.net.XhrManager.Request.prototype.getUrl = function() {
  return this.url_;
};


/**
 * Gets the send method.
 * @return {string} The send method.
 */
goog.net.XhrManager.Request.prototype.getMethod = function() {
  return this.method_;
};


/**
 * Gets the post data.
 * @return {ArrayBuffer|ArrayBufferView|Blob|Document|FormData|string|undefined}
 *     The post data.
 */
goog.net.XhrManager.Request.prototype.getContent = function() {
  return this.content_;
};


/**
 * Gets the map of headers.
 * @return {Object|goog.structs.Map} The map of headers.
 */
goog.net.XhrManager.Request.prototype.getHeaders = function() {
  return this.headers_;
};


/**
 * Gets the maximum number of times the request should be retried.
 * @return {number} The maximum number of times the request should be retried.
 */
goog.net.XhrManager.Request.prototype.getMaxRetries = function() {
  return this.maxRetries_;
};


/**
 * Gets the number of attempts so far.
 * @return {number} The number of attempts so far.
 */
goog.net.XhrManager.Request.prototype.getAttemptCount = function() {
  return this.attemptCount_;
};


/**
 * Increases the number of attempts so far.
 */
goog.net.XhrManager.Request.prototype.increaseAttemptCount = function() {
  this.attemptCount_++;
};


/**
 * Returns whether the request has reached the maximum number of retries.
 * @return {boolean} Whether the request has reached the maximum number of
 *     retries.
 */
goog.net.XhrManager.Request.prototype.hasReachedMaxRetries = function() {
  return this.attemptCount_ > this.maxRetries_;
};


/**
 * Sets the completed status.
 * @param {boolean} complete The completed status.
 */
goog.net.XhrManager.Request.prototype.setCompleted = function(complete) {
  this.completed_ = complete;
};


/**
 * Gets the completed status.
 * @return {boolean} The completed status.
 */
goog.net.XhrManager.Request.prototype.getCompleted = function() {
  return this.completed_;
};


/**
 * Sets the aborted status.
 * @param {boolean} aborted True if the request was aborted, otherwise False.
 */
goog.net.XhrManager.Request.prototype.setAborted = function(aborted) {
  this.aborted_ = aborted;
};


/**
 * Gets the aborted status.
 * @return {boolean} True if request was aborted, otherwise False.
 */
goog.net.XhrManager.Request.prototype.getAborted = function() {
  return this.aborted_;
};


/**
 * Gets the callback attached to the events of the XhrIo object.
 * @return {Function} The callback attached to the events of the
 *     XhrIo object.
 */
goog.net.XhrManager.Request.prototype.getXhrEventCallback = function() {
  return this.xhrEventCallback_;
};


/**
 * Gets the callback for when the request is complete.
 * @return {Function|undefined} The callback for when the request is complete.
 */
goog.net.XhrManager.Request.prototype.getCompleteCallback = function() {
  return this.completeCallback_;
};


/**
 * Gets the response type that will be set on this request's XhrIo when it's
 * available.
 * @return {!goog.net.XhrIo.ResponseType} The response type to be set
 *     when an XhrIo becomes available to this request.
 */
goog.net.XhrManager.Request.prototype.getResponseType = function() {
  return this.responseType_;
};
