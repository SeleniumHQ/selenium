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
 * @fileoverview File used to declare some types that would otherwise not be
 * included in a built binary and would thus result in compiler warnings. If
 * any of these types are ever introduced to the target's scope, resulting
 * in duplicate provide errors, simply remove the declaration here.
 */

goog.addDependency(
    // Relative path to the base closure file that defines the goog namespace.
    // Doesn't matter here because this is never used for raw mode.
    '',
    // The symbols we're declaring for the compiler. These should be removed if
    // the files that actually goog.provide them are ever pulled into the
    // dependency graph.
    [
      'goog.debug.ErrorHandler',
      'goog.events.EventWrapper',
      'goog.testing.JsUnitException',
      'webdriver.logging.Preferences'
    ],
    // And symbols we require, which is always empty here.
    []);

