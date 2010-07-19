// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A DragListGroup is a class representing a group of one or more
 * "drag lists" with items that can be dragged within them and between them.
 *
*
 * @see ../demos/draglistgroup.html
 */


goog.provide('goog.fx.DragListDirection');
goog.provide('goog.fx.DragListGroup');
goog.provide('goog.fx.DragListGroupEvent');

goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.classes');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.fx.Dragger');
goog.require('goog.fx.Dragger.EventType');
goog.require('goog.math.Coordinate');
goog.require('goog.style');


/**
 * A class representing a group of one or more "drag lists" with items that can
 * be dragged within them and between them.
 *
 * Example usage:
 *   var dragListGroup = new goog.fx.DragListGroup();
 *   dragListGroup.setDragItemHandleHoverClass(className1);
 *   dragListGroup.setDraggerElClass(className2);
 *   dragListGroup.addDragList(vertList, goog.fx.DragListDirection.DOWN);
 *   dragListGroup.addDragList(horizList, goog.fx.DragListDirection.RIGHT);
 *   dragListGroup.init();
 *
 * @extends {goog.events.EventTarget}
 * @constructor
 */
goog.fx.DragListGroup = function() {
  goog.events.EventTarget.call(this);

  /**
   * The drag lists.
   * @type {Array.<Element>}
   * @private
   */
  this.dragLists_ = [];

  /**
   * All the drag items. Set by init().
   * @type {Array.<Element>}
   * @private
   */
  this.dragItems_ = [];

  /**
   * Which drag item corresponds to a given handle.  Set by init().
   * Specifically, this maps from the unique ID (as given by goog.getUid)
   * of the handle to the drag item.
   * @type {Object}
   * @private
   */
  this.dragItemForHandle_ = {};

  /**
   * The event handler for this instance.
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler(this);

  /**
   * Whether the setup has been done to make all items in all lists draggable.
   * @type {boolean}
   * @private
   */
  this.isInitialized_ = false;

};
goog.inherits(goog.fx.DragListGroup, goog.events.EventTarget);



/**
 * Enum to indicate the direction that a drag list grows.
 * @enum {number}
 */
goog.fx.DragListDirection = {
  DOWN: 0,  // common
  UP: 1,  // very rare
  RIGHT: 2,  // common
  LEFT: 3  // uncommon (except perhaps for right-to-left interfaces)
};


/**
 * Events dispatched by this class.
 * @type {Object}
 */
goog.fx.DragListGroup.EventType = {
  BEFOREDRAGSTART: 'beforedragstart',
  DRAGSTART: 'dragstart',
  BEFOREDRAGMOVE: 'beforedragmove',
  DRAGMOVE: 'dragmove',
  BEFOREDRAGEND: 'beforedragend',
  DRAGEND: 'dragend'
};


// The next 4 are user-supplied CSS classes.

/**
 * The user-supplied CSS class to add to a drag item on hover (not during a
 * drag action).
 * @type {string|undefined}
 * @private
 */
goog.fx.DragListGroup.prototype.dragItemHoverClass_;


/**
 * The user-supplied CSS class to add to a drag item handle on hover (not
 * during a drag action).
 * @type {string|undefined}
 * @private
 */
goog.fx.DragListGroup.prototype.dragItemHandleHoverClass_;


/**
 * The user-supplied CSS class to add to the current drag item (during a
 * drag action).
 * @type {string|undefined}
 * @private
 */
goog.fx.DragListGroup.prototype.currDragItemClass_;


/**
 * The user-supplied CSS class to add to the clone of the current drag item
 * that's actually being dragged around (during a drag action).
 * @type {string|undefined}
 * @private
 */
goog.fx.DragListGroup.prototype.draggerElClass_;


// The next 5 are info applicable during a drag action.

/**
 * The current drag item being moved.
 * Note: This is only defined while a drag action is happening.
 * @type {Element}
 * @private
 */
goog.fx.DragListGroup.prototype.currDragItem_;


/**
 * The original drag list that the current drag item came from. We need to
 * remember this in case the user drops the item outside of any lists, in which
 * case we return the item to its original location.
 * Note: This is only defined while a drag action is happening.
 * @type {Element}
 * @private
 */
goog.fx.DragListGroup.prototype.origList_;


/**
 * The original next item in the original list that the current drag item came
 * from. We need to remember this in case the user drops the item outside of
 * any lists, in which case we return the item to its original location.
 * Note: This is only defined while a drag action is happening.
 * @type {Element}
 * @private
 */
goog.fx.DragListGroup.prototype.origNextItem_;


