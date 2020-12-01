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
 * @fileoverview Provides JSON utilities that uses native JSON parsing where
 * possible (a feature not currently offered by Closure).
 */

goog.provide('bot.json');


/**
 * Converts a JSON object to its string representation.
 * @param {*} jsonObj The input object.
 * @param {?(function(string, *): *)=} opt_replacer A replacer function called
 *     for each (key, value) pair that determines how the value should be
 *     serialized. By default, this just returns the value and allows default
 *     serialization to kick in.
 * @return {string} A JSON string representation of the input object.
 */
bot.json.stringify = JSON.stringify;


/**
 * Parses a JSON string and returns the result.
 * @param {string} jsonStr The string to parse.
 * @return {*} The JSON object.
 * @throws {Error} If the input string is an invalid JSON string.
 */
bot.json.parse = JSON.parse;
