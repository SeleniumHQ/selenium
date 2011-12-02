// Copyright 2011 WebDriver committers
// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/** @fileoverview A XHR client. */

goog.provide('webdriver.http.XhrClient');

goog.require('webdriver.http.Response');


/**
 * A HTTP client that sends requests using XMLHttpRequests.
 * @param {string} url URL for the WebDriver server to send commands
 *     to.
 * @constructor
 * @implements {webdriver.http.Client}
 */
webdriver.http.XhrClient = function(url) {

  /**
   * URL for the WebDriver server to send commands to.
   * @type {string}
   * @private
   */
  this.url_ = url;
};


/**
 * Tests whether teh current environment supports cross-origin resource sharing
 * with XMLHttpRequest.
 * @return {boolean} Whether cross-origin resource sharing is supported.
 * @see http://www.w3.org/TR/cors/
 */
webdriver.http.XhrClient.isCorsAvailable = function() {
  return typeof XMLHttpRequest != 'undefined' &&
      goog.isBoolean(new XMLHttpRequest().withCredentials);
};


/** @override */
webdriver.http.XhrClient.prototype.send = function(request, callback) {
  try {
    var xhr = new XMLHttpRequest;
    var url = this.url_ + request.path;
    xhr.open(request.method, url, true);

    xhr.onload = function() {
      callback(null, webdriver.http.Response.fromXmlHttpRequest(xhr));
    };

    xhr.onerror = function() {
      var location = window.location;
      var currentDomain = [
        location.protocol, '//', location.hostname,
        (location.port ? ':' + location.port : '')].join('');

      // Wow this is a verbose error message, but we're trying to be helpful.
      var message = [
        'Unable to send request: ', request.method, ' ', url,
        '\nWas this a cross-domain request? The current domain is ',
        currentDomain
      ];

      if (webdriver.http.XhrClient.isCorsAvailable()) {
        message.push(
            '\nThe current browser appears to support cross-domain XHR.',
            '\nPerhaps the server did not respond to the preflight request ',
            'with valid access control headers?');
      } else {
        message.push(
            'The current browser does not appear to support cross-domain XHR.');
      }

      message.push('\n', request);
      callback(new Error(message.join('')));
    };

    for (var header in request.headers) {
      xhr.setRequestHeader(header, request.headers[header]);
    }

    xhr.send(JSON.stringify(request.data));
  } catch (ex) {
    callback(ex);
  }
};
