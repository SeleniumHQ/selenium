// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2006 Google Inc. All Rights Reserved.

/**
 * @fileoverview Cross domain RPC library using the <a
 * href="http://go/xd2_design" target="_top">XD2 approach</a>.
 *
 * <h5>Protocol</h5>
 * Client sends a request across domain via a form submission.  Server
 * receives these parameters: "xdpe:request-id", "xdpe:dummy-uri" ("xdpe" for
 * "cross domain parameter to echo back") and other user parameters prefixed
 * with "xdp" (for "cross domain parameter").  Headers are passed as parameters
 * prefixed with "xdh" (for "cross domain header").  Only strings are supported
 * for parameters and headers.  A GET method is mapped to a form GET.  All
 * other methods are mapped to a POST.  Server is expected to produce a
 * HTML response such as the following:
 * <pre>
 * &lt;body&gt;
 * &lt;script type="text/javascript"
 *     src="path-to-crossdomainrpc.js"&gt;&lt;/script&gt;
 * var currentDirectory = location.href.substring(
 *     0, location.href.lastIndexOf('/')
 * );
 *
 * // echo all parameters prefixed with "xdpe:"
 * var echo = {};
 * echo[goog.net.CrossDomainRpc.PARAM_ECHO_REQUEST_ID] =
 *     &lt;value of parameter "xdpe:request-id"&gt;;
 * echo[goog.net.CrossDomainRpc.PARAM_ECHO_DUMMY_URI] =
 *     &lt;value of parameter "xdpe:dummy-uri"&gt;;
 *
 * goog.net.CrossDomainRpc.sendResponse(
 *     '({"result":"&lt;responseInJSON"})',
 *     true,    // is JSON
 *     echo,    // parameters to echo back
 *     status,  // response status code
 *     headers  // response headers
 * );
 * &lt;/script&gt;
 * &lt;/body&gt;
 * </pre>
 *
 * <h5>Server Side</h5>
 * For an example of the server side, refer to the following files:
 * <ul>
 * <li>http://go/xdservletfilter.java</li>
 * <li>http://go/xdservletrequest.java</li>
 * <li>http://go/xdservletresponse.java</li>
 * </ul>
 *
 * <h5>System Requirements</h5>
 * Tested on IE6, IE7, Firefox 2.0 and Safari nightly r23841.
 *
 */

goog.provide('goog.net.CrossDomainRpc');

goog.require('goog.Uri.QueryData');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.json');
goog.require('goog.net.EventType');
goog.require('goog.userAgent');


/**
 * Creates a new instance of cross domain RPC
 * @extends {goog.events.EventTarget}
 * @constructor
 */
goog.net.CrossDomainRpc = function() {
  goog.events.EventTarget.call(this);
};
goog.inherits(goog.net.CrossDomainRpc, goog.events.EventTarget);


/**
 * Cross-domain response iframe marker.
 * @type {string}
 * @private
 */
goog.net.CrossDomainRpc.RESPONSE_MARKER_ = 'xdrp';


/**
 * Use a fallback dummy resource if none specified or detected.
 * @type {boolean}
 * @private
 */
goog.net.CrossDomainRpc.useFallBackDummyResource_ = true;


/**
 * Checks to see if we are executing inside a response iframe.  This is the
 * case when this page is used as a dummy resource to gain caller's domain.
 * @return {*} True if we are executing inside a response iframe; false
 *     otherwise.
 * @private
 */
goog.net.CrossDomainRpc.isInResponseIframe_ = function() {
  return window.location && (window.location.hash.indexOf(
      goog.net.CrossDomainRpc.RESPONSE_MARKER_) == 1 ||
      window.location.search.indexOf(
          goog.net.CrossDomainRpc.RESPONSE_MARKER_) == 1);
};


/**
 * Stops execution of the rest of the page if this page is loaded inside a
 *    response iframe.
 */
if (goog.net.CrossDomainRpc.isInResponseIframe_()) {
  if (goog.userAgent.IE) {
    document.execCommand('Stop');
  } else if (goog.userAgent.GECKO) {
    window.stop();
  } else {
    throw Error('stopped');
  }
}


/**
 * Sets the URI for a dummy resource on caller's domain.  This function is
 * used for specifying a particular resource to use rather than relying on
 * auto detection.
 * @param {string} dummyResourceUri URI to dummy resource on the same domain
 *    of caller's page.
 */
