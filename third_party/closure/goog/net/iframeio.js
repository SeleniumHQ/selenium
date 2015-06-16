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
 * @fileoverview Class for managing requests via iFrames.  Supports a number of
 * methods of transfer.
 *
 * Gets and Posts can be performed and the resultant page read in as text,
 * JSON, or from the HTML DOM.
 *
 * Using an iframe causes the throbber to spin, this is good for providing
 * feedback to the user that an action has occurred.
 *
 * Requests do not affect the history stack, see goog.History if you require
 * this behavior.
 *
 * The responseText and responseJson methods assume the response is plain,
 * text.  You can access the Iframe's DOM through responseXml if you need
 * access to the raw HTML.
 *
 * Tested:
 *    + FF2.0 (Win Linux)
 *    + IE6, IE7
 *    + Opera 9.1,
 *    + Chrome
 *    - Opera 8.5 fails because of no textContent and buggy innerText support
 *
 * NOTE: Safari doesn't fire the onload handler when loading plain text files
 *
 * This has been tested with Drip in IE to ensure memory usage is as constant
 * as possible. When making making thousands of requests, memory usage stays
 * constant for a while but then starts increasing (<500k for 2000
 * requests) -- this hasn't yet been tracked down yet, though it is cleared up
 * after a refresh.
 *
 *
 * BACKGROUND FILE UPLOAD:
 * By posting an arbitrary form through an IframeIo object, it is possible to
 * implement background file uploads.  Here's how to do it:
 *
 * - Create a form:
 *   <pre>
 *   &lt;form id="form" enctype="multipart/form-data" method="POST"&gt;
 *      &lt;input name="userfile" type="file" /&gt;
 *   &lt;/form&gt;
 *   </pre>
 *
 * - Have the user click the file input
 * - Create an IframeIo instance
 *   <pre>
 *   var io = new goog.net.IframeIo;
 *   goog.events.listen(io, goog.net.EventType.COMPLETE,
 *       function() { alert('Sent'); });
 *   io.sendFromForm(document.getElementById('form'));
 *   </pre>
 *
 *
 * INCREMENTAL LOADING:
 * Gmail sends down multiple script blocks which get executed as they are
 * received by the client. This allows incremental rendering of the thread
 * list and conversations.
 *
 * This requires collaboration with the server that is sending the requested
 * page back.  To set incremental loading up, you should:
 *
 * A) In the application code there should be an externed reference to
 * <code>handleIncrementalData()</code>.  e.g.
 * goog.exportSymbol('GG_iframeFn', goog.net.IframeIo.handleIncrementalData);
 *
 * B) The response page should them call this method directly, an example
 * response would look something like this:
 * <pre>
 *   &lt;html&gt;
 *   &lt;head&gt;
 *     &lt;meta content="text/html;charset=UTF-8" http-equiv="content-type"&gt;
 *   &lt;/head&gt;
 *   &lt;body&gt;
 *     &lt;script&gt;
 *       D = top.P ? function(d) { top.GG_iframeFn(window, d) } : function() {};
 *     &lt;/script&gt;
 *
 *     &lt;script&gt;D([1, 2, 3, 4, 5]);&lt;/script&gt;
 *     &lt;script&gt;D([6, 7, 8, 9, 10]);&lt;/script&gt;
 *     &lt;script&gt;D([11, 12, 13, 14, 15]);&lt;/script&gt;
 *   &lt;/body&gt;
 *   &lt;/html&gt;
 * </pre>
 *
 * Your application should then listen, on the IframeIo instance, to the event
 * goog.net.EventType.INCREMENTAL_DATA.  The event object contains a
 * 'data' member which is the content from the D() calls above.
 *
 * NOTE: There can be problems if you save a reference to the data object in IE.
 * If you save an array, and the iframe is dispose, then the array looses its
 * prototype and thus array methods like .join().  You can get around this by
 * creating arrays using the parent window's Array constructor, or you can
 * clone the array.
 *
 *
 * EVENT MODEL:
 * The various send methods work asynchronously. You can be notified about
 * the current status of the request (completed, success or error) by
 * listening for events on the IframeIo object itself. The following events
 * will be sent:
 * - goog.net.EventType.COMPLETE: when the request is completed
 *   (either sucessfully or unsuccessfully). You can find out about the result
 *   using the isSuccess() and getLastError
 *   methods.
 * - goog.net.EventType.SUCCESS</code>: when the request was completed
 *   successfully
 * - goog.net.EventType.ERROR: when the request failed
 * - goog.net.EventType.ABORT: when the request has been aborted
 *
 * Example:
 * <pre>
 * var io = new goog.net.IframeIo();
 * goog.events.listen(io, goog.net.EventType.COMPLETE,
 *   function() { alert('request complete'); });
 * io.sendFromForm(...);
 * </pre>
 *
 */

goog.provide('goog.net.IframeIo');
goog.provide('goog.net.IframeIo.IncrementalDataEvent');

goog.require('goog.Timer');
goog.require('goog.Uri');
goog.require('goog.asserts');
goog.require('goog.debug');
goog.require('goog.dom');
goog.require('goog.dom.InputType');
goog.require('goog.dom.TagName');
goog.require('goog.dom.safe');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.html.uncheckedconversions');
goog.require('goog.json');
goog.require('goog.log');
goog.require('goog.log.Level');
goog.require('goog.net.ErrorCode');
goog.require('goog.net.EventType');
goog.require('goog.reflect');
goog.require('goog.string');
goog.require('goog.string.Const');
goog.require('goog.structs');
goog.require('goog.userAgent');



