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
 * @see ../demos/draglistgroup.html
 */


goog.provide('goog.fx.DragListDirection');
goog.provide('goog.fx.DragListGroup');
goog.provide('goog.fx.DragListGroup.EventType');
goog.provide('goog.fx.DragListGroupEvent');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.fx.Dragger');
goog.require('goog.math.Coordinate');
goog.require('goog.string');
goog.require('goog.style');



/**
 * A class representing a group of one or more "drag lists" with items that can
 * be dragged within them and between them.
 *
 * Example usage:
 *   var dragListGroup = new goog.fx.DragListGroup();
 *   dragListGroup.setDragItemHandleHoverClass(className1, className2);
 *   dragListGroup.setDraggerElClass(className3);
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
   * @type {goog.events.EventHandler.<!goog.fx.DragListGroup>}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler(this);

  /**
   * Whether the setup has been done to make all items in all lists draggable.
   * @type {boolean}
   * @private
   */
  this.isInitialized_ = false;

  /**
   * Whether the currDragItem is always displayed. By default the list
   * collapses, the currDragItem's display is set to none, when we do not
   * hover over a draglist.
   * @type {boolean}
   * @private
   */
  this.isCurrDragItemAlwaysDisplayed_ = false;

  /**
   * Whether to update the position of the currDragItem as we drag, i.e.,
   * insert the currDragItem each time to the position where it would land if
   * we were to end the drag at that point. Defaults to true.
   * @type {boolean}
   * @private
   */
  this.updateWhileDragging_ = true;
};
goog.inherits(goog.fx.DragListGroup, goog.events.EventTarget);


/**
 * Enum to indicate the direction that a drag list grows.
 * @enum {number}
 */