goog.net.CrossDomainRpc.setDummyResourceUri = function(dummyResourceUri) {
  goog.net.CrossDomainRpc.dummyResourceUri_ = dummyResourceUri;
};


/**
 * Sets whether a fallback dummy resource ("/robots.txt" on Firefox and Safari
 * and current page on IE) should be used when a suitable dummy resource is
 * not available.
 * @param {boolean} useFallBack Whether to use fallback or not.
 */
goog.net.CrossDomainRpc.setUseFallBackDummyResource = function(useFallBack) {
  goog.net.CrossDomainRpc.useFallBackDummyResource_ = useFallBack;
};


/**
 * Sends a request across domain.
 * @param {string} uri Uri to make request to.
 * @param {Function} opt_continuation Continuation function to be called
 *     when request is completed.  Takes one argument of an event object
 *     whose target has the following properties: "status" is the HTTP
 *     response status code, "responseText" is the response text,
 *     and "headers" is an object with all response headers.  The event
 *     target's getResponseJson() method returns a JavaScript object evaluated
 *     from the JSON response or undefined if response is not JSON.
 * @param {string} opt_method Method of request. Default is POST.
 * @param {Object} opt_params Parameters. Each property is turned into a
 *     request parameter.
 * @param {Object} opt_headers Map of headers of the request.
 */
goog.net.CrossDomainRpc.send =
    function(uri, opt_continuation, opt_method, opt_params, opt_headers) {
  var xdrpc = new goog.net.CrossDomainRpc();
  if (opt_continuation) {
    goog.events.listen(xdrpc, goog.net.EventType.COMPLETE, opt_continuation);
  }
  goog.events.listen(xdrpc, goog.net.EventType.READY, xdrpc.reset);
  xdrpc.sendRequest(uri, opt_method, opt_params, opt_headers);
};


/**
 * Sets debug mode to true or false.  When debug mode is on, response iframes
 * are visible and left behind after their use is finished.
 * @param {boolean} flag Flag to indicate intention to turn debug model on
 *     (true) or off (false).
 */
goog.net.CrossDomainRpc.setDebugMode = function(flag) {
  goog.net.CrossDomainRpc.debugMode_ = flag;
};


/**
 * Logger for goog.net.CrossDomainRpc
 * @type {goog.debug.Logger}
 * @private
 */
goog.net.CrossDomainRpc.logger_ =
    goog.debug.Logger.getLogger('goog.net.CrossDomainRpc');


/**
 * Creates the HTML of an input element
 * @param {string} name Name of input element.
 * @param {Object} value Value of input element.
 * @return {string} HTML of input element with that name and value.
 * @private
 */
goog.net.CrossDomainRpc.createInputHtml_ = function(name, value) {
  return '<textarea name="' + name + '">' +
      goog.net.CrossDomainRpc.escapeAmpersand_(value) + '</textarea>';
};


/**
 * Escapes ampersand so that XML/HTML entities are submitted as is because
 * browser unescapes them when they are put into a text area.
 * @param {Object} value Value to escape.
 * @return {Object} Value with ampersand escaped, if value is a string;
 *     otherwise the value itself is returned.
 * @private
 */
goog.net.CrossDomainRpc.escapeAmpersand_ = function(value) {
  return value && (goog.isString(value) || value.constructor == String) ?
      value.replace(/&/g, '&amp;') : value;
};


/**
 * Finds a dummy resource that can be used by response to gain domain of
 * requester's page.
 * @return {string} URI of the resource to use.
 * @private
 */
