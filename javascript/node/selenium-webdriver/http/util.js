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

/**
 * @fileoverview Various HTTP utilities.
 */

'use strict';

const error = require('../error'),
    Executor = require('./index').Executor,
    HttpClient = require('./index').HttpClient,
    HttpRequest = require('./index').Request,
    Command = require('../lib/command').Command,
    CommandName = require('../lib/command').Name,
    promise = require('../lib/promise');



/**
 * Queries a WebDriver server for its current status.
 * @param {string} url Base URL of the server to query.
 * @return {!promise.Promise.<!Object>} A promise that resolves with
 *     a hash of the server status.
 */
function getStatus(url) {
  var client = new HttpClient(url);
  var executor = new Executor(client);
  var command = new Command(CommandName.GET_SERVER_STATUS);
  return executor.execute(command).then(function(responseObj) {
    error.checkLegacyResponse(responseObj);
    return responseObj['value'];
  });
}


// PUBLIC API


/**
 * Queries a WebDriver server for its current status.
 * @param {string} url Base URL of the server to query.
 * @return {!promise.Promise.<!Object>} A promise that resolves with
 *     a hash of the server status.
 */
exports.getStatus = getStatus;


/**
 * Waits for a WebDriver server to be healthy and accepting requests.
 * @param {string} url Base URL of the server to query.
 * @param {number} timeout How long to wait for the server.
 * @return {!promise.Promise} A promise that will resolve when the
 *     server is ready.
 */
exports.waitForServer = function(url, timeout) {
  var ready = promise.defer(),
      start = Date.now();
  checkServerStatus();
  return ready.promise;

  function checkServerStatus() {
    return getStatus(url).then(ready.fulfill, onError);
  }

  function onError() {
    if (Date.now() - start > timeout) {
      ready.reject(
          Error('Timed out waiting for the WebDriver server at ' + url));
    } else {
      setTimeout(function() {
        if (ready.isPending()) {
          checkServerStatus();
        }
      }, 50);
    }
  }
};


/**
 * Polls a URL with GET requests until it returns a 2xx response or the
 * timeout expires.
 * @param {string} url The URL to poll.
 * @param {number} timeout How long to wait, in milliseconds.
 * @return {!promise.Promise} A promise that will resolve when the
 *     URL responds with 2xx.
 */
exports.waitForUrl = function(url, timeout) {
  var client = new HttpClient(url),
      request = new HttpRequest('GET', ''),
      ready = promise.defer(),
      start = Date.now();
  testUrl();
  return ready.promise;

  function testUrl() {
    client.send(request).then(onResponse, onError);
  }

  function onError() {
    if (Date.now() - start > timeout) {
      ready.reject(Error(
          'Timed out waiting for the URL to return 2xx: ' + url));
    } else {
      setTimeout(function() {
        if (ready.isPending()) {
          testUrl();
        }
      }, 50);
    }
  }

  function onResponse(response) {
    if (!ready.isPending()) return;
    if (response.status > 199 && response.status < 300) {
      return ready.fulfill();
    }
    onError();
  }
};
