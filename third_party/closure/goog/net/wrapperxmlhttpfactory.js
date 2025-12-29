/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Implementation of XmlHttpFactory which allows construction from
 * simple factory methods.
 */

goog.provide('goog.net.WrapperXmlHttpFactory');

/** @suppress {extraRequire} Typedef. */
goog.require('goog.net.XhrLike');
goog.require('goog.net.XmlHttpFactory');



/**
 * An xhr factory subclass which can be constructed using two factory methods.
 * This exists partly to allow the preservation of goog.net.XmlHttp.setFactory()
 * with an unchanged signature.
 * @param {function():!goog.net.XhrLike.OrNative} xhrFactory
 *     A function which returns a new XHR object.
 * @param {function():!Object} optionsFactory A function which returns the
 *     options associated with xhr objects from this factory.
 * @extends {goog.net.XmlHttpFactory}
 * @constructor
 * @final
 */
goog.net.WrapperXmlHttpFactory = function(xhrFactory, optionsFactory) {
  'use strict';
  goog.net.XmlHttpFactory.call(this);

  /**
   * XHR factory method.
   * @type {function() : !goog.net.XhrLike.OrNative}
   * @private
   */
  this.xhrFactory_ = xhrFactory;

  /**
   * Options factory method.
   * @type {function() : !Object}
   * @private
   */
  this.optionsFactory_ = optionsFactory;
};
goog.inherits(goog.net.WrapperXmlHttpFactory, goog.net.XmlHttpFactory);


/** @override */
goog.net.WrapperXmlHttpFactory.prototype.createInstance = function() {
  'use strict';
  return this.xhrFactory_();
};


/** @override */
goog.net.WrapperXmlHttpFactory.prototype.getOptions = function() {
  'use strict';
  return this.optionsFactory_();
};
