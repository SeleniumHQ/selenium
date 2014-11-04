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
 * @fileoverview Various utilities for working with
 * {@link webdriver.CommandExecutor} implementations.
 */

var HttpClient = require('./http').HttpClient,
    HttpExecutor = require('./http').Executor,
    promise = require('./_base').require('webdriver.promise');



/**
 * Wraps a promised {@link webdriver.CommandExecutor}, ensuring no commands
 * are executed until the wrapped executor has been fully built.
 * @param {!webdriver.promise.Promise.<!webdriver.CommandExecutor>} delegate The
 *     promised delegate.
 * @constructor
 * @implements {webdriver.CommandExecutor}
 */
var DeferredExecutor = function(delegate) {

  /** @override */
  this.execute = function(command, callback) {
    delegate.then(function(executor) {
      executor.execute(command, callback);
    }, callback);
  };
};


// PUBLIC API


exports.DeferredExecutor = DeferredExecutor;

/**
 * Creates a command executor that uses WebDriver's JSON wire protocol.
 * @param {(string|!webdriver.promise.Promise.<string>)} url The server's URL,
 *     or a promise that will resolve to that URL.
 * @param {string=} opt_proxy (optional) The URL of the HTTP proxy for the
 *     client to use.
 * @returns {!webdriver.CommandExecutor} The new command executor.
 */
exports.createExecutor = function(url, opt_proxy) {
  return new DeferredExecutor(promise.when(url, function(url) {
    var client = new HttpClient(url, null, opt_proxy);
    return new HttpExecutor(client);
  }));
};