goog.fx.DragListDirection = {
  DOWN: 0,  // common
  RIGHT: 2,  // common
  LEFT: 3,  // uncommon (except perhaps for right-to-left interfaces)
  RIGHT_2D: 4, // common + handles multiple lines if items are wrapped
  LEFT_2D: 5 // for rtl languages
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
 * The user-supplied CSS classes to add to a drag item on hover (not during a
 * drag action).
 * @type {Array|undefined}
 * @private
 */
goog.fx.DragListGroup.prototype.dragItemHoverClasses_;


/**
 * The user-supplied CSS classes to add to a drag item handle on hover (not
 * during a drag action).
 * @type {Array|undefined}
 * @private
 */
goog.fx.DragListGroup.prototype.dragItemHandleHoverClasses_;


/**
 * The user-supplied CSS classes to add to the current drag item (during a drag
 * action).
 * @type {Array|undefined}
 * @private
 */
goog.fx.DragListGroup.prototype.currDragItemClasses_;


/**
 * The user-supplied CSS classes to add to the clone of the current drag item
 * that's actually being dragged around (during a drag action).
 * @type {Array.<string>|undefined}
 * @private
 */
goog.fx.DragListGroup.prototype.draggerElClasses_;


// The next 5 are info applicable during a drag action.


/**
 * The current drag item being moved.
 * Note: This is only defined while a drag action is happening.
 * @type {Element}
 * @private
 */
goog.fx.DragListGroup.prototype.currDragItem_;


/**
 * The drag list that {@code this.currDragItem_} is currently hovering over, or
 * null if it is not hovering over a list.
 * @type {Element}
 * @private
 */
goog.fx.DragListGroup.prototype.currHoverList_;


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
 * The current item in the list we are hovering over. We need to remember
 * this in case we do not update the position of the current drag item while
 * dragging (see {@code updateWhileDragging_}). In this case the current drag
 * item will be inserted into the list before this element when the drag ends.
 * @type {Element}
 * @private
 */
goog.fx.DragListGroup.prototype.currHoverItem_;


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
 * The amount of distance, in pixels, after which a mousedown or touchstart is
 * considered a drag.
 * @type {number}
 * @private
 */
goog.fx.DragListGroup.prototype.hysteresisDistance_ = 0;


/**
 * Sets the property of the currDragItem that it is always displayed in the
 * list.
 */
goog.fx.DragListGroup.prototype.setIsCurrDragItemAlwaysDisplayed = function() {
  this.isCurrDragItemAlwaysDisplayed_ = true;
};


/**
 * Sets the private property updateWhileDragging_ to false. This disables the
 * update of the position of the currDragItem while dragging. It will only be
 * placed to its new location once the drag ends.
 */
goog.fx.DragListGroup.prototype.setNoUpdateWhileDragging = function() {
  this.updateWhileDragging_ = false;
};


/**
 * Sets the distance the user has to drag the element before a drag operation
 * is started.
 * @param {number} distance The number of pixels after which a mousedown and
 *     move is considered a drag.
 */
goog.fx.DragListGroup.prototype.setHysteresis = function(distance) {
  this.hysteresisDistance_ = distance;
};


/**
 * @return {number} distance The number of pixels after which a mousedown and
 *     move is considered a drag.
 */
goog.fx.DragListGroup.prototype.getHysteresis = function() {
  return this.hysteresisDistance_;
};


/**
 * Adds a drag list to this DragListGroup.
 * All calls to this method must happen before the call to init().
 * Remember that all child nodes (except text nodes) will be made draggable to
 * any other drag list in this group.
 *
 * @param {Element} dragListElement Must be a container for a list of items
 *     that should all be made draggable.
 * @param {goog.fx.DragListDirection} growthDirection The direction that this
 *     drag list grows in (i.e. if an item is appended to the DOM, the list's
 *     bounding box expands in this direction).
 * @param {boolean=} opt_unused Unused argument.
 * @param {string=} opt_dragHoverClass CSS class to apply to this drag list when
 *     the draggerEl hovers over it during a drag action.  If present, must be a
 *     single, valid classname (not a string of space-separated classnames).
 */
goog.fx.DragListGroup.prototype.addDragList = function(
    dragListElement, growthDirection, opt_unused, opt_dragHoverClass) {
  goog.asserts.assert(!this.isInitialized_);

  dragListElement.dlgGrowthDirection_ = growthDirection;
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
  goog.asserts.assert(!this.isInitialized_);
  this.getHandleForDragItem_ = getHandleForDragItemFn;
};


/**
 * Sets a user-supplied CSS class to add to a drag item on hover (not during a
 * drag action).
 * @param {...!string} var_args The CSS class or classes.
 */
goog.fx.DragListGroup.prototype.setDragItemHoverClass = function(var_args) {
  goog.asserts.assert(!this.isInitialized_);
  this.dragItemHoverClasses_ = goog.array.slice(arguments, 0);
};


/**
 * Sets a user-supplied CSS class to add to a drag item handle on hover (not
 * during a drag action).
 * @param {...!string} var_args The CSS class or classes.
 */
goog.fx.DragListGroup.prototype.setDragItemHandleHoverClass = function(
    var_args) {
  goog.asserts.assert(!this.isInitialized_);
  this.dragItemHandleHoverClasses_ = goog.array.slice(arguments, 0);
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
 * @param {...!string} var_args The CSS class or classes.
 */
goog.fx.DragListGroup.prototype.setCurrDragItemClass = function(var_args) {
  goog.asserts.assert(!this.isInitialized_);
  this.currDragItemClasses_ = goog.array.slice(arguments, 0);
};


/**
 * Sets a user-supplied CSS class to add to the clone of the current drag item
 * that's actually being dragged around (during a drag action).
 * @param {string} draggerElClass The CSS class.
 */
goog.fx.DragListGroup.prototype.setDraggerElClass = function(draggerElClass) {
  goog.asserts.assert(!this.isInitialized_);
  // Split space-separated classes up into an array.
  this.draggerElClasses_ = goog.string.trim(draggerElClass).split(' ');
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

    var dragItems = goog.dom.getChildren(dragList);
    for (var j = 0, numItems = dragItems.length; j < numItems; ++j) {
      this.listenForDragEvents(dragItems[j]);
    }
  }

  this.isInitialized_ = true;
};


/**
 * Adds a single item to the given drag list and sets up the drag listeners for
 * it.
 * If opt_index is specified the item is inserted at this index, otherwise the
 * item is added as the last child of the list.
 *
 * @param {!Element} list The drag list where to add item to.
 * @param {!Element} item The new element to add.
 * @param {number=} opt_index Index where to insert the item in the list. If not
 * specified item is inserted as the last child of list.
 */
goog.fx.DragListGroup.prototype.addItemToDragList = function(list, item,
    opt_index) {
  if (goog.isDef(opt_index)) {
    goog.dom.insertChildAt(list, item, opt_index);
  } else {
    goog.dom.appendChild(list, item);
  }
  this.listenForDragEvents(item);
};


/** @override */
goog.fx.DragListGroup.prototype.disposeInternal = function() {
  this.eventHandler_.dispose();

  for (var i = 0, n = this.dragLists_.length; i < n; i++) {
    var dragList = this.dragLists_[i];
    // Note: IE doesn't allow 'delete' for fields on HTML elements (because
    // they're not real JS objects in IE), so we just set them to undefined.
    dragList.dlgGrowthDirection_ = undefined;
    dragList.dlgDragHoverClass_ = undefined;
  }

  this.dragLists_.length = 0;
  this.dragItems_.length = 0;
  this.dragItemForHandle_ = null;

  // In the case where a drag event is currently in-progress and dispose is
  // called, this cleans up the extra state.
  this.cleanupDragDom_();

  goog.fx.DragListGroup.superClass_.disposeInternal.call(this);
};


/**
 * Caches the heights of each drag list and drag item, except for the current
 * drag item.
 *
 * @param {Element} currDragItem The item currently being dragged.
 * @private
 */
goog.fx.DragListGroup.prototype.recacheListAndItemBounds_ = function(
    currDragItem) {
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
};


/**
 * Listens for drag events on the given drag item. This method is currently used
 * to initialize drag items.
 *
 * @param {Element} dragItem the element to initialize. This element has to be
 * in one of the drag lists.
 * @protected
 */
goog.fx.DragListGroup.prototype.listenForDragEvents = function(dragItem) {
  var dragItemHandle = this.getHandleForDragItem_(dragItem);
  var uid = goog.getUid(dragItemHandle);
  this.dragItemForHandle_[uid] = dragItem;

  if (this.dragItemHoverClasses_) {
    this.eventHandler_.listen(
        dragItem, goog.events.EventType.MOUSEOVER,
        this.handleDragItemMouseover_);
    this.eventHandler_.listen(
        dragItem, goog.events.EventType.MOUSEOUT,
        this.handleDragItemMouseout_);
  }
  if (this.dragItemHandleHoverClasses_) {
    this.eventHandler_.listen(
        dragItemHandle, goog.events.EventType.MOUSEOVER,
        this.handleDragItemHandleMouseover_);
    this.eventHandler_.listen(
        dragItemHandle, goog.events.EventType.MOUSEOUT,
        this.handleDragItemHandleMouseout_);
  }

  this.dragItems_.push(dragItem);
  this.eventHandler_.listen(dragItemHandle,
      [goog.events.EventType.MOUSEDOWN, goog.events.EventType.TOUCHSTART],
      this.handlePotentialDragStart_);
};


/**
 * Handles mouse and touch events which may start a drag action.
 * @param {!goog.events.BrowserEvent} e MOUSEDOWN or TOUCHSTART event.
 * @private
 */
goog.fx.DragListGroup.prototype.handlePotentialDragStart_ = function(e) {
  var uid = goog.getUid(/** @type {Node} */ (e.currentTarget));
  this.currDragItem_ = /** @type {Element} */ (this.dragItemForHandle_[uid]);

  this.draggerEl_ = this.createDragElementInternal(this.currDragItem_);
  if (this.draggerElClasses_) {
    // Add CSS class for the clone, if any.
    goog.dom.classlist.addAll(
        goog.asserts.assert(this.draggerEl_), this.draggerElClasses_ || []);
  }

  // Place the clone (i.e. draggerEl) at the same position as the actual
  // current drag item. This is a bit tricky since
  //   goog.style.getPageOffset() gets the left-top pos of the border, but
  //   goog.style.setPageOffset() sets the left-top pos of the margin.
  // It's difficult to adjust for the margins of the clone because it's
  // difficult to read it: goog.style.getComputedStyle() doesn't work for IE.
  // Instead, our workaround is simply to set the clone's margins to 0px.
  this.draggerEl_.style.margin = '0';
  this.draggerEl_.style.position = 'absolute';
  this.draggerEl_.style.visibility = 'hidden';
  var doc = goog.dom.getOwnerDocument(this.currDragItem_);
  doc.body.appendChild(this.draggerEl_);

  // Important: goog.style.setPageOffset() only works correctly for IE when the
  // element is already in the document.
  var currDragItemPos = goog.style.getPageOffset(this.currDragItem_);
  goog.style.setPageOffset(this.draggerEl_, currDragItemPos);

  this.dragger_ = new goog.fx.Dragger(this.draggerEl_);
  this.dragger_.setHysteresis(this.hysteresisDistance_);

  // Listen to events on the dragger. These handlers will be unregistered at
  // DRAGEND, when the dragger is disposed of. We can't use eventHandler_,
  // because it creates new references to the handler functions at each
  // dragging action, and keeps them until DragListGroup is disposed of.
  goog.events.listen(this.dragger_, goog.fx.Dragger.EventType.START,
      this.handleDragStart_, false, this);
  goog.events.listen(this.dragger_, goog.fx.Dragger.EventType.END,
      this.handleDragEnd_, false, this);
  goog.events.listen(this.dragger_, goog.fx.Dragger.EventType.EARLY_CANCEL,
      this.cleanup_, false, this);
  this.dragger_.startDrag(e);
};


/**
 * Creates copy of node being dragged.
 *
 * @param {Element} sourceEl Element to copy.
 * @return {!Element} The clone of {@code sourceEl}.
 * @deprecated Use goog.fx.Dragger.cloneNode().
 * @private
 */
goog.fx.DragListGroup.prototype.cloneNode_ = function(sourceEl) {
  return goog.fx.Dragger.cloneNode(sourceEl);
};


/**
 * Generates an element to follow the cursor during dragging, given a drag
 * source element.  The default behavior is simply to clone the source element,
 * but this may be overridden in subclasses.  This method is called by
 * {@code createDragElement()} before the drag class is added.
 *
 * @param {Element} sourceEl Drag source element.
 * @return {!Element} The new drag element.
 * @protected
 * @suppress {deprecated}
 */
goog.fx.DragListGroup.prototype.createDragElementInternal =
    function(sourceEl) {
  return this.cloneNode_(sourceEl);
};


/**
 * Handles the start of a drag action.
 * @param {!goog.fx.DragEvent} e goog.fx.Dragger.EventType.START event.
 * @private
 */
goog.fx.DragListGroup.prototype.handleDragStart_ = function(e) {
  if (!this.dispatchEvent(new goog.fx.DragListGroupEvent(
      goog.fx.DragListGroup.EventType.BEFOREDRAGSTART, this, e.browserEvent,
      this.currDragItem_, null, null))) {
    e.preventDefault();
    this.cleanup_();
    return;
  }

  // Record the original location of the current drag item.
  // Note: this.origNextItem_ may be null.
  this.origList_ = /** @type {Element} */ (this.currDragItem_.parentNode);
  this.origNextItem_ = goog.dom.getNextElementSibling(this.currDragItem_);
  this.currHoverItem_ = this.origNextItem_;
  this.currHoverList_ = this.origList_;

  // If there's a CSS class specified for the current drag item, add it.
  // Otherwise, make the actual current drag item hidden (takes up space).
  if (this.currDragItemClasses_) {
    goog.dom.classlist.addAll(
        goog.asserts.assert(this.currDragItem_),
        this.currDragItemClasses_ || []);
  } else {
    this.currDragItem_.style.visibility = 'hidden';
  }

  // Precompute distances from top-left corner to center for efficiency.
  var draggerElSize = goog.style.getSize(this.draggerEl_);
  this.draggerEl_.halfWidth = draggerElSize.width / 2;
  this.draggerEl_.halfHeight = draggerElSize.height / 2;

  this.draggerEl_.style.visibility = '';

  // Record the bounds of all the drag lists and all the other drag items. This
  // caching is for efficiency, so that we don't have to recompute the bounds on
  // each drag move. Do this in the state where the current drag item is not in
  // any of the lists, except when update while dragging is disabled, as in this
  // case the current drag item does not get removed until drag ends.
  if (this.updateWhileDragging_) {
    this.currDragItem_.style.display = 'none';
  }
  this.recacheListAndItemBounds_(this.currDragItem_);
  this.currDragItem_.style.display = '';

  // Listen to events on the dragger.
  goog.events.listen(this.dragger_, goog.fx.Dragger.EventType.DRAG,
      this.handleDragMove_, false, this);

  this.dispatchEvent(
      new goog.fx.DragListGroupEvent(
          goog.fx.DragListGroup.EventType.DRAGSTART, this, e.browserEvent,
          this.currDragItem_, this.draggerEl_, this.dragger_));
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
    if (this.updateWhileDragging_) {
      this.insertCurrDragItem_(hoverList, hoverNextItem);
    } else {
      // If update while dragging is disabled do not insert
      // the dragged item, but update the hovered item instead.
      this.updateCurrHoverItem(hoverNextItem, draggerElCenter);
    }
    this.currDragItem_.style.display = '';
    // Add drag list's hover class (if any).
    if (hoverList.dlgDragHoverClass_) {
      goog.dom.classlist.add(
          goog.asserts.assert(hoverList), hoverList.dlgDragHoverClass_);
    }

  } else {
    // Not hovering over a drag list, so remove the item altogether unless
    // specified otherwise by the user.
    if (!this.isCurrDragItemAlwaysDisplayed_) {
      this.currDragItem_.style.display = 'none';
    }

    // Remove hover classes (if any) from all drag lists.
    for (var i = 0, n = this.dragLists_.length; i < n; i++) {
      var dragList = this.dragLists_[i];
      if (dragList.dlgDragHoverClass_) {
        goog.dom.classlist.remove(
            goog.asserts.assert(dragList), dragList.dlgDragHoverClass_);
      }
    }
  }

  // If the current hover list is different than the last, the lists may have
  // shrunk, so we should recache the bounds.
  if (hoverList != this.currHoverList_) {
    this.currHoverList_ = hoverList;
    this.recacheListAndItemBounds_(this.currDragItem_);
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
 * Clear all our temporary fields that are only defined while dragging, and
 * all the bounds info stored on the drag lists and drag elements.
 * @param {!goog.events.Event=} opt_e EARLY_CANCEL event from the dragger if
 *     cleanup_ was called as an event handler.
 * @private
 */
goog.fx.DragListGroup.prototype.cleanup_ = function(opt_e) {
  this.cleanupDragDom_();

  this.currDragItem_ = null;
  this.currHoverList_ = null;
  this.origList_ = null;
  this.origNextItem_ = null;
  this.draggerEl_ = null;
  this.dragger_ = null;

  // Note: IE doesn't allow 'delete' for fields on HTML elements (because
  // they're not real JS objects in IE), so we just set them to null.
  for (var i = 0, n = this.dragLists_.length; i < n; i++) {
    this.dragLists_[i].dlgBounds_ = null;
  }
  for (var i = 0, n = this.dragItems_.length; i < n; i++) {
    this.dragItems_[i].dlgBounds_ = null;
  }
};


/**
 * Handles the end or the cancellation of a drag action, i.e. END or CLEANUP
 * event fired by the dragger.
 *
 * @param {!goog.fx.DragEvent} dragEvent Event object fired by the dragger.
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

  // If update while dragging is disabled insert the current drag item into
  // its intended location.
  if (!this.updateWhileDragging_) {
    this.insertCurrHoverItem();
  }

  // The DRAGEND handler may need the new order of the list items. Clean up the
  // garbage.
  // TODO(user): Regression test.
  this.cleanupDragDom_();

  this.dispatchEvent(
      new goog.fx.DragListGroupEvent(
          goog.fx.DragListGroup.EventType.DRAGEND, this, dragEvent,
          this.currDragItem_, this.draggerEl_, this.dragger_));

  this.cleanup_();

  return true;
};


/**
 * Cleans up DOM changes that are made by the {@code handleDrag*} methods.
 * @private
 */
goog.fx.DragListGroup.prototype.cleanupDragDom_ = function() {
  // Disposes of the dragger and remove the cloned drag item.
  goog.dispose(this.dragger_);
  if (this.draggerEl_) {
    goog.dom.removeNode(this.draggerEl_);
  }

  // If the current drag item is not in any list, put it back in its original
  // location.
  if (this.currDragItem_ && this.currDragItem_.style.display == 'none') {
    // Note: this.origNextItem_ may be null, but insertBefore() still works.
    this.origList_.insertBefore(this.currDragItem_, this.origNextItem_);
    this.currDragItem_.style.display = '';
  }

  // If there's a CSS class specified for the current drag item, remove it.
  // Otherwise, make the current drag item visible (instead of empty space).
  if (this.currDragItemClasses_ && this.currDragItem_) {
    goog.dom.classlist.removeAll(
        goog.asserts.assert(this.currDragItem_),
        this.currDragItemClasses_ || []);
  } else if (this.currDragItem_) {
    this.currDragItem_.style.visibility = 'visible';
  }

  // Remove hover classes (if any) from all drag lists.
  for (var i = 0, n = this.dragLists_.length; i < n; i++) {
    var dragList = this.dragLists_[i];
    if (dragList.dlgDragHoverClass_) {
      goog.dom.classlist.remove(
          goog.asserts.assert(dragList), dragList.dlgDragHoverClass_);
    }
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
  var targetEl = goog.asserts.assertElement(e.currentTarget);
  goog.dom.classlist.addAll(targetEl, this.dragItemHoverClasses_ || []);
};


/**
 * Handles a MOUSEOUT event fired on a drag item.
 * @param {goog.events.BrowserEvent} e The event.
 * @private
 */
goog.fx.DragListGroup.prototype.handleDragItemMouseout_ = function(e) {
  var targetEl = goog.asserts.assertElement(e.currentTarget);
  goog.dom.classlist.removeAll(targetEl, this.dragItemHoverClasses_ || []);
};


/**
 * Handles a MOUSEOVER event fired on the handle element of a drag item.
 * @param {goog.events.BrowserEvent} e The event.
 * @private
 */
goog.fx.DragListGroup.prototype.handleDragItemHandleMouseover_ = function(e) {
  var targetEl = goog.asserts.assertElement(e.currentTarget);
  goog.dom.classlist.addAll(targetEl, this.dragItemHandleHoverClasses_ || []);
};


/**
 * Handles a MOUSEOUT event fired on the handle element of a drag item.
 * @param {goog.events.BrowserEvent} e The event.
 * @private
 */
goog.fx.DragListGroup.prototype.handleDragItemHandleMouseout_ = function(e) {
  var targetEl = goog.asserts.assertElement(e.currentTarget);
  goog.dom.classlist.removeAll(targetEl,
      this.dragItemHandleHoverClasses_ || []);
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
 * Updates the value of currHoverItem_.
 *
 * This method is used for insertion only when updateWhileDragging_ is false.
 * The below implementation is the basic one. This method can be extended by
 * a subclass to support changes to hovered item (eg: highlighting). Parametr
 * opt_draggerElCenter can be used for more sophisticated effects.
 *
 * @param {Element} hoverNextItem element of the list that is hovered over.
 * @param {goog.math.Coordinate=} opt_draggerElCenter current position of
 *     the dragged element.
 * @protected
 */
goog.fx.DragListGroup.prototype.updateCurrHoverItem = function(
    hoverNextItem, opt_draggerElCenter) {
  if (hoverNextItem) {
    this.currHoverItem_ = hoverNextItem;
  }
};


/**
 * Inserts the currently dragged item in its new place.
 *
 * This method is used for insertion only when updateWhileDragging_ is false
 * (otherwise there is no need for that). In the basic implementation
 * the element is inserted before the currently hovered over item (this can
 * be changed by overriding the method in subclasses).
 *
 * @protected
 */
goog.fx.DragListGroup.prototype.insertCurrHoverItem = function() {
  this.origList_.insertBefore(this.currDragItem_, this.currHoverItem_);
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
  var pickClosestRow = false;
  var distanceToClosestRow = undefined;
  switch (hoverList.dlgGrowthDirection_) {
    case goog.fx.DragListDirection.DOWN:
      // "Before" means draggerElCenter.y is less than item's bottom y-value.
      relevantCoord = draggerElCenter.y;
      getRelevantBoundFn = goog.fx.DragListGroup.getBottomBound_;
      isBeforeFn = goog.fx.DragListGroup.isLessThan_;
      break;
    case goog.fx.DragListDirection.RIGHT_2D:
      pickClosestRow = true;
    case goog.fx.DragListDirection.RIGHT:
      // "Before" means draggerElCenter.x is less than item's right x-value.
      relevantCoord = draggerElCenter.x;
      getRelevantBoundFn = goog.fx.DragListGroup.getRightBound_;
      isBeforeFn = goog.fx.DragListGroup.isLessThan_;
      break;
    case goog.fx.DragListDirection.LEFT_2D:
      pickClosestRow = true;
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

  var hoverListItems = goog.dom.getChildren(hoverList);
  for (var i = 0, n = hoverListItems.length; i < n; i++) {
    var item = hoverListItems[i];
    if (item == this.currDragItem_) {
      continue;
    }

    var relevantBound = getRelevantBoundFn(item.dlgBounds_);
    // When the hoverlist is broken into multiple rows (i.e., in the case of
    // LEFT_2D and RIGHT_2D) it is no longer enough to only look at the
    // x-coordinate alone in order to find the {@earliestAfterItem} in the
    // hoverlist. Make sure it is chosen from the row closest to the
    // {@code draggerElCenter}.
    if (pickClosestRow) {
      var distanceToRow = goog.fx.DragListGroup.verticalDistanceFromItem_(item,
          draggerElCenter);
      // Initialize the distance to the closest row to the current value if
      // undefined.
      if (!goog.isDef(distanceToClosestRow)) {
        distanceToClosestRow = distanceToRow;
      }
      if (isBeforeFn(relevantCoord, relevantBound) &&
          (earliestAfterItemRelevantBound == undefined ||
           (distanceToRow < distanceToClosestRow) ||
           ((distanceToRow == distanceToClosestRow) &&
            (isBeforeFn(relevantBound, earliestAfterItemRelevantBound) ||
            relevantBound == earliestAfterItemRelevantBound)))) {
        earliestAfterItem = item;
        earliestAfterItemRelevantBound = relevantBound;
      }
      // Update distance to closest row.
      if (distanceToRow < distanceToClosestRow) {
        distanceToClosestRow = distanceToRow;
      }
    } else if (isBeforeFn(relevantCoord, relevantBound) &&
        (earliestAfterItemRelevantBound == undefined ||
         isBeforeFn(relevantBound, earliestAfterItemRelevantBound))) {
      earliestAfterItem = item;
      earliestAfterItemRelevantBound = relevantBound;
    }
  }
  // If we ended up picking an element that is not in the closest row it can
  // only happen if we should have picked the last one in which case there is
  // no consecutive element.
  if (!goog.isNull(earliestAfterItem) &&
      goog.fx.DragListGroup.verticalDistanceFromItem_(
          earliestAfterItem, draggerElCenter) > distanceToClosestRow) {
    return null;
  } else {
    return earliestAfterItem;
  }
};


/**
 * Private helper for getHoverNextItem().
 * Given an item and a target determine the vertical distance from the item's
 * center to the target.
 * @param {Element} item The item to measure the distance from.
 * @param {goog.math.Coordinate} target The (x,y) coordinate of the target
 *     to measure the distance to.
 * @return {number} The vertical distance between the center of the item and
 *     the target.
 * @private
 */
goog.fx.DragListGroup.verticalDistanceFromItem_ = function(item, target) {
  var itemBounds = item.dlgBounds_;
  var itemCenterY = itemBounds.top + (itemBounds.height - 1) / 2;
  return Math.abs(target.y - itemCenterY);
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
  if (this.currDragItem_.parentNode != hoverList ||
      goog.dom.getNextElementSibling(this.currDragItem_) != hoverNextItem) {
    // The current drag item is not in the correct location, so we move it.
    // Note: hoverNextItem may be null, but insertBefore() still works.
    hoverList.insertBefore(this.currDragItem_, hoverNextItem);
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
 * @extends {goog.events.Event}
 */
goog.fx.DragListGroupEvent = function(
    type, dragListGroup, event, currDragItem, draggerEl, dragger,
    opt_draggerElCenter, opt_hoverList, opt_hoverNextItem) {
  goog.events.Event.call(this, type);

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
goog.inherits(goog.fx.DragListGroupEvent, goog.events.Event);
