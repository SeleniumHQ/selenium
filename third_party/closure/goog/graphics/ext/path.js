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
 * @fileoverview A thick wrapper around paths.
 * @author robbyw@google.com (Robby Walker)
 */


goog.provide('goog.graphics.ext.Path');

goog.require('goog.graphics.AffineTransform');
goog.require('goog.graphics.Path');
goog.require('goog.math');
goog.require('goog.math.Rect');



/**
 * Creates a path object
 * @constructor
 * @extends {goog.graphics.Path}
 * @final
 */
goog.graphics.ext.Path = function() {
  goog.graphics.Path.call(this);
};
goog.inherits(goog.graphics.ext.Path, goog.graphics.Path);


/**
 * Optional cached or user specified bounding box.  A user may wish to
 * precompute a bounding box to save time and include more accurate
 * computations.
 * @type {goog.math.Rect?}
 * @private
 */
goog.graphics.ext.Path.prototype.bounds_ = null;


/**
 * Clones the path.
 * @return {!goog.graphics.ext.Path} A clone of this path.
 * @override
 */
goog.graphics.ext.Path.prototype.clone = function() {
  var output = /** @type {goog.graphics.ext.Path} */
      (goog.graphics.ext.Path.superClass_.clone.call(this));
  output.bounds_ = this.bounds_ && this.bounds_.clone();
  return output;
};


/**
 * Transforms the path. Only simple paths are transformable. Attempting
 * to transform a non-simple path will throw an error.
 * @param {!goog.graphics.AffineTransform} tx The transformation to perform.
 * @return {!goog.graphics.ext.Path} The path itself.
 * @override
 */
goog.graphics.ext.Path.prototype.transform = function(tx) {
  goog.graphics.ext.Path.superClass_.transform.call(this, tx);

  // Make sure the precomputed bounds are cleared when the path is transformed.
  this.bounds_ = null;

  return this;
};


/**
 * Modify the bounding box of the path.  This may cause the path to be
 * simplified (i.e. arcs converted to curves) as a side-effect.
 * @param {number} deltaX How far to translate the x coordinates.
 * @param {number} deltaY How far to translate the y coordinates.
 * @param {number} xFactor After translation, all x coordinates are multiplied
 *     by this number.
 * @param {number} yFactor After translation, all y coordinates are multiplied
 *     by this number.
 * @return {!goog.graphics.ext.Path} The path itself.
 */
goog.graphics.ext.Path.prototype.modifyBounds = function(deltaX, deltaY,
    xFactor, yFactor) {
  if (!this.isSimple()) {
    var simple = goog.graphics.Path.createSimplifiedPath(this);
    this.clear();
    this.appendPath(simple);
  }

  return this.transform(goog.graphics.AffineTransform.getScaleInstance(
      xFactor, yFactor).translate(deltaX, deltaY));
};


/**
 * Set the precomputed bounds.
 * @param {goog.math.Rect?} bounds The bounds to use, or set to null to clear
 *     and recompute on the next call to getBoundingBox.
 */
goog.graphics.ext.Path.prototype.useBoundingBox = function(bounds) {
  this.bounds_ = bounds && bounds.clone();
};


/**
 * @return {goog.math.Rect?} The bounding box of the path, or null if the
 *     path is empty.
 */
goog.graphics.ext.Path.prototype.getBoundingBox = function() {
  if (!this.bounds_ && !this.isEmpty()) {
    var minY;
    var minX = minY = Number.POSITIVE_INFINITY;
    var maxY;
    var maxX = maxY = Number.NEGATIVE_INFINITY;

    var simplePath = this.isSimple() ? this :
        goog.graphics.Path.createSimplifiedPath(this);
    simplePath.forEachSegment(function(type, points) {
      for (var i = 0, len = points.length; i < len; i += 2) {
        minX = Math.min(minX, points[i]);
        maxX = Math.max(maxX, points[i]);
        minY = Math.min(minY, points[i + 1]);
        maxY = Math.max(maxY, points[i + 1]);
      }
    });

    this.bounds_ = new goog.math.Rect(minX, minY, maxX - minX, maxY - minY);
  }

  return this.bounds_;
};
