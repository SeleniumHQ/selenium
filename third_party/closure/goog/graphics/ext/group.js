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
 * @fileoverview A thicker wrapper around graphics groups.
 * @author robbyw@google.com (Robby Walker)
 */


goog.provide('goog.graphics.ext.Group');

goog.require('goog.graphics.ext.Element');



/**
 * Wrapper for a graphics group.
 * @param {goog.graphics.ext.Group} group Parent for this element. Can
 *     be null if this is a Graphics instance.
 * @param {goog.graphics.GroupElement=} opt_wrapper The thin wrapper
 *     to wrap. If omitted, a new group will be created. Must be included
 *     when group is null.
 * @constructor
 * @extends {goog.graphics.ext.Element}
 */
goog.graphics.ext.Group = function(group, opt_wrapper) {
  opt_wrapper = opt_wrapper || group.getGraphicsImplementation().createGroup(
      group.getWrapper());
  goog.graphics.ext.Element.call(this, group, opt_wrapper);

  /**
   * Array of child elements this group contains.
   * @type {Array.<goog.graphics.ext.Element>}
   * @private
   */
  this.children_ = [];
};
goog.inherits(goog.graphics.ext.Group, goog.graphics.ext.Element);


/**
 * Add an element to the group.  This should be treated as package local, as
 * it is called by the draw* methods.
 * @param {!goog.graphics.ext.Element} element The element to add.
 * @param {boolean=} opt_chain Whether this addition is part of a longer set
 *     of element additions.
 */
goog.graphics.ext.Group.prototype.addChild = function(element, opt_chain) {
  if (!goog.array.contains(this.children_, element)) {
    this.children_.push(element);
  }

  var transformed = this.growToFit_(element);

  if (element.isParentDependent()) {
    element.parentTransform();
  }

  if (!opt_chain && element.isPendingTransform()) {
    element.reset();
  }

  if (transformed) {
    this.reset();
  }
};


/**
 * Remove an element from the group.
 * @param {goog.graphics.ext.Element} element The element to remove.
 */
goog.graphics.ext.Group.prototype.removeChild = function(element) {
  goog.array.remove(this.children_, element);

  // TODO(robbyw): shape.fireEvent('delete')

  this.getGraphicsImplementation().removeElement(element.getWrapper());
};


/**
 * Calls the given function on each of this component's children in order.  If
 * {@code opt_obj} is provided, it will be used as the 'this' object in the
 * function when called.  The function should take two arguments:  the child
 * component and its 0-based index.  The return value is ignored.
 * @param {Function} f The function to call for every child component; should
 *    take 2 arguments (the child and its index).
 * @param {Object=} opt_obj Used as the 'this' object in f when called.
 */
goog.graphics.ext.Group.prototype.forEachChild = function(f, opt_obj) {
  if (this.children_) {
    goog.array.forEach(this.children_, f, opt_obj);
  }
};


/**
 * @return {goog.graphics.GroupElement} The underlying thin wrapper.
 * @protected
 */
goog.graphics.ext.Group.prototype.getWrapper;


/**
 * Reset the element.
 */
goog.graphics.ext.Group.prototype.reset = function() {
  goog.graphics.ext.Group.superClass_.reset.call(this);

  this.updateChildren();
};


/**
 * Called from the parent class, this method resets any pre-computed positions
 * and sizes.
 * @protected
 */
goog.graphics.ext.Group.prototype.redraw = function() {
  this.getWrapper().setSize(this.getWidth(), this.getHeight());
  this.transformChildren();
};


/**
 * Transform the children that need to be transformed.
 * @protected
 */
goog.graphics.ext.Group.prototype.transformChildren = function() {
  this.forEachChild(function(child) {
    if (child.isParentDependent()) {
      child.parentTransform();
    }
  });
};


/**
 * As part of the reset process, update child elements.
 */
goog.graphics.ext.Group.prototype.updateChildren = function() {
  this.forEachChild(function(child) {
    if (child.isParentDependent() || child.isPendingTransform()) {
      child.reset();
    } else if (child.updateChildren) {
      child.updateChildren();
    }
  });
};


/**
 * When adding an element, grow this group's bounds to fit it.
 * @param {!goog.graphics.ext.Element} element The added element.
 * @return {boolean} Whether the size of this group changed.
 * @private
 */
goog.graphics.ext.Group.prototype.growToFit_ = function(element) {
  var transformed = false;

  var x = element.getMaxX();
  if (x > this.getWidth()) {
    this.setMinWidth(x);
    transformed = true;
  }

  var y = element.getMaxY();
  if (y > this.getHeight()) {
    this.setMinHeight(y);
    transformed = true;
  }

  return transformed;
};


/**
 * @return {number} The width of the element's coordinate space.
 */
goog.graphics.ext.Group.prototype.getCoordinateWidth = function() {
  return this.getWidth();
};


/**
 * @return {number} The height of the element's coordinate space.
 */
goog.graphics.ext.Group.prototype.getCoordinateHeight = function() {
  return this.getHeight();
};


/**
 * Remove all drawing elements from the group.
 */
goog.graphics.ext.Group.prototype.clear = function() {
  while (this.children_.length) {
    this.removeChild(this.children_[0]);
  }
};
