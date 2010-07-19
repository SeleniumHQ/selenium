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
 * @fileoverview Implementation of a basic slider control.
 *
 * Models a control that allows to select a sub-range within a given
 * range of values using two thumbs.  The underlying range is modeled
 * as a range model, where the min thumb points to value of the
 * rangemodel, and the max thumb points to value + extent of the range
 * model.
 *
 * The currently selected range is exposed through methods
 * getValue() and getExtent().
 *
 * The reason for modelling the basic slider state as value + extent is
 * to be able to capture both, a two-thumb slider to select a range, and
 * a single-thumb slider to just select a value (in the latter case, extent
 * is always zero). We provide subclasses (twothumbslider.js and slider.js)
 * that model those special cases of this control.
 *
 * All rendering logic is left out, so that the subclasses can define
 * their own rendering. To do so, the subclasses overwrite:
 * - createDom
 * - decorateInternal
 * - getCssClass
 *
*
*
 */

goog.provide('goog.ui.SliderBase');
goog.provide('goog.ui.SliderBase.Orientation');

goog.require('goog.Timer');
goog.require('goog.dom');
goog.require('goog.dom.a11y');
goog.require('goog.dom.a11y.Role');
goog.require('goog.dom.a11y.State');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.KeyHandler.EventType');
goog.require('goog.events.MouseWheelHandler');
goog.require('goog.events.MouseWheelHandler.EventType');
goog.require('goog.fx.Animation.EventType');
goog.require('goog.fx.Dragger');
goog.require('goog.fx.Dragger.EventType');
goog.require('goog.fx.dom.SlideFrom');
goog.require('goog.math');
goog.require('goog.math.Coordinate');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.RangeModel');


/**
 * This creates a SliderBase object.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.SliderBase = function(opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);
  this.rangeModel = new goog.ui.RangeModel;
  // Don't use getHandler because it gets cleared in exitDocument.
  goog.events.listen(this.rangeModel, goog.ui.Component.EventType.CHANGE,
      this.handleRangeModelChange, false, this);
};
goog.inherits(goog.ui.SliderBase, goog.ui.Component);


/**
 * Enum for representing the orientation of the slider.
 *
 * @enum {string}
 */
goog.ui.SliderBase.Orientation = {
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal'
};


/**
 * Orientation of the slider.
 * @type {goog.ui.SliderBase.Orientation}
 * @private
 */
goog.ui.SliderBase.prototype.orientation_ =
    goog.ui.SliderBase.Orientation.HORIZONTAL;


/**
 * When the user holds down the mouse on the slider background, the closest
 * thumb will move in "lock-step" towards the mouse. This number indicates how
 * long each step should take (in milliseconds).
 * @type {number}
 * @private
 */
goog.ui.SliderBase.MOUSE_DOWN_INCREMENT_INTERVAL_ = 200;


/**
 * How long the animations should take (in milliseconds).
 * @type {number}
 * @private
 */
goog.ui.SliderBase.ANIMATION_INTERVAL_ = 100;


/**
 * The underlying range model
 * @type {goog.ui.RangeModel}
 * @protected
 */
goog.ui.SliderBase.prototype.rangeModel;


/**
 * The minThumb dom-element, pointing to the start of the selected range.
 * @type {HTMLDivElement}
 * @protected
 */
goog.ui.SliderBase.prototype.valueThumb;


/**
 * The maxThumb dom-element, pointing to the end of the selected range.
 * @type {HTMLDivElement}
 * @protected
 */
goog.ui.SliderBase.prototype.extentThumb;


/**
 * The thumb that we should be moving (only relevant when timed move is active).
 * @type {HTMLDivElement}
 * @private
 */
goog.ui.SliderBase.prototype.thumbToMove_;


/**
 * The object handling keyboard events.
 * @type {goog.events.KeyHandler}
 * @private
 */
goog.ui.SliderBase.prototype.keyHandler_;


/**
 * The object handling mouse wheel events.
 * @type {goog.events.MouseWheelHandler}
 * @private
 */
goog.ui.SliderBase.prototype.mouseWheelHandler_;


/**
 * The Dragger for dragging the valueThumb.
 * @type {goog.fx.Dragger}
 * @private
 */
goog.ui.SliderBase.prototype.valueDragger_;


