// Copyright 2018 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Typedef for JavaScript types that can be JSON serialized.
 */

goog.module('goog.json.Jsonable');

/**
 * @typedef {boolean|number|string}
 */
let Primitive;

/**
 * @typedef {!Primitive|!Array|!Object}
 */
let NestedType;

/**
 * Types that can be JSON serialized. We only check one level deep for Objects
 * and Arrays so it's not checked at compile time whether nested types are
 * correct, and it would be possible for a user to pass in an invalid JSON
 * object. Which would be a bummer.
 * NOTE: If the compiler were to support recursive typedefs, this would be
 * {boolean|number|string|!Object<string, !Jsonable>|!Array<!Jsonable>}.
 * Recursive type checking is supported by @record but not @typedef.
 * @typedef {?Primitive|!Object<string, ?NestedType>|!Array<?NestedType>}
 */
let Jsonable;

exports = Jsonable;
