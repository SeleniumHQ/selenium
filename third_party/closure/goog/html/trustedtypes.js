/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Policy to convert strings to Trusted Types. See
 * https://github.com/WICG/trusted-types for details.
 */

goog.provide('goog.html.trustedtypes');


/**
 * @define {string} Name for the Trusted Types policy used in Closure Safe
 * Types. Differs from `goog.TRUSTED_TYPES_POLICY_NAME` in that the latter is
 * also used for other purposes like the debug loader. If empty, Closure Safe
 * Types will not use Trusted Types. Default is `goog.TRUSTED_TYPES_POLICY_NAME`
 * plus the suffix `#html`, unless `goog.TRUSTED_TYPES_POLICY_NAME` is empty.
 * @package
 */
goog.html.trustedtypes.POLICY_NAME = goog.define(
    'goog.html.trustedtypes.POLICY_NAME', '');


/**
 * Cached result of goog.createTrustedTypesPolicy.
 * @type {?TrustedTypePolicy|undefined}
 * @private
 */
goog.html.trustedtypes.cachedPolicy_;


/**
 * Creates a (singleton) Trusted Type Policy for Safe HTML Types.
 * @return {?TrustedTypePolicy}
 * @package
 */
goog.html.trustedtypes.getPolicyPrivateDoNotAccessOrElse = function() {
  'use strict';
  if (!goog.html.trustedtypes.POLICY_NAME) {
    // Binary not configured for Trusted Types.
    return null;
  }

  if (goog.html.trustedtypes.cachedPolicy_ === undefined) {
    goog.html.trustedtypes.cachedPolicy_ = null;
  }

  return goog.html.trustedtypes.cachedPolicy_;
};
