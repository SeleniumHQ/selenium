// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is dihstributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * @fileoverview A class that attempts parse/serialize JSON using native JSON,
 *     falling back to goog.json if necessary.
 * @author nnaze@google.com (Nathan Naze)
 */

goog.provide('goog.json.HybridJsonProcessor');

goog.require('goog.json.Processor');
goog.require('goog.json.hybrid');



/**
 * Processor form of goog.json.hybrid, which attempts to parse/serialize
 * JSON using native JSON methods, falling back to goog.json if not
 * available.
 * @constructor
 * @implements {goog.json.Processor}
 * @final
 */
goog.json.HybridJsonProcessor = function() {};


/** @override */
goog.json.HybridJsonProcessor.prototype.stringify =
    /** @type {function (*): string} */ (goog.json.hybrid.stringify);


/** @override */
goog.json.HybridJsonProcessor.prototype.parse =
    /** @type {function (*): !Object} */ (goog.json.hybrid.parse);
