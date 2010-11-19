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
 * @fileoverview A thick wrapper around ellipses.
 * @author robbyw@google.com (Robby Walker)
 */


goog.provide('goog.graphics.ext.Ellipse');

goog.require('goog.graphics.ext.StrokeAndFillElement');



/**
 * Wrapper for a graphics ellipse element.
 * @param {goog.graphics.ext.Group} group Parent for this element.
 * @constructor
 * @extends {goog.graphics.ext.StrokeAndFillElement}
 */
goog.graphics.ext.Ellipse = function(group) {
  // Initialize with some stock values.
  var wrapper = group.getGraphicsImplementation().drawEllipse(1, 1, 2, 2, null,
      null, group.getWrapper());
  goog.graphics.ext.StrokeAndFillElement.call(this, group, wrapper);
};
goog.inherits(goog.graphics.ext.Ellipse,
              goog.graphics.ext.StrokeAndFillElement);


/**
 * Redraw the ellipse.  Called when the coordinate system is changed.
 * @protected
 */
goog.graphics.ext.Ellipse.prototype.redraw = function() {
  goog.graphics.ext.Ellipse.superClass_.redraw.call(this);

  // Our position is already transformed in transform_, but because this is an
  // ellipse we need to position the center.
  var xRadius = this.getWidth() / 2;
  var yRadius = this.getHeight() / 2;
  var wrapper = this.getWrapper();
  wrapper.setCenter(xRadius, yRadius);
  wrapper.setRadius(xRadius, yRadius);
};