/**
 * Class for managing requests via iFrames.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.net.IframeIo = function() {
  goog.net.IframeIo.base(this, 'constructor');

  /**
   * Name for this IframeIo and frame
   * @type {string}
   * @private
   */
  this.name_ = goog.net.IframeIo.getNextName_();

  /**
   * An array of iframes that have been finished with.  We need them to be
   * disposed async, so we don't confuse the browser (see below).
   * @type {Array<Element>}
   * @private
   */
  this.iframesForDisposal_ = [];

  // Create a lookup from names to instances of IframeIo.  This is a helper
  // function to be used in conjunction with goog.net.IframeIo.getInstanceByName
  // to find the IframeIo object associated with a particular iframe.  Used in
  // incremental scripts etc.
  goog.net.IframeIo.instances_[this.name_] = this;

};
goog.inherits(goog.net.IframeIo, goog.events.EventTarget);


/**
 * Object used as a map to lookup instances of IframeIo objects by name.
 * @type {Object}
 * @private
 */
goog.net.IframeIo.instances_ = {};


/**
 * Prefix for frame names
 * @type {string}
 */
goog.net.IframeIo.FRAME_NAME_PREFIX = 'closure_frame';


/**
 * Suffix that is added to inner frames used for sending requests in non-IE
 * browsers
 * @type {string}
 */
goog.net.IframeIo.INNER_FRAME_SUFFIX = '_inner';


/**
 * The number of milliseconds after a request is completed to dispose the
 * iframes.  This can be done lazily so we wait long enough for any processing
 * that occurred as a result of the response to finish.
 * @type {number}
 */
goog.net.IframeIo.IFRAME_DISPOSE_DELAY_MS = 2000;


/**
 * Counter used when creating iframes
 * @type {number}
 * @private
 */
goog.net.IframeIo.counter_ = 0;


/**
 * Form element to post to.
 * @type {HTMLFormElement}
 * @private
 */
goog.net.IframeIo.form_;


/**
 * Static send that creates a short lived instance of IframeIo to send the
 * request.
 * @param {goog.Uri|string} uri Uri of the request, it is up the caller to
 *     manage query string params.
 * @param {Function=} opt_callback Event handler for when request is completed.
 * @param {string=} opt_method Default is GET, POST uses a form to submit the
 *     request.
 * @param {boolean=} opt_noCache Append a timestamp to the request to avoid
 *     caching.
 * @param {Object|goog.structs.Map=} opt_data Map of key-value pairs that
 *     will be posted to the server via the iframe's form.
 */
goog.net.IframeIo.send = function(
    uri, opt_callback, opt_method, opt_noCache, opt_data) {

  var io = new goog.net.IframeIo();
  goog.events.listen(io, goog.net.EventType.READY, io.dispose, false, io);
  if (opt_callback) {
    goog.events.listen(io, goog.net.EventType.COMPLETE, opt_callback);
  }
  io.send(uri, opt_method, opt_noCache, opt_data);
};


/**
 * Find an iframe by name (assumes the context is goog.global since that is
 * where IframeIo's iframes are kept).
 * @param {string} fname The name to find.
 * @return {HTMLIFrameElement} The iframe element with that name.
 */
goog.net.IframeIo.getIframeByName = function(fname) {
  return window.frames[fname];
};


/**
 * Find an instance of the IframeIo object by name.
 * @param {string} fname The name to find.
 * @return {goog.net.IframeIo} The instance of IframeIo.
 */
goog.net.IframeIo.getInstanceByName = function(fname) {
  return goog.net.IframeIo.instances_[fname];
};


/**
 * Handles incremental data and routes it to the correct iframeIo instance.
 * The HTML page requested by the IframeIo instance should contain script blocks
 * that call an externed reference to this method.
 * @param {Window} win The window object.
 * @param {Object} data The data object.
 */
goog.net.IframeIo.handleIncrementalData = function(win, data) {
  // If this is the inner-frame, then we need to use the parent instead.
  var iframeName = goog.string.endsWith(win.name,
      goog.net.IframeIo.INNER_FRAME_SUFFIX) ? win.parent.name : win.name;

  var iframeIoName = iframeName.substring(0, iframeName.lastIndexOf('_'));
  var iframeIo = goog.net.IframeIo.getInstanceByName(iframeIoName);
  if (iframeIo && iframeName == iframeIo.iframeName_) {
    iframeIo.handleIncrementalData_(data);
  } else {
    var logger = goog.log.getLogger('goog.net.IframeIo');
    goog.log.info(logger,
        'Incremental iframe data routed for unknown iframe');
  }
};


/**
 * @return {string} The next iframe name.
 * @private
 */
goog.net.IframeIo.getNextName_ = function() {
  return goog.net.IframeIo.FRAME_NAME_PREFIX + goog.net.IframeIo.counter_++;
};


/**
 * Gets a static form, one for all instances of IframeIo since IE6 leaks form
 * nodes that are created/removed from the document.
 * @return {!HTMLFormElement} The static form.
 * @private
 */
