/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Interface for a factory for creating XMLHttpRequest objects
 * and metadata about them.
 */

goog.provide('goog.net.XmlHttpFactory');

/** @suppress {extraRequire} Typedef. */
goog.require('goog.net.XhrLike');



/**
 * Abstract base class for an XmlHttpRequest factory.
 * @constructor
 */
goog.net.XmlHttpFactory = function() {};


/**
 * Cache of options - we only actually call internalGetOptions once.
 * @type {?Object}
 * @private
 */
goog.net.XmlHttpFactory.prototype.cachedOptions_ = null;


/**
 * @return {!goog.net.XhrLike.OrNative} A new XhrLike instance.
 */
goog.net.XmlHttpFactory.prototype.createInstance = goog.abstractMethod;


/**
 * @return {Object} Options describing how xhr objects obtained from this
 *     factory should be used.
 */
goog.net.XmlHttpFactory.prototype.getOptions = function() {
  'use strict';
  return this.cachedOptions_ ||
      (this.cachedOptions_ = this.internalGetOptions());
};


/**
 * Override this method in subclasses to preserve the caching offered by
 * getOptions().
 * @return {Object} Options describing how xhr objects obtained from this
 *     factory should be used.
 * @protected
 */
goog.net.XmlHttpFactory.prototype.internalGetOptions = goog.abstractMethod;
