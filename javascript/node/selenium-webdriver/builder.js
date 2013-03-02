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

var base = require('./_base'),
    HttpClient = require('./http').HttpClient;

var goog = base.require('goog'),
    AbstractBuilder = base.require('webdriver.AbstractBuilder'),
    WebDriver = base.require('webdriver.WebDriver'),
    HttpExecutor = base.require('webdriver.http.Executor'),
    promise = base.require('webdriver.promise');



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



/**
 * @constructor
 * @extends {webdriver.AbstractBuilder}
 */
var Builder = function() {
  goog.base(this);
};
goog.inherits(Builder, AbstractBuilder);



/**
 * @override
 */
Builder.prototype.build = function() {
  var serverUrl = this.getServerUrl();
  var executor = new DeferredExecutor(promise.when(serverUrl, function(url) {
    var client = new HttpClient(url);
    return new HttpExecutor(client);
  }));

  if (this.getSession()) {
    return WebDriver.attachToSession(executor, this.getSession());
  } else {
    return WebDriver.createSession(executor, this.getCapabilities());
  }
};


// PUBLIC API


exports.Builder = Builder;
