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

goog.provide('node.Builder');

goog.require('node.http.HttpClient');
goog.require('webdriver.AbstractBuilder');
goog.require('webdriver.WebDriver');
goog.require('webdriver.http.Executor');



/**
 * @constructor
 * @extends {webdriver.AbstractBuilder}
 */
node.Builder = function() {
  goog.base(this);
};
goog.inherits(node.Builder, webdriver.AbstractBuilder);



/**
 * @override
 */
node.Builder.prototype.build = function() {
  var client = new node.http.HttpClient(this.getServerUrl());
  var executor = new webdriver.http.Executor(client);

  if (this.getSession()) {
    return webdriver.WebDriver.attachToSession(executor, this.getSession());
  } else {
    return webdriver.WebDriver.createSession(executor, this.getCapabilities());
  }
};