goog.net.IframeIo.getForm_ = function() {
  if (!goog.net.IframeIo.form_) {
    goog.net.IframeIo.form_ = /** @type {!HTMLFormElement} */ (
        goog.dom.createDom(goog.dom.TagName.FORM));
    goog.net.IframeIo.form_.acceptCharset = 'utf-8';

    // Hide the form and move it off screen
    var s = goog.net.IframeIo.form_.style;
    s.position = 'absolute';
    s.visibility = 'hidden';
    s.top = s.left = '-10px';
    s.width = s.height = '10px';
    s.overflow = 'hidden';

    goog.dom.getDocument().body.appendChild(goog.net.IframeIo.form_);
  }
  return goog.net.IframeIo.form_;
};


/**
 * Adds the key value pairs from a map like data structure to a form
 * @param {HTMLFormElement} form The form to add to.
 * @param {Object|goog.structs.Map|goog.Uri.QueryData} data The data to add.
 * @private
 */
goog.net.IframeIo.addFormInputs_ = function(form, data) {
  var helper = goog.dom.getDomHelper(form);
  goog.structs.forEach(data, function(value, key) {
    var inp = helper.createDom(goog.dom.TagName.INPUT,
        {'type': goog.dom.InputType.HIDDEN, 'name': key, 'value': value});
    form.appendChild(inp);
  });
};


/**
 * @return {boolean} Whether we can use readyState to monitor iframe loading.
 * @private
 */
goog.net.IframeIo.useIeReadyStateCodePath_ = function() {
  // ReadyState is only available on iframes up to IE10.
  return goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('11');
};


/**
 * Reference to a logger for the IframeIo objects
 * @type {goog.log.Logger}
 * @private
 */
goog.net.IframeIo.prototype.logger_ =
    goog.log.getLogger('goog.net.IframeIo');


/**
 * Reference to form element that gets reused for requests to the iframe.
 * @type {HTMLFormElement}
 * @private
 */
goog.net.IframeIo.prototype.form_ = null;


/**
 * Reference to the iframe being used for the current request, or null if no
 * request is currently active.
 * @type {HTMLIFrameElement}
 * @private
 */
goog.net.IframeIo.prototype.iframe_ = null;


/**
 * Name of the iframe being used for the current request, or null if no
 * request is currently active.
 * @type {?string}
 * @private
 */
goog.net.IframeIo.prototype.iframeName_ = null;


/**
 * Next id so that iframe names are unique.
 * @type {number}
 * @private
 */
goog.net.IframeIo.prototype.nextIframeId_ = 0;


/**
 * Whether the object is currently active with a request.
 * @type {boolean}
 * @private
 */
goog.net.IframeIo.prototype.active_ = false;


/**
 * Whether the last request is complete.
 * @type {boolean}
 * @private
 */
goog.net.IframeIo.prototype.complete_ = false;


/**
 * Whether the last request was a success.
 * @type {boolean}
 * @private
 */
goog.net.IframeIo.prototype.success_ = false;


/**
 * The URI for the last request.
 * @type {goog.Uri}
 * @private
 */
goog.net.IframeIo.prototype.lastUri_ = null;


/**
 * The text content of the last request.
 * @type {?string}
 * @private
 */
goog.net.IframeIo.prototype.lastContent_ = null;


/**
 * Last error code
 * @type {goog.net.ErrorCode}
 * @private
 */
goog.net.IframeIo.prototype.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR;


/**
 * Window timeout ID used to detect when firefox silently fails.
 * @type {?number}
 * @private
 */
goog.net.IframeIo.prototype.firefoxSilentErrorTimeout_ = null;


/**
 * Window timeout ID used by the timer that disposes the iframes.
 * @type {?number}
 * @private
 */
goog.net.IframeIo.prototype.iframeDisposalTimer_ = null;


/**
 * This is used to ensure that we don't handle errors twice for the same error.
 * We can reach the {@link #handleError_} method twice in IE if the form is
 * submitted while IE is offline and the URL is not available.
 * @type {boolean}
 * @private
 */
goog.net.IframeIo.prototype.errorHandled_;


/**
 * Whether to suppress the listeners that determine when the iframe loads.
 * @type {boolean}
 * @private
 */
goog.net.IframeIo.prototype.ignoreResponse_ = false;


/** @private {Function} */
goog.net.IframeIo.prototype.errorChecker_;


/** @private {Object} */
goog.net.IframeIo.prototype.lastCustomError_;


/** @private {?string} */
goog.net.IframeIo.prototype.lastContentHtml_;


/**
 * Sends a request via an iframe.
 *
 * A HTML form is used and submitted to the iframe, this simplifies the
 * difference between GET and POST requests. The iframe needs to be created and
 * destroyed for each request otherwise the request will contribute to the
 * history stack.
 *
 * sendFromForm does some clever trickery (thanks jlim) in non-IE browsers to
 * stop a history entry being added for POST requests.
 *
 * @param {goog.Uri|string} uri Uri of the request.
 * @param {string=} opt_method Default is GET, POST uses a form to submit the
 *     request.
 * @param {boolean=} opt_noCache Append a timestamp to the request to avoid
 *     caching.
 * @param {Object|goog.structs.Map=} opt_data Map of key-value pairs.
 */