/**
 * The clone of the current drag item that's actually being dragged around.
 * Note: This is only defined while a drag action is happening.
 * @type {Element}
 * @private
 */
goog.fx.DragListGroup.prototype.draggerEl_;


/**
 * The dragger object.
 * Note: This is only defined while a drag action is happening.
 * @type {goog.fx.Dragger}
 * @private
 */
goog.fx.DragListGroup.prototype.dragger_;



/**
 * Adds a drag list to this DragListGroup.
 * All calls to this method must happen before the call to init().
 * Remember that all child nodes (except text nodes) will be made draggable to
 * any other drag list in this group.
 *
 * @param {Element} dragListElement Must be a container for a list of items
 *     that should all be made draggable.
 * @param {goog.fx.DragListDirection} growthDirection The direction that this
 *     drag list grows in (i.e.. if an item is added, the list's bounding box
 *     expands in this direction).
 * @param {boolean=} opt_isDocOrderSameAsGrowthDirection Defaults to true.
 *     Whether or not the ordering of this drag list's items in the document
 *     is the same as the list's growth direction.
 * @param {string=} opt_dragHoverClass CSS class to apply to this drag list when
 *     the draggerEl hovers over it during a drag action.
 */
goog.fx.DragListGroup.prototype.addDragList = function(
    dragListElement, growthDirection, opt_isDocOrderSameAsGrowthDirection,
    opt_dragHoverClass) {
  this.assertNotInitialized_();

  dragListElement.dlgGrowthDirection_ = growthDirection;
  dragListElement.dlgIsDocOrderSameAsGrowthDirection_ =
      opt_isDocOrderSameAsGrowthDirection !== false;
  dragListElement.dlgDragHoverClass_ = opt_dragHoverClass;
  this.dragLists_.push(dragListElement);
};


/**
 * Sets a user-supplied function used to get the "handle" element for a drag
 * item. The function must accept exactly one argument. The argument may be
 * any drag item element.
 *
 * If not set, the default implementation uses the whole drag item as the
 * handle.
 *
 * @param {function(Element): Element} getHandleForDragItemFn A function that,
 *     given any drag item, returns a reference to its "handle" element
 *     (which may be the drag item element itself).
 */
goog.fx.DragListGroup.prototype.setFunctionToGetHandleForDragItem = function(
    getHandleForDragItemFn) {
  this.assertNotInitialized_();
  this.getHandleForDragItem_ = getHandleForDragItemFn;
};


/**
 * Sets a user-supplied CSS class to add to a drag item on hover (not during a
 * drag action).
 * @param {string} dragItemHoverClass The CSS class.
 */
goog.fx.DragListGroup.prototype.setDragItemHoverClass = function(
    dragItemHoverClass) {
  this.assertNotInitialized_();
  this.dragItemHoverClass_ = dragItemHoverClass;
};


/**
 * Sets a user-supplied CSS class to add to a drag item handle on hover (not
 * during a drag action).
 * @param {string} dragItemHandleHoverClass The CSS class.
 */
goog.fx.DragListGroup.prototype.setDragItemHandleHoverClass = function(
    dragItemHandleHoverClass) {
  this.assertNotInitialized_();
  this.dragItemHandleHoverClass_ = dragItemHandleHoverClass;
};


/**
 * Sets a user-supplied CSS class to add to the current drag item (during a
 * drag action).
 *
 * If not set, the default behavior adds visibility:hidden to the current drag
 * item so that it is a block of empty space in the hover drag list (if any).
 * If this class is set by the user, then the default behavior does not happen
 * (unless, of course, the class also contains visibility:hidden).
 *
 * @param {string} currDragItemClass The CSS class.
 */
goog.fx.DragListGroup.prototype.setCurrDragItemClass = function(
    currDragItemClass) {
  this.assertNotInitialized_();
  this.currDragItemClass_ = currDragItemClass;
};


/**
 * Sets a user-supplied CSS class to add to the clone of the current drag item
 * that's actually being dragged around (during a drag action).
 * @param {string} draggerElClass The CSS class.
 */
goog.fx.DragListGroup.prototype.setDraggerElClass = function(draggerElClass) {
  this.assertNotInitialized_();
  this.draggerElClass_ = draggerElClass;
};


/**
 * Performs the initial setup to make all items in all lists draggable.
 */