goog.net.CrossDomainRpc.getDummyResourceUri_ = function() {
  if (goog.net.CrossDomainRpc.dummyResourceUri_) {
    return goog.net.CrossDomainRpc.dummyResourceUri_;
  }

  // find a style sheet if not on IE, which will attempt to save style sheet
  if (goog.userAgent.GECKO) {
    var links = document.getElementsByTagName('link');
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      // find a link which is on the same domain as this page
      // cannot use one with '?' or '#' in its URL as it will confuse
      // goog.net.CrossDomainRpc.getFramePayload_()
      if (link.rel == 'stylesheet' &&
          goog.Uri.haveSameDomain(link.href, window.location.href) &&
          link.href.indexOf('?') < 0) {
        return goog.net.CrossDomainRpc.removeHash_(link.href);
      }
    }
  }

  var images = document.getElementsByTagName('img');
  for (var i = 0; i < images.length; i++) {
    var image = images[i];
    // find a link which is on the same domain as this page
    // cannot use one with '?' or '#' in its URL as it will confuse
    // goog.net.CrossDomainRpc.getFramePayload_()
    if (goog.Uri.haveSameDomain(image.src, window.location.href) &&
        image.src.indexOf('?') < 0) {
      return goog.net.CrossDomainRpc.removeHash_(image.src);
    }
  }

  if (!goog.net.CrossDomainRpc.useFallBackDummyResource_) {
    throw Error(
        'No suitable dummy resource specified or detected for this page');
  }

  if (goog.userAgent.IE) {
    // use this page as the dummy resource; remove hash from URL if any
    return goog.net.CrossDomainRpc.removeHash_(window.location.href);
  } else {
    /**
     * Try to use "http://<this-domain>/robots.txt" which may exist.  Even if
     * it does not, an error page is returned and is a good dummy resource to
     * use on Firefox and Safari.  An existing resource is faster because it
     * is cached.
     */
    var locationHref = window.location.href;
    var rootSlash = locationHref.indexOf('/', locationHref.indexOf('//') + 2);
    var rootHref = locationHref.substring(0, rootSlash);
    return rootHref + '/robots.txt';
  }
};


/**
 * Removes everything at and after hash from URI
 * @param {string} uri Uri to to remove hash.
 * @return {string} Uri with its hash and all characters after removed.
 * @private
 */
goog.net.CrossDomainRpc.removeHash_ = function(uri) {
  return uri.split('#')[0];
};


// ------------
// request side


/**
 * next request id used to support multiple XD requests at the same time
 * @type {number}
 * @private
 */
goog.net.CrossDomainRpc.nextRequestId_ = 0;


/**
 * Header prefix.
 * @type {string}
 */
goog.net.CrossDomainRpc.HEADER = 'xdh:';


/**
 * Parameter prefix.
 * @type {string}
 */
goog.net.CrossDomainRpc.PARAM = 'xdp:';


/**
 * Parameter to echo prefix.
 * @type {string}
 */
goog.net.CrossDomainRpc.PARAM_ECHO = 'xdpe:';


/**
 * Parameter to echo: request id
 * @type {string}
 */
goog.net.CrossDomainRpc.PARAM_ECHO_REQUEST_ID =
    goog.net.CrossDomainRpc.PARAM_ECHO + 'request-id';


/**
 * Parameter to echo: dummy resource URI
 * @type {string}
 */
goog.net.CrossDomainRpc.PARAM_ECHO_DUMMY_URI =
    goog.net.CrossDomainRpc.PARAM_ECHO + 'dummy-uri';


/**
 * Cross-domain request marker.
 * @type {string}
 * @private
 */
goog.net.CrossDomainRpc.REQUEST_MARKER_ = 'xdrq';


/**
 * Sends a request across domain.
 * @param {string} uri Uri to make request to.
 * @param {string} opt_method Method of request. Default is POST.
 * @param {Object} opt_params Parameters. Each property is turned into a
 *     request parameter.
 * @param {Object} opt_headers Map of headers of the request.
 */
