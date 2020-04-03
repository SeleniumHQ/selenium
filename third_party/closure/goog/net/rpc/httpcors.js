// Copyright 2017 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Provides CORS support for HTTP based RPC requests.
 *
 * As part of net.rpc package, CORS features provided by this class
 * depend on the server support. Please check related specs to decide how
 * to enable any of the features provided by this class.
 *
 */

goog.module('goog.net.rpc.HttpCors');

var GoogUri = goog.require('goog.Uri');
var googObject = goog.require('goog.object');
var googString = goog.require('goog.string');
var googUriUtils = goog.require('goog.uri.utils');


/**
 * The default URL parameter name to overwrite http headers with a URL param
 * to avoid CORS preflight.
 *
 * See https://github.com/whatwg/fetch/issues/210#issue-129531743 for the spec.
 *
 * @type {string}
 */
exports.HTTP_HEADERS_PARAM_NAME = '$httpHeaders';


/**
 * Generates the URL parameter value with custom headers encoded as
 * HTTP/1.1 headers block.
 *
 * @param {!Object<string, string>} headers The custom headers.
 * @return {string} The URL param to overwrite custom HTTP headers.
 */
exports.generateHttpHeadersOverwriteParam = function(headers) {
  var result = '';
  googObject.forEach(headers, function(value, key) {
    result += key;
    result += ':';
    result += value;
    result += '\r\n';
  });
  return result;
};


/**
 * Generates the URL-encoded URL parameter value with custom headers encoded as
 * HTTP/1.1 headers block.
 *
 * @param {!Object<string, string>} headers The custom headers.
 * @return {string} The URL param to overwrite custom HTTP headers.
 */
exports.generateEncodedHttpHeadersOverwriteParam = function(headers) {
  return googString.urlEncode(
      exports.generateHttpHeadersOverwriteParam(headers));
};


/**
 * Sets custom HTTP headers via an overwrite URL param.
 *
 * @param {!GoogUri|string} url The URI object or a string path.
 * @param {string} urlParam The URL param name.
 * @param {!Object<string, string>} extraHeaders The HTTP headers.
 * @return {!GoogUri|string} The URI object or a string path with headers
 * encoded as a url param.
 */
exports.setHttpHeadersWithOverwriteParam = function(
    url, urlParam, extraHeaders) {
  if (googObject.isEmpty(extraHeaders)) {
    return url;
  }
  var httpHeaders = exports.generateHttpHeadersOverwriteParam(extraHeaders);
  if (goog.isString(url)) {
    return googUriUtils.appendParam(
        url, googString.urlEncode(urlParam), httpHeaders);
  } else {
    url.setParameterValue(urlParam, httpHeaders);  // duplicate removed!
    return url;
  }
};
