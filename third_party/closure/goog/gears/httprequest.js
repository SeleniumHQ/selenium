// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2007 Google Inc. All Rights Reserved.

/**
 * @fileoverview This file contains functions for setting up the standard
 * goog.net.XmlHttp factory (and, therefore, goog.net.XhrIo) to work using
 * the HttpRequest object Gears provides.
 *
 */


goog.provide('goog.gears.HttpRequest');

goog.require('goog.Timer');
goog.require('goog.gears');
goog.require('goog.net.XmlHttp');


/**
 * Sets up the Gears HttpRequest's to be the default HttpRequest's used via
 * the goog.net.XmlHttp factory.
 */
goog.gears.HttpRequest.setup = function() {
  // Set the XmlHttp factory.
  goog.net.XmlHttp.setFactory(
      goog.gears.HttpRequest.factory_, goog.gears.HttpRequest.optionsFactory_);

  // Use the Gears timer as the default timer object to ensure that the XhrIo
  // timeouts function in the Workers.
  goog.Timer.defaultTimerObject = goog.gears.getFactory().create(
      'beta.timer', '1.0');
};


/**
 * The factory for creating Gears HttpRequest's.
 * @return {XMLHttpRequest} The request object.
 * @private
 */
goog.gears.HttpRequest.factory_ = function() {
  return goog.gears.getFactory().create('beta.httprequest', '1.0');
};


/**
 * The options object for the Gears HttpRequest.
 * @type {Object}
 * @private
 */
goog.gears.HttpRequest.options_ = {};


// As of Gears API v.2 (build version 0.1.56.0), setting onreadystatechange to
// null in FF will cause the browser to crash.
goog.gears.HttpRequest.options_[goog.net.XmlHttp.OptionType.USE_NULL_FUNCTION] =
    true;


/**
 * The factory for creating the options object for Gears HttpRequest's.
 * @return {Object} The options.
 * @private
 */
goog.gears.HttpRequest.optionsFactory_ = function() {
  return goog.gears.HttpRequest.options_;
};
