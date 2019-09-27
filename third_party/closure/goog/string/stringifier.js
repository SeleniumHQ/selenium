// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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


/**
 * @fileoverview Defines an interface for serializing objects into strings.
 */

goog.provide('goog.string.Stringifier');



/**
 * An interface for serializing objects into strings.
 * @interface
 */
goog.string.Stringifier = function() {};


/**
 * Serializes an object or a value to a string.
 * Agnostic to the particular format of object and string.
 *
 * @param {*} object The object to stringify.
 * @return {string} A string representation of the input.
 */
goog.string.Stringifier.prototype.stringify;
