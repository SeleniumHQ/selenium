// Copyright 2012 Software Freedom Conservancy. All Rights Reserved.
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
 * @fileoverview Configures what to export when WebDriverJS is compiled into a
 * deployable module.
 */

goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.response');
goog.require('webdriver.ActionSequence');
goog.require('webdriver.Builder');
goog.require('webdriver.Button');
goog.require('webdriver.Command');
goog.require('webdriver.CommandName');
goog.require('webdriver.EventEmitter');
goog.require('webdriver.Key');
goog.require('webdriver.Locator');
goog.require('webdriver.Session');
goog.require('webdriver.WebDriver');
goog.require('webdriver.WebElement');
goog.require('webdriver.http.CorsClient');
goog.require('webdriver.http.Executor');
goog.require('webdriver.http.Request');
goog.require('webdriver.http.Response');
goog.require('webdriver.http.XhrClient');
goog.require('webdriver.process');
goog.require('webdriver.promise');
goog.require('webdriver.stacktrace');

exports.ActionSequence = webdriver.ActionSequence;
exports.Builder = webdriver.Builder;
exports.Button = webdriver.Button;
exports.By = webdriver.Locator.Strategy;
exports.Command = webdriver.Command;
exports.CommandName = webdriver.CommandName;
exports.Error = bot.Error;
exports.ErrorCode = bot.ErrorCode;
exports.EventEmitter = webdriver.EventEmitter;
exports.Key = webdriver.Key;
exports.WebDriver = webdriver.WebDriver;
exports.WebElement = webdriver.WebElement;
exports.Session = webdriver.Session;

exports.http = {
  Executor: webdriver.http.Executor,
  Request: webdriver.http.Request,
  Response: webdriver.http.Response
};

exports.http.CorsClient = webdriver.http.CorsClient;
exports.http.XhrClient = webdriver.http.XhrClient;

exports.response = bot.response;

exports.process = {
  getEnv: webdriver.process.getEnv,
  setEnv: webdriver.process.setEnv
};

exports.promise = webdriver.promise;
exports.stacktrace = webdriver.stacktrace;
