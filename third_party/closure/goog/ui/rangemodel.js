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
 * @fileoverview Implementation of a range model. This is an implementation of
 * the BoundedRangeModel as described by Java at
 * http://java.sun.com/javase/6/docs/api/javax/swing/BoundedRangeModel.html.
 *
 * One good way to understand the range model is to think of a scroll bar for
 * a scrollable element. In that case minimum is 0, maximum is scrollHeight,
 * value is scrollTop and extent is clientHeight.
 *
 * Based on http://webfx.eae.net/dhtml/slider/js/range.js
 *
 * @author arv@google.com (Erik Arvidsson)
 */

goog.provide('goog.ui.RangeModel');

goog.require('goog.events.EventTarget');
goog.require('goog.ui.Component.EventType');



/**
 * Creates a range model
 * @extends {goog.events.EventTarget}
 * @constructor
 */
goog.ui.RangeModel = function() {
  goog.events.EventTarget.call(this);
};
goog.inherits(goog.ui.RangeModel, goog.events.EventTarget);


/**
 * @type {number}
 * @private
 */
goog.ui.RangeModel.prototype.value_ = 0;


/**
 * @type {number}
 * @private
 */
goog.ui.RangeModel.prototype.minimum_ = 0;


/**
 * @type {number}
 * @private
 */
goog.ui.RangeModel.prototype.maximum_ = 100;


/**
 * @type {number}
 * @private
 */
goog.ui.RangeModel.prototype.extent_ = 0;


/**
 * @type {?number}
 * @private
 */
goog.ui.RangeModel.prototype.step_ = 1;


/**
 * This is true if something is changed as a side effect. This happens when for
 * example we set the maximum below the current value.
 * @type {boolean}
 * @private
 */
goog.ui.RangeModel.prototype.isChanging_ = false;


/**
 * If set to true, we do not fire any change events.
 * @type {boolean}
 * @private
 */
goog.ui.RangeModel.prototype.mute_ = false;


/**
 * Sets the model to mute / unmute.
 * @param {boolean} muteValue Whether or not to mute the range, i.e.,
 *     suppress any CHANGE events.
 */
goog.ui.RangeModel.prototype.setMute = function(muteValue) {
  this.mute_ = muteValue;
};


/**
 * Sets the value.
 * @param {number} value The new value.
 */
goog.ui.RangeModel.prototype.setValue = function(value) {
  value = this.roundToStepWithMin(value);
  if (this.value_ != value) {
    if (value + this.extent_ > this.maximum_) {
      this.value_ = this.maximum_ - this.extent_;
    } else if (value < this.minimum_) {
      this.value_ = this.minimum_;
    } else {
      this.value_ = value;
    }
    if (!this.isChanging_ && !this.mute_) {
      this.dispatchEvent(goog.ui.Component.EventType.CHANGE);
    }
  }
};


/**
 * @return {number} the current value.
 */
goog.ui.RangeModel.prototype.getValue = function() {
  return this.roundToStepWithMin(this.value_);
};


/**
 * Sets the extent. The extent is the 'size' of the value.
 * @param {number} extent The new extent.
 */
goog.ui.RangeModel.prototype.setExtent = function(extent) {
  extent = this.roundToStepWithMin(extent);
  if (this.extent_ != extent) {
    if (extent < 0) {
      this.extent_ = 0;
    } else if (this.value_ + extent > this.maximum_) {
      this.extent_ = this.maximum_ - this.value_;
    } else {
      this.extent_ = extent;
    }
    if (!this.isChanging_ && !this.mute_) {
      this.dispatchEvent(goog.ui.Component.EventType.CHANGE);
    }
  }
};


/**
 * @return {number} The extent for the range model.
 */
goog.ui.RangeModel.prototype.getExtent = function() {
  return this.roundToStep(this.extent_);
};


/**
 * Sets the minimum
 * @param {number} minimum The new minimum.
 */
goog.ui.RangeModel.prototype.setMinimum = function(minimum) {
  // Don't round minimum because it is the base
  if (this.minimum_ != minimum) {
    var oldIsChanging = this.isChanging_;
    this.isChanging_ = true;

    this.minimum_ = minimum;

    if (minimum + this.extent_ > this.maximum_) {
      this.extent_ = this.maximum_ - this.minimum_;
    }
    if (minimum > this.value_) {
      this.setValue(minimum);
    }
    if (minimum > this.maximum_) {
      this.extent_ = 0;
      this.setMaximum(minimum);
      this.setValue(minimum);
    }


    this.isChanging_ = oldIsChanging;
    if (!this.isChanging_ && !this.mute_) {
      this.dispatchEvent(goog.ui.Component.EventType.CHANGE);
    }
  }
};


/**
 * @return {number} The minimum value for the range model.
 */
goog.ui.RangeModel.prototype.getMinimum = function() {
  return this.roundToStepWithMin(this.minimum_);
};


/**
 * Sets the maximum
 * @param {number} maximum The new maximum.
 */
goog.ui.RangeModel.prototype.setMaximum = function(maximum) {
  maximum = this.roundToStepWithMin(maximum);
  if (this.maximum_ != maximum) {
    var oldIsChanging = this.isChanging_;
    this.isChanging_ = true;

    this.maximum_ = maximum;

    if (maximum < this.value_ + this.extent_) {
      this.setValue(maximum - this.extent_);
    }
    if (maximum < this.minimum_) {
      this.extent_ = 0;
      this.setMinimum(maximum);
      this.setValue(this.maximum_);
    }
    if (maximum < this.minimum_ + this.extent_) {
      this.extent_ = this.maximum_ - this.minimum_;
    }

    this.isChanging_ = oldIsChanging;
    if (!this.isChanging_ && !this.mute_) {
      this.dispatchEvent(goog.ui.Component.EventType.CHANGE);
    }
  }
};


/**
 * @return {number} The maximimum value for the range model.
 */
goog.ui.RangeModel.prototype.getMaximum = function() {
  return this.roundToStepWithMin(this.maximum_);
};


/**
 * Returns the step value. The step value is used to determine how to round the
 * value.
 * @return {?number} The maximimum value for the range model.
 */
goog.ui.RangeModel.prototype.getStep = function() {
  return this.step_;
};


/**
 * Sets the step. The step value is used to determine how to round the value.
 * @param {?number} step  The step size.
 */
goog.ui.RangeModel.prototype.setStep = function(step) {
  if (this.step_ != step) {
    this.step_ = step;

    // adjust value, extent and maximum
    var oldIsChanging = this.isChanging_;
    this.isChanging_ = true;

    this.setMaximum(this.getMaximum());
    this.setExtent(this.getExtent());
    this.setValue(this.getValue());

    this.isChanging_ = oldIsChanging;
    if (!this.isChanging_ && !this.mute_) {
      this.dispatchEvent(goog.ui.Component.EventType.CHANGE);
    }
  }
};


/**
 * Rounds to the closest step using the minimum value as the base.
 * @param {number} value  The number to round.
 * @return {number} The number rounded to the closest step.
 */
goog.ui.RangeModel.prototype.roundToStepWithMin = function(value) {
  if (this.step_ == null) return value;
  return this.minimum_ +
      Math.round((value - this.minimum_) / this.step_) * this.step_;
};


/**
 * Rounds to the closest step.
 * @param {number} value  The number to round.
 * @return {number} The number rounded to the closest step.
 */
goog.ui.RangeModel.prototype.roundToStep = function(value) {
  if (this.step_ == null) return value;
  return Math.round(value / this.step_) * this.step_;
};