goog.net.CrossDomainRpc.prototype.sendRequest =
    function(uri, opt_method, opt_params, opt_headers) {
  // create request frame
  var requestFrame = this.requestFrame_ = document.createElement('iframe');
  var requestId = goog.net.CrossDomainRpc.nextRequestId_++;
  requestFrame.id = goog.net.CrossDomainRpc.REQUEST_MARKER_ + '-' + requestId;
  if (!goog.net.CrossDomainRpc.debugMode_) {
    requestFrame.style.position = 'absolute';
    requestFrame.style.top = '-5000px';
    requestFrame.style.left = '-5000px';
  }
  document.body.appendChild(requestFrame);

  // build inputs
  var inputs = [];

  // add request id
  inputs.push(goog.net.CrossDomainRpc.createInputHtml_(
      goog.net.CrossDomainRpc.PARAM_ECHO_REQUEST_ID, requestId));

  // add dummy resource uri
  var dummyUri = goog.net.CrossDomainRpc.getDummyResourceUri_();
  goog.net.CrossDomainRpc.logger_.log(
      goog.debug.Logger.Level.FINE, 'dummyUri: ' + dummyUri);
  inputs.push(goog.net.CrossDomainRpc.createInputHtml_(
      goog.net.CrossDomainRpc.PARAM_ECHO_DUMMY_URI, dummyUri));

  // add parameters
  if (opt_params) {
    for (var name in opt_params) {
      var value = opt_params[name];
      inputs.push(goog.net.CrossDomainRpc.createInputHtml_(
          goog.net.CrossDomainRpc.PARAM + name, value));
    }
  }

  // add headers
  if (opt_headers) {
    for (var name in opt_headers) {
      var value = opt_headers[name];
      inputs.push(goog.net.CrossDomainRpc.createInputHtml_(
          goog.net.CrossDomainRpc.HEADER + name, value));
    }
  }

  var requestFrameContent = '<body><form method="' +
      (opt_method == 'GET' ? 'GET' : 'POST') + '" action="' +
      uri + '">' + inputs.join('') + '</form></body>';
  var requestFrameDoc = goog.dom.getFrameContentDocument(requestFrame);
  requestFrameDoc.open();
  requestFrameDoc.write(requestFrameContent);
  requestFrameDoc.close();

  requestFrameDoc.forms[0].submit();
  requestFrameDoc = null;

  this.loadListenerKey_ = goog.events.listen(requestFrame,
      goog.events.EventType.LOAD, function() {
        goog.net.CrossDomainRpc.logger_.log(goog.debug.Logger.Level.FINE,
            'response ready');
        this.responseReady_ = true;
      }, false, this
  );

  this.receiveResponse_();
};


/**
 * period of response polling (ms)
 * @type {number}
 * @private
 */
goog.net.CrossDomainRpc.RESPONSE_POLLING_PERIOD_ = 50;


/**
 * timeout from response comes back to sendResponse is called (ms)
 * @type {number}
 * @private
 */
goog.net.CrossDomainRpc.SEND_RESPONSE_TIME_OUT_ = 500;


/**
 * Receives response by polling to check readiness of response and then
 *     reads response frames and assembles response data
 * @private
 */
goog.net.CrossDomainRpc.prototype.receiveResponse_ = function() {
  this.timeWaitedAfterResponseReady_ = 0;
  var responseDetectorHandle = window.setInterval(goog.bind(function() {
    this.detectResponse_(responseDetectorHandle);
  }, this), goog.net.CrossDomainRpc.RESPONSE_POLLING_PERIOD_);
};


/**
 * Detects response inside request frame
 * @param {number} responseDetectorHandle Handle of detector.
 * @private
 */
