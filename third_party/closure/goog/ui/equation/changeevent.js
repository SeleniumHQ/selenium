// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.equation.ChangeEvent');

goog.require('goog.events.Event');



/**
 * Event fired when equation changes.
 * @constructor
 * @param {boolean} isValid Whether the equation is valid.
 * @extends {goog.events.Event}
 * @final
 */
goog.ui.equation.ChangeEvent = function(isValid) {
  goog.events.Event.call(this, 'change');

  /**
   * Whether equation is valid.
   * @type {boolean}
   */
  this.isValid = isValid;
};
goog.inherits(goog.ui.equation.ChangeEvent, goog.events.Event);