goog.net.IframeIo.prototype.send = function(
    uri, opt_method, opt_noCache, opt_data) {

  if (this.active_) {
    throw Error('[goog.net.IframeIo] Unable to send, already active.');
  }

  var uriObj = new goog.Uri(uri);
  this.lastUri_ = uriObj;
  var method = opt_method ? opt_method.toUpperCase() : 'GET';

  if (opt_noCache) {
    uriObj.makeUnique();
  }

  goog.log.info(this.logger_,
      'Sending iframe request: ' + uriObj + ' [' + method + ']');

  // Build a form for this request
  this.form_ = goog.net.IframeIo.getForm_();

  if (method == 'GET') {
    // For GET requests, we assume that the caller didn't want the queryparams
    // already specified in the URI to be clobbered by the form, so we add the
    // params here.
    goog.net.IframeIo.addFormInputs_(this.form_, uriObj.getQueryData());
  }

  if (opt_data) {
    // Create form fields for each of the data values
    goog.net.IframeIo.addFormInputs_(this.form_, opt_data);
  }

  // Set the URI that the form will be posted
  this.form_.action = uriObj.toString();
  this.form_.method = method;

  this.sendFormInternal_();
  this.clearForm_();
};


/**
 * Sends the data stored in an existing form to the server. The HTTP method
 * should be specified on the form, the action can also be specified but can
 * be overridden by the optional URI param.
 *
 * This can be used in conjunction will a file-upload input to upload a file in
 * the background without affecting history.
 *
 * Example form:
 * <pre>
 *   &lt;form action="/server/" enctype="multipart/form-data" method="POST"&gt;
 *     &lt;input name="userfile" type="file"&gt;
 *   &lt;/form&gt;
 * </pre>
 *
 * @param {HTMLFormElement} form Form element used to send the request to the
 *     server.
 * @param {string=} opt_uri Uri to set for the destination of the request, by
 *     default the uri will come from the form.
 * @param {boolean=} opt_noCache Append a timestamp to the request to avoid
 *     caching.
 */
goog.net.IframeIo.prototype.sendFromForm = function(form, opt_uri,
    opt_noCache) {
  if (this.active_) {
    throw Error('[goog.net.IframeIo] Unable to send, already active.');
  }

  var uri = new goog.Uri(opt_uri || form.action);
  if (opt_noCache) {
    uri.makeUnique();
  }

  goog.log.info(this.logger_, 'Sending iframe request from form: ' + uri);

  this.lastUri_ = uri;
  this.form_ = form;
  this.form_.action = uri.toString();
  this.sendFormInternal_();
};


/**
 * Abort the current Iframe request
 * @param {goog.net.ErrorCode=} opt_failureCode Optional error code to use -
 *     defaults to ABORT.
 */
goog.net.IframeIo.prototype.abort = function(opt_failureCode) {
  if (this.active_) {
    goog.log.info(this.logger_, 'Request aborted');
    var requestIframe = this.getRequestIframe();
    goog.asserts.assert(requestIframe);
    goog.events.removeAll(requestIframe);
    this.complete_ = false;
    this.active_ = false;
    this.success_ = false;
    this.lastErrorCode_ = opt_failureCode || goog.net.ErrorCode.ABORT;

    this.dispatchEvent(goog.net.EventType.ABORT);

    this.makeReady_();
  }
};


/** @override */
goog.net.IframeIo.prototype.disposeInternal = function() {
  goog.log.fine(this.logger_, 'Disposing iframeIo instance');

  // If there is an active request, abort it
  if (this.active_) {
    goog.log.fine(this.logger_, 'Aborting active request');
    this.abort();
  }

  // Call super-classes implementation (remove listeners)
  goog.net.IframeIo.superClass_.disposeInternal.call(this);

  // Add the current iframe to the list of iframes for disposal.
  if (this.iframe_) {
    this.scheduleIframeDisposal_();
  }

  // Disposes of the form
  this.disposeForm_();

  // Nullify anything that might cause problems and clear state
  delete this.errorChecker_;
  this.form_ = null;
  this.lastCustomError_ = this.lastContent_ = this.lastContentHtml_ = null;
  this.lastUri_ = null;
  this.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR;

  delete goog.net.IframeIo.instances_[this.name_];
};


/**
 * @return {boolean} True if transfer is complete.
 */
goog.net.IframeIo.prototype.isComplete = function() {
  return this.complete_;
};


/**
 * @return {boolean} True if transfer was successful.
 */
goog.net.IframeIo.prototype.isSuccess = function() {
  return this.success_;
};


/**
 * @return {boolean} True if a transfer is in progress.
 */
goog.net.IframeIo.prototype.isActive = function() {
  return this.active_;
};


/**
 * Returns the last response text (i.e. the text content of the iframe).
 * Assumes plain text!
 * @return {?string} Result from the server.
 */
goog.net.IframeIo.prototype.getResponseText = function() {
  return this.lastContent_;
};


/**
 * Returns the last response html (i.e. the innerHtml of the iframe).
 * @return {?string} Result from the server.
 */
goog.net.IframeIo.prototype.getResponseHtml = function() {
  return this.lastContentHtml_;
};


/**
 * Parses the content as JSON. This is a safe parse and may throw an error
 * if the response is malformed.
 * Use goog.json.unsafeparse(this.getResponseText()) if you are sure of the
 * state of the returned content.
 * @return {Object} The parsed content.
 */
goog.net.IframeIo.prototype.getResponseJson = function() {
  return goog.json.parse(this.lastContent_);
};


/**
 * Returns the document object from the last request.  Not truely XML, but
 * used to mirror the XhrIo interface.
 * @return {HTMLDocument} The document object from the last request.
 */
goog.net.IframeIo.prototype.getResponseXml = function() {
  if (!this.iframe_) return null;

  return this.getContentDocument_();
};


/**
 * Get the uri of the last request.
 * @return {goog.Uri} Uri of last request.
 */
goog.net.IframeIo.prototype.getLastUri = function() {
  return this.lastUri_;
};


