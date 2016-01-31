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
 * @fileoverview The main user facing module. Exports WebDriver's primary
 * public API and provides convenience assessors to certain sub-modules.
 */

'use strict';

const builder = require('./builder');
const error = require('./error');
const actions = require('./lib/actions');
const by = require('./lib/by');
const capabilities = require('./lib/capabilities');
const command = require('./lib/command');
const events = require('./lib/events');
const input = require('./lib/input');
const logging = require('./lib/logging');
const promise = require('./lib/promise');
const session = require('./lib/session');
const until = require('./lib/until');
const webdriver = require('./lib/webdriver');


exports.ActionSequence = actions.ActionSequence;
exports.Browser = capabilities.Browser;
exports.Builder = builder.Builder;
exports.Button = input.Button;
exports.By = by.By;
exports.Capabilities = capabilities.Capabilities;
exports.Capability = capabilities.Capability;
exports.EventEmitter = events.EventEmitter;
exports.FileDetector = input.FileDetector;
exports.Key = input.Key;
exports.Session = session.Session;
exports.WebDriver = webdriver.WebDriver;
exports.WebElement = webdriver.WebElement;
exports.WebElementPromise = webdriver.WebElementPromise;
exports.error = error;
exports.logging = logging;
exports.promise = promise;
exports.until = until;