/**
 * The Dragger for dragging the extentThumb.
 * @type {goog.fx.Dragger}
 * @private
 */
goog.ui.SliderBase.prototype.extentDragger_;


/**
 * If we are currently animating the thumb.
 * @private
 * @type {boolean}
 */
goog.ui.SliderBase.prototype.isAnimating_ = false;


/**
 * Whether clicking on the backgtround should move directly to that point.
 * @private
 * @type {boolean}
 */
goog.ui.SliderBase.prototype.moveToPointEnabled_ = false;


/**
 * The amount to increment/decrement for page up/down as well as when holding
 * down the mouse button on the background.
 * @private
 * @type {number}
 */
goog.ui.SliderBase.prototype.blockIncrement_ = 10;


/**
 * The minimal extent. The class will ensure that the extent cannot shrink
 * to a value smaller than minExtent.
 * @private
 * @type {number}
 */
goog.ui.SliderBase.prototype.minExtent_ = 0;


/**
 * Returns the CSS class applied to the slider element for the given
 * orientation. Subclasses must override this method.
 * @param {goog.ui.SliderBase.Orientation} orient The orientation.
 * @return {string} The CSS class applied to slider elements.
 * @protected
 */
goog.ui.SliderBase.prototype.getCssClass = goog.abstractMethod;


/** @inheritDoc */
goog.ui.SliderBase.prototype.createDom = function() {
  goog.ui.SliderBase.superClass_.createDom.call(this);
  var element =
      this.getDomHelper().createDom('div', this.getCssClass(this.orientation_));
  this.decorateInternal(element);
};


/**
 * Subclasses must implement this method and set the valueThumb and
 * extentThumb to non-null values.
 * @type {function() : void}
 * @protected
 */
goog.ui.SliderBase.prototype.createThumbs = goog.abstractMethod;


/** @inheritDoc */
goog.ui.SliderBase.prototype.decorateInternal = function(element) {
  goog.ui.SliderBase.superClass_.decorateInternal.call(this, element);
  goog.dom.classes.add(element, this.getCssClass(this.orientation_));
  this.createThumbs();
  this.setAriaRoles();
};


/**
 * Called when the DOM for the component is for sure in the document.
 * Subclasses should override this method to set this element's role.
 */
goog.ui.SliderBase.prototype.enterDocument = function() {
  goog.ui.SliderBase.superClass_.enterDocument.call(this);

  // Attach the events
  this.valueDragger_ = new goog.fx.Dragger(this.valueThumb);
  this.extentDragger_ = new goog.fx.Dragger(this.extentThumb);
  // The slider is handling the positioning so make the defaultActions empty.
  this.valueDragger_.defaultAction = this.extentDragger_.defaultAction =
      goog.nullFunction;
  this.keyHandler_ = new goog.events.KeyHandler(this.getElement());
  this.mouseWheelHandler_ = new goog.events.MouseWheelHandler(
      this.getElement());
  this.getHandler().
      listen(this.valueDragger_, goog.fx.Dragger.EventType.BEFOREDRAG,
          this.handleBeforeDrag_).
      listen(this.extentDragger_, goog.fx.Dragger.EventType.BEFOREDRAG,
          this.handleBeforeDrag_).
      listen(this.keyHandler_, goog.events.KeyHandler.EventType.KEY,
          this.handleKeyDown_).
      listen(this.getElement(), goog.events.EventType.MOUSEDOWN,
          this.handleMouseDown_).
      listen(this.mouseWheelHandler_,
          goog.events.MouseWheelHandler.EventType.MOUSEWHEEL,
          this.handleMouseWheel_);

  this.getElement().tabIndex = 0;
  this.updateUi_();
};


/**
 * Handler for the before drag event. We use the event properties to determine
 * the new value.
 * @param {goog.fx.DragEvent} e  The drag event used to drag the thumb.
 * @private
 */
