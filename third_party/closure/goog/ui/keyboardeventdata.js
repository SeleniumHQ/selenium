// Copyright 2019 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.KeyboardEventData');

goog.require('goog.asserts');
goog.require('goog.events.BrowserEvent');



/**
 * Data object that contains all the necessary information from a keyboard event
 * that is required to process it in `KeyboardShortcutHandler`.
 *
 * Prefer using `goog.ui.KeyboardEventData.Builder` over using this constructor.
 * @param {number} keyCode
 * @param {string} key
 * @param {boolean} shiftKey
 * @param {boolean} altKey
 * @param {boolean} ctrlKey
 * @param {boolean} metaKey
 * @param {!Node} target
 * @param {!EventTarget} rootTarget
 * @param {function(): void} preventDefaultFn
 * @param {function(): void} stopPropagationFn
 * @constructor @struct @final
 * @package
 */
goog.ui.KeyboardEventData = function(
    keyCode, key, shiftKey, altKey, ctrlKey, metaKey, target, rootTarget,
    preventDefaultFn, stopPropagationFn) {
  /** @private @const {number} */
  this.keyCode_ = keyCode;

  /** @private @const {string} */
  this.key_ = key;

  /** @private @const {boolean} */
  this.shiftKey_ = shiftKey;

  /** @private @const {boolean} */
  this.altKey_ = altKey;

  /** @private @const {boolean} */
  this.ctrlKey_ = ctrlKey;

  /** @private @const {boolean} */
  this.metaKey_ = metaKey;

  /** @private @const {!Node} */
  this.target_ = target;

  /**
   * For events fired from inside `open` Shadow DOM elements, the root event
   * target (i.e. the first `EventTarget` in the composed path). For all other
   * events, the original target.
   * @private @const {!EventTarget}
   */
  this.rootTarget_ = rootTarget;

  /** @private @const {function(): void} */
  this.preventDefaultFn_ = preventDefaultFn;

  /** @private @const {function(): void} */
  this.stopPropagationFn_ = stopPropagationFn;
};


/** @return {number} The keyCode of the event. */
goog.ui.KeyboardEventData.prototype.getKeyCode = function() {
  return this.keyCode_;
};


/** @return {string} The key of the event, or `''` if not one. */
goog.ui.KeyboardEventData.prototype.getKey = function() {
  return this.key_;
};


/** @return {boolean} If the shift key was pressed. */
goog.ui.KeyboardEventData.prototype.getShiftKey = function() {
  return this.shiftKey_;
};


/** @return {boolean} If the alt key was pressed. */
goog.ui.KeyboardEventData.prototype.getAltKey = function() {
  return this.altKey_;
};


/** @return {boolean} If the ctrl key was pressed. */
goog.ui.KeyboardEventData.prototype.getCtrlKey = function() {
  return this.ctrlKey_;
};


/** @return {boolean} If the meta key was pressed. */
goog.ui.KeyboardEventData.prototype.getMetaKey = function() {
  return this.metaKey_;
};


/** @return {!Node} The target of the event. */
goog.ui.KeyboardEventData.prototype.getTarget = function() {
  return this.target_;
};


/** @return {!EventTarget} The rootTarget of the event. */
goog.ui.KeyboardEventData.prototype.getRootTarget = function() {
  return this.rootTarget_;
};


/** @return {function(): void} Callback to prevent default. */
goog.ui.KeyboardEventData.prototype.getPreventDefaultFn = function() {
  return this.preventDefaultFn_;
};


/** @return {function(): void} Callback to stop propagation. */
goog.ui.KeyboardEventData.prototype.getStopPropagationFn = function() {
  return this.stopPropagationFn_;
};


/**
 * @param {!goog.events.BrowserEvent} event
 * @return {!goog.ui.KeyboardEventData}
 */
goog.ui.KeyboardEventData.fromBrowserEvent = function(event) {
  var e = event.getBrowserEvent();
  // Check existence to prevent classic FF reference error in strict mode.
  var hasComposed = e && 'composed' in e;
  var hasComposedPath = e && 'composedPath' in e;
  // EventTarget is updated, when browser supports shadow dom and event is
  // triggered inside `open` shadow root.
  var path = hasComposed && hasComposedPath && e.composed && e.composedPath();
  var rootTarget = (path && path.length > 0) ? path[0] : event.target;

  return new goog.ui.KeyboardEventData.Builder()
      .keyCode(event.keyCode || 0)
      .key(event.key || '')
      .shiftKey(!!event.shiftKey)
      .altKey(!!event.altKey)
      .ctrlKey(!!event.ctrlKey)
      .metaKey(!!event.metaKey)
      .target(event.target)
      .rootTarget(rootTarget)
      .preventDefaultFn(() => event.preventDefault())
      .stopPropagationFn(() => event.stopPropagation())
      .build();
};



