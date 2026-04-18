/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Defines for goog.labs.userAgent.
 */

goog.module('goog.labs.userAgent');
goog.module.declareLegacyNamespace();

const flags = goog.require('goog.flags');

/**
 * @define {string} Optional runtime override for the USE_CLIENT_HINTS flag.
 * If this is set (for example, to 'foo.bar') then any value of USE_CLIENT_HINTS
 * will be overridden by `globalThis.foo.bar` if it is non-null.
 * This flag will be removed in December 2021.
 */
const USE_CLIENT_HINTS_OVERRIDE =
    goog.define('goog.labs.userAgent.USE_CLIENT_HINTS_OVERRIDE', '');

/**
 * @define {boolean} If true, use navigator.userAgentData.  Note: this overrides
 * the `USE_USER_AGENT_CLIENT_HINTS` runtime flag.  Please prefer the flag when
 * possible.
 */
const USE_CLIENT_HINTS =
    goog.define('goog.labs.userAgent.USE_CLIENT_HINTS', false);

let forceClientHintsInTests = false;

/**
 * Sets whether to use client hints APIs in tests for codepaths that
 *  - were originally implemented as checks against the navigator.userAgent
 *    string.
 *  - have an alternative implementation that uses Client Hints APIs.
 *
 * See the jsdoc on useClientHints for cases where this flag will be
 * ineffective, and the Client Hints APIs would be used regardless.
 * DO NOT call this function in production code - it will cause de-optimization.
 * @param {boolean} use Whether or not to use Client Hints API codepaths in
 *     goog.labs.useragent.* modules.
 */
exports.setUseClientHintsForTesting = (use) => {
  forceClientHintsInTests = use;
};

/** @const {boolean} */
const useClientHintsRuntimeOverride = USE_CLIENT_HINTS_OVERRIDE ?
    !!goog.getObjectByName(USE_CLIENT_HINTS_OVERRIDE) :
    false;

/**
 * Whether to use UserAgent-Client Hints API surfaces in parts of the
 * labs.userAgent package that previously only relied on the navigator.userAgent
 * string. Newer labs.userAgent API surfaces may ignore the result of this
 * function as they are considered opt-in API surfaces.
 * @const {function():boolean}
 */
exports.useClientHints = () => {
  return flags.USE_USER_AGENT_CLIENT_HINTS || USE_CLIENT_HINTS ||
      useClientHintsRuntimeOverride || forceClientHintsInTests;
};
