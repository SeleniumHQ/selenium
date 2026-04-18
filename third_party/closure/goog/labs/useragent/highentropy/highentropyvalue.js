/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Provides helper classes and objects to work with High Entropy
 * user agent values.
 */

goog.module('goog.labs.userAgent.highEntropy.highEntropyValue');

const util = goog.require('goog.labs.userAgent.util');
const {compareVersions} = goog.require('goog.string.internal');

/**
 * Represents a value that can be asynchronously loaded.
 * @interface
 * @template VALUE_TYPE
 */
class AsyncValue {
  /**
   * Get the value represented by this AsyncValue instance, if it was
   * previously requested.
   * @return {VALUE_TYPE|undefined}
   */
  getIfLoaded() {}

  /**
   * Request the value represented by this AsyncValue instance.
   * @return {!Promise<VALUE_TYPE>}
   */
  load() {}
}
exports.AsyncValue = AsyncValue;

/**
 * Represents a high-entropy value.
 * High-entropy values must be specifically requested from the Promise-based
 * Client Hints API.
 * @template VALUE_TYPE The type of the value wrapped by this HighEntropyValue
 *     instance.
 * @implements {AsyncValue<VALUE_TYPE>}
 */
class HighEntropyValue {
  /**
   * Constructs a new HighEntropyValue instance.
   * @param {string} key The name of the high-entropy value, used when
   * requesting it from the browser.
   */
  constructor(key) {
    /**
     * The key used to request the high-entropy value from the browser.
     * @const {string}
     * @private
     */
    this.key_ = key;

    /**
     * The value represented by this HighEntropyValue instance. If it hasn't
     * been successfully requested yet, its value will be undefined.
     * @type {VALUE_TYPE|undefined}
     * @protected
     */
    this.value_ = undefined;

    /**
     * The high-entropy value request. If it hasn't been requested yet, this
     * value will be undefined.
     * @type {!Promise<VALUE_TYPE>|undefined}
     * @private
     */
    this.promise_ = undefined;

    this.pending_ = false;
  }

  /**
   * @return {VALUE_TYPE|undefined}
   * @override
   */
  getIfLoaded() {
    const userAgentData = util.getUserAgentData();
    if (!userAgentData) {
      return undefined;
    }
    return this.value_;
  }

  /**
   * @return {!Promise<VALUE_TYPE>}
   * @override
   */
  async load() {
    const userAgentData = util.getUserAgentData();
    if (!userAgentData) return undefined;
    if (!this.promise_) {
      this.pending_ = true;
      this.promise_ = (async () => {
        try {
          const dataValues =
              await userAgentData.getHighEntropyValues([this.key_]);
          this.value_ =
              /** @type {!Object<string, VALUE_TYPE>} */ (
                  dataValues)[this.key_];
          return this.value_;
        } finally {
          this.pending_ = false;
        }
      })();
    }
    return await this.promise_;
  }

  resetForTesting() {
    if (this.pending_) {
      // There is a pending request that may set this.value_ at any time.
      // Therefore, it can't be guaranteed that this object is actually in a
      // clean state.
      throw new Error('Unsafe call to resetForTesting');
    }
    this.promise_ = undefined;
    this.value_ = undefined;
    this.pending_ = false;
  }
}
exports.HighEntropyValue = HighEntropyValue;

/**
 * An object that wraps a version string.
 * This allows for easy version comparisons.
 */
class Version {
  /**
   * @param {string} versionString The underlying version string.
   */
  constructor(versionString) {
    /**
     * @const {string}
     * @private
     */
    this.versionString_ = versionString;
  }

  /**
   * Returns the underlying version string.
   * @return {string}
   */
  toVersionStringForLogging() {
    return this.versionString_;
  }

  /**
   * Returns true if the underlying version string is equal to or greater than
   * the given version.
   * @param {string} version The version to compare against.
   * @return {boolean}
   */
  isAtLeast(version) {
    return compareVersions(this.versionString_, version) >= 0;
  }
}
exports.Version = Version;
