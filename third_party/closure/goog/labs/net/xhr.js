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
goog.provide('goog.labs.net.xhr.TimeoutError');

goog.require('goog.Promise');
goog.require('goog.debug.Error');
goog.require('goog.json');
goog.require('goog.net.HttpStatus');
goog.require('goog.net.XmlHttp');
goog.require('goog.string');
goog.require('goog.uri.utils');



goog.scope(function() {
var _ = goog.labs.net.xhr;
var HttpStatus = goog.net.HttpStatus;


/**
 * Configuration options for an XMLHttpRequest.
 * - headers: map of header key/value pairs.
 * - timeoutMs: number of milliseconds after which the request will be timed
 *      out by the client. Default is to allow the browser to handle timeouts.
 * - withCredentials: whether user credentials are to be included in a
 *      cross-origin request.  See:
 *      http://dev.w3.org/2006/webapi/XMLHttpRequest-2/#the-withcredentials-attribute
 * - mimeType: allows the caller to override the content-type and charset for
 *      the request, which is useful when requesting binary data.  See:
 *      http://dev.w3.org/2006/webapi/XMLHttpRequest-2/#dom-xmlhttprequest-overridemimetype
 * - xssiPrefix: Prefix used for protecting against XSSI attacks, which should
 *      be removed before parsing the response as JSON.
 *
 * @typedef {{
 *   headers: (Object.<string>|undefined),
 *   timeoutMs: (number|undefined),
 *   withCredentials: (boolean|undefined),
 *   mimeType: (string|undefined),
 *   xssiPrefix: (string|undefined)
 * }}
 */
_.Options;


/**
 * Defines the types that are allowed as post data.
 * @typedef {(ArrayBuffer|Blob|Document|FormData|null|string|undefined)}
 */
_.PostData;


/**
 * The Content-Type HTTP header name.
 * @type {string}
 */
_.CONTENT_TYPE_HEADER = 'Content-Type';


/**
 * The Content-Type HTTP header value for a url-encoded form.
 * @type {string}
 */
_.FORM_CONTENT_TYPE = 'application/x-www-form-urlencoded;charset=utf-8';


/**
 * Sends a get request, returning a promise that will be resolved
 * with the response text once the request completes.
 *
 * @param {string} url The URL to request.
 * @param {_.Options=} opt_options Configuration options for the request.
 * @return {!goog.Promise.<string>} A promise that will be resolved with the
 *     response text once the request completes.
 */
_.get = function(url, opt_options) {
  return _.send('GET', url, null, opt_options).then(function(xhr) {
    return xhr.responseText;
  });
};


/**
 * Sends a post request, returning a promise that will be resolved
 * with the response text once the request completes.
 *
 * @param {string} url The URL to request.
 * @param {_.PostData} data The body of the post request.
 * @param {_.Options=} opt_options Configuration options for the request.
 * @return {!goog.Promise.<string>} A promise that will be resolved with the
 *     response text once the request completes.
 */
_.post = function(url, data, opt_options) {
  return _.send('POST', url, data, opt_options).then(function(xhr) {
    return xhr.responseText;
  });
};


/**
 * Sends a get request, returning a promise that will be resolved with
 * the parsed response text once the request completes.
 *
 * @param {string} url The URL to request.
 * @param {_.Options=} opt_options Configuration options for the request.
 * @return {!goog.Promise.<Object>} A promise that will be resolved with the
 *     response JSON once the request completes.
 */
_.getJson = function(url, opt_options) {
  return _.send('GET', url, null, opt_options).then(function(xhr) {
    return _.parseJson_(xhr.responseText, opt_options);
  });
};


/**
 * Sends a post request, returning a promise that will be resolved with
 * the parsed response text once the request completes.
 *
 * @param {string} url The URL to request.
 * @param {_.PostData} data The body of the post request.
 * @param {_.Options=} opt_options Configuration options for the request.
 * @return {!goog.Promise.<Object>} A promise that will be resolved with the
 *     response JSON once the request completes.
 */
_.postJson = function(url, data, opt_options) {
  return _.send('POST', url, data, opt_options).then(function(xhr) {
    return _.parseJson_(xhr.responseText, opt_options);
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
 * @param {_.PostData} data The body of the post request.
 * @param {_.Options=} opt_options Configuration options for the request.
 * @return {!goog.Promise.<!goog.net.XhrLike.OrNative>} A promise that will be
 *     resolved with the XHR object once the request completes.
 */
_.send = function(method, url, data, opt_options) {
  return new goog.Promise(function(resolve, reject) {
    var options = opt_options || {};
    var timer;

    var xhr = goog.net.XmlHttp();
    try {
      xhr.open(method, url, true);
    } catch (e) {
      // XMLHttpRequest.open may throw when 'open' is called, for example, IE7
      // throws "Access Denied" for cross-origin requests.
      reject(new _.Error('Error opening XHR: ' + e.message, url, xhr));
    }

    // So sad that IE doesn't support onload and onerror.
    xhr.onreadystatechange = function() {
      if (xhr.readyState == goog.net.XmlHttp.ReadyState.COMPLETE) {
        goog.global.clearTimeout(timer);
        // Note: When developing locally, XHRs to file:// schemes return
        // a status code of 0. We mark that case as a success too.
        if (HttpStatus.isSuccess(xhr.status) ||
            xhr.status === 0 && !_.isEffectiveSchemeHttp_(url)) {
          resolve(xhr);
        } else {
          reject(new _.HttpError(xhr.status, url, xhr));
        }
      }
    };
    xhr.onerror = function() {
      reject(new _.Error('Network error', url, xhr));
    };

    // Set the headers.
    var contentType;
    if (options.headers) {
      for (var key in options.headers) {
        var value = options.headers[key];
        if (goog.isDefAndNotNull(value)) {
          xhr.setRequestHeader(key, value);
        }
      }
      contentType = options.headers[_.CONTENT_TYPE_HEADER];
    }

    // If a content type hasn't been set, and hasn't been explicitly set to
    // null, default to form-urlencoded/UTF8 for POSTs.  This is because some
    // proxies have been known to reject posts without a content-type.
    if (method == 'POST' && contentType === undefined) {
      xhr.setRequestHeader(_.CONTENT_TYPE_HEADER, _.FORM_CONTENT_TYPE);
    }

    // Set whether to pass cookies on cross-domain requests (if applicable).
    // @see http://dev.w3.org/2006/webapi/XMLHttpRequest-2/#the-withcredentials-attribute
    if (options.withCredentials) {
      xhr.withCredentials = options.withCredentials;
    }

    // Allow the request to override the mime type, useful for getting binary
    // data from the server.  e.g. 'text/plain; charset=x-user-defined'.
    // @see http://dev.w3.org/2006/webapi/XMLHttpRequest-2/#dom-xmlhttprequest-overridemimetype
    if (options.mimeType) {
      xhr.overrideMimeType(options.mimeType);
    }

    // Handle timeouts, if requested.
    if (options.timeoutMs > 0) {
      timer = goog.global.setTimeout(function() {
        // Clear event listener before aborting so the errback will not be
        // called twice.
        xhr.onreadystatechange = goog.nullFunction;
        xhr.abort();
        reject(new _.TimeoutError(url, xhr));
      }, options.timeoutMs);
    }

    // Trigger the send.
    try {
      xhr.send(data);
    } catch (e) {
      // XMLHttpRequest.send is known to throw on some versions of FF,
      // for example if a cross-origin request is disallowed.
      xhr.onreadystatechange = goog.nullFunction;
      goog.global.clearTimeout(timer);
      reject(new _.Error('Error sending XHR: ' + e.message, url, xhr));
    }
  });
};


/**
 * @param {string} url The URL to test.
 * @return {boolean} Whether the effective scheme is HTTP or HTTPs.
 * @private
 */
_.isEffectiveSchemeHttp_ = function(url) {
  var scheme = goog.uri.utils.getEffectiveScheme(url);
  // NOTE(user): Empty-string is for the case under FF3.5 when the location
  // is not defined inside a web worker.
  return scheme == 'http' || scheme == 'https' || scheme == '';
};


/**
 * JSON-parses the given response text, returning an Object.
 *
 * @param {string} responseText Response text.
 * @param {_.Options|undefined} options The options object.
 * @return {Object} The JSON-parsed value of the original responseText.
 * @private
 */
_.parseJson_ = function(responseText, options) {
  var prefixStrippedResult = responseText;
  if (options && options.xssiPrefix) {
    prefixStrippedResult = _.stripXssiPrefix_(
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
_.stripXssiPrefix_ = function(prefix, string) {
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
 * @param {!goog.net.XhrLike.OrNative} xhr The XHR that failed.
 * @extends {goog.debug.Error}
 * @constructor
 */
_.Error = function(message, url, xhr) {
  _.Error.base(this, 'constructor', message + ', url=' + url);

  /**
   * The URL that was requested.
   * @type {string}
   */
  this.url = url;

  /**
   * The XMLHttpRequest corresponding with the failed request.
   * @type {!goog.net.XhrLike.OrNative}
   */
  this.xhr = xhr;
};
goog.inherits(_.Error, goog.debug.Error);


/** @override */
_.Error.prototype.name = 'XhrError';



/**
 * Class for HTTP errors.
 *
 * @param {number} status The HTTP status code of the response.
 * @param {string} url The URL that was being requested.
 * @param {!goog.net.XhrLike.OrNative} xhr The XHR that failed.
 * @extends {_.Error}
 * @constructor
 * @final
 */
_.HttpError = function(status, url, xhr) {
  _.HttpError.base(
      this, 'constructor', 'Request Failed, status=' + status, url, xhr);

  /**
   * The HTTP status code for the error.
   * @type {number}
   */
  this.status = status;
};
goog.inherits(_.HttpError, _.Error);


/** @override */
_.HttpError.prototype.name = 'XhrHttpError';



/**
 * Class for Timeout errors.
 *
 * @param {string} url The URL that timed out.
 * @param {!goog.net.XhrLike.OrNative} xhr The XHR that failed.
 * @extends {_.Error}
 * @constructor
 * @final
 */
_.TimeoutError = function(url, xhr) {
  _.TimeoutError.base(this, 'constructor', 'Request timed out', url, xhr);
};
goog.inherits(_.TimeoutError, _.Error);


/** @override */
_.TimeoutError.prototype.name = 'XhrTimeoutError';

});  // goog.scope
