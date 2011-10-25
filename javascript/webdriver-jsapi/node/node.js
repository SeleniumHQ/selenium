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

/**
 * @fileoverview Defines a the {@code webdriver.http.Client} for use with
 * NodeJS.
 */

goog.provide('webdriver.node');
goog.provide('webdriver.node.HttpClient');

goog.require('webdriver.http.Response');
goog.require('webdriver.process');


/**
 * Returns the source of the current module.
 * @param {function(*, string=)} callback The function to call with this
 *     module's source. If an error occurs while loading the source, it will be
 *     passed as the first argument to the callback. Otherwise, the source
 *     contents will be passed as the second argument (and null for the first).
 * @export
 */
webdriver.node.toSource = (function() {
  /**
   * The loaded source for this module.
   * @type {string}
   */
  var source;

  /**
   * @param {function(*, string=)} callback The function to call with this
   *     module's source code.
   */
  function loadSource(callback) {
    webdriver.node.checkIsNative_();
    if (webdriver.node.source_) {
      callback(null, webdriver.node.source_);
    } else {
      require('fs').readFile(__filename, 'utf-8', function(err, data) {
        callback(err, webdriver.node.source_ = data);
      });
    }
  }

  return loadSource;
})();


/**
 * Parses a URL with Node's native "url" module.
 * @param {string} url The URL to parse.
 * @return {!Object} The parsed URL.
 * @private
 */
webdriver.node.parseUrl_ = function(url) {
  return require('url').parse(url);
};


/**
 * Checks that the current environment is a native Node environment.
 * @private
 */
webdriver.node.checkIsNative_ = function() {
  if (!webdriver.process.isNative()) {
    throw new Error(
        'This operation/object may not be used in a non-native environment');
  }
};


/**
 * HTTP client for use with NodeJS.
 * @param {!(goog.Uri|string)} url URL for the WebDriver server to send commands
 *     to.
 * @constructor
 * @implements {webdriver.http.Client}
 */
webdriver.node.HttpClient = function(url) {
  webdriver.node.checkIsNative_();

  url = webdriver.node.parseUrl_(url + '');
  if (!url.hostname) {
    throw new Error('Invalid server URL: ' + url);
  }

  /**
   * Base options for each request.
   * @type {!Object}
   * @private
   */
  this.options_ = {
    host: url.hostname,
    path: url.pathname || '/',
    port: url.port
  };
};


/** @override */
webdriver.node.HttpClient.prototype.send = function(httpRequest, callback) {
  var data;
  if (httpRequest.method == 'POST' || httpRequest.method == 'PUT') {
     data = JSON.stringify(httpRequest.data);
     httpRequest.headers['Content-Length'] = data.length;
  }

  webdriver.node.HttpClient.sendRequest_({
    method: httpRequest.method,
    host: this.options_.host,
    port: this.options_.port,
    path: this.options_.path + httpRequest.path,
    headers: httpRequest.headers
  }, callback, data);
};


/**
 * Sends a single HTTP request.
 * @param {!Object} options The request options.
 * @param {function(Error, !webdriver.http.Response=)} callback The function to
 *     invoke with the server's response.
 * @param {string=} opt_data The data to send with the request.
 * @private
 */
webdriver.node.HttpClient.sendRequest_ = function(options, callback, opt_data) {
  var request =  require('http').request(options, function(response) {
    if (response.statusCode == 302 || response.statusCode == 303) {
      var location = webdriver.node.parseUrl_(response.headers['location']);

      if (!location.hostname) {
        location.hostname = options.host;
        location.port = options.port;
      }

      request.abort();
      webdriver.node.HttpClient.sendRequest_({
        method: 'GET',
        host: location.hostname,
        path: location.pathname + (location.search || ''),
        port: location.port,
        headers: {
          'Accept': 'application/json'
        }
      }, callback);
      return;
    }

    var body = [];
    response.on('data', body.push.bind(body));
    response.on('end', function() {
      var resp = new webdriver.http.Response(response.statusCode,
          response.headers, body.join('').replace(/\0/g, ''));
      callback(null, resp);
    });
  });

  request.on('error', function(e) {
    callback(new Error('Unable to send request: ' + e.message));
  });

  if (opt_data) {
    request.write(opt_data);
  }

  request.end();
};
