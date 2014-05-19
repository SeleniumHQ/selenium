// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview The file contains data tables generated from the ARIA
 * standard schema http://www.w3.org/TR/wai-aria/.
 *
 * This is auto-generated code. Do not manually edit!
 */

goog.provide('goog.a11y.aria.datatables');

goog.require('goog.a11y.aria.State');
goog.require('goog.object');


/**
 * A map that contains mapping between an ARIA state and the default value
 * for it. Note that not all ARIA states have default values.
 *
 * @type {Object.<!(goog.a11y.aria.State|string), (string|boolean|number)>}
 */
goog.a11y.aria.DefaultStateValueMap_;


/**
 * A method that creates a map that contains mapping between an ARIA state and
 * the default value for it. Note that not all ARIA states have default values.
 *
 * @return {!Object.<!(goog.a11y.aria.State|string), (string|boolean|number)>}
 *      The names for each of the notification methods.
 */
goog.a11y.aria.datatables.getDefaultValuesMap = function() {
  if (!goog.a11y.aria.DefaultStateValueMap_) {
    goog.a11y.aria.DefaultStateValueMap_ = goog.object.create(
        goog.a11y.aria.State.ATOMIC, false,
        goog.a11y.aria.State.AUTOCOMPLETE, 'none',
        goog.a11y.aria.State.DROPEFFECT, 'none',
        goog.a11y.aria.State.HASPOPUP, false,
        goog.a11y.aria.State.LIVE, 'off',
        goog.a11y.aria.State.MULTILINE, false,
        goog.a11y.aria.State.MULTISELECTABLE, false,
        goog.a11y.aria.State.ORIENTATION, 'vertical',
        goog.a11y.aria.State.READONLY, false,
        goog.a11y.aria.State.RELEVANT, 'additions text',
        goog.a11y.aria.State.REQUIRED, false,
        goog.a11y.aria.State.SORT, 'none',
        goog.a11y.aria.State.BUSY, false,
        goog.a11y.aria.State.DISABLED, false,
        goog.a11y.aria.State.HIDDEN, false,
        goog.a11y.aria.State.INVALID, 'false');
  }

  return goog.a11y.aria.DefaultStateValueMap_;
};
