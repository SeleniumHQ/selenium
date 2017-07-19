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

/**
 * @fileoverview A record declaration to allow ClientRect and other rectangle
 * like objects to be used with goog.math.Rect.
 */

goog.provide('goog.math.IRect');


/**
 * Record for representing rectangular regions, allows compatibility between
 * things like ClientRect and goog.math.Rect.
 *
 * @record
 */
goog.math.IRect = function() {};


/** @type {number} */
goog.math.IRect.prototype.left;


/** @type {number} */
goog.math.IRect.prototype.top;


/** @type {number} */
goog.math.IRect.prototype.width;


/** @type {number} */
goog.math.IRect.prototype.height;