/**
 * Gets the last error code.
 * @return {goog.net.ErrorCode} Last error code.
 */
goog.net.IframeIo.prototype.getLastErrorCode = function() {
  return this.lastErrorCode_;
};


/**
 * Gets the last error message.
 * @return {string} Last error message.
 */
goog.net.IframeIo.prototype.getLastError = function() {
  return goog.net.ErrorCode.getDebugMessage(this.lastErrorCode_);
};


/**
 * Gets the last custom error.
 * @return {Object} Last custom error.
 */
goog.net.IframeIo.prototype.getLastCustomError = function() {
  return this.lastCustomError_;
};


/**
 * Sets the callback function used to check if a loaded IFrame is in an error
 * state.
 * @param {Function} fn Callback that expects a document object as it's single
 *     argument.
 */
goog.net.IframeIo.prototype.setErrorChecker = function(fn) {
  this.errorChecker_ = fn;
};


/**
 * Gets the callback function used to check if a loaded IFrame is in an error
 * state.
 * @return {Function} A callback that expects a document object as it's single
 *     argument.
 */
goog.net.IframeIo.prototype.getErrorChecker = function() {
  return this.errorChecker_;
};


/**
 * @return {boolean} Whether the server response is being ignored.
 */
goog.net.IframeIo.prototype.isIgnoringResponse = function() {
  return this.ignoreResponse_;
};


/**
 * Sets whether to ignore the response from the server by not adding any event
 * handlers to fire when the iframe loads. This is necessary when using IframeIo
 * to submit to a server on another domain, to avoid same-origin violations when
 * trying to access the response. If this is set to true, the IframeIo instance
 * will be a single-use instance that is only usable for one request.  It will
 * only clean up its resources (iframes and forms) when it is disposed.
 * @param {boolean} ignore Whether to ignore the server response.
 */
goog.net.IframeIo.prototype.setIgnoreResponse = function(ignore) {
  this.ignoreResponse_ = ignore;
};


/**
 * Submits the internal form to the iframe.
 * @private
 */
goog.net.IframeIo.prototype.sendFormInternal_ = function() {
  this.active_ = true;
  this.complete_ = false;
  this.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR;

  // Make Iframe
  this.createIframe_();

  if (goog.net.IframeIo.useIeReadyStateCodePath_()) {
    // In IE<11 we simply create the frame, wait until it is ready, then post
    // the form to the iframe and wait for the readystate to change to
    // 'complete'

    // Set the target to the iframe's name
    this.form_.target = this.iframeName_ || '';
    this.appendIframe_();
    if (!this.ignoreResponse_) {
      goog.events.listen(this.iframe_, goog.events.EventType.READYSTATECHANGE,
          this.onIeReadyStateChange_, false, this);
    }

    /** @preserveTry */
    try {
      this.errorHandled_ = false;
      this.form_.submit();
    } catch (e) {
      // If submit threw an exception then it probably means the page that the
      // code is running on the local file system and the form's action was
      // pointing to a file that doesn't exist, causing the browser to fire an
      // exception.  IE also throws an exception when it is working offline and
      // the URL is not available.

      if (!this.ignoreResponse_) {
        goog.events.unlisten(
            this.iframe_,
            goog.events.EventType.READYSTATECHANGE,
            this.onIeReadyStateChange_,
            false,
            this);
      }

      this.handleError_(goog.net.ErrorCode.ACCESS_DENIED);
    }

  } else {
    // For all other browsers we do some trickery to ensure that there is no
    // entry on the history stack. Thanks go to jlim for the prototype for this

    goog.log.fine(this.logger_, 'Setting up iframes and cloning form');

    this.appendIframe_();

    var innerFrameName = this.iframeName_ +
                         goog.net.IframeIo.INNER_FRAME_SUFFIX;

    // Open and document.write another iframe into the iframe
    var doc = goog.dom.getFrameContentDocument(this.iframe_);
    var html;
    if (document.baseURI) {
      // On Safari 4 and 5 the new iframe doesn't inherit the current baseURI.
      html = goog.net.IframeIo.createIframeHtmlWithBaseUri_(innerFrameName);
    } else {
      html = goog.net.IframeIo.createIframeHtml_(innerFrameName);
    }
    if (goog.userAgent.OPERA) {
      // Opera adds a history entry when document.write is used.
      // Change the innerHTML of the page instead.
      goog.dom.safe.setInnerHtml(doc.documentElement, html);
    } else {
      goog.dom.safe.documentWrite(doc, html);
    }

    // Listen for the iframe's load
    if (!this.ignoreResponse_) {
      goog.events.listen(doc.getElementById(innerFrameName),
          goog.events.EventType.LOAD, this.onIframeLoaded_, false, this);
    }

    // Fix text areas, since importNode won't clone changes to the value
    var textareas = this.form_.getElementsByTagName(goog.dom.TagName.TEXTAREA);
    for (var i = 0, n = textareas.length; i < n; i++) {
      // The childnodes represent the initial child nodes for the text area
      // appending a text node essentially resets the initial value ready for
      // it to be clones - while maintaining HTML escaping.
      var value = textareas[i].value;
      if (goog.dom.getRawTextContent(textareas[i]) != value) {
        goog.dom.setTextContent(textareas[i], value);
        textareas[i].value = value;
      }
    }

    // Append a cloned form to the iframe
    var clone = doc.importNode(this.form_, true);
    clone.target = innerFrameName;
    // Work around crbug.com/66987
    clone.action = this.form_.action;
    doc.body.appendChild(clone);

    // Fix select boxes, importNode won't override the default value
    var selects = this.form_.getElementsByTagName(goog.dom.TagName.SELECT);
    var clones = clone.getElementsByTagName(goog.dom.TagName.SELECT);
    for (var i = 0, n = selects.length; i < n; i++) {
      var selectsOptions = selects[i].getElementsByTagName(
          goog.dom.TagName.OPTION);
      var clonesOptions = clones[i].getElementsByTagName(
          goog.dom.TagName.OPTION);
      for (var j = 0, m = selectsOptions.length; j < m; j++) {
        clonesOptions[j].selected = selectsOptions[j].selected;
      }
    }

    // IE and some versions of Firefox (1.5 - 1.5.07?) fail to clone the value
    // attribute for <input type="file"> nodes, which results in an empty
    // upload if the clone is submitted.  Check, and if the clone failed, submit
    // using the original form instead.
    var inputs = this.form_.getElementsByTagName(goog.dom.TagName.INPUT);
    var inputClones = clone.getElementsByTagName(goog.dom.TagName.INPUT);
    for (var i = 0, n = inputs.length; i < n; i++) {
      if (inputs[i].type == goog.dom.InputType.FILE) {
        if (inputs[i].value != inputClones[i].value) {
          goog.log.fine(this.logger_,
              'File input value not cloned properly.  Will ' +
              'submit using original form.');
          this.form_.target = innerFrameName;
          clone = this.form_;
          break;
        }
      }
    }

    goog.log.fine(this.logger_, 'Submitting form');

    /** @preserveTry */
    try {
      this.errorHandled_ = false;
      clone.submit();
      doc.close();

      if (goog.userAgent.GECKO) {
        // This tests if firefox silently fails, this can happen, for example,
        // when the server resets the connection because of a large file upload
        this.firefoxSilentErrorTimeout_ =
            goog.Timer.callOnce(this.testForFirefoxSilentError_, 250, this);
      }

    } catch (e) {
      // If submit threw an exception then it probably means the page that the
      // code is running on the local file system and the form's action was
      // pointing to a file that doesn't exist, causing the browser to fire an
      // exception.

      goog.log.error(this.logger_,
          'Error when submitting form: ' + goog.debug.exposeException(e));

      if (!this.ignoreResponse_) {
        goog.events.unlisten(doc.getElementById(innerFrameName),
            goog.events.EventType.LOAD, this.onIframeLoaded_, false, this);
      }

      doc.close();

      this.handleError_(goog.net.ErrorCode.FILE_NOT_FOUND);
    }
  }
};


