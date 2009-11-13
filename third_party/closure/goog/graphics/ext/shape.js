// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2007 Google Inc. All Rights Reserved.


/**
 * @fileoverview A thick wrapper around shapes with custom paths.
 */


goog.provide('goog.graphics.ext.Shape');

goog.require('goog.graphics.ext.Path');
goog.require('goog.graphics.ext.StrokeAndFillElement');
goog.require('goog.math.Rect');


/**
 * Wrapper for a graphics shape element.
 * @param {goog.graphics.ext.Group} group Parent for this element.
 * @param {goog.graphics.ext.Path} path  The path to draw.
 * @param {boolean} opt_autoSize Optional flag to specify the path should
 *     automatically resize to fit the element.  Defaults to false.
 * @constructor
 * @extends {goog.graphics.ext.StrokeAndFillElement}
 */
goog.graphics.ext.Shape = function(group, path, opt_autoSize) {
  this.autoSize_ = !!opt_autoSize;

  var graphics = group.getGraphicsImplementation();
  var wrapper = graphics.drawPath(path, null, null,
      group.getWrapper());
  goog.graphics.ext.StrokeAndFillElement.call(this, group, wrapper);
  this.setPath(path);
};
goog.inherits(goog.graphics.ext.Shape, goog.graphics.ext.StrokeAndFillElement);


/**
 * Whether or not to automatically resize the shape's path when the element
 * itself is resized.
 * @type {boolean}
 * @private
 */
goog.graphics.ext.Shape.prototype.autoSize_ = false;


/**
 * The original path, specified by the caller.
 * @type {goog.graphics.Path}
 * @private
 */
goog.graphics.ext.Shape.prototype.path_;


/**
 * The bounding box of the original path.
 * @type {goog.math.Rect?}
 * @private
 */
goog.graphics.ext.Shape.prototype.boundingBox_ = null;


/**
 * The scaled path.
 * @type {goog.graphics.Path}
 * @private
 */
goog.graphics.ext.Shape.prototype.scaledPath_;


/**
 * Get the path drawn by this shape.
 * @return {goog.graphics.Path?} The path drawn by this shape.
 */
goog.graphics.ext.Shape.prototype.getPath = function() {
  return this.path_;
};


/**
 * Set the path to draw.
 * @param {goog.graphics.ext.Path} path The path to draw.
 */
goog.graphics.ext.Shape.prototype.setPath = function(path) {
  this.path_ = path;

  if (this.autoSize_) {
    this.boundingBox_ = path.getBoundingBox();
  }

  this.scaleAndSetPath_();
};


/**
 * Scale the internal path to fit.
 * @private
 */
goog.graphics.ext.Shape.prototype.scaleAndSetPath_ = function() {
  this.scaledPath_ = this.boundingBox_ ? this.path_.clone().modifyBounds(
      -this.boundingBox_.left, -this.boundingBox_.top,
      this.getWidth() / (this.boundingBox_.width || 1),
      this.getHeight() / (this.boundingBox_.height || 1)) : this.path_;

  var wrapper = this.getWrapper();
  if (wrapper) {
    wrapper.setPath(this.scaledPath_);
  }
};


/**
 * Redraw the ellipse.  Called when the coordinate system is changed.
 * @protected
 */
goog.graphics.ext.Shape.prototype.redraw = function() {
  goog.graphics.ext.Shape.superClass_.redraw.call(this);
  if (this.autoSize_) {
    this.scaleAndSetPath_();
  }
};


/**
 * @return {boolean} Whether the shape is parent dependent.
 * @protected
 */
goog.graphics.ext.Shape.prototype.checkParentDependent = function() {
  return this.autoSize_ ||
      goog.graphics.ext.Shape.superClass_.checkParentDependent.call(this);
};
