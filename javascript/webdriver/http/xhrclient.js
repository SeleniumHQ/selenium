// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/** @fileoverview A XHR client. */

goog.provide('webdriver.http.XhrClient');

goog.require('goog.Promise');
goog.require('goog.net.XmlHttp');
goog.require('webdriver.http.Client');
goog.require('webdriver.http.Response');



/**
 * A HTTP client that sends requests using XMLHttpRequests.
 * @param {string} url URL for the WebDriver server to send commands to.
 * @constructor
 * @implements {webdriver.http.Client}
 */
webdriver.http.XhrClient = function(url) {

  /** @private {string} */
  this.url_ = url;
};


/** @override */
webdriver.http.XhrClient.prototype.send = function(request) {
  var url = this.url_ + request.path;
  return new goog.Promise(function(fulfill, reject) {
    var xhr = /** @type {!XMLHttpRequest} */ (goog.net.XmlHttp());
    xhr.open(request.method, url, true);

    xhr.onload = function() {
      fulfill(webdriver.http.Response.fromXmlHttpRequest(xhr));
    };

    xhr.onerror = function() {
      reject(Error([
        'Unable to send request: ', request.method, ' ', url,
        '\nOriginal request:\n', request
      ].join('')));
    };

    for (var header in request.headers) {
      xhr.setRequestHeader(header, request.headers[header] + '');
    }

    xhr.send(JSON.stringify(request.data));
  });
};
