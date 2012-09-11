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
 * @author arv@google.com (Erik Arvidsson)
 * @author reto@google.com (Reto Strobl)
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
goog.require('goog.fx.AnimationParallelQueue');
goog.require('goog.fx.Dragger');
goog.require('goog.fx.Dragger.EventType');
goog.require('goog.fx.Transition.EventType');
goog.require('goog.fx.dom.ResizeHeight');
goog.require('goog.fx.dom.ResizeWidth');
goog.require('goog.fx.dom.Slide');
goog.require('goog.math');
goog.require('goog.math.Coordinate');
goog.require('goog.style');
goog.require('goog.style.bidi');
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
 * The dom-element highlighting the selected range.
 * @type {HTMLDivElement}
 * @protected
 */
goog.ui.SliderBase.prototype.rangeHighlight;


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
 * Whether the slider should handle mouse wheel events.
 * @private
 * @type {boolean}
 */
goog.ui.SliderBase.prototype.isHandleMouseWheel_ = true;


/**
 * Whether the slider is enabled or not.
 * @private
 * @type {boolean}
 */
goog.ui.SliderBase.prototype.enabled_ = true;


/**
 * Whether the slider implements the changes described in http://b/6324964,
 * making it truly RTL.  This is a temporary flag to allow clients to transition
 * to the new behavior at their convenience.  At some point it will be the
 * default.
 * @type {boolean}
 * @private
 */
goog.ui.SliderBase.prototype.flipForRtl_ = false;


/**
 * Enables/disables true RTL behavior.  This should be called immediately after
 * construction.  This is a temporary flag to allow clients to transition
 * to the new behavior at their convenience.  At some point it will be the
 * default.
 * @param {boolean} flipForRtl True if the slider should be flipped for RTL,
 *     false otherwise.
 */
goog.ui.SliderBase.prototype.enableFlipForRtl = function(flipForRtl) {
  this.flipForRtl_ = flipForRtl;
};


// TODO: Make this return a base CSS class (without orientation), in subclasses.
/**
 * Returns the CSS class applied to the slider element for the given
 * orientation. Subclasses must override this method.
 * @param {goog.ui.SliderBase.Orientation} orient The orientation.
 * @return {string} The CSS class applied to slider elements.
 * @protected
 */
goog.ui.SliderBase.prototype.getCssClass = goog.abstractMethod;


/** @override */
goog.ui.SliderBase.prototype.createDom = function() {
  goog.ui.SliderBase.superClass_.createDom.call(this);
  var element =
      this.getDomHelper().createDom('div', this.getCssClass(this.orientation_));
  this.decorateInternal(element);
};


/**
 * Subclasses must implement this method and set the valueThumb and
 * extentThumb to non-null values. They can also set the rangeHighlight
 * element if a range highlight is desired.
 * @type {function() : void}
 * @protected
 */
goog.ui.SliderBase.prototype.createThumbs = goog.abstractMethod;


/**
 * CSS class name applied to the slider while its thumbs are being dragged.
 * @type {string}
 * @private
 */
goog.ui.SliderBase.SLIDER_DRAGGING_CSS_CLASS_ =
    goog.getCssName('goog-slider-dragging');


/**
 * CSS class name applied to a thumb while it's being dragged.
 * @type {string}
 * @private
 */
goog.ui.SliderBase.THUMB_DRAGGING_CSS_CLASS_ =
    goog.getCssName('goog-slider-thumb-dragging');


/**
 * CSS class name applied when the slider is disabled.
 * @type {string}
 * @private
 */
goog.ui.SliderBase.DISABLED_CSS_CLASS_ =
    goog.getCssName('goog-slider-disabled');


/** @override */
goog.ui.SliderBase.prototype.decorateInternal = function(element) {
  goog.ui.SliderBase.superClass_.decorateInternal.call(this, element);
  goog.dom.classes.add(element, this.getCssClass(this.orientation_));
  this.createThumbs();
  this.setAriaRoles();
};