goog.ui.SliderBase.prototype.handleBeforeDrag_ = function(e) {
  var thumbToDrag = e.dragger == this.valueDragger_ ?
      this.valueThumb : this.extentThumb;
  var value;
  if (this.orientation_ == goog.ui.SliderBase.Orientation.VERTICAL) {
    var availHeight = this.getElement().clientHeight - thumbToDrag.offsetHeight;
    value = (availHeight - e.top) / availHeight *
        (this.getMaximum() - this.getMinimum()) + this.getMinimum();
  } else {
    var availWidth = this.getElement().clientWidth - thumbToDrag.offsetWidth;
    value = (e.left / availWidth) * (this.getMaximum() - this.getMinimum()) +
        this.getMinimum();
  }
  // Bind the value within valid range before calling setThumbPosition_.
  // This is necessary because setThumbPosition_ is a no-op for values outside
  // of the legal range. For drag operations, we want the handle to snap to the
  // last valid value instead of remaining at the previous position.
  if (e.dragger == this.valueDragger_) {
    value = Math.min(Math.max(value, this.getMinimum()),
        this.getValue() + this.getExtent());
  } else {
    value = Math.min(Math.max(value, this.getValue()), this.getMaximum());
  }
  this.setThumbPosition_(thumbToDrag, value);
};


/**
 * Event handler for the key down event. This is used to update the value
 * based on the key pressed.
 * @param {goog.events.KeyEvent} e  The keyboard event object.
 * @private
 */
goog.ui.SliderBase.prototype.handleKeyDown_ = function(e) {
  var handled = true;
  switch (e.keyCode) {
    case goog.events.KeyCodes.HOME:
      this.animatedSetValue_(this.getMinimum());
      break;
    case goog.events.KeyCodes.END:
      this.animatedSetValue_(this.getMaximum());
      break;
    case goog.events.KeyCodes.PAGE_UP:
      this.moveThumbs(this.getBlockIncrement());
      break;
    case goog.events.KeyCodes.PAGE_DOWN:
      this.moveThumbs(-this.getBlockIncrement());
      break;
    case goog.events.KeyCodes.LEFT:
    case goog.events.KeyCodes.DOWN:
      this.moveThumbs(e.shiftKey ?
          -this.getBlockIncrement() : -this.getUnitIncrement());
      break;
    case goog.events.KeyCodes.RIGHT:
    case goog.events.KeyCodes.UP:
      this.moveThumbs(e.shiftKey ?
          this.getBlockIncrement() : this.getUnitIncrement());
      break;

    default:
      handled = false;
  }

  if (handled) {
    e.preventDefault();
  }
};


/**
 * Handler for the mouse down event.
 * @param {goog.events.Event} e  The mouse event object.
 * @private
 */
goog.ui.SliderBase.prototype.handleMouseDown_ = function(e) {
  if (this.getElement().focus) {
    this.getElement().focus();
  }

  // Known Element.
  var target = /** @type {Element} */ (e.target);

  if (!goog.dom.contains(this.valueThumb, target) &&
      !goog.dom.contains(this.extentThumb, target)) {
    if (this.moveToPointEnabled_) {
      // just set the value directly based on the position of the click
      this.animatedSetValue_(this.getValueFromMousePosition_(e));
    } else {
      // start a timer that incrementally moves the handle
      this.startBlockIncrementing_(e);
    }
  }
};


/**
 * Handler for the mouse wheel event.
 * @param {goog.events.MouseWheelEvent} e  The mouse wheel event object.
 * @private
 */
goog.ui.SliderBase.prototype.handleMouseWheel_ = function(e) {
  // Just move one unit increment per mouse wheel event
  var direction = e.detail > 0 ? -1 : 1;
  this.moveThumbs(direction * this.getUnitIncrement());
  e.preventDefault();
};


/**
 * Starts the animation that causes the thumb to increment/decrement by the
 * block increment when the user presses down on the background.
 * @param {goog.events.Event} e  The mouse event object.
 * @private
 */
goog.ui.SliderBase.prototype.startBlockIncrementing_ = function(e) {
  this.storeMousePos_(e);
  this.thumbToMove_ = this.getClosestThumb_(this.getValueFromMousePosition_(e));
  if (this.orientation_ == goog.ui.SliderBase.Orientation.VERTICAL) {
    this.incrementing_ = this.lastMousePosition_ < this.thumbToMove_.offsetTop;
  } else {
    this.incrementing_ = this.lastMousePosition_ >
                         this.thumbToMove_.offsetLeft +
                         this.thumbToMove_.offsetWidth;
  }

  var doc = goog.dom.getOwnerDocument(this.getElement());
  this.getHandler().
      listen(doc, goog.events.EventType.MOUSEUP, this.handleMouseUp_, true).
      listen(this.getElement(), goog.events.EventType.MOUSEMOVE,
          this.storeMousePos_);

  if (!this.incTimer_) {
    this.incTimer_ = new goog.Timer(
        goog.ui.SliderBase.MOUSE_DOWN_INCREMENT_INTERVAL_);
    this.getHandler().listen(this.incTimer_, goog.Timer.TICK,
        this.handleTimerTick_);
  }
  this.handleTimerTick_();
  this.incTimer_.start();
};


