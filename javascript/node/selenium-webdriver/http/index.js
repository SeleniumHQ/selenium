// Copyright 2011 Software Freedom Conservancy. All Rights Reserved.
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

var http = require('http'),
    url = require('url');

var base = require('../_base'),
    HttpResponse = base.require('webdriver.http.Response');


/**
 * HTTP client for use with NodeJS.
 * @param {string} serverUrl URL for the WebDriver server to send commands to.
 * @constructor
 * @implements {webdriver.http.Client}
 */
var HttpClient = function(serverUrl) {
  var parsedUrl = url.parse(serverUrl);
  if (!parsedUrl.hostname) {
    throw new Error('Invalid server URL: ' + serverUrl);
  }

  /**
   * Base options for each request.
   * @private {!Object}
   */
  this.options_ = {
    host: parsedUrl.hostname,
    path: parsedUrl.pathname,
    port: parsedUrl.port
  };
};


/** @override */
HttpClient.prototype.send = function(httpRequest, callback) {
  var data;
  httpRequest.headers['Content-Length'] = 0;
  if (httpRequest.method == 'POST' || httpRequest.method == 'PUT') {
    data = JSON.stringify(httpRequest.data);
    httpRequest.headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
    httpRequest.headers['Content-Type'] = 'application/json;charset=UTF-8';
  }

  var path = this.options_.path;
  if (path[path.length - 1] === '/' && httpRequest.path[0] === '/') {
    path += httpRequest.path.substring(1);
  } else {
    path += httpRequest.path;
  }

  sendRequest({
    method: httpRequest.method,
    host: this.options_.host,
    port: this.options_.port,
    path: path,
    headers: httpRequest.headers
  }, callback, data);
};


/**
 * Sends a single HTTP request.
 * @param {!Object} options The request options.
 * @param {function(Error, !webdriver.http.Response=)} callback The function to
 *     invoke with the server's response.
 * @param {string=} opt_data The data to send with the request.
 */
var sendRequest = function(options, callback, opt_data) {
  var request = http.request(options, function(response) {
    if (response.statusCode == 302 || response.statusCode == 303) {
      var location = url.parse(response.headers['location']);

      if (!location.hostname) {
        location.hostname = options.host;
        location.port = options.port;
      }

      request.abort();
      sendRequest({
        method: 'GET',
        host: location.hostname,
        path: location.pathname + (location.search || ''),
        port: location.port,
        headers: {
          'Accept': 'application/json; charset=utf-8'
        }
      }, callback);
      return;
    }

    var body = [];
    response.on('data', body.push.bind(body));
    response.on('end', function() {
      var resp = new HttpResponse(response.statusCode,
          response.headers, body.join('').replace(/\0/g, ''));
      callback(null, resp);
    });
  });

  request.on('error', function(e) {
    if (e.code === 'ECONNRESET') {
      setTimeout(function() {
        sendRequest(options, callback, opt_data);
      }, 15);
    } else {
      var message = e.message;
      if (e.code) {
        message = e.code + ' ' + message;
      }
      callback(new Error(message));
    }
  });

  if (opt_data) {
    request.write(opt_data);
  }

  request.end();
};


// PUBLIC API


exports.Executor = base.require('webdriver.http.Executor');
exports.Request = base.require('webdriver.http.Request');
exports.Response = base.require('webdriver.http.Response');
exports.HttpClient = HttpClient;
exports.util = require('./util');
