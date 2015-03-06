// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Represents a fill goog.graphics.
 * @author arv@google.com (Erik Arvidsson)
 */


goog.provide('goog.graphics.Fill');



/**
 * Creates a fill object
 * @constructor
 * @deprecated goog.graphics is deprecated. It existed to abstract over browser
 *     differences before the canvas tag was widely supported.  See
 *     http://en.wikipedia.org/wiki/Canvas_element for details.
 */
goog.graphics.Fill = function() {};


/**
 * @return {string} The start color of a gradient fill.
 */
goog.graphics.Fill.prototype.getColor1 = goog.abstractMethod;


/**
 * @return {string} The end color of a gradient fill.
 */
goog.graphics.Fill.prototype.getColor2 = goog.abstractMethod;