/**
 * Handler for the tick event dispatched by the timer used to update the value
 * in a block increment. This is also called directly from
 * startBlockIncrementing_.
 * @private
 */
goog.ui.SliderBase.prototype.handleTimerTick_ = function() {
  var value;
  if (this.orientation_ == goog.ui.SliderBase.Orientation.VERTICAL) {
    var mouseY = this.lastMousePosition_;
    var thumbY = this.thumbToMove_.offsetTop;
    if (this.incrementing_) {
      if (mouseY < thumbY) {
        value = this.getThumbPosition_(this.thumbToMove_) +
            this.getBlockIncrement();
      }
    } else {
      var thumbH = this.thumbToMove_.offsetHeight;
      if (mouseY > thumbY + thumbH) {
        value = this.getThumbPosition_(this.thumbToMove_) -
            this.getBlockIncrement();
      }
    }
  } else {
    var mouseX = this.lastMousePosition_;
    var thumbX = this.thumbToMove_.offsetLeft;
    if (this.incrementing_) {
      var thumbW = this.thumbToMove_.offsetWidth;
      if (mouseX > thumbX + thumbW) {
        value = this.getThumbPosition_(this.thumbToMove_) +
            this.getBlockIncrement();
      }
    } else {
      if (mouseX < thumbX) {
        value = this.getThumbPosition_(this.thumbToMove_) -
            this.getBlockIncrement();
      }
    }
  }

  if (goog.isDef(value)) { // not all code paths sets the value variable
    this.setThumbPosition_(this.thumbToMove_, value);
  }
};


/**
 * Handler for the mouse up event.
 * @param {goog.events.Event} e  The event object.
 * @private
 */
goog.ui.SliderBase.prototype.handleMouseUp_ = function(e) {
  if (this.incTimer_) {
    this.incTimer_.stop();
  }

  var doc = goog.dom.getOwnerDocument(this.getElement());
  this.getHandler().
      unlisten(doc, goog.events.EventType.MOUSEUP, this.handleMouseUp_, true).
      unlisten(this.getElement(), goog.events.EventType.MOUSEMOVE,
          this.storeMousePos_);
};


/**
 * Returns the relative mouse position to the slider.
 * @param {goog.events.Event} e  The mouse event object.
 * @return {number} The relative mouse position to the slider.
 * @private
 */
goog.ui.SliderBase.prototype.getRelativeMousePos_ = function(e) {
  var coord = goog.style.getRelativePosition(e, this.getElement());
  if (this.orientation_ == goog.ui.SliderBase.Orientation.VERTICAL) {
    return coord.y;
  } else {
    return coord.x;
  }
};


/**
 * Stores the current mouse position so that it can be used in the timer.
 * @param {goog.events.Event} e  The mouse event object.
 * @private
 */
goog.ui.SliderBase.prototype.storeMousePos_ = function(e) {
  this.lastMousePosition_ = this.getRelativeMousePos_(e);
};


/**
 * Returns the value to use for the current mouse position
 * @param {goog.events.Event} e  The mouse event object.
 * @return {number} The value that this mouse position represents.
 * @private
 */
goog.ui.SliderBase.prototype.getValueFromMousePosition_ = function(e) {
  var min = this.getMinimum();
  var max = this.getMaximum();
  if (this.orientation_ == goog.ui.SliderBase.Orientation.VERTICAL) {
    var thumbH = this.valueThumb.offsetHeight;
    var availH = this.getElement().clientHeight - thumbH;
    var y = this.getRelativeMousePos_(e) - thumbH / 2;
    return (max - min) * (availH - y) / availH + min;
  } else {
    var thumbW = this.valueThumb.offsetWidth;
    var availW = this.getElement().clientWidth - thumbW;
    var x = this.getRelativeMousePos_(e) - thumbW / 2;
    return (max - min) * x / availW + min;
  }
};