/**
 * Builder for `KeyboardEventData`. All fields are required except `key`, which
 * defaults to `''`.
 * @constructor @struct @final
 */
goog.ui.KeyboardEventData.Builder = function() {
  /** @private {?number} */
  this.keyCode_ = null;

  /** @private {string} */
  this.key_ = '';

  /** @private {?boolean} */
  this.shiftKey_ = null;

  /** @private {?boolean} */
  this.altKey_ = null;

  /** @private {?boolean} */
  this.ctrlKey_ = null;

  /** @private {?boolean} */
  this.metaKey_ = null;

  /** @private {?Node} */
  this.target_ = null;

  /** @private {?EventTarget} */
  this.rootTarget_ = null;

  /** @private {?function(): void} */
  this.preventDefaultFn_ = null;

  /** @private {?function(): void} */
  this.stopPropagationFn_ = null;
};


/**
 * @param {number} keyCode
 * @return {!goog.ui.KeyboardEventData.Builder}
 */
goog.ui.KeyboardEventData.Builder.prototype.keyCode = function(keyCode) {
  this.keyCode_ = keyCode;
  return this;
};


/**
 * @param {string} key
 * @return {!goog.ui.KeyboardEventData.Builder}
 */
goog.ui.KeyboardEventData.Builder.prototype.key = function(key) {
  this.key_ = key;
  return this;
};


/**
 * @param {boolean} shiftKey
 * @return {!goog.ui.KeyboardEventData.Builder}
 */
goog.ui.KeyboardEventData.Builder.prototype.shiftKey = function(shiftKey) {
  this.shiftKey_ = shiftKey;
  return this;
};


/**
 * @param {boolean} altKey
 * @return {!goog.ui.KeyboardEventData.Builder}
 */
goog.ui.KeyboardEventData.Builder.prototype.altKey = function(altKey) {
  this.altKey_ = altKey;
  return this;
};


/**
 * @param {boolean} ctrlKey
 * @return {!goog.ui.KeyboardEventData.Builder}
 */
goog.ui.KeyboardEventData.Builder.prototype.ctrlKey = function(ctrlKey) {
  this.ctrlKey_ = ctrlKey;
  return this;
};


/**
 * @param {boolean} metaKey
 * @return {!goog.ui.KeyboardEventData.Builder}
 */
goog.ui.KeyboardEventData.Builder.prototype.metaKey = function(metaKey) {
  this.metaKey_ = metaKey;
  return this;
};


/**
 * @param {?Node} target
 * @return {!goog.ui.KeyboardEventData.Builder}
 */
goog.ui.KeyboardEventData.Builder.prototype.target = function(target) {
  this.target_ = target;
  return this;
};


/**
 * @param {?EventTarget} rootTarget
 * @return {!goog.ui.KeyboardEventData.Builder}
 */
goog.ui.KeyboardEventData.Builder.prototype.rootTarget = function(rootTarget) {
  this.rootTarget_ = rootTarget;
  return this;
};


/**
 * @param {function(): void} preventDefaultFn
 * @return {!goog.ui.KeyboardEventData.Builder}
 */
goog.ui.KeyboardEventData.Builder.prototype.preventDefaultFn = function(
    preventDefaultFn) {
  this.preventDefaultFn_ = preventDefaultFn;
  return this;
};


/**
 * @param {function(): void} stopPropagationFn
 * @return {!goog.ui.KeyboardEventData.Builder}
 */
goog.ui.KeyboardEventData.Builder.prototype.stopPropagationFn = function(
    stopPropagationFn) {
  this.stopPropagationFn_ = stopPropagationFn;
  return this;
};


/** @return {!goog.ui.KeyboardEventData} */
goog.ui.KeyboardEventData.Builder.prototype.build = function() {
  return new goog.ui.KeyboardEventData(
      goog.asserts.assertNumber(this.keyCode_), this.key_,
      goog.asserts.assertBoolean(this.shiftKey_),
      goog.asserts.assertBoolean(this.altKey_),
      goog.asserts.assertBoolean(this.ctrlKey_),
      goog.asserts.assertBoolean(this.metaKey_),
      goog.asserts.assert(this.target_), goog.asserts.assert(this.rootTarget_),
      goog.asserts.assertFunction(this.preventDefaultFn_),
      goog.asserts.assertFunction(this.stopPropagationFn_));
};
