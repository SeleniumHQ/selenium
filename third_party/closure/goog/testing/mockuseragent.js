// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview MockUserAgent overrides goog.userAgent.getUserAgentString()
 *     depending on a specified configuration.
 *
 */

goog.setTestOnly('goog.testing.MockUserAgent');
goog.provide('goog.testing.MockUserAgent');

goog.require('goog.Disposable');
goog.require('goog.labs.userAgent.util');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.userAgent');



/**
 * Class for unit testing code that uses goog.userAgent.
 *
 * @extends {goog.Disposable}
 * @constructor
 * @final
 */
goog.testing.MockUserAgent = function() {
  goog.Disposable.call(this);

  /**
   * Property replacer used to mock out User-Agent functions.
   * @type {!goog.testing.PropertyReplacer}
   * @private
   */
  this.propertyReplacer_ = new goog.testing.PropertyReplacer();

  /**
   * The userAgent string used by goog.userAgent.
   * @type {?string}
   * @private
   */
  this.userAgent_ = goog.userAgent.getUserAgentString();

  /**
   * The navigator object used by goog.userAgent
   * @type {Object}
   * @private
   */
  this.navigator_ = goog.userAgent.getNavigator();

  /**
   * The documentMode number used by goog.userAgent
   * @type {number|undefined}
   * @private
   */
  this.documentMode_ = goog.userAgent.DOCUMENT_MODE;
};
goog.inherits(goog.testing.MockUserAgent, goog.Disposable);


/**
 * Whether this MockUserAgent has been installed.
 * @type {boolean}
 * @private
 */
goog.testing.MockUserAgent.prototype.installed_;


/**
 * Installs this MockUserAgent.
 */
goog.testing.MockUserAgent.prototype.install = function() {
  if (!this.installed_) {
    // Stub out user agent functions.
    this.propertyReplacer_.replace(
        goog.userAgent, 'getUserAgentString',
        goog.bind(this.getUserAgentString, this));

    this.propertyReplacer_.replace(
        goog.labs.userAgent.util, 'getUserAgent',
        goog.bind(this.getUserAgentString, this));

    // Stub out navigator functions.
    this.propertyReplacer_.replace(
        goog.userAgent, 'getNavigator', goog.bind(this.getNavigator, this));

    // Stub out documentMode functions.
    this.propertyReplacer_.replace(
        goog.userAgent, 'getDocumentMode_',
        goog.bind(this.getDocumentMode, this));

    this.propertyReplacer_.replace(
        goog.userAgent, 'DOCUMENT_MODE', this.getDocumentMode());

    this.installed_ = true;
  }
};


/**
 * @return {?string} The userAgent set in this class.
 */
goog.testing.MockUserAgent.prototype.getUserAgentString = function() {
  return this.userAgent_;
};


/**
 * @param {string} userAgent The desired userAgent string to use.
 */
goog.testing.MockUserAgent.prototype.setUserAgentString = function(userAgent) {
  this.userAgent_ = userAgent;
};


/**
 * @return {Object} The Navigator set in this class.
 */
goog.testing.MockUserAgent.prototype.getNavigator = function() {
  return this.navigator_;
};


/**
 * @param {Object} navigator The desired Navigator object to use.
 */
goog.testing.MockUserAgent.prototype.setNavigator = function(navigator) {
  this.navigator_ = navigator;
};

/**
 * @return {number|undefined} The documentMode set in this class.
 */
goog.testing.MockUserAgent.prototype.getDocumentMode = function() {
  return this.documentMode_;
};

/**
 * @param {number} documentMode The desired documentMode to use.
 */
goog.testing.MockUserAgent.prototype.setDocumentMode = function(documentMode) {
  this.documentMode_ = documentMode;
  this.propertyReplacer_.set(goog.userAgent, 'DOCUMENT_MODE', documentMode);
};

/**
 * Uninstalls the MockUserAgent.
 */
goog.testing.MockUserAgent.prototype.uninstall = function() {
  if (this.installed_) {
    this.propertyReplacer_.reset();
    this.installed_ = false;
  }

};


/** @override */
goog.testing.MockUserAgent.prototype.disposeInternal = function() {
  this.uninstall();
  delete this.propertyReplacer_;
  delete this.navigator_;
  delete this.documentMode_;
  goog.testing.MockUserAgent.base(this, 'disposeInternal');
};