/**
 * @param {HTMLDivElement} thumb  The thumb object.
 * @return {number} The position of the specified thumb.
 * @private
 */
goog.ui.SliderBase.prototype.getThumbPosition_ = function(thumb) {
  if (thumb == this.valueThumb) {
    return this.rangeModel.getValue();
  } else if (thumb == this.extentThumb) {
    return this.rangeModel.getValue() + this.rangeModel.getExtent();
  } else {
    throw Error('Illegal thumb element. Neither minThumb nor maxThumb');
  }
};


/**
 * Moves the thumbs by the specified delta as follows
 * - as long as both thumbs stay within [min,max], both thumbs are moved
 * - once a thumb reaches or exceeds min (or max, respectively), it stays
 * - at min (or max, respectively).
 * In case both thumbs have reached min (or max), no change event will fire.
 * @param {number} delta The delta by which to move the selected range.
 */
goog.ui.SliderBase.prototype.moveThumbs = function(delta) {
  var newMinPos = this.getThumbPosition_(this.valueThumb) + delta;
  var newMaxPos = this.getThumbPosition_(this.extentThumb) + delta;
  // correct min / max positions to be within bounds
  newMinPos = goog.math.clamp(
      newMinPos, this.getMinimum(), this.getMaximum() - this.minExtent_);
  newMaxPos = goog.math.clamp(
      newMaxPos, this.getMinimum() + this.minExtent_, this.getMaximum());
  // Set value and extent atomically
  this.setValueAndExtent(newMinPos, newMaxPos - newMinPos);
};


/**
 * Sets the position of the given thumb. The set is ignored and no CHANGE event
 * fires if it violates the constraint minimum <= value (valueThumb position) <=
 * value + extent (extentThumb position) <= maximum.
 *
 * Note: To keep things simple, the setThumbPosition_ function does not have the
 * side-effect of "correcting" value or extent to fit the above constraint as it
 * is the case in the underlying range model. Instead, we simply ignore the
 * call. Callers must make these adjustements explicitly if they wish.
 * @param {Element} thumb The thumb whose position to set.
 * @param {number} position The position to move the thumb to.
 * @private
 */
goog.ui.SliderBase.prototype.setThumbPosition_ = function(thumb, position) {
  var intermediateExtent = null;
  // Make sure the maxThumb stays within minThumb <= maxThumb <= maximum
  if (thumb == this.extentThumb &&
      position <= this.rangeModel.getMaximum() &&
      position >= this.rangeModel.getValue() + this.minExtent_) {
      // For the case where there is only one thumb, we don't want to set the
      // extent twice, causing two change events, so delay setting until we know
      // if there will be a subsequent change.
      intermediateExtent = position - this.rangeModel.getValue();
  }

  // Make sure the minThumb stays within minimum <= minThumb <= maxThumb
  var currentExtent = intermediateExtent || this.rangeModel.getExtent();
  if (thumb == this.valueThumb &&
      position >= this.getMinimum() &&
      position <= this.rangeModel.getValue() +
          currentExtent - this.minExtent_) {
    var newExtent = currentExtent -
                    (position - this.rangeModel.getValue());
    // The range model will round the value and extent. Since we're setting
    // both, extent and value at the same time, it can happen that the
    // rounded sum of position and extent is not equal to the sum of the
    // position and extent rounded individually. If this happens, we simply
    // ignore the update to prevent inconsistent moves of the extent thumb.
    if (this.rangeModel.roundToStepWithMin(position) +
            this.rangeModel.roundToStepWithMin(newExtent) ==
        this.rangeModel.roundToStepWithMin(position + newExtent)) {
      // Atomically update the position and extent.
      this.setValueAndExtent(position, newExtent);
      intermediateExtent = null;
    }
  }

  // Need to be able to set extent to 0.
  if (intermediateExtent != null) {
    this.rangeModel.setExtent(intermediateExtent);
  }
};


/**
 * Sets the value and extent of the underlying range model. We enforce that
 * getMinimum() <= value <= getMaximum() - extent and
 * getMinExtent <= extent <= getMaximum() - getValue()
 * If this is not satisifed for the given extent, the call is ignored and no
 * CHANGE event fires. This is a utility method to allow setting the thumbs
 * simultaneously and ensuring that only one event fires.
 * @param {number} value The value to which to set the value.
 * @param {number} extent The value to which to set the extent.
 */