goog.fx.DragListGroup.prototype.init = function() {
  if (this.isInitialized_) {
    return;
  }

  for (var i = 0, numLists = this.dragLists_.length; i < numLists; i++) {
    var dragList = this.dragLists_[i];

    var dragItems = this.getItemsInDragList_(dragList);
    for (var j = 0, numItems = dragItems.length; j < numItems; ++j) {
      var dragItem = dragItems[j];
      var dragItemHandle = this.getHandleForDragItem_(dragItem);

      var uid = goog.getUid(dragItemHandle);
      this.dragItemForHandle_[uid] = dragItem;

      if (this.dragItemHoverClass_) {
        this.eventHandler_.listen(
            dragItem, goog.events.EventType.MOUSEOVER,
            this.handleDragItemMouseover_);
        this.eventHandler_.listen(
            dragItem, goog.events.EventType.MOUSEOUT,
            this.handleDragItemMouseout_);
      }
      if (this.dragItemHandleHoverClass_) {
        this.eventHandler_.listen(
            dragItemHandle, goog.events.EventType.MOUSEOVER,
            this.handleDragItemHandleMouseover_);
        this.eventHandler_.listen(
            dragItemHandle, goog.events.EventType.MOUSEOUT,
            this.handleDragItemHandleMouseout_);
      }

      this.dragItems_.push(dragItem);
      this.eventHandler_.listen(
          dragItemHandle, goog.events.EventType.MOUSEDOWN,
          this.handleDragStart_);
    }
  }

  this.isInitialized_ = true;
};


/**
 * Disposes of the DragListGroup.
 */
goog.fx.DragListGroup.prototype.disposeInternal = function() {
  this.eventHandler_.dispose();

  for (var i = 0, n = this.dragLists_.length; i < n; i++) {
    var dragList = this.dragLists_[i];
    // Note: IE doesn't allow 'delete' for fields on HTML elements (because
    // they're not real JS objects in IE), so we just set them to undefined.
    dragList.dlgGrowthDirection_ = undefined;
    dragList.dlgIsDocOrderSameAsGrowthDirection_ = undefined;
    dragList.dlgDragHoverClass_ = undefined;
  }

  this.dragLists_.length = 0;
  this.dragItems_.length = 0;
  this.dragItemForHandle_ = null;

  goog.fx.DragListGroup.superClass_.disposeInternal.call(this);
};



/**
 * Handles the start of a drag action (i.e. MOUSEDOWN on any drag item).
 *
 * @param {goog.events.BrowserEvent} e Event object fired on a drag item handle.
 * @return {boolean} Whether the event was handled.
 * @private
 */
goog.fx.DragListGroup.prototype.handleDragStart_ = function(e) {

  var uid = goog.getUid(/** @type {Node} */ (e.currentTarget));
  var currDragItem = /** @type {Element} */ (this.dragItemForHandle_[uid]);

  var rv = this.dispatchEvent(
      new goog.fx.DragListGroupEvent(
          goog.fx.DragListGroup.EventType.BEFOREDRAGSTART, this, e,
          currDragItem, null, null));
  if (!rv) {
    return false;
  }

  this.currDragItem_ = currDragItem;

  // Record the original location of the current drag item.
  // Note: this.origNextItem_ may be null.
  this.origList_ = /** @type {Element} */ (currDragItem.parentNode);
  this.origNextItem_ = goog.dom.getNextElementSibling(currDragItem);

  // Create a clone for dragging.
  var draggerEl = this.cloneNode_(currDragItem);
  this.draggerEl_ = draggerEl;

  // If there's a CSS class specified for the current drag item, add it.
  // Otherwise, make the actual current drag item hidden (takes up space).
  if (this.currDragItemClass_) {
    goog.dom.classes.add(currDragItem, this.currDragItemClass_);
  } else {
    currDragItem.style.visibility = 'hidden';
  }

  // Add CSS class for the clone, if any.
  if (this.draggerElClass_) {
    goog.dom.classes.add(draggerEl, this.draggerElClass_);
  }

  // Place the clone (i.e. draggerEl) at the same position as the actual
  // current drag item. This is a bit tricky since
  //   goog.style.getPageOffset() gets the left-top pos of the border, but
  //   goog.style.setPageOffset() sets the left-top pos of the margin.
  // It's difficult to adjust for the margins of the clone because it's
  // difficult to read it: goog.style.getComputedStyle() doesn't work for IE.
  // Instead, our workaround is simply to set the clone's margins to 0px.
  draggerEl.style.margin = '0px';
  draggerEl.style.position = 'absolute';
  goog.dom.getOwnerDocument(currDragItem).body.appendChild(draggerEl);
  // Important: goog.style.setPageOffset() only works correctly for IE when the
  // element is already in the document.
  var currDragItemPos = goog.style.getPageOffset(currDragItem);
  goog.style.setPageOffset(draggerEl, currDragItemPos);

  // Precompute distances from top-left corner to center for efficiency.
  var draggerElSize = goog.style.getSize(draggerEl);
  draggerEl.halfWidth = draggerElSize.width / 2;
  draggerEl.halfHeight = draggerElSize.height / 2;

  // Record the bounds of all the drag lists and all the other drag items, in
  // the state where the current drag item is not in any of the lists. (This
  // caching is for efficiency, so that we don't have to recompute the bounds
  // on each drag move.)
  currDragItem.style.display = 'none';
  for (var i = 0, n = this.dragLists_.length; i < n; i++) {
    var dragList = this.dragLists_[i];
    dragList.dlgBounds_ = goog.style.getBounds(dragList);
  }
  for (var i = 0, n = this.dragItems_.length; i < n; i++) {
    var dragItem = this.dragItems_[i];
    if (dragItem != currDragItem) {
      dragItem.dlgBounds_ = goog.style.getBounds(dragItem);
    }
  }
  currDragItem.style.display = '';

  // Create the dragger object.
  this.dragger_ = new goog.fx.Dragger(draggerEl);

  // Listen to events on the dragger.
  this.eventHandler_.listen(
      this.dragger_, goog.fx.Dragger.EventType.DRAG, this.handleDragMove_);
  this.eventHandler_.listen(
      this.dragger_, goog.fx.Dragger.EventType.END, this.handleDragEnd_);

  // Manually start up the dragger.
  this.dragger_.startDrag(e);

  this.dispatchEvent(
      new goog.fx.DragListGroupEvent(
          goog.fx.DragListGroup.EventType.DRAGSTART, this, e,
          currDragItem, draggerEl, this.dragger_));

  return true;
};