goog.net.CrossDomainRpc.prototype.detectResponse_ =
    function(responseDetectorHandle) {
  var requestFrameWindow = this.requestFrame_.contentWindow;
  var grandChildrenLength = requestFrameWindow.frames.length;
  var responseInfoFrame = null;
  if (grandChildrenLength > 0 &&
      goog.net.CrossDomainRpc.isResponseInfoFrame_(responseInfoFrame =
      requestFrameWindow.frames[grandChildrenLength - 1])) {
    goog.net.CrossDomainRpc.logger_.log(goog.debug.Logger.Level.FINE,
        'xd response ready');

    var responseInfoPayload = goog.net.CrossDomainRpc.getFramePayload_(
        responseInfoFrame).substring(1);
    var params = new goog.Uri.QueryData(responseInfoPayload);

    var chunks = [];
    var numChunks = Number(params.get('n'));
    goog.net.CrossDomainRpc.logger_.log(goog.debug.Logger.Level.FINE,
        'xd response number of chunks: ' + numChunks);
    for (var i = 0; i < numChunks; i++) {
      var responseFrame = requestFrameWindow.frames[i];
      if (!responseFrame || !responseFrame.location ||
          !responseFrame.location.href) {
        // On Safari 3.0, it is sometimes the case that the
        // iframe exists but doesn't have a same domain href yet.
        goog.net.CrossDomainRpc.logger_.log(goog.debug.Logger.Level.FINE,
            'xd response iframe not ready');
        return;
      }
      var responseChunkPayload =
          goog.net.CrossDomainRpc.getFramePayload_(responseFrame);
      // go past "chunk="
      var chunkIndex = responseChunkPayload.indexOf(
          goog.net.CrossDomainRpc.PARAM_CHUNK_) +
          goog.net.CrossDomainRpc.PARAM_CHUNK_.length + 1;
      var chunk = responseChunkPayload.substring(chunkIndex);
      chunks.push(chunk);
    }

    window.clearInterval(responseDetectorHandle);

    var responseData = chunks.join('');
    // Payload is not encoded to begin with on IE. Decode in other cases only.
    if (!goog.userAgent.IE) {
      responseData = decodeURIComponent(responseData);
    }

    this.status = Number(params.get('status'));
    this.responseText = responseData;
    this.responseTextIsJson_ = params.get('isDataJson') == 'true';
    this.responseHeaders = goog.json.unsafeParse(
        /** @type {string} */ (params.get('headers')));

    this.dispatchEvent(goog.net.EventType.READY);
    this.dispatchEvent(goog.net.EventType.COMPLETE);
  } else {
    if (this.responseReady_) {
      /* The response has come back. But the first response iframe has not
       * been created yet. If this lasts long enough, it is an error.
       */
      this.timeWaitedAfterResponseReady_ +=
          goog.net.CrossDomainRpc.RESPONSE_POLLING_PERIOD_;
      if (this.timeWaitedAfterResponseReady_ >
          goog.net.CrossDomainRpc.SEND_RESPONSE_TIME_OUT_) {
        goog.net.CrossDomainRpc.logger_.log(goog.debug.Logger.Level.FINE,
            'xd response timed out');
        window.clearInterval(responseDetectorHandle);

        this.status = 500;
        this.responseText = 'response timed out';
        this.dispatchEvent(goog.net.EventType.READY);
        this.dispatchEvent(goog.net.EventType.ERROR);
        this.dispatchEvent(goog.net.EventType.COMPLETE);
      }
    }
  }
};


/**
 * Checks whether a frame is response info frame.
 * @param {Object} frame Frame to check.
 * @return {boolean} True if frame is a response info frame; false otherwise.
 * @private
 */
goog.net.CrossDomainRpc.isResponseInfoFrame_ = function(frame) {
  /** @preserveTry */
  try {
    return goog.net.CrossDomainRpc.getFramePayload_(frame).indexOf(
        goog.net.CrossDomainRpc.RESPONSE_INFO_MARKER_) == 1;
  } catch (e) {
    // frame not ready for same-domain access yet
    return false;
  }
};


/**
 * Returns the payload of a frame (value after # or ? on the URL).  This value
 * is URL encoded except IE, where the value is not encoded to begin with.
 * @param {Object} frame Frame.
 * @return {string} Payload of that frame.
 * @private
 */
goog.net.CrossDomainRpc.getFramePayload_ = function(frame) {
  var href = frame.location.href;
  var question = href.indexOf('?');
  var hash = href.indexOf('#');
  // On IE, beucase the URL is not encoded, we can have a case where ?
  // is the delimiter before payload and # in payload or # as the delimiter
  // and ? in payload.  So here we treat whoever is the first as the delimiter.
  var delimiter = question < 0 ? hash :
      hash < 0 ? question : Math.min(question, hash);
  return href.substring(delimiter);
};


/**
 * If response is JSON, evaluates it to a JavaScript object and
 * returns it; otherwise returns undefined.
 * @return {Object|undefined} JavaScript object if response is in JSON
 *     or undefined.
 */
goog.net.CrossDomainRpc.prototype.getResponseJson = function() {
  return this.responseTextIsJson_ ?
      goog.json.unsafeParse(this.responseText) : undefined;
};


/**
 * @return {boolean} Whether the request completed with a success.
 */
goog.net.CrossDomainRpc.prototype.isSuccess = function() {
  // Definition similar to goog.net.XhrIo.prototype.isSuccess.
  switch (this.status) {
    case 200:       // Http Success
    case 304:       // Http Cache
      return true;

    default:
      return false;
  }
};


/**
 * Removes request iframe used.
 */
goog.net.CrossDomainRpc.prototype.reset = function() {
  if (!goog.net.CrossDomainRpc.debugMode_) {
    goog.net.CrossDomainRpc.logger_.log(goog.debug.Logger.Level.FINE,
        'request frame removed: ' + this.requestFrame_.id);
    goog.events.unlistenByKey(this.loadListenerKey_);
    this.requestFrame_.parentNode.removeChild(this.requestFrame_);
  }
  delete this.requestFrame_;
};