/**
 * @param {string} innerFrameName
 * @return {!goog.html.SafeHtml}
 * @private
 */
goog.net.IframeIo.createIframeHtml_ = function(innerFrameName) {
  var innerFrameNameEscaped = goog.string.htmlEscape(innerFrameName);
  return goog.html.uncheckedconversions
      .safeHtmlFromStringKnownToSatisfyTypeContract(
          goog.string.Const.from(
              'Short HTML snippet, input escaped, for performance'),
          '<body><iframe id="' + innerFrameNameEscaped +
          '" name="' + innerFrameNameEscaped + '"></iframe>');
};


/**
 * @param {string} innerFrameName
 * @return {!goog.html.SafeHtml}
 * @private
 */
goog.net.IframeIo.createIframeHtmlWithBaseUri_ = function(innerFrameName) {
  var innerFrameNameEscaped = goog.string.htmlEscape(innerFrameName);
  return goog.html.uncheckedconversions
      .safeHtmlFromStringKnownToSatisfyTypeContract(
          goog.string.Const.from(
              'Short HTML snippet, input escaped, safe URL, for performance'),
          '<head><base href="' +
          goog.string.htmlEscape(/** @type {string} */ (document.baseURI)) +
          '"></head>' +
          '<body><iframe id="' + innerFrameNameEscaped +
          '" name="' + innerFrameNameEscaped + '"></iframe>');
};


/**
 * Handles the load event of the iframe for IE, determines if the request was
 * successful or not, handles clean up and dispatching of appropriate events.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.net.IframeIo.prototype.onIeReadyStateChange_ = function(e) {
  if (this.iframe_.readyState == 'complete') {
    goog.events.unlisten(this.iframe_, goog.events.EventType.READYSTATECHANGE,
        this.onIeReadyStateChange_, false, this);
    var doc;
    /** @preserveTry */
    try {
      doc = goog.dom.getFrameContentDocument(this.iframe_);

      // IE serves about:blank when it cannot load the resource while offline.
      if (goog.userAgent.IE && doc.location == 'about:blank' &&
          !navigator.onLine) {
        this.handleError_(goog.net.ErrorCode.OFFLINE);
        return;
      }
    } catch (ex) {
      this.handleError_(goog.net.ErrorCode.ACCESS_DENIED);
      return;
    }
    this.handleLoad_(/** @type {!HTMLDocument} */(doc));
  }
};


/**
 * Handles the load event of the iframe for non-IE browsers.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.net.IframeIo.prototype.onIframeLoaded_ = function(e) {
  // In Opera, the default "about:blank" page of iframes fires an onload
  // event that we'd like to ignore.
  if (goog.userAgent.OPERA &&
      this.getContentDocument_().location == 'about:blank') {
    return;
  }
  goog.events.unlisten(this.getRequestIframe(),
      goog.events.EventType.LOAD, this.onIframeLoaded_, false, this);
  try {
    this.handleLoad_(this.getContentDocument_());
  } catch (ex) {
    this.handleError_(goog.net.ErrorCode.ACCESS_DENIED);
  }
};


/**
 * Handles generic post-load
 * @param {HTMLDocument} contentDocument The frame's document.
 * @private
 */