goog.ui.SliderBase.prototype.setValueAndExtent = function(value, extent) {
  if (this.getMinimum() <= value &&
      value <= this.getMaximum() - extent &&
      this.minExtent_ <= extent &&
      extent <= this.getMaximum() - value) {

    if (value == this.getValue() && extent == this.getExtent()) {
      return;
    }
    // because the underlying range model applies adjustements of value
    // and extent to fit within bounds, we need to reset the extent
    // first so these adjustements don't kick in.
    this.rangeModel.setMute(true);
    this.rangeModel.setExtent(0);
    this.rangeModel.setValue(value);
    this.rangeModel.setExtent(extent);
    this.rangeModel.setMute(false);
    this.updateUi_();
    this.dispatchEvent(goog.ui.Component.EventType.CHANGE);
  }
};


/**
 * @return {number} The minimum value.
 */
goog.ui.SliderBase.prototype.getMinimum = function() {
  return this.rangeModel.getMinimum();
};


/**
 * Sets the minimum number.
 * @param {number} min The minimum value.
 */
goog.ui.SliderBase.prototype.setMinimum = function(min) {
  this.rangeModel.setMinimum(min);
};


/**
 * @return {number} The maximum value.
 */
goog.ui.SliderBase.prototype.getMaximum = function() {
  return this.rangeModel.getMaximum();
};


/**
 * Sets the maximum number.
 * @param {number} max The maximum value.
 */
goog.ui.SliderBase.prototype.setMaximum = function(max) {
  this.rangeModel.setMaximum(max);
};


/**
 * @return {HTMLDivElement} The value thumb element.
 */
goog.ui.SliderBase.prototype.getValueThumb = function() {
  return this.valueThumb;
};


/**
 * @return {HTMLDivElement} The extent thumb element.
 */
goog.ui.SliderBase.prototype.getExtentThumb = function() {
  return this.extentThumb;
};


/**
 * @param {number} position The position to get the closest thumb to.
 * @return {HTMLDivElement} The thumb that is closest to the given position.
 * @private
 */
goog.ui.SliderBase.prototype.getClosestThumb_ = function(position) {
  if (position <= (this.rangeModel.getValue() +
                   this.rangeModel.getExtent() / 2)) {
    return this.valueThumb;
  } else {
    return this.extentThumb;
  }
};


/**
 * Call back when the internal range model changes. Sub-classes may override
 * and re-enter this method to update a11y state. Consider protected.
 * @param {goog.events.Event} e The event object.
 * @protected
 */
goog.ui.SliderBase.prototype.handleRangeModelChange = function(e) {
  this.updateUi_();
  this.updateAriaStates();
  this.dispatchEvent(goog.ui.Component.EventType.CHANGE);
};


/**
 * This is called when we need to update the size of the thumb. This happens
 * when first created as well as when the value and the orientation changes.
 * @private
 */
goog.ui.SliderBase.prototype.updateUi_ = function() {
  if (this.valueThumb && !this.isAnimating_) {
    var minCoord = this.getThumbCoordinateForValue_(
        this.getThumbPosition_(this.valueThumb));
    var maxCoord = this.getThumbCoordinateForValue_(
         this.getThumbPosition_(this.extentThumb));

    if (this.orientation_ == goog.ui.SliderBase.Orientation.VERTICAL) {
      this.valueThumb.style.top = minCoord.y + 'px';
      this.extentThumb.style.top = maxCoord.y + 'px';
    } else {
      this.valueThumb.style.left = minCoord.x + 'px';
      this.extentThumb.style.left = maxCoord.x + 'px';
    }
  }
};


/**
 * Returns the position to move the handle to for a given value
 * @param {number} val  The value to get the coordinate for.
 * @return {goog.math.Coordinate} Coordinate with either x or y set.
 * @private
 */