// -------------
// response side


/**
 * Name of response info iframe.
 * @type {string}
 * @private
 */
goog.net.CrossDomainRpc.RESPONSE_INFO_MARKER_ =
    goog.net.CrossDomainRpc.RESPONSE_MARKER_ + '-info';


/**
 * Maximal chunk size.  IE can only handle 4095 bytes on its URL.
 * 16MB has been tested on Firefox.  But 1MB is a practical size.
 * @type {number}
 * @private
 */
goog.net.CrossDomainRpc.MAX_CHUNK_SIZE_ =
    goog.userAgent.IE ? 4095 : 1024 * 1024;


/**
 * Query parameter 'chunk'.
 * @type {string}
 * @private
 */
goog.net.CrossDomainRpc.PARAM_CHUNK_ = 'chunk';


/**
 * Prefix before data chunk for passing other parameters.
 * type String
 * @private
 */
goog.net.CrossDomainRpc.CHUNK_PREFIX_ =
    goog.net.CrossDomainRpc.RESPONSE_MARKER_ + '=1&' +
    goog.net.CrossDomainRpc.PARAM_CHUNK_ + '=';


/**
 * Makes response available for grandparent (requester)'s receiveResponse
 * call to pick up by creating a series of iframes pointed to the dummy URI
 * with a payload (value after either ? or #) carrying a chunk of response
 * data and a response info iframe that tells the grandparent (requester) the
 * readiness of response.
 * @param {string} data Response data (string or JSON string).
 * @param {boolean} isDataJson true if data is a JSON string; false if just a
 *     string.
 * @param {Object} echo Parameters to echo back
 *     "xdpe:request-id": Server that produces the response needs to
 *     copy it here to support multiple current XD requests on the same page.
 *     "xdpe:dummy-uri": URI to a dummy resource that response
 *     iframes point to to gain the domain of the client.  This can be an
 *     image (IE) or a CSS file (FF) found on the requester's page.
 *     Server should copy value from request parameter "xdpe:dummy-uri".
 * @param {number} status HTTP response status code.
 * @param {string} headers Response headers in JSON format.
 */
goog.net.CrossDomainRpc.sendResponse =
    function(data, isDataJson, echo, status, headers) {
  var dummyUri = echo[goog.net.CrossDomainRpc.PARAM_ECHO_DUMMY_URI];

  // since the dummy-uri can be specified by the user, verify that it doesn't
  // use any other protocols. (Specifically we don't want users to use a
  // dummy-uri beginning with "javascript:").
  if (!goog.string.caseInsensitiveStartsWith(dummyUri, 'http://') &&
      !goog.string.caseInsensitiveStartsWith(dummyUri, 'https://')) {
    dummyUri = 'http://' + dummyUri;
  }

  // usable chunk size is max less dummy URI less chunk prefix length
  // TODO: Figure out why we need to do "- 1" below
  var chunkSize = goog.net.CrossDomainRpc.MAX_CHUNK_SIZE_ - dummyUri.length -
      1 - // payload delimiter ('#' or '?')
      goog.net.CrossDomainRpc.CHUNK_PREFIX_.length - 1;

  /*
   * Here we used to do URI encoding of data before we divide it into chunks
   * and decode on the receiving end.  We don't do this any more on IE for the
   * following reasons.
   *
   * 1) On IE, calling decodeURIComponent on a relatively large string is
   *   extremely slow (~22s for 160KB).  So even a moderate amount of data
   *   makes this library pretty much useless.  Fortunately, we can actually
   *   put unencoded data on IE's URL and get it back reliably.  So we are
   *   completely skipping encoding and decoding on IE.  When we call
   *   getFrameHash_ to get it back, the value is still intact(*) and unencoded.
   * 2) On Firefox, we have to call decodeURIComponent because location.hash
   *   does decoding by itself.  Fortunately, decodeURIComponent is not slow
   *   on Firefox.
   * 3) Safari automatically encodes everything you put on URL and it does not
   *   automatically decode when you access it via location.hash or
   *   location.href.  So we encode it here and decode it in detectResponse_().
   *
   * NOTE: IE actually does encode only space to %20 and decodes that
   *   automatically when you do location.href or location.hash.
   */
  if (!goog.userAgent.IE) {
    data = encodeURIComponent(data);
  }

  var numChunksToSend = Math.ceil(data.length / chunkSize);
  if (numChunksToSend == 0) {
    goog.net.CrossDomainRpc.createResponseInfo_(
        dummyUri, numChunksToSend, isDataJson, status, headers);
  } else {
    var numChunksSent = 0;
    function checkToCreateResponseInfo_() {
      if (++numChunksSent == numChunksToSend) {
        goog.net.CrossDomainRpc.createResponseInfo_(
            dummyUri, numChunksToSend, isDataJson, status, headers);
      }
    }

    for (var i = 0; i < numChunksToSend; i++) {
      var chunkStart = i * chunkSize;
      var chunkEnd = chunkStart + chunkSize;
      var chunk = chunkEnd > data.length ?
          data.substring(chunkStart) :
          data.substring(chunkStart, chunkEnd);

      var responseFrame = document.createElement('iframe');
      responseFrame.src = dummyUri +
          goog.net.CrossDomainRpc.getPayloadDelimiter_(dummyUri) +
          goog.net.CrossDomainRpc.CHUNK_PREFIX_ + chunk;
      document.body.appendChild(responseFrame);

      // We used to call the function below when handling load event of
      // responseFrame.  But that event does not fire on IE when current
      // page is used as the dummy resource (because its loading is stopped?).
      // It also does not fire sometimes on Firefox.  So now we call it
      // directly.
      checkToCreateResponseInfo_();
    }
  }
};