goog.net.IframeIo.prototype.handleLoad_ = function(contentDocument) {
  goog.log.fine(this.logger_, 'Iframe loaded');

  this.complete_ = true;
  this.active_ = false;

  var errorCode;

  // Try to get the innerHTML.  If this fails then it can be an access denied
  // error or the document may just not have a body, typical case is if there
  // is an IE's default 404.
  /** @preserveTry */
  try {
    var body = contentDocument.body;
    this.lastContent_ = body.textContent || body.innerText;
    this.lastContentHtml_ = body.innerHTML;
  } catch (ex) {
    errorCode = goog.net.ErrorCode.ACCESS_DENIED;
  }

  // Use a callback function, defined by the application, to analyse the
  // contentDocument and determine if it is an error page.  Applications
  // may send down markers in the document, define JS vars, or some other test.
  var customError;
  if (!errorCode && typeof this.errorChecker_ == 'function') {
    customError = this.errorChecker_(contentDocument);
    if (customError) {
      errorCode = goog.net.ErrorCode.CUSTOM_ERROR;
    }
  }

  goog.log.log(this.logger_, goog.log.Level.FINER,
      'Last content: ' + this.lastContent_);
  goog.log.log(this.logger_, goog.log.Level.FINER,
      'Last uri: ' + this.lastUri_);

  if (errorCode) {
    goog.log.fine(this.logger_, 'Load event occurred but failed');
    this.handleError_(errorCode, customError);

  } else {
    goog.log.fine(this.logger_, 'Load succeeded');
    this.success_ = true;
    this.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR;
    this.dispatchEvent(goog.net.EventType.COMPLETE);
    this.dispatchEvent(goog.net.EventType.SUCCESS);

    this.makeReady_();
  }
};


/**
 * Handles errors.
 * @param {goog.net.ErrorCode} errorCode Error code.
 * @param {Object=} opt_customError If error is CUSTOM_ERROR, this is the
 *     client-provided custom error.
 * @private
 */
goog.net.IframeIo.prototype.handleError_ = function(errorCode,
                                                    opt_customError) {
  if (!this.errorHandled_) {
    this.success_ = false;
    this.active_ = false;
    this.complete_ = true;
    this.lastErrorCode_ = errorCode;
    if (errorCode == goog.net.ErrorCode.CUSTOM_ERROR) {
      goog.asserts.assert(goog.isDef(opt_customError));
      this.lastCustomError_ = opt_customError;
    }
    this.dispatchEvent(goog.net.EventType.COMPLETE);
    this.dispatchEvent(goog.net.EventType.ERROR);

    this.makeReady_();

    this.errorHandled_ = true;
  }
};


/**
 * Dispatches an event indicating that the IframeIo instance has received a data
 * packet via incremental loading.  The event object has a 'data' member.
 * @param {Object} data Data.
 * @private
 */
goog.net.IframeIo.prototype.handleIncrementalData_ = function(data) {
  this.dispatchEvent(new goog.net.IframeIo.IncrementalDataEvent(data));
};


/**
 * Finalizes the request, schedules the iframe for disposal, and maybe disposes
 * the form.
 * @private
 */
goog.net.IframeIo.prototype.makeReady_ = function() {
  goog.log.info(this.logger_, 'Ready for new requests');
  this.scheduleIframeDisposal_();
  this.disposeForm_();
  this.dispatchEvent(goog.net.EventType.READY);
};


/**
 * Creates an iframe to be used with a request.  We use a new iframe for each
 * request so that requests don't create history entries.
 * @private
 */
goog.net.IframeIo.prototype.createIframe_ = function() {
  goog.log.fine(this.logger_, 'Creating iframe');

  this.iframeName_ = this.name_ + '_' + (this.nextIframeId_++).toString(36);

  var iframeAttributes = {'name': this.iframeName_, 'id': this.iframeName_};
  // Setting the source to javascript:"" is a fix to remove IE6 mixed content
  // warnings when being used in an https page.
  if (goog.userAgent.IE && goog.userAgent.VERSION < 7) {
    iframeAttributes.src = 'javascript:""';
  }

  this.iframe_ = /** @type {!HTMLIFrameElement} */(
      goog.dom.getDomHelper(this.form_).createDom(
          goog.dom.TagName.IFRAME, iframeAttributes));

  var s = this.iframe_.style;
  s.visibility = 'hidden';
  s.width = s.height = '10px';
  // Chrome sometimes shows scrollbars when visibility is hidden, but not when
  // display is none.
  s.display = 'none';

  // There are reports that safari 2.0.3 has a bug where absolutely positioned
  // iframes can't have their src set.
  if (!goog.userAgent.WEBKIT) {
    s.position = 'absolute';
    s.top = s.left = '-10px';
  } else {
    s.marginTop = s.marginLeft = '-10px';
  }
};


/**
 * Appends the Iframe to the document body.
 * @private
 */
goog.net.IframeIo.prototype.appendIframe_ = function() {
  goog.dom.getDomHelper(this.form_).getDocument().body.appendChild(
      this.iframe_);
};


/**
 * Schedules an iframe for disposal, async.  We can't remove the iframes in the
 * same execution context as the response, otherwise some versions of Firefox
 * will not detect that the response has correctly finished and the loading bar
 * will stay active forever.
 * @private
 */