/**
 * Handles a drag movement (i.e. DRAG event fired by the dragger).
 *
 * @param {goog.fx.DragEvent} dragEvent Event object fired by the dragger.
 * @return {boolean} The return value for the event.
 * @private
 */
goog.fx.DragListGroup.prototype.handleDragMove_ = function(dragEvent) {

  // Compute the center of the dragger element (i.e. the cloned drag item).
  var draggerElPos = goog.style.getPageOffset(this.draggerEl_);
  var draggerElCenter = new goog.math.Coordinate(
      draggerElPos.x + this.draggerEl_.halfWidth,
      draggerElPos.y + this.draggerEl_.halfHeight);

  // Check whether the center is hovering over one of the drag lists.
  var hoverList = this.getHoverDragList_(draggerElCenter);

  // If hovering over a list, find the next item (if drag were to end now).
  var hoverNextItem =
      hoverList ? this.getHoverNextItem_(hoverList, draggerElCenter) : null;

  var rv = this.dispatchEvent(
      new goog.fx.DragListGroupEvent(
          goog.fx.DragListGroup.EventType.BEFOREDRAGMOVE, this, dragEvent,
          this.currDragItem_, this.draggerEl_, this.dragger_,
          draggerElCenter, hoverList, hoverNextItem));
  if (!rv) {
    return false;
  }

  if (hoverList) {
    this.insertCurrDragItem_(hoverList, hoverNextItem);
    this.currDragItem_.style.display = '';
    // Add drag list's hover class (if any).
    if (hoverList.dlgDragHoverClass_) {
      goog.dom.classes.add(hoverList, hoverList.dlgDragHoverClass_);
    }

  } else {
    // Not hovering over a drag list, so remove the item altogether.
    this.currDragItem_.style.display = 'none';
    // Remove hover classes (if any) from all drag lists.
    for (var i = 0, n = this.dragLists_.length; i < n; i++) {
      var dragList = this.dragLists_[i];
      if (dragList.dlgDragHoverClass_) {
        goog.dom.classes.remove(dragList, dragList.dlgDragHoverClass_);
      }
    }
  }

  this.dispatchEvent(
      new goog.fx.DragListGroupEvent(
          goog.fx.DragListGroup.EventType.DRAGMOVE, this, dragEvent,
          /** @type {Element} */ (this.currDragItem_),
          this.draggerEl_, this.dragger_,
          draggerElCenter, hoverList, hoverNextItem));

  // Return false to prevent selection due to mouse drag.
  return false;
};


/**
 * Handles the end of a drag action (i.e. END event fired by the dragger).
 *
 * @param {goog.fx.DragEvent} dragEvent Event object fired by the dragger.
 * @return {boolean} Whether the event was handled.
 * @private
 */
