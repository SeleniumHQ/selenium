// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Single Element Drag and Drop.
 *
 * Drag and drop implementation for sources/targets consisting of a single
 * element.
 *
 * @author eae@google.com (Emil A Eklund)
 * @see ../demos/dragdrop.html
 */

goog.provide('goog.fx.DragDrop');

goog.require('goog.fx.AbstractDragDrop');
goog.require('goog.fx.DragDropItem');



/**
 * Drag/drop implementation for creating drag sources/drop targets consisting of
 * a single HTML Element.
 *
 * @param {Element|string} element Dom Node, or string representation of node
 *     id, to be used as drag source/drop target.
 * @param {Object=} opt_data Data associated with the source/target.
 * @throws Error If no element argument is provided or if the type is invalid
 * @extends {goog.fx.AbstractDragDrop}
 * @constructor
 * @struct
 */
goog.fx.DragDrop = function(element, opt_data) {
  goog.fx.AbstractDragDrop.call(this);

  var item = new goog.fx.DragDropItem(element, opt_data);
  item.setParent(this);
  this.items_.push(item);
};
goog.inherits(goog.fx.DragDrop, goog.fx.AbstractDragDrop);