goog.net.IframeIo.prototype.scheduleIframeDisposal_ = function() {
  var iframe = this.iframe_;

  // There shouldn't be a case where the iframe is null and we get to this
  // stage, but the error reports in http://b/909448 indicate it is possible.
  if (iframe) {
    // NOTE(user): Stops Internet Explorer leaking the iframe object. This
    // shouldn't be needed, since the events have all been removed, which
    // should in theory clean up references.  Oh well...
    iframe.onreadystatechange = null;
    iframe.onload = null;
    iframe.onerror = null;

    this.iframesForDisposal_.push(iframe);
  }

  if (this.iframeDisposalTimer_) {
    goog.Timer.clear(this.iframeDisposalTimer_);
    this.iframeDisposalTimer_ = null;
  }

  if (goog.userAgent.GECKO || goog.userAgent.OPERA) {
    // For FF and Opera, we must dispose the iframe async,
    // but it doesn't need to be done as soon as possible.
    // We therefore schedule it for 2s out, so as not to
    // affect any other actions that may have been triggered by the request.
    this.iframeDisposalTimer_ = goog.Timer.callOnce(
        this.disposeIframes_, goog.net.IframeIo.IFRAME_DISPOSE_DELAY_MS, this);

  } else {
    // For non-Gecko browsers we dispose straight away.
    this.disposeIframes_();
  }

  // Nullify reference
  this.iframe_ = null;
  this.iframeName_ = null;
};


/**
 * Disposes any iframes.
 * @private
 */
goog.net.IframeIo.prototype.disposeIframes_ = function() {
  if (this.iframeDisposalTimer_) {
    // Clear the timer
    goog.Timer.clear(this.iframeDisposalTimer_);
    this.iframeDisposalTimer_ = null;
  }

  while (this.iframesForDisposal_.length != 0) {
    var iframe = this.iframesForDisposal_.pop();
    goog.log.info(this.logger_, 'Disposing iframe');
    goog.dom.removeNode(iframe);
  }
};


/**
 * Removes all the child nodes from the static form so it can be reused again.
 * This should happen right after sending a request. Otherwise, there can be
 * issues when another iframe uses this form right after the first iframe.
 * @private
 */
goog.net.IframeIo.prototype.clearForm_ = function() {
  if (this.form_ && this.form_ == goog.net.IframeIo.form_) {
    goog.dom.removeChildren(this.form_);
  }
};


/**
 * Disposes of the Form.  Since IE6 leaks form nodes, this just cleans up the
 * DOM and nullifies the instances reference so the form can be used for another
 * request.
 * @private
 */
goog.net.IframeIo.prototype.disposeForm_ = function() {
  this.clearForm_();
  this.form_ = null;
};


/**
 * @return {HTMLDocument} The appropriate content document.
 * @private
 */
goog.net.IframeIo.prototype.getContentDocument_ = function() {
  if (this.iframe_) {
    return /** @type {!HTMLDocument} */(goog.dom.getFrameContentDocument(
        this.getRequestIframe()));
  }
  return null;
};


/**
 * @return {HTMLIFrameElement} The appropriate iframe to use for requests
 *     (created in sendForm_).
 */
goog.net.IframeIo.prototype.getRequestIframe = function() {
  if (this.iframe_) {
    return /** @type {HTMLIFrameElement} */(
        goog.net.IframeIo.useIeReadyStateCodePath_() ?
            this.iframe_ :
            goog.dom.getFrameContentDocument(this.iframe_).getElementById(
                this.iframeName_ + goog.net.IframeIo.INNER_FRAME_SUFFIX));
  }
  return null;
};


/**
 * Tests for a silent failure by firefox that can occur when the connection is
 * reset by the server or is made to an illegal URL.
 * @private
 */
goog.net.IframeIo.prototype.testForFirefoxSilentError_ = function() {
  if (this.active_) {
    var doc = this.getContentDocument_();

    // This is a hack to test of the document has loaded with a page that
    // we can't access, such as a network error, that won't report onload
    // or onerror events.
    if (doc && !goog.reflect.canAccessProperty(doc, 'documentUri')) {
      if (!this.ignoreResponse_) {
        goog.events.unlisten(this.getRequestIframe(),
            goog.events.EventType.LOAD, this.onIframeLoaded_, false, this);
      }

      if (navigator.onLine) {
        goog.log.warning(this.logger_, 'Silent Firefox error detected');
        this.handleError_(goog.net.ErrorCode.FF_SILENT_ERROR);
      } else {
        goog.log.warning(this.logger_,
            'Firefox is offline so report offline error ' +
            'instead of silent error');
        this.handleError_(goog.net.ErrorCode.OFFLINE);
      }
      return;
    }
    this.firefoxSilentErrorTimeout_ =
        goog.Timer.callOnce(this.testForFirefoxSilentError_, 250, this);
  }
};



/**
 * Class for representing incremental data events.
 * @param {Object} data The data associated with the event.
 * @extends {goog.events.Event}
 * @constructor
 * @final
 */
goog.net.IframeIo.IncrementalDataEvent = function(data) {
  goog.events.Event.call(this, goog.net.EventType.INCREMENTAL_DATA);

  /**
   * The data associated with the event.
   * @type {Object}
   */
  this.data = data;
};
goog.inherits(goog.net.IframeIo.IncrementalDataEvent, goog.events.Event);