goog.fx.DragListGroup.prototype.handleDragEnd_ = function(dragEvent) {

  var rv = this.dispatchEvent(
      new goog.fx.DragListGroupEvent(
          goog.fx.DragListGroup.EventType.BEFOREDRAGEND, this, dragEvent,
          /** @type {Element} */ (this.currDragItem_),
          this.draggerEl_, this.dragger_));
  if (!rv) {
    return false;
  }

  // Disposes of the dragger and remove the cloned drag item.
  this.dragger_.dispose();
  goog.dom.removeNode(this.draggerEl_);

  // If the current drag item is not in any list, put it back in its original
  // location.
  if (this.currDragItem_.style.display == 'none') {
    // Note: this.origNextItem_ may be null, but insertBefore() still works.
    this.origList_.insertBefore(this.currDragItem_, this.origNextItem_);
    this.currDragItem_.style.display = '';
  }

  // If there's a CSS class specified for the current drag item, remove it.
  // Otherwise, make the current drag item visible (instead of empty space).
  if (this.currDragItemClass_) {
    goog.dom.classes.remove(this.currDragItem_, this.currDragItemClass_);
  } else {
    this.currDragItem_.style.visibility = 'visible';
  }

  // Remove hover classes (if any) from all drag lists.
  for (var i = 0, n = this.dragLists_.length; i < n; i++) {
    var dragList = this.dragLists_[i];
    if (dragList.dlgDragHoverClass_) {
      goog.dom.classes.remove(dragList, dragList.dlgDragHoverClass_);
    }
  }

  this.dispatchEvent(
      new goog.fx.DragListGroupEvent(
          goog.fx.DragListGroup.EventType.DRAGEND, this, dragEvent,
          this.currDragItem_, this.draggerEl_, this.dragger_));

  // Clear all our temporary fields that are only defined while dragging.
  this.currDragItem_ = null;
  this.origList_ = null;
  this.origNextItem_ = null;
  this.draggerEl_ = null;
  this.dragger_ = null;

  // Clear all the bounds info stored on the drag lists and drag elements.
  // Note: IE doesn't allow 'delete' for fields on HTML elements (because
  // they're not real JS objects in IE), so we just set them to undefined.
  for (var i = 0, n = this.dragLists_.length; i < n; i++) {
    this.dragLists_[i].dlgBounds_ = null;
  }
  for (var i = 0, n = this.dragItems_.length; i < n; i++) {
    this.dragItems_[i].dlgBounds_ = null;
  }

  return true;
};



/**
 * Asserts that this DragListGroup instance is not yet initialized.
 * @throws {Error} If this DragListGroup is already initialized.
 * @private
 */
goog.fx.DragListGroup.prototype.assertNotInitialized_ = function() {
  if (this.isInitialized_) {
    throw Error('This action is not allowed after calling init().');
  }
};


/**
 * Default implementation of the function to get the "handle" element for a
 * drag item. By default, we use the whole drag item as the handle. Users can
 * change this by calling setFunctionToGetHandleForDragItem().
 *
 * @param {Element} dragItem The drag item to get the handle for.
 * @return {Element} The dragItem element itself.
 * @private
 */
goog.fx.DragListGroup.prototype.getHandleForDragItem_ = function(dragItem) {
  return dragItem;
};


/**
 * Handles a MOUSEOVER event fired on a drag item.
 * @param {goog.events.BrowserEvent} e The event.
 * @private
 */
goog.fx.DragListGroup.prototype.handleDragItemMouseover_ = function(e) {
  goog.dom.classes.add(/** @type {Element} */ (e.currentTarget),
      this.dragItemHoverClass_);
};


/**
 * Handles a MOUSEOUT event fired on a drag item.
 * @param {goog.events.BrowserEvent} e The event.
 * @private
 */
goog.fx.DragListGroup.prototype.handleDragItemMouseout_ = function(e) {
  goog.dom.classes.remove(/** @type {Element} */ (e.currentTarget),
      this.dragItemHoverClass_);
};


/**
 * Handles a MOUSEOVER event fired on the handle element of a drag item.
 * @param {goog.events.BrowserEvent} e The event.
 * @private
 */
goog.fx.DragListGroup.prototype.handleDragItemHandleMouseover_ = function(e) {
  goog.dom.classes.add(/** @type {Element} */ (e.currentTarget),
      this.dragItemHandleHoverClass_);
};


/**
 * Handles a MOUSEOUT event fired on the handle element of a drag item.
 * @param {goog.events.BrowserEvent} e The event.
 * @private
 */
goog.fx.DragListGroup.prototype.handleDragItemHandleMouseout_ = function(e) {
  goog.dom.classes.remove(/** @type {Element} */ (e.currentTarget),
      this.dragItemHandleHoverClass_);
};