goog.ui.SliderBase.prototype.getThumbCoordinateForValue_ = function(val) {
  var coord = new goog.math.Coordinate;
  if (this.valueThumb) {
    var min = this.getMinimum();
    var max = this.getMaximum();

    // This check ensures the ratio never take NaN value, which is possible when
    // the slider min & max are same numbers (i.e. 1).
    var ratio = (val == min && min == max) ? 0 : (val - min) / (max - min);

    if (this.orientation_ == goog.ui.SliderBase.Orientation.VERTICAL) {
      var thumbHeight = this.valueThumb.offsetHeight;
      var h = this.getElement().clientHeight - thumbHeight;
      var bottom = Math.round(ratio * h);
      coord.y = h - bottom;
    } else {
      var w = this.getElement().clientWidth - this.valueThumb.offsetWidth;
      var left = Math.round(ratio * w);
      coord.x = left;
    }
  }
  return coord;
};


/**
 * Sets the value and starts animating the handle towards that position.
 * @param {number} v Value to set and animate to.
 * @private
 */
goog.ui.SliderBase.prototype.animatedSetValue_ = function(v) {
  // the value might be out of bounds
  v = Math.min(this.getMaximum(), Math.max(v, this.getMinimum()));

  if (this.currentAnimation_) {
    this.currentAnimation_.stop(true);
  }

  var end;
  var thumb = this.getClosestThumb_(v);
  var coord = this.getThumbCoordinateForValue_(v);
  if (this.orientation_ == goog.ui.SliderBase.Orientation.VERTICAL) {
    end = [thumb.offsetLeft, coord.y];
  } else {
    end = [coord.x, thumb.offsetTop];
  }
  var animation = new goog.fx.dom.SlideFrom(thumb, end,
      goog.ui.SliderBase.ANIMATION_INTERVAL_);
  this.currentAnimation_ = animation;
  this.getHandler().listen(animation, goog.fx.Animation.EventType.END,
      this.endAnimation_);

  this.isAnimating_ = true;
  this.setThumbPosition_(thumb, v);
  animation.play(false);
};


/**
 * Sets the isAnimating_ field to false once the animation is done.
 * @param {goog.fx.AnimationEvent} e Event object passed by the animation
 *     object.
 * @private
 */
goog.ui.SliderBase.prototype.endAnimation_ = function(e) {
  this.isAnimating_ = false;
};


/**
 * Changes the orientation.
 * @param {goog.ui.SliderBase.Orientation} orient The orientation.
 */
goog.ui.SliderBase.prototype.setOrientation = function(orient) {
  if (this.orientation_ != orient) {
    var oldCss = this.getCssClass(this.orientation_);
    var newCss = this.getCssClass(orient);
    this.orientation_ = orient;

    // Update the DOM
    if (this.getElement()) {
      goog.dom.classes.swap(this.getElement(), oldCss, newCss);
      // we need to reset the left and top
      this.valueThumb.style.left = this.valueThumb.style.top = '';
      this.extentThumb.style.left = this.extentThumb.style.top = '';
      this.updateUi_();
    }
  }
};


/**
 * @return {goog.ui.SliderBase.Orientation} the orientation of the slider.
 */
goog.ui.SliderBase.prototype.getOrientation = function() {
  return this.orientation_;
};


/** @inheritDoc */
goog.ui.SliderBase.prototype.disposeInternal = function() {
  goog.ui.SliderBase.superClass_.disposeInternal.call(this);
  if (this.incTimer_) {
    this.incTimer_.dispose();
  }
  delete this.incTimer_;
  if (this.currentAnimation_) {
    this.currentAnimation_.dispose();
  }
  delete this.currentAnimation_;
  delete this.valueThumb;
  delete this.extentThumb;
  this.rangeModel.dispose();
  delete this.rangeModel;
  if (this.keyHandler_) {
    this.keyHandler_.dispose();
    delete this.keyHandler_;
  }
  if (this.mouseWheelHandler_) {
    this.mouseWheelHandler_.dispose();
    delete this.mouseWheelHandler_;
  }
};


/**
 * @return {number} The amount to increment/decrement for page up/down as well
 *     as when holding down the mouse button on the background.
 */
goog.ui.SliderBase.prototype.getBlockIncrement = function() {
  return this.blockIncrement_;
};


/**
 * Sets the amount to increment/decrement for page up/down as well as when
 * holding down the mouse button on the background.
 *
 * @param {number} value The value to set the block increment to.
 */
goog.ui.SliderBase.prototype.setBlockIncrement = function(value) {
  this.blockIncrement_ = value;
};


