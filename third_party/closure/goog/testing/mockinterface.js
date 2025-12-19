/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview An interface that all mocks should share.
 */

goog.setTestOnly('goog.testing.MockInterface');
goog.provide('goog.testing.MockInterface');

goog.require('goog.Promise');



/** @interface */
goog.testing.MockInterface = function() {};


/**
 * Write down all the expected functions that have been called on the
 * mock so far. From here on out, future function calls will be
 * compared against this list.
 */
goog.testing.MockInterface.prototype.$replay = function() {};


/**
 * Reset the mock.
 */
goog.testing.MockInterface.prototype.$reset = function() {};


/**
 * Waits for the Mock to gather expectations and then performs verify.
 * @return {!goog.Promise<undefined>}
 */
goog.testing.MockInterface.prototype.$waitAndVerify = function() {};


/**
 * Assert that the expected function calls match the actual calls.
 */
goog.testing.MockInterface.prototype.$verify = function() {};