/**
 * Gets the drag items currently in the given drag list.
 * Note: Any drag item can potentially be moved to any drag list.
 *
 * @param {Element} dragList The drag list to get drag items from.
 * @return {Array.<Element>} The drag items currently in the given drag list.
 * @private
 */
goog.fx.DragListGroup.prototype.getItemsInDragList_ = function(dragList) {
  var dragItems = [];
  var childNodes = dragList.childNodes;
  for (var i = 0, n = childNodes.length; i < n; i++) {
    if (childNodes[i].nodeType == goog.dom.NodeType.ELEMENT) {
      dragItems.push(childNodes[i]);
    }
  }
  return dragItems;
};


/**
 * Helper for handleDragMove_().
 * Given the position of the center of the dragger element, figures out whether
 * it's currently hovering over any of the drag lists.
 *
 * @param {goog.math.Coordinate} draggerElCenter The center position of the
 *     dragger element.
 * @return {Element} If currently hovering over a drag list, returns the drag
 *     list element. Else returns null.
 * @private
 */
goog.fx.DragListGroup.prototype.getHoverDragList_ = function(draggerElCenter) {

  // If the current drag item was in a list last time we did this, then check
  // that same list first.
  var prevHoverList = null;
  if (this.currDragItem_.style.display != 'none') {
    prevHoverList = /** @type {Element} */ (this.currDragItem_.parentNode);
    // Important: We can't use the cached bounds for this list because the
    // cached bounds are based on the case where the current drag item is not
    // in the list. Since the current drag item is known to be in this list, we
    // must recompute the list's bounds.
    var prevHoverListBounds = goog.style.getBounds(prevHoverList);
    if (this.isInRect_(draggerElCenter, prevHoverListBounds)) {
      return prevHoverList;
    }
  }

  for (var i = 0, n = this.dragLists_.length; i < n; i++) {
    var dragList = this.dragLists_[i];
    if (dragList == prevHoverList) {
      continue;
    }
    if (this.isInRect_(draggerElCenter, dragList.dlgBounds_)) {
      return dragList;
    }
  }

  return null;
};


/**
 * Checks whether a coordinate position resides inside a rectangle.
 * @param {goog.math.Coordinate} pos The coordinate position.
 * @param {goog.math.Rect} rect The rectangle.
 * @return {boolean} True if 'pos' is within the bounds of 'rect'.
 * @private
 */
goog.fx.DragListGroup.prototype.isInRect_ = function(pos, rect) {
  return pos.x > rect.left && pos.x < rect.left + rect.width &&
         pos.y > rect.top && pos.y < rect.top + rect.height;
};


/**
 * Helper for handleDragMove_().
 * Given the position of the center of the dragger element, plus the drag list
 * that it's currently hovering over, figures out the next drag item in the
 * list that follows the current position of the dragger element. (I.e. if
 * the drag action ends right now, it would become the item after the current
 * drag item.)
 *
 * @param {Element} hoverList The drag list that we're hovering over.
 * @param {goog.math.Coordinate} draggerElCenter The center position of the
 *     dragger element.
 * @return {Element} Returns the earliest item in the hover list that belongs
 *     after the current position of the dragger element. If all items in the
 *     list should come before the current drag item, then returns null.
 * @private
 */
