/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Provides access to high-entropy user agent values.
 */

goog.module('goog.labs.userAgent.highEntropy.highEntropyData');

const {HighEntropyValue} = goog.require('goog.labs.userAgent.highEntropy.highEntropyValue');

/**
 * @type {!HighEntropyValue<!Array<!NavigatorUABrandVersion>|undefined>}
 */
const fullVersionList = new HighEntropyValue('fullVersionList');
exports.fullVersionList = fullVersionList;

/**
 * @type {!HighEntropyValue<string>}
 */
const platformVersion = new HighEntropyValue('platformVersion');
exports.platformVersion = platformVersion;