/**
 * Creates a response info iframe to indicate completion of sendResponse
 * @param {string} dummyUri URI to a dummy resource.
 * @param {number} numChunks Total number of chunks.
 * @param {boolean} isDataJson Whether response is a JSON string or just string.
 * @param {number} status HTTP response status code.
 * @param {string} headers Response headers in JSON format.
 * @private
 */
goog.net.CrossDomainRpc.createResponseInfo_ =
    function(dummyUri, numChunks, isDataJson, status, headers) {
  var responseInfoFrame = document.createElement('iframe');
  document.body.appendChild(responseInfoFrame);
  responseInfoFrame.src = dummyUri +
      goog.net.CrossDomainRpc.getPayloadDelimiter_(dummyUri) +
      goog.net.CrossDomainRpc.RESPONSE_INFO_MARKER_ +
      '=1&n=' + numChunks + '&isDataJson=' + isDataJson + '&status=' + status +
      '&headers=' + encodeURIComponent(headers);
};


/**
 * Returns payload delimiter, either "#" when caller's page is not used as
 * the dummy resource or "?" when it is, in which case caching issues prevent
 * response frames to gain the caller's domain.
 * @param {string} dummyUri URI to resource being used as dummy resource.
 * @return {string} Either "?" when caller's page is used as dummy resource or
 *     "#" if it is not.
 * @private
 */
goog.net.CrossDomainRpc.getPayloadDelimiter_ = function(dummyUri) {
  return goog.net.CrossDomainRpc.REFERRER_ == dummyUri ? '?' : '#';
};


/**
 * Removes all parameters (after ? or #) from URI.
 * @param {string} uri URI to remove parameters from.
 * @return {string} URI with all parameters removed.
 * @private
 */
goog.net.CrossDomainRpc.removeUriParams_ = function(uri) {
  // remove everything after question mark
  var question = uri.indexOf('?');
  if (question > 0) {
    uri = uri.substring(0, question);
  }

  // remove everything after hash mark
  var hash = uri.indexOf('#');
  if (hash > 0) {
    uri = uri.substring(0, hash);
  }

  return uri;
};


/**
 * Gets a response header.
 * @param {string} name Name of response header.
 * @return {string|undefined} Value of response header; undefined if not found.
 */
goog.net.CrossDomainRpc.prototype.getResponseHeader = function(name) {
  return goog.isObject(this.responseHeaders) ?
      this.responseHeaders[name] : undefined;
};


/**
 * Referrer of current document with all parameters after "?" and "#" stripped.
 * @type {string}
 * @private
 */
goog.net.CrossDomainRpc.REFERRER_ =
    goog.net.CrossDomainRpc.removeUriParams_(document.referrer);