goog.fx.DragListGroup.prototype.getHoverNextItem_ = function(
    hoverList, draggerElCenter) {
  if (hoverList == null) {
    throw Error('getHoverNextItem_ called with null hoverList.');
  }

  // The definition of what it means for the draggerEl to be "before" a given
  // item in the hover drag list is not always the same. It changes based on
  // the growth direction of the hover drag list in question.
  /** @type {number} */
  var relevantCoord;
  var getRelevantBoundFn;
  var isBeforeFn;
  switch (hoverList.dlgGrowthDirection_) {
    case goog.fx.DragListDirection.DOWN:
      // "Before" means draggerElCenter.y is less than item's bottom y-value.
      relevantCoord = draggerElCenter.y;
      getRelevantBoundFn = goog.fx.DragListGroup.getBottomBound_;
      isBeforeFn = goog.fx.DragListGroup.isLessThan_;
      break;
    case goog.fx.DragListDirection.UP:
      // "Before" means draggerElCenter.y is greater than item's top y-value.
      relevantCoord = draggerElCenter.y;
      getRelevantBoundFn = goog.fx.DragListGroup.getTopBound_;
      isBeforeFn = goog.fx.DragListGroup.isGreaterThan_;
      break;
    case goog.fx.DragListDirection.RIGHT:
      // "Before" means draggerElCenter.x is less than item's right x-value.
      relevantCoord = draggerElCenter.x;
      getRelevantBoundFn = goog.fx.DragListGroup.getRightBound_;
      isBeforeFn = goog.fx.DragListGroup.isLessThan_;
      break;
    case goog.fx.DragListDirection.LEFT:
      // "Before" means draggerElCenter.x is greater than item's left x-value.
      relevantCoord = draggerElCenter.x;
      getRelevantBoundFn = goog.fx.DragListGroup.getLeftBound_;
      isBeforeFn = goog.fx.DragListGroup.isGreaterThan_;
      break;
  }

  // This holds the earliest drag item found so far that should come after
  // this.currDragItem_ in the hover drag list (based on draggerElCenter).
  var earliestAfterItem = null;
  // This is the position of the relevant bound for the earliestAfterItem,
  // where "relevant" is determined by the growth direction of hoverList.
  var earliestAfterItemRelevantBound;

  var hoverListItems = this.getItemsInDragList_(hoverList);
  for (var i = 0, n = hoverListItems.length; i < n; i++) {
    var item = hoverListItems[i];
    if (item == this.currDragItem_) {
      continue;
    }

    var relevantBound = getRelevantBoundFn(item.dlgBounds_);
    if (isBeforeFn(relevantCoord, relevantBound) &&
        (earliestAfterItemRelevantBound == undefined ||
         isBeforeFn(relevantBound, earliestAfterItemRelevantBound))) {
      earliestAfterItem = item;
      earliestAfterItemRelevantBound = relevantBound;
    }
  }

  return earliestAfterItem;
};


/**
 * Private helper for getHoverNextItem_().
 * Given the bounds of an item, computes the item's bottom y-value.
 * @param {goog.math.Rect} itemBounds The bounds of the item.
 * @return {number} The item's bottom y-value.
 * @private
 */
goog.fx.DragListGroup.getBottomBound_ = function(itemBounds) {
  return itemBounds.top + itemBounds.height - 1;
};

/**
 * Private helper for getHoverNextItem_().
 * Given the bounds of an item, computes the item's top y-value.
 * @param {goog.math.Rect} itemBounds The bounds of the item.
 * @return {number} The item's top y-value.
 * @private
 */
goog.fx.DragListGroup.getTopBound_ = function(itemBounds) {
  return itemBounds.top || 0;
};

/**
 * Private helper for getHoverNextItem_().
 * Given the bounds of an item, computes the item's right x-value.
 * @param {goog.math.Rect} itemBounds The bounds of the item.
 * @return {number} The item's right x-value.
 * @private
 */
goog.fx.DragListGroup.getRightBound_ = function(itemBounds) {
  return itemBounds.left + itemBounds.width - 1;
};

/**
 * Private helper for getHoverNextItem_().
 * Given the bounds of an item, computes the item's left x-value.
 * @param {goog.math.Rect} itemBounds The bounds of the item.
 * @return {number} The item's left x-value.
 * @private
 */
goog.fx.DragListGroup.getLeftBound_ = function(itemBounds) {
  return itemBounds.left || 0;
};

/**
 * Private helper for getHoverNextItem_().
 * @param {number} a Number to compare.
 * @param {number} b Number to compare.
 * @return {boolean} Whether a is less than b.
 * @private
 */
goog.fx.DragListGroup.isLessThan_ = function(a, b) {
  return a < b;
};

/**
 * Private helper for getHoverNextItem_().
 * @param {number} a Number to compare.
 * @param {number} b Number to compare.
 * @return {boolean} Whether a is greater than b.
 * @private
 */
goog.fx.DragListGroup.isGreaterThan_ = function(a, b) {
  return a > b;
};


/**
 * Inserts the current drag item to the appropriate location in the drag list
 * that we're hovering over (if the current drag item is not already there).
 *
 * @param {Element} hoverList The drag list we're hovering over.
 * @param {Element} hoverNextItem The next item in the hover drag list.
 * @private
 */