/**
 * Called when the DOM for the component is for sure in the document.
 * Subclasses should override this method to set this element's role.
 * @override
 */
goog.ui.SliderBase.prototype.enterDocument = function() {
  goog.ui.SliderBase.superClass_.enterDocument.call(this);

  // Attach the events
  this.valueDragger_ = new goog.fx.Dragger(this.valueThumb);
  this.extentDragger_ = new goog.fx.Dragger(this.extentThumb);
  this.valueDragger_.enableRightPositioningForRtl(this.flipForRtl_);
  this.extentDragger_.enableRightPositioningForRtl(this.flipForRtl_);

  // The slider is handling the positioning so make the defaultActions empty.
  this.valueDragger_.defaultAction = this.extentDragger_.defaultAction =
      goog.nullFunction;
  this.keyHandler_ = new goog.events.KeyHandler(this.getElement());
  this.enableEventHandlers_(true);

  this.getElement().tabIndex = 0;
  this.updateUi_();
};


/**
 * Attaches/Detaches the event handlers on the slider.
 * @param {boolean} enable Whether to attach or detach the event handlers.
 * @private
 */
goog.ui.SliderBase.prototype.enableEventHandlers_ = function(enable) {
  if (enable) {
    this.getHandler().
        listen(this.valueDragger_, goog.fx.Dragger.EventType.BEFOREDRAG,
            this.handleBeforeDrag_).
        listen(this.extentDragger_, goog.fx.Dragger.EventType.BEFOREDRAG,
            this.handleBeforeDrag_).
        listen(this.valueDragger_,
            [goog.fx.Dragger.EventType.START, goog.fx.Dragger.EventType.END],
            this.handleThumbDragStartEnd_).
        listen(this.extentDragger_,
            [goog.fx.Dragger.EventType.START, goog.fx.Dragger.EventType.END],
            this.handleThumbDragStartEnd_).
        listen(this.keyHandler_, goog.events.KeyHandler.EventType.KEY,
            this.handleKeyDown_).
        listen(this.getElement(), goog.events.EventType.MOUSEDOWN,
            this.handleMouseDown_);
    if (this.isHandleMouseWheel()) {
      this.enableMouseWheelHandling_(true);
    }
  } else {
    this.getHandler().
        unlisten(this.valueDragger_, goog.fx.Dragger.EventType.BEFOREDRAG,
            this.handleBeforeDrag_).
        unlisten(this.extentDragger_, goog.fx.Dragger.EventType.BEFOREDRAG,
            this.handleBeforeDrag_).
        unlisten(this.valueDragger_,
            [goog.fx.Dragger.EventType.START, goog.fx.Dragger.EventType.END],
            this.handleThumbDragStartEnd_).
        unlisten(this.extentDragger_,
            [goog.fx.Dragger.EventType.START, goog.fx.Dragger.EventType.END],
            this.handleThumbDragStartEnd_).
        unlisten(this.keyHandler_, goog.events.KeyHandler.EventType.KEY,
            this.handleKeyDown_).
        unlisten(this.getElement(), goog.events.EventType.MOUSEDOWN,
            this.handleMouseDown_);
    if (this.isHandleMouseWheel()) {
      this.enableMouseWheelHandling_(false);
    }
  }
};


