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
 * @fileoverview Selenium Core.
 */

goog.provide('core.Error');

goog.require('goog.debug.Error');



/**
 * Error extension that indicates that the something has gone awry in Selenium
 * Core.
 *
 * @param {string=} opt_message Optional error message.
 * @constructor
 * @extends {goog.debug.Error}
 */
core.Error = function(opt_message) {
  goog.base(this, opt_message);
};
goog.inherits(core.Error, goog.debug.Error);