goog.fx.DragListGroup.prototype.insertCurrDragItem_ = function(
    hoverList, hoverNextItem) {

  if (hoverList.dlgIsDocOrderSameAsGrowthDirection_) {
    if (this.currDragItem_.parentNode != hoverList ||
        goog.dom.getNextElementSibling(this.currDragItem_) != hoverNextItem) {
      // The current drag item is not in the correct location, so we move it.
      // Note: hoverNextItem may be null, but insertBefore() still works.
      hoverList.insertBefore(this.currDragItem_, hoverNextItem);
    }

  } else {
    // Since the doc order of the items is actually the reverse order of the
    // drag list's growth direction, we need to insert AFTER the hoverNextItem.
    if (!hoverNextItem) {
      // Insert after a non-existent item: actually means insert at beginning.
      hoverList.insertBefore(this.currDragItem_,
          goog.dom.getFirstElementChild(hoverList));
    } else {
      var actualNextItem = goog.dom.getNextElementSibling(hoverNextItem);
      // Note: actualNextItem may be null, but insertBefore() still works.
      hoverList.insertBefore(this.currDragItem_, actualNextItem);
    }
  }
};


/**
 * Note: Copied from abstractdragdrop.js. TODO(user): consolidate.
 * Creates copy of node being dragged.
 *
 * @param {Element} sourceEl Element to copy.
 * @return {Element} The clone of {@code sourceEl}.
 * @private
 */
goog.fx.DragListGroup.prototype.cloneNode_ = function(sourceEl) {
  var clonedEl = /** @type {Element} */ (sourceEl.cloneNode(true));
  switch (sourceEl.tagName.toLowerCase()) {
    case 'tr':
      return goog.dom.createDom(
          'table', null, goog.dom.createDom('tbody', null, clonedEl));
    case 'td':
    case 'th':
      return goog.dom.createDom(
          'table', null, goog.dom.createDom('tbody', null, goog.dom.createDom(
          'tr', null, clonedEl)));
    default:
      return clonedEl;
  }
};



/**
 * The event object dispatched by DragListGroup.
 * The fields draggerElCenter, hoverList, and hoverNextItem are only available
 * for the BEFOREDRAGMOVE and DRAGMOVE events.
 *
 * @param {string} type The event type string.
 * @param {goog.fx.DragListGroup} dragListGroup A reference to the associated
 *     DragListGroup object.
 * @param {goog.events.BrowserEvent|goog.fx.DragEvent} event The event fired
 *     by the browser or fired by the dragger.
 * @param {Element} currDragItem The current drag item being moved.
 * @param {Element} draggerEl The clone of the current drag item that's actually
 *     being dragged around.
 * @param {goog.fx.Dragger} dragger The dragger object.
 * @param {goog.math.Coordinate=} opt_draggerElCenter The current center
 *     position of the draggerEl.
 * @param {Element=} opt_hoverList The current drag list that's being hovered
 *     over, or null if the center of draggerEl is outside of any drag lists.
 *     If not null and the drag action ends right now, then currDragItem will
 *     end up in this list.
 * @param {Element=} opt_hoverNextItem The current next item in the hoverList
 *     that the draggerEl is hovering over. (I.e. If the drag action ends
 *     right now, then this item would become the next item after the new
 *     location of currDragItem.) May be null if not applicable or if
 *     currDragItem would be added to the end of hoverList.
 * @constructor
 */
goog.fx.DragListGroupEvent = function(
    type, dragListGroup, event, currDragItem, draggerEl, dragger,
    opt_draggerElCenter, opt_hoverList, opt_hoverNextItem) {

  /**
   * The event type string.
   * @type {string}
   */
  this.type = type;

  /**
   * A reference to the associated DragListGroup object.
   * @type {goog.fx.DragListGroup}
   */
  this.dragListGroup = dragListGroup;

  /**
   * The event fired by the browser or fired by the dragger.
   * @type {goog.events.BrowserEvent|goog.fx.DragEvent}
   */
  this.event = event;

  /**
   * The current drag item being move.
   * @type {Element}
   */
  this.currDragItem = currDragItem;

  /**
   * The clone of the current drag item that's actually being dragged around.
   * @type {Element}
   */
  this.draggerEl = draggerEl;

  /**
   * The dragger object.
   * @type {goog.fx.Dragger}
   */
  this.dragger = dragger;

  /**
   * The current center position of the draggerEl.
   * @type {goog.math.Coordinate|undefined}
   */
  this.draggerElCenter = opt_draggerElCenter;

  /**
   * The current drag list that's being hovered over, or null if the center of
   * draggerEl is outside of any drag lists. (I.e. If not null and the drag
   * action ends right now, then currDragItem will end up in this list.)
   * @type {Element|undefined}
   */
  this.hoverList = opt_hoverList;

  /**
   * The current next item in the hoverList that the draggerEl is hovering over.
   * (I.e. If the drag action ends right now, then this item would become the
   * next item after the new location of currDragItem.) May be null if not
   * applicable or if currDragItem would be added to the end of hoverList.
   * @type {Element|undefined}
   */
  this.hoverNextItem = opt_hoverNextItem;
};
