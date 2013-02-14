// Copyright 2013 Selenium committers
// Copyright 2013 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Various HTTP utilities.
 */

goog.provide('node.http.util');

goog.require('bot.response');
goog.require('node.http.HttpClient');
goog.require('webdriver.http.Executor');
goog.require('webdriver.http.Request');
goog.require('webdriver.Command');
goog.require('webdriver.CommandName');
goog.require('webdriver.promise');


/**
 * Queries a WebDriver server for its current status.
 * @param {string} url Base URL of the server to query.
 * @return {!webdriver.promise.Promise.<!Object>} A promise that resolves with
 *     a hash of the server status.
 */
node.http.util.getStatus = function(url) {
  var deferredStatus = webdriver.promise.defer();
  var client = new node.http.HttpClient(url);
  var executor = new webdriver.http.Executor(client);
  var command = new webdriver.Command(webdriver.CommandName.GET_SERVER_STATUS);
  executor.execute(command, function(err, responseObj) {
    if (err) {
      deferredStatus.reject(err);
    } else {
      try {
        bot.response.checkResponse(responseObj);
        deferredStatus.resolve(responseObj['value']);
      } catch (ex) {
        deferredStatus.reject(ex);
      }
    }
  });
  return deferredStatus.promise;
};


/**
 * Waits for a WebDriver server to be healthy and accepting requests.
 * @param {string} url Base URL of the server to query.
 * @param {number} timeout How long to wait for the server.
 * @return {!webdriver.promise.Promise} A promise that will resolve when the
 *     server is ready.
 */
node.http.util.waitForServer = function(url, timeout) {
  return webdriver.promise.controlFlow().wait(function() {
    return node.http.util.getStatus(url).
        then(function() { return true; },
             function() { return false; });
  }, timeout, 'Timed out waiting for the WebDriver server at ' + url);
};


/**
 * Polls a URL with GET requests until it returns a 2xx response or the
 * timeout expires.
 * @param {string} url The URL to poll.
 * @param {number} timeout How long to wait, in milliseconds.
 * @return {!webdriver.promise.Promise} A promise that will resolve when the
 *     URL responds with 2xx.
 */
node.http.util.waitForUrl = function(url, timeout) {
  var client = new node.http.HttpClient(url);
  var request = new webdriver.http.Request('GET', '');
  var sendRequest = client.send.bind(client, request);

  return webdriver.promise.controlFlow().wait(function() {
      return webdriver.promise.checkedNodeCall(sendRequest).
          then(function(response) {
            return response.status > 199 && response.status < 300;
          });
  }, timeout, 'Timed out waiting for the URL to return 2xx: ' + url);
};
