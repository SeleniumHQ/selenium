// Copyright 2018 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.SyntheticKeyboardEvent');

goog.require('goog.events.Event');
goog.require('goog.ui.KeyboardEventData');



/**
 * Synthetic keyboard event that can be handled by `KeyboardShortcutHandler`.
 *
 * Prefer using the available `createKeyUp`, `createKeyDown`, `createKeyPress`
 * helpers over using this constructor.
 * @param {!goog.ui.SyntheticKeyboardEvent.Type} type
 * @param {number} keyCode
 * @param {boolean} shiftKey
 * @param {boolean} altKey
 * @param {boolean} ctrlKey
 * @param {boolean} metaKey
 * @param {!Node} target
 * @param {function(): void} preventDefaultFn
 * @param {function(): void} stopPropagationFn
 * @extends {goog.events.Event}
 * @constructor @struct @final
 */
goog.ui.SyntheticKeyboardEvent = function(
    type, keyCode, shiftKey, altKey, ctrlKey, metaKey, target, preventDefaultFn,
    stopPropagationFn) {
  goog.ui.SyntheticKeyboardEvent.base(this, 'constructor', type);

  /** @private @const {!goog.ui.KeyboardEventData} */
  this.data_ = new goog.ui.KeyboardEventData.Builder()
                   .keyCode(keyCode)
                   .shiftKey(shiftKey)
                   .altKey(altKey)
                   .ctrlKey(ctrlKey)
                   .metaKey(metaKey)
                   .target(target)
                   .rootTarget(target)
                   .preventDefaultFn(preventDefaultFn)
                   .stopPropagationFn(stopPropagationFn)
                   .build();
};
goog.inherits(goog.ui.SyntheticKeyboardEvent, goog.events.Event);


/**
 * @return {!goog.ui.KeyboardEventData}
 * @package
 */
goog.ui.SyntheticKeyboardEvent.prototype.getData = function() {
  return this.data_;
};


/**
 * Creates a synthetic keydown event.
 * @param {number} keyCode
 * @param {boolean} shiftKey
 * @param {boolean} altKey
 * @param {boolean} ctrlKey
 * @param {boolean} metaKey
 * @param {!Node} target
 * @param {function(): void} preventDefaultFn
 * @param {function(): void} stopPropagationFn
 * @return {!goog.ui.SyntheticKeyboardEvent}
 */
goog.ui.SyntheticKeyboardEvent.createKeyDown = function(
    keyCode, shiftKey, altKey, ctrlKey, metaKey, target, preventDefaultFn,
    stopPropagationFn) {
  return new goog.ui.SyntheticKeyboardEvent(
      goog.ui.SyntheticKeyboardEvent.Type.KEYDOWN, keyCode, shiftKey, altKey,
      ctrlKey, metaKey, target, preventDefaultFn, stopPropagationFn);
};


/**
 * Creates a synthetic keyup event.
 * @param {number} keyCode
 * @param {boolean} shiftKey
 * @param {boolean} altKey
 * @param {boolean} ctrlKey
 * @param {boolean} metaKey
 * @param {!Node} target
 * @param {function(): void} preventDefaultFn
 * @param {function(): void} stopPropagationFn
 * @return {!goog.ui.SyntheticKeyboardEvent}
 */
goog.ui.SyntheticKeyboardEvent.createKeyUp = function(
    keyCode, shiftKey, altKey, ctrlKey, metaKey, target, preventDefaultFn,
    stopPropagationFn) {
  return new goog.ui.SyntheticKeyboardEvent(
      goog.ui.SyntheticKeyboardEvent.Type.KEYUP, keyCode, shiftKey, altKey,
      ctrlKey, metaKey, target, preventDefaultFn, stopPropagationFn);
};


/**
 * Creates a synthetic keypress event.
 * @param {number} keyCode
 * @param {boolean} shiftKey
 * @param {boolean} altKey
 * @param {boolean} ctrlKey
 * @param {boolean} metaKey
 * @param {!Node} target
 * @param {function(): void} preventDefaultFn
 * @param {function(): void} stopPropagationFn
 * @return {!goog.ui.SyntheticKeyboardEvent}
 */
goog.ui.SyntheticKeyboardEvent.createKeyPress = function(
    keyCode, shiftKey, altKey, ctrlKey, metaKey, target, preventDefaultFn,
    stopPropagationFn) {
  return new goog.ui.SyntheticKeyboardEvent(
      goog.ui.SyntheticKeyboardEvent.Type.KEYPRESS, keyCode, shiftKey, altKey,
      ctrlKey, metaKey, target, preventDefaultFn, stopPropagationFn);
};


/**
 * Synthetic event types.
 * @enum {string}
 */
goog.ui.SyntheticKeyboardEvent.Type = {
  KEYDOWN: 'synthetic-keydown',
  KEYUP: 'synthetic-keyup',
  KEYPRESS: 'synthetic-keypress'
};
