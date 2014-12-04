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
 * @fileoverview Offered as an alternative to XhrIo as a way for making requests
 * via XMLHttpRequest.  Instead of mirroring the XHR interface and exposing
 * events, results are used as a way to pass a "promise" of the response to
 * interested parties.
 *
 */

goog.provide('goog.labs.net.xhr');
goog.provide('goog.labs.net.xhr.Error');
goog.provide('goog.labs.net.xhr.HttpError');
goog.provide('goog.labs.net.xhr.Options');
goog.provide('goog.labs.net.xhr.PostData');
goog.provide('goog.labs.net.xhr.ResponseType');
goog.provide('goog.labs.net.xhr.TimeoutError');

goog.require('goog.Promise');
goog.require('goog.debug.Error');
goog.require('goog.json');
goog.require('goog.net.HttpStatus');
goog.require('goog.net.XmlHttp');
goog.require('goog.string');
goog.require('goog.uri.utils');
goog.require('goog.userAgent');



goog.scope(function() {
var xhr = goog.labs.net.xhr;
var HttpStatus = goog.net.HttpStatus;


/**
 * Configuration options for an XMLHttpRequest.
 * - headers: map of header key/value pairs.
 * - timeoutMs: number of milliseconds after which the request will be timed
 *      out by the client. Default is to allow the browser to handle timeouts.
 * - withCredentials: whether user credentials are to be included in a
 *      cross-origin request. See:
 *      http://www.w3.org/TR/XMLHttpRequest/#the-withcredentials-attribute
 * - mimeType: allows the caller to override the content-type and charset for
 *      the request. See:
 *      http://www.w3.org/TR/XMLHttpRequest/#dom-xmlhttprequest-overridemimetype
 * - responseType: may be set to change the response type to an arraybuffer or
 *      blob for downloading binary data. See:
 *      http://www.w3.org/TR/XMLHttpRequest/#dom-xmlhttprequest-responsetype
 * - xssiPrefix: Prefix used for protecting against XSSI attacks, which should
 *      be removed before parsing the response as JSON.
 *
 * @typedef {{
 *   headers: (Object<string>|undefined),
 *   mimeType: (string|undefined),
 *   responseType: (xhr.ResponseType|undefined),
 *   timeoutMs: (number|undefined),
 *   withCredentials: (boolean|undefined),
 *   xssiPrefix: (string|undefined)
 * }}
 */
xhr.Options;


/**
 * Defines the types that are allowed as post data.
 * @typedef {(ArrayBuffer|Blob|Document|FormData|null|string|undefined)}
 */
xhr.PostData;


/**
 * The Content-Type HTTP header name.
 * @type {string}
 */
xhr.CONTENT_TYPE_HEADER = 'Content-Type';


/**
 * The Content-Type HTTP header value for a url-encoded form.
 * @type {string}
 */
xhr.FORM_CONTENT_TYPE = 'application/x-www-form-urlencoded;charset=utf-8';


/**
 * Supported data types for the responseType field.
 * See: http://www.w3.org/TR/XMLHttpRequest/#dom-xmlhttprequest-response
 * @enum {string}
 */
xhr.ResponseType = {
  ARRAYBUFFER: 'arraybuffer',
  BLOB: 'blob',
  DOCUMENT: 'document',
  JSON: 'json',
  TEXT: 'text'
};


/**
 * Sends a get request, returning a promise that will be resolved
 * with the response text once the request completes.
 *
 * @param {string} url The URL to request.
 * @param {xhr.Options=} opt_options Configuration options for the request.
 * @return {!goog.Promise<string>} A promise that will be resolved with the
 *     response text once the request completes.
 */
xhr.get = function(url, opt_options) {
  return xhr.send('GET', url, null, opt_options).then(function(request) {
    return request.responseText;
  });
};


/**
 * Sends a post request, returning a promise that will be resolved
 * with the response text once the request completes.
 *
 * @param {string} url The URL to request.
 * @param {xhr.PostData} data The body of the post request.
 * @param {xhr.Options=} opt_options Configuration options for the request.
 * @return {!goog.Promise<string>} A promise that will be resolved with the
 *     response text once the request completes.
 */
xhr.post = function(url, data, opt_options) {
  return xhr.send('POST', url, data, opt_options).then(function(request) {
    return request.responseText;
  });
};


/**
 * Sends a get request, returning a promise that will be resolved with
 * the parsed response text once the request completes.
 *
 * @param {string} url The URL to request.
 * @param {xhr.Options=} opt_options Configuration options for the request.
 * @return {!goog.Promise<Object>} A promise that will be resolved with the
 *     response JSON once the request completes.
 */
xhr.getJson = function(url, opt_options) {
  return xhr.send('GET', url, null, opt_options).then(function(request) {
    return xhr.parseJson_(request.responseText, opt_options);
  });
};


/**
 * Sends a get request, returning a promise that will be resolved with the
 * response as an array of bytes.
 *
 * Supported in all XMLHttpRequest level 2 browsers, as well as IE9. IE8 and
 * earlier are not supported.
 *
 * @param {string} url The URL to request.
 * @param {xhr.Options=} opt_options Configuration options for the request. The
 *     responseType will be overwritten to 'arraybuffer' if it was set.
 * @return {!goog.Promise<!Uint8Array|!Array<number>>} A promise that will be
 *     resolved with an array of bytes once the request completes.
 */
xhr.getBytes = function(url, opt_options) {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    throw new Error('getBytes is not supported in this browser.');
  }

  var options = opt_options || {};
  options.responseType = xhr.ResponseType.ARRAYBUFFER;

  return xhr.send('GET', url, null, options).then(function(request) {
    // Use the ArrayBuffer response in browsers that support XMLHttpRequest2.
    // This covers nearly all modern browsers: http://caniuse.com/xhr2
    if (request.response) {
      return new Uint8Array(/** @type {!ArrayBuffer} */ (request.response));
    }

    // Fallback for IE9: the response may be accessed as an array of bytes with
    // the non-standard responseBody property, which can only be accessed as a
    // VBArray. IE7 and IE8 require significant amounts of VBScript to extract
    // the bytes.
    // See: http://stackoverflow.com/questions/1919972/
    if (goog.global['VBArray']) {
      return new goog.global['VBArray'](request['responseBody']).toArray();
    }

    // Nearly all common browsers are covered by the cases above. If downloading
    // binary files in older browsers is necessary, the MDN article "Sending and
    // Receiving Binary Data" provides techniques that may work with
    // XMLHttpRequest level 1 browsers: http://goo.gl/7lEuGN
    throw new xhr.Error(
        'getBytes is not supported in this browser.', url, request);
  });
};


/**
 * Sends a post request, returning a promise that will be resolved with
 * the parsed response text once the request completes.
 *
 * @param {string} url The URL to request.
 * @param {xhr.PostData} data The body of the post request.
 * @param {xhr.Options=} opt_options Configuration options for the request.
 * @return {!goog.Promise<Object>} A promise that will be resolved with the
 *     response JSON once the request completes.
 */
xhr.postJson = function(url, data, opt_options) {
  return xhr.send('POST', url, data, opt_options).then(function(request) {
    return xhr.parseJson_(request.responseText, opt_options);
  });
};


/**
 * Sends a request, returning a promise that will be resolved
 * with the XHR object once the request completes.
 *
 * If content type hasn't been set in opt_options headers, and hasn't been
 * explicitly set to null, default to form-urlencoded/UTF8 for POSTs.
 *
 * @param {string} method The HTTP method for the request.
 * @param {string} url The URL to request.
 * @param {xhr.PostData} data The body of the post request.
 * @param {xhr.Options=} opt_options Configuration options for the request.
 * @return {!goog.Promise<!goog.net.XhrLike.OrNative>} A promise that will be
 *     resolved with the XHR object once the request completes.
 */
xhr.send = function(method, url, data, opt_options) {
  return new goog.Promise(function(resolve, reject) {
    var options = opt_options || {};
    var timer;

    var request = goog.net.XmlHttp();
    try {
      request.open(method, url, true);
    } catch (e) {
      // XMLHttpRequest.open may throw when 'open' is called, for example, IE7
      // throws "Access Denied" for cross-origin requests.
      reject(new xhr.Error('Error opening XHR: ' + e.message, url, request));
    }

    // So sad that IE doesn't support onload and onerror.
    request.onreadystatechange = function() {
      if (request.readyState == goog.net.XmlHttp.ReadyState.COMPLETE) {
        goog.global.clearTimeout(timer);
        // Note: When developing locally, XHRs to file:// schemes return
        // a status code of 0. We mark that case as a success too.
        if (HttpStatus.isSuccess(request.status) ||
            request.status === 0 && !xhr.isEffectiveSchemeHttp_(url)) {
          resolve(request);
        } else {
          reject(new xhr.HttpError(request.status, url, request));
        }
      }
    };
    request.onerror = function() {
      reject(new xhr.Error('Network error', url, request));
    };

    // Set the headers.
    var contentType;
    if (options.headers) {
      for (var key in options.headers) {
        var value = options.headers[key];
        if (goog.isDefAndNotNull(value)) {
          request.setRequestHeader(key, value);
        }
      }
      contentType = options.headers[xhr.CONTENT_TYPE_HEADER];
    }

    // Browsers will automatically set the content type to multipart/form-data
    // when passed a FormData object.
    var dataIsFormData = (goog.global['FormData'] &&
        (data instanceof goog.global['FormData']));
    // If a content type hasn't been set, it hasn't been explicitly set to null,
    // and the data isn't a FormData, default to form-urlencoded/UTF8 for POSTs.
    // This is because some proxies have been known to reject posts without a
    // content-type.
    if (method == 'POST' && contentType === undefined && !dataIsFormData) {
      request.setRequestHeader(xhr.CONTENT_TYPE_HEADER, xhr.FORM_CONTENT_TYPE);
    }

    // Set whether to include cookies with cross-domain requests. See:
    // http://www.w3.org/TR/XMLHttpRequest/#the-withcredentials-attribute
    if (options.withCredentials) {
      request.withCredentials = options.withCredentials;
    }

    // Allows setting an alternative response type, such as an ArrayBuffer. See:
    // http://www.w3.org/TR/XMLHttpRequest/#dom-xmlhttprequest-responsetype
    if (options.responseType) {
      request.responseType = options.responseType;
    }

    // Allow the request to override the MIME type of the response. See:
    // http://www.w3.org/TR/XMLHttpRequest/#dom-xmlhttprequest-overridemimetype
    if (options.mimeType) {
      request.overrideMimeType(options.mimeType);
    }

    // Handle timeouts, if requested.
    if (options.timeoutMs > 0) {
      timer = goog.global.setTimeout(function() {
        // Clear event listener before aborting so the errback will not be
        // called twice.
        request.onreadystatechange = goog.nullFunction;
        request.abort();
        reject(new xhr.TimeoutError(url, request));
      }, options.timeoutMs);
    }

    // Trigger the send.
    try {
      request.send(data);
    } catch (e) {
      // XMLHttpRequest.send is known to throw on some versions of FF,
      // for example if a cross-origin request is disallowed.
      request.onreadystatechange = goog.nullFunction;
      goog.global.clearTimeout(timer);
      reject(new xhr.Error('Error sending XHR: ' + e.message, url, request));
    }
  });
};


/**
 * @param {string} url The URL to test.
 * @return {boolean} Whether the effective scheme is HTTP or HTTPs.
 * @private
 */
xhr.isEffectiveSchemeHttp_ = function(url) {
  var scheme = goog.uri.utils.getEffectiveScheme(url);
  // NOTE(user): Empty-string is for the case under FF3.5 when the location
  // is not defined inside a web worker.
  return scheme == 'http' || scheme == 'https' || scheme == '';
};


/**
 * JSON-parses the given response text, returning an Object.
 *
 * @param {string} responseText Response text.
 * @param {xhr.Options|undefined} options The options object.
 * @return {Object} The JSON-parsed value of the original responseText.
 * @private
 */
xhr.parseJson_ = function(responseText, options) {
  var prefixStrippedResult = responseText;
  if (options && options.xssiPrefix) {
    prefixStrippedResult = xhr.stripXssiPrefix_(
        options.xssiPrefix, prefixStrippedResult);
  }
  return goog.json.parse(prefixStrippedResult);
};


/**
 * Strips the XSSI prefix from the input string.
 *
 * @param {string} prefix The XSSI prefix.
 * @param {string} string The string to strip the prefix from.
 * @return {string} The input string without the prefix.
 * @private
 */
xhr.stripXssiPrefix_ = function(prefix, string) {
  if (goog.string.startsWith(string, prefix)) {
    string = string.substring(prefix.length);
  }
  return string;
};



/**
 * Generic error that may occur during a request.
 *
 * @param {string} message The error message.
 * @param {string} url The URL that was being requested.
 * @param {!goog.net.XhrLike.OrNative} request The XHR that failed.
 * @extends {goog.debug.Error}
 * @constructor
 */
xhr.Error = function(message, url, request) {
  xhr.Error.base(this, 'constructor', message + ', url=' + url);

  /**
   * The URL that was requested.
   * @type {string}
   */
  this.url = url;

  /**
   * The XMLHttpRequest corresponding with the failed request.
   * @type {!goog.net.XhrLike.OrNative}
   */
  this.xhr = request;
};
goog.inherits(xhr.Error, goog.debug.Error);


/** @override */
xhr.Error.prototype.name = 'XhrError';



/**
 * Class for HTTP errors.
 *
 * @param {number} status The HTTP status code of the response.
 * @param {string} url The URL that was being requested.
 * @param {!goog.net.XhrLike.OrNative} request The XHR that failed.
 * @extends {xhr.Error}
 * @constructor
 * @final
 */
xhr.HttpError = function(status, url, request) {
  xhr.HttpError.base(
      this, 'constructor', 'Request Failed, status=' + status, url, request);

  /**
   * The HTTP status code for the error.
   * @type {number}
   */
  this.status = status;
};
goog.inherits(xhr.HttpError, xhr.Error);


/** @override */
xhr.HttpError.prototype.name = 'XhrHttpError';



/**
 * Class for Timeout errors.
 *
 * @param {string} url The URL that timed out.
 * @param {!goog.net.XhrLike.OrNative} request The XHR that failed.
 * @extends {xhr.Error}
 * @constructor
 * @final
 */
xhr.TimeoutError = function(url, request) {
  xhr.TimeoutError.base(this, 'constructor', 'Request timed out', url, request);
};
goog.inherits(xhr.TimeoutError, xhr.Error);


/** @override */
xhr.TimeoutError.prototype.name = 'XhrTimeoutError';

});  // goog.scope
