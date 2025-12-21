/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */



/**
 * @fileoverview The file contains data tables generated from the ARIA
 * standard schema http://www.w3.org/TR/wai-aria/.
 *
 * This is auto-generated code. Do not manually edit!
 */

goog.module('goog.a11y.aria.datatables');
goog.module.declareLegacyNamespace();

const State = goog.require('goog.a11y.aria.State');


/**
 * A map that contains mapping between an ARIA state and the default value
 * for it. Note that not all ARIA states have default values.
 *
 * @type {!Object<!State|string, string|boolean|number>|undefined}
 */
let defaultStateValueMap;


/**
 * A method that creates a map that contains mapping between an ARIA state and
 * the default value for it. Note that not all ARIA states have default values.
 *
 * @return {!Object<!State|string, string|boolean|number>}
 *      The names for each of the notification methods.
 */
exports.getDefaultValuesMap = function() {
  if (!defaultStateValueMap) {
    defaultStateValueMap = {
      [State.ATOMIC]: false,
      [State.AUTOCOMPLETE]: 'none',
      [State.DROPEFFECT]: 'none',
      [State.HASPOPUP]: false,
      [State.LIVE]: 'off',
      [State.MULTILINE]: false,
      [State.MULTISELECTABLE]: false,
      [State.ORIENTATION]: 'vertical',
      [State.READONLY]: false,
      [State.RELEVANT]: 'additions text',
      [State.REQUIRED]: false,
      [State.SORT]: 'none',
      [State.BUSY]: false,
      [State.DISABLED]: false,
      [State.HIDDEN]: false,
      [State.INVALID]: 'false',
    };
  }

  return defaultStateValueMap;
};
