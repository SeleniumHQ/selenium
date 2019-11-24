// Copyright 2016 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.module('goog.net.streams.utils');


/**
 * Returns whether a character is whitespace in the context of parsing JSON
 * stream.
 *
 * TODO(user): 0xa0 for IE?
 *
 * @param {string} c The char to check
 * @return {boolean} true if a char is a whitespace
 */
exports.isJsonWhitespace = function(c) {
  return c == '\r' || c == '\n' || c == ' ' || c == '\t';
};