/** @override */
goog.ui.SliderBase.prototype.exitDocument = function() {
  goog.base(this, 'exitDocument');
  goog.disposeAll(this.valueDragger_, this.extentDragger_, this.keyHandler_,
                  this.mouseWheelHandler_);
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
 * Handler for the start/end drag event on the thumgs. Adds/removes
 * the "-dragging" CSS classes on the slider and thumb.
 * @param {goog.fx.DragEvent} e The drag event used to drag the thumb.
 * @private
 */
goog.ui.SliderBase.prototype.handleThumbDragStartEnd_ = function(e) {
  var enable = e.type == goog.fx.Dragger.EventType.START;
  goog.dom.classes.enable(this.getElement(),
      goog.ui.SliderBase.SLIDER_DRAGGING_CSS_CLASS_, enable);
  goog.dom.classes.enable(e.target.handle,
      goog.ui.SliderBase.THUMB_DRAGGING_CSS_CLASS_, enable);
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
      this.animatedSetValue(this.getMinimum());
      break;
    case goog.events.KeyCodes.END:
      this.animatedSetValue(this.getMaximum());
      break;
    case goog.events.KeyCodes.PAGE_UP:
      this.moveThumbs(this.getBlockIncrement());
      break;
    case goog.events.KeyCodes.PAGE_DOWN:
      this.moveThumbs(-this.getBlockIncrement());
      break;
    case goog.events.KeyCodes.LEFT:
      var sign = this.flipForRtl_ && this.isRightToLeft() ? 1 : -1;
      this.moveThumbs(e.shiftKey ?
          sign * this.getBlockIncrement() : sign * this.getUnitIncrement());
      break;
    case goog.events.KeyCodes.DOWN:
      this.moveThumbs(e.shiftKey ?
          -this.getBlockIncrement() : -this.getUnitIncrement());
      break;
    case goog.events.KeyCodes.RIGHT:
      var sign = this.flipForRtl_ && this.isRightToLeft() ? -1 : 1;
      this.moveThumbs(e.shiftKey ?
          sign * this.getBlockIncrement() : sign * this.getUnitIncrement());
      break;
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
      this.animatedSetValue(this.getValueFromMousePosition(e));
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
  this.thumbToMove_ = this.getClosestThumb_(this.getValueFromMousePosition(e));
  if (this.orientation_ == goog.ui.SliderBase.Orientation.VERTICAL) {
    this.incrementing_ = this.lastMousePosition_ < this.thumbToMove_.offsetTop;
  } else {
    this.incrementing_ = this.lastMousePosition_ >
                         this.getOffsetStart_(this.thumbToMove_) +
                         this.thumbToMove_.offsetWidth;
  }

  var doc = goog.dom.getOwnerDocument(this.getElement());
  this.getHandler().
      listen(doc, goog.events.EventType.MOUSEUP,
          this.stopBlockIncrementing_, true).
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
    var thumbX = this.getOffsetStart_(this.thumbToMove_);
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
 * Stops the block incrementing animation and unlistens the necessary
 * event handlers.
 * @private
 */
goog.ui.SliderBase.prototype.stopBlockIncrementing_ = function() {
  if (this.incTimer_) {
    this.incTimer_.stop();
  }

  var doc = goog.dom.getOwnerDocument(this.getElement());
  this.getHandler().
      unlisten(doc, goog.events.EventType.MOUSEUP,
          this.stopBlockIncrementing_, true).
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
    if (this.flipForRtl_ && this.isRightToLeft()) {
      return this.getElement().clientWidth - coord.x;
    } else {
      return coord.x;
    }
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
 */
goog.ui.SliderBase.prototype.getValueFromMousePosition = function(e) {
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
 * @deprecated Since 25-June-2012. Use public method getValueFromMousePosition.
 * @private
 */
goog.ui.SliderBase.prototype.getValueFromMousePosition_ =
    goog.ui.SliderBase.prototype.getValueFromMousePosition;


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
    this.handleRangeModelChange(null);
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
    var minCoord = this.getThumbCoordinateForValue(
        this.getThumbPosition_(this.valueThumb));
    var maxCoord = this.getThumbCoordinateForValue(
        this.getThumbPosition_(this.extentThumb));

    if (this.orientation_ == goog.ui.SliderBase.Orientation.VERTICAL) {
      this.valueThumb.style.top = minCoord.y + 'px';
      this.extentThumb.style.top = maxCoord.y + 'px';
      if (this.rangeHighlight) {
        var highlightPositioning = this.calculateRangeHighlightPositioning_(
            maxCoord.y, minCoord.y, this.valueThumb.offsetHeight);
        this.rangeHighlight.style.top = highlightPositioning.offset + 'px';
        this.rangeHighlight.style.height = highlightPositioning.size + 'px';
      }
    } else {
      var pos = (this.flipForRtl_ && this.isRightToLeft()) ? 'right' : 'left';
      this.valueThumb.style[pos] = minCoord.x + 'px';
      this.extentThumb.style[pos] = maxCoord.x + 'px';
      if (this.rangeHighlight) {
        var highlightPositioning = this.calculateRangeHighlightPositioning_(
            minCoord.x, maxCoord.x, this.valueThumb.offsetWidth);
        this.rangeHighlight.style[pos] = highlightPositioning.offset + 'px';
        this.rangeHighlight.style.width = highlightPositioning.size + 'px';
      }
    }
  }
};


/**
 * Calculates the start position (offset) and size of the range highlight, e.g.
 * for a horizontal slider, this will return [left, width] for the highlight.
 * @param {number} firstThumbPos The position of the first thumb along the
 *     slider axis.
 * @param {number} secondThumbPos The position of the second thumb along the
 *     slider axis, must be >= firstThumbPos.
 * @param {number} thumbSize The size of the thumb, along the slider axis.
 * @return {{offset: number, size: number}} The positioning parameters for the
 *     range highlight.
 * @private
 */
goog.ui.SliderBase.prototype.calculateRangeHighlightPositioning_ = function(
    firstThumbPos, secondThumbPos, thumbSize) {
  // Highlight is inset by half the thumb size, from the edges of the thumb.
  var highlightInset = Math.ceil(thumbSize / 2);
  var size = secondThumbPos - firstThumbPos + thumbSize - 2 * highlightInset;
  // Don't return negative size since it causes an error. IE sometimes attempts
  // to position the thumbs while slider size is 0, resulting in size < 0 here.
  return {
    offset: firstThumbPos + highlightInset,
    size: Math.max(size, 0)
  };
};


/**
 * Returns the position to move the handle to for a given value
 * @param {number} val  The value to get the coordinate for.
 * @return {goog.math.Coordinate} Coordinate with either x or y set.
 */
goog.ui.SliderBase.prototype.getThumbCoordinateForValue = function(val) {
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
 * @deprecated Since 25-June-2012. Use public method getThumbCoordinateForValue.
 * @private
 */
goog.ui.SliderBase.prototype.getThumbCoordinateForValue_ =
    goog.ui.SliderBase.prototype.getThumbCoordinateForValue;


/**
 * Sets the value and starts animating the handle towards that position.
 * @param {number} v Value to set and animate to.
 */
goog.ui.SliderBase.prototype.animatedSetValue = function(v) {
  // the value might be out of bounds
  v = goog.math.clamp(v, this.getMinimum(), this.getMaximum());

  if (this.isAnimating_) {
    this.currentAnimation_.stop(true);
  }
  var animations = new goog.fx.AnimationParallelQueue();
  var end;

  var thumb = this.getClosestThumb_(v);
  var previousValue = this.getValue();
  var previousExtent = this.getExtent();
  var previousThumbValue = this.getThumbPosition_(thumb);
  var previousCoord = this.getThumbCoordinateForValue(previousThumbValue);
  var stepSize = this.getStep();

  // If the delta is less than a single step, increase it to a step, else the
  // range model will reduce it to zero.
  if (Math.abs(v - previousThumbValue) < stepSize) {
    var delta = v > previousThumbValue ? stepSize : -stepSize;
    v = previousThumbValue + delta;

    // The resulting value may be out of bounds, sanitize.
    v = goog.math.clamp(v, this.getMinimum(), this.getMaximum());
  }

  this.setThumbPosition_(thumb, v);
  var coord = this.getThumbCoordinateForValue(this.getThumbPosition_(thumb));

  if (this.orientation_ == goog.ui.SliderBase.Orientation.VERTICAL) {
    end = [this.getOffsetStart_(thumb), coord.y];
  } else {
    end = [coord.x, thumb.offsetTop];
  }

  var slide = new goog.fx.dom.Slide(thumb,
      [previousCoord.x, previousCoord.y],
      end,
      goog.ui.SliderBase.ANIMATION_INTERVAL_);
  slide.enableRightPositioningForRtl(this.flipForRtl_);
  animations.add(slide);
  if (this.rangeHighlight) {
    this.addRangeHighlightAnimations_(thumb, previousValue, previousExtent,
        coord, animations);
  }

  this.currentAnimation_ = animations;
  this.getHandler().listen(animations, goog.fx.Transition.EventType.END,
      this.endAnimation_);

  this.isAnimating_ = true;
  animations.play(false);
};


/**
 * Adds animations for the range highlight element to the animation queue.
 *
 * @param {Element} thumb The thumb that's moving, must be
 *     either valueThumb or extentThumb.
 * @param {number} previousValue The previous value of the slider.
 * @param {number} previousExtent The previous extent of the
 *     slider.
 * @param {goog.math.Coordinate} newCoord The new pixel coordinate of the
 *     thumb that's moving.
 * @param {goog.fx.AnimationParallelQueue} animations The animation queue.
 * @private
 */
goog.ui.SliderBase.prototype.addRangeHighlightAnimations_ = function(thumb,
    previousValue, previousExtent, newCoord, animations) {
  var previousMinCoord = this.getThumbCoordinateForValue(previousValue);
  var previousMaxCoord = this.getThumbCoordinateForValue(
      previousValue + previousExtent);
  var minCoord = previousMinCoord;
  var maxCoord = previousMaxCoord;
  if (thumb == this.valueThumb) {
    minCoord = newCoord;
  } else {
    maxCoord = newCoord;
  }

  if (this.orientation_ == goog.ui.SliderBase.Orientation.VERTICAL) {
    var previousHighlightPositioning = this.calculateRangeHighlightPositioning_(
        previousMaxCoord.y, previousMinCoord.y, this.valueThumb.offsetHeight);
    var highlightPositioning = this.calculateRangeHighlightPositioning_(
        maxCoord.y, minCoord.y, this.valueThumb.offsetHeight);
    var slide = new goog.fx.dom.Slide(this.rangeHighlight,
        [this.getOffsetStart_(this.rangeHighlight),
          previousHighlightPositioning.offset],
        [this.getOffsetStart_(this.rangeHighlight),
          highlightPositioning.offset],
        goog.ui.SliderBase.ANIMATION_INTERVAL_);
    var resizeHeight = new goog.fx.dom.ResizeHeight(this.rangeHighlight,
        previousHighlightPositioning.size, highlightPositioning.size,
        goog.ui.SliderBase.ANIMATION_INTERVAL_);
    slide.enableRightPositioningForRtl(this.flipForRtl_);
    resizeHeight.enableRightPositioningForRtl(this.flipForRtl_);
    animations.add(slide);
    animations.add(resizeHeight);
  } else {
    var previousHighlightPositioning = this.calculateRangeHighlightPositioning_(
        previousMinCoord.x, previousMaxCoord.x, this.valueThumb.offsetWidth);
    var highlightPositioning = this.calculateRangeHighlightPositioning_(
        minCoord.x, maxCoord.x, this.valueThumb.offsetWidth);
    var newWidth = highlightPositioning[1];
    var slide = new goog.fx.dom.Slide(this.rangeHighlight,
        [previousHighlightPositioning.offset, this.rangeHighlight.offsetTop],
        [highlightPositioning.offset, this.rangeHighlight.offsetTop],
        goog.ui.SliderBase.ANIMATION_INTERVAL_);
    var resizeWidth = new goog.fx.dom.ResizeWidth(this.rangeHighlight,
        previousHighlightPositioning.size, highlightPositioning.size,
        goog.ui.SliderBase.ANIMATION_INTERVAL_);
    slide.enableRightPositioningForRtl(this.flipForRtl_);
    resizeWidth.enableRightPositioningForRtl(this.flipForRtl_);
    animations.add(slide);
    animations.add(resizeWidth);
  }
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
      // we need to reset the left and top, plus range highlight
      var pos = (this.flipForRtl_ && this.isRightToLeft()) ? 'right' : 'left';
      this.valueThumb.style[pos] = this.valueThumb.style.top = '';
      this.extentThumb.style[pos] = this.extentThumb.style.top = '';
      if (this.rangeHighlight) {
        this.rangeHighlight.style[pos] = this.rangeHighlight.style.top = '';
        this.rangeHighlight.style.width = this.rangeHighlight.style.height = '';
      }
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


/** @override */
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
  if (this.rangeHighlight) {
    delete this.rangeHighlight;
  }
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
  if (this.valueDragger_) {
    this.valueDragger_.dispose();
    delete this.valueDragger_;
  }
  if (this.extentDragger_) {
    this.extentDragger_.dispose();
    delete this.extentDragger_;
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


/**
 * Enables or disables mouse wheel handling for the slider. The mouse wheel
 * handler enables the user to change the value of slider using a mouse wheel.
 *
 * @param {boolean} enable Whether to enable mouse wheel handling.
 */
goog.ui.SliderBase.prototype.setHandleMouseWheel = function(enable) {
  if (this.isInDocument() && enable != this.isHandleMouseWheel()) {
    this.enableMouseWheelHandling_(enable);
  }

  this.isHandleMouseWheel_ = enable;
};


/**
 * @return {boolean} Whether the slider handles mousewheel.
 */
goog.ui.SliderBase.prototype.isHandleMouseWheel = function() {
  return this.isHandleMouseWheel_;
};


/**
 * Enable/Disable mouse wheel handling.
 * @param {boolean} enable Whether to enable mouse wheel handling.
 * @private
 */
goog.ui.SliderBase.prototype.enableMouseWheelHandling_ = function(enable) {
  if (enable) {
    if (!this.mouseWheelHandler_) {
      this.mouseWheelHandler_ = new goog.events.MouseWheelHandler(
          this.getElement());
    }
    this.getHandler().listen(this.mouseWheelHandler_,
        goog.events.MouseWheelHandler.EventType.MOUSEWHEEL,
        this.handleMouseWheel_);
  } else {
    this.getHandler().unlisten(this.mouseWheelHandler_,
        goog.events.MouseWheelHandler.EventType.MOUSEWHEEL,
        this.handleMouseWheel_);
  }
};


/**
 * Enables or disables the slider. A disabled slider will ignore all
 * user-initiated events. Also fires goog.ui.Component.EventType.ENABLE/DISABLE
 * event as appropriate.
 * @param {boolean} enable Whether to enable the slider or not.
 */
goog.ui.SliderBase.prototype.setEnabled = function(enable) {
  if (this.enabled_ == enable) {
    return;
  }

  var eventType = enable ?
      goog.ui.Component.EventType.ENABLE : goog.ui.Component.EventType.DISABLE;
  if (this.dispatchEvent(eventType)) {
    this.enabled_ = enable;
    this.enableEventHandlers_(enable);
    if (!enable) {
      // Disabling a slider is equivalent to a mouse up event when the block
      // increment (if happening) should be halted and any possible event
      // handlers be appropriately unlistened.
      this.stopBlockIncrementing_();
    }
    goog.dom.classes.enable(this.getElement(),
        goog.ui.SliderBase.DISABLED_CSS_CLASS_, !enable);
  }
};


/**
 * @return {boolean} Whether the slider is enabled or not.
 */
goog.ui.SliderBase.prototype.isEnabled = function() {
  return this.enabled_;
};


/**
 * @param {Element} element An element for which we want offsetLeft.
 * @return {number} Returns the element's offsetLeft, accounting for RTL if
 *     flipForRtl_ is true.
 * @private
 */
goog.ui.SliderBase.prototype.getOffsetStart_ = function(element) {
  return this.flipForRtl_ ?
      goog.style.bidi.getOffsetStart(element) : element.offsetLeft;
};