/**
 * Sets the minimal value that the extent may have.
 *
 * @param {number} value The minimal value for the extent.
 */
goog.ui.SliderBase.prototype.setMinExtent = function(value) {
  this.minExtent_ = value;
};


/**
 * The amount to increment/decrement for up, down, left and right arrow keys.
 * @private
 * @type {number}
 */
goog.ui.SliderBase.prototype.unitIncrement_ = 1;


/**
 * @return {number} The amount to increment/decrement for up, down, left and
 *     right arrow keys.
 */
goog.ui.SliderBase.prototype.getUnitIncrement = function() {
  return this.unitIncrement_;
};


/**
 * Sets the amount to increment/decrement for up, down, left and right arrow
 * keys.
 * @param {number} value  The value to set the unit increment to.
 */
goog.ui.SliderBase.prototype.setUnitIncrement = function(value) {
  this.unitIncrement_ = value;
};


/**
 * @return {?number} The step value used to determine how to round the value.
 */
goog.ui.SliderBase.prototype.getStep = function() {
  return this.rangeModel.getStep();
};


/**
 * Sets the step value. The step value is used to determine how to round the
 * value.
 * @param {?number} step  The step size.
 */
goog.ui.SliderBase.prototype.setStep = function(step) {
  this.rangeModel.setStep(step);
};



/**
 * @return {boolean} Whether clicking on the backgtround should move directly to
 *     that point.
 */
goog.ui.SliderBase.prototype.getMoveToPointEnabled = function() {
  return this.moveToPointEnabled_;
};


/**
 * Sets whether clicking on the background should move directly to that point.
 * @param {boolean} val Whether clicking on the background should move directly
 *     to that point.
 */
goog.ui.SliderBase.prototype.setMoveToPointEnabled = function(val) {
  this.moveToPointEnabled_ = val;
};


/**
 * @return {number} The value of the underlying range model.
 */
goog.ui.SliderBase.prototype.getValue = function() {
  return this.rangeModel.getValue();
};


/**
 * Sets the value of the underlying range model. We enforce that
 * getMinimum() <= value <= getMaximum() - getExtent()
 * If this is not satisifed for the given value, the call is ignored and no
 * CHANGE event fires.
 * @param {number} value The value.
 */
goog.ui.SliderBase.prototype.setValue = function(value) {
  // Set the position through the thumb method to enforce constraints.
  this.setThumbPosition_(this.valueThumb, value);
};


/**
 * @return {number} The value of the extent of the underlying range model.
 */
goog.ui.SliderBase.prototype.getExtent = function() {
  return this.rangeModel.getExtent();
};


/**
 * Sets the extent of the underlying range model. We enforce that
 * getMinExtent() <= extent <= getMaximum() - getValue()
 * If this is not satisifed for the given extent, the call is ignored and no
 * CHANGE event fires.
 * @param {number} extent The value to which to set the extent.
 */
goog.ui.SliderBase.prototype.setExtent = function(extent) {
  // Set the position through the thumb method to enforce constraints.
  this.setThumbPosition_(this.extentThumb, (this.rangeModel.getValue() +
                                             extent));
};


/**
 * Change the visibility of the slider.
 * You must call this if you had set the slider's value when it was invisible.
 * @param {boolean} visible Whether to show the slider.
 */
goog.ui.SliderBase.prototype.setVisible = function(visible) {
  goog.style.showElement(this.getElement(), visible);
  if (visible) {
    this.updateUi_();
  }
};


/**
 * Set a11y roles and state.
 * @protected
 */
goog.ui.SliderBase.prototype.setAriaRoles = function() {
  goog.dom.a11y.setRole(this.getElement(), goog.dom.a11y.Role.SLIDER);
  this.updateAriaStates();
};


/**
 * Set a11y roles and state when values change.
 * @protected
 */
goog.ui.SliderBase.prototype.updateAriaStates = function() {
  var element = this.getElement();
  if (element) {
    goog.dom.a11y.setState(element,
                           goog.dom.a11y.State.VALUEMIN,
                           this.getMinimum());
    goog.dom.a11y.setState(element,
                           goog.dom.a11y.State.VALUEMAX,
                           this.getMaximum());
    goog.dom.a11y.setState(element,
                           goog.dom.a11y.State.VALUENOW,
                           this.getValue());
  }
};